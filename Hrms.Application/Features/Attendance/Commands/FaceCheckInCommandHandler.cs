using MediatR;
using Microsoft.Extensions.Logging;
using Hrms.Application.DTOs.Attendance;
using Hrms.Application.Interface;
using Hrms.Domain.Entities;
using Hrms.Domain.Enums;

namespace Hrms.Application.Features.Attendance.Commands
{
    /// <summary>
    /// Handler xử lý face check-in từ ESP32-CAM
    /// </summary>
    public class FaceCheckInCommandHandler : IRequestHandler<FaceCheckInCommand, FaceCheckInResponseDto>
    {
        private readonly IPythonAIService _pythonAIService;
        private readonly IEmployeeRepository _employeeRepository;
        private readonly IAttendanceRecordRepository _attendanceRecordRepository;
        private readonly IAttendanceDeviceLogRepository _deviceLogRepository;
        private readonly IIoTDeviceRepository _iotDeviceRepository;
        private readonly IShiftAssignmentRepository _shiftAssignmentRepository;
        private readonly ILogger<FaceCheckInCommandHandler> _logger;

        public FaceCheckInCommandHandler(
            IPythonAIService pythonAIService,
            IEmployeeRepository employeeRepository,
            IAttendanceRecordRepository attendanceRecordRepository,
            IAttendanceDeviceLogRepository deviceLogRepository,
            IIoTDeviceRepository iotDeviceRepository,
            IShiftAssignmentRepository shiftAssignmentRepository,
            ILogger<FaceCheckInCommandHandler> logger)
        {
            _pythonAIService = pythonAIService;
            _employeeRepository = employeeRepository;
            _attendanceRecordRepository = attendanceRecordRepository;
            _deviceLogRepository = deviceLogRepository;
            _iotDeviceRepository = iotDeviceRepository;
            _shiftAssignmentRepository = shiftAssignmentRepository;
            _logger = logger;
        }

        public async Task<FaceCheckInResponseDto> Handle(FaceCheckInCommand request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Processing face check-in from device: {DeviceId}", request.DeviceId);

            // 1. Validate device exists
            IoTDevice? device = null;
            if (int.TryParse(request.DeviceId, out var deviceIdInt))
            {
                device = await _iotDeviceRepository.GetByIdAsync(deviceIdInt, cancellationToken);
            }

            // 2. Gọi Python AI Service để nhận diện khuôn mặt
            var recognizeResult = await _pythonAIService.RecognizeFaceAsync(
                request.DeviceId, 
                request.ImageBase64, 
                cancellationToken);

            // 3. Tạo device log
            var deviceLog = new AttendanceDeviceLog
            {
                Id = Guid.NewGuid(),
                DeviceId = device?.Id,
                DeviceCode = request.DeviceId,
                CapturedAt = request.CapturedAt,
                ProcessingResult = "Processing"
            };

            try
            {
                // 4. Kiểm tra kết quả từ Python AI
                if (!recognizeResult.Ok)
                {
                    deviceLog.ProcessingResult = "Failed";
                    deviceLog.ErrorMessage = recognizeResult.Reason ?? "Python AI Service error";
                    await _deviceLogRepository.AddAsync(deviceLog, cancellationToken);
                    await _deviceLogRepository.SaveChangesAsync(cancellationToken);

                    _logger.LogWarning("Python AI recognition failed: {Reason}", recognizeResult.Reason);

                    return new FaceCheckInResponseDto
                    {
                        Success = false,
                        Message = "Lỗi khi nhận diện khuôn mặt",
                        Status = "Failed"
                    };
                }

                // 5. Kiểm tra decision
                if (recognizeResult.Decision != "accept")
                {
                    deviceLog.ProcessingResult = "Rejected";
                    deviceLog.ErrorMessage = recognizeResult.Reason ?? "Face not recognized";
                    await _deviceLogRepository.AddAsync(deviceLog, cancellationToken);
                    await _deviceLogRepository.SaveChangesAsync(cancellationToken);

                    _logger.LogInformation("Face not recognized. Reason: {Reason}", recognizeResult.Reason);

                    return new FaceCheckInResponseDto
                    {
                        Success = false,
                        Message = "Không nhận diện được khuôn mặt",
                        Status = "UnknownFace",
                        Confidence = recognizeResult.Confidence
                    };
                }

                // 6. Tìm Employee bằng PersonId (EmployeeCode)
                if (string.IsNullOrEmpty(recognizeResult.PersonId))
                {
                    deviceLog.ProcessingResult = "Failed";
                    deviceLog.ErrorMessage = "PersonId is null from Python AI";
                    await _deviceLogRepository.AddAsync(deviceLog, cancellationToken);
                    await _deviceLogRepository.SaveChangesAsync(cancellationToken);

                    return new FaceCheckInResponseDto
                    {
                        Success = false,
                        Message = "Lỗi dữ liệu từ AI Service",
                        Status = "Failed"
                    };
                }

                var employee = await _employeeRepository.GetByEmployeeCodeAsync(recognizeResult.PersonId, cancellationToken);
                
                if (employee == null)
                {
                    deviceLog.ProcessingResult = "Failed";
                    deviceLog.ErrorMessage = $"Employee not found with code: {recognizeResult.PersonId}";
                    await _deviceLogRepository.AddAsync(deviceLog, cancellationToken);
                    await _deviceLogRepository.SaveChangesAsync(cancellationToken);

                    _logger.LogWarning("Employee not found with code: {EmployeeCode}", recognizeResult.PersonId);

                    return new FaceCheckInResponseDto
                    {
                        Success = false,
                        Message = $"Không tìm thấy nhân viên: {recognizeResult.Name}",
                        Status = "Failed",
                        Confidence = recognizeResult.Confidence
                    };
                }

                deviceLog.EmployeeId = employee.Id;
                deviceLog.Confidence = recognizeResult.Confidence;

                // 7. Kiểm tra đã check-in hôm nay chưa
                var today = DateTime.Today;
                var existingRecord = await _attendanceRecordRepository.GetByEmployeeAndDateAsync(employee.Id, today, cancellationToken);

                if (existingRecord != null)
                {
                    // Đã check-in rồi, xử lý check-out
                    if (existingRecord.CheckOutTime.HasValue)
                    {
                        // Đã check-out rồi
                        deviceLog.ProcessingResult = "AlreadyCheckedOut";
                        await _deviceLogRepository.AddAsync(deviceLog, cancellationToken);
                        await _deviceLogRepository.SaveChangesAsync(cancellationToken);

                        return new FaceCheckInResponseDto
                        {
                            Success = false,
                            Message = $"Bạn đã check-out lúc {existingRecord.CheckOutTime:HH:mm}",
                            EmployeeName = employee.FullName,
                            Status = "AlreadyCheckedOut",
                            Confidence = recognizeResult.Confidence
                        };
                    }
                    else
                    {
                        // Chưa check-out, thực hiện check-out
                        existingRecord.CheckOutTime = request.CapturedAt;
                        
                        // Tính total hours
                        if (existingRecord.CheckInTime.HasValue)
                        {
                            var totalMinutes = (existingRecord.CheckOutTime.Value - existingRecord.CheckInTime.Value).TotalMinutes;
                            existingRecord.TotalHours = totalMinutes / 60.0;
                        }

                        // Kiểm tra early leave nếu có shift
                        var shiftAssignment = await _shiftAssignmentRepository.GetCurrentShiftAssignmentAsync(
                            employee.Id, today, cancellationToken);
                        
                        if (shiftAssignment?.Shift != null)
                        {
                            var expectedEndTime = today.Add(shiftAssignment.Shift.EndTime);
                            if (existingRecord.CheckOutTime.Value < expectedEndTime)
                            {
                                // Về sớm
                                existingRecord.Status = AttendanceStatus.EarlyLeave;
                            }
                        }

                        _attendanceRecordRepository.Update(existingRecord);
                        await _attendanceRecordRepository.SaveChangesAsync(cancellationToken);

                        deviceLog.ProcessingResult = "CheckedOut";
                        await _deviceLogRepository.AddAsync(deviceLog, cancellationToken);
                        await _deviceLogRepository.SaveChangesAsync(cancellationToken);

                        _logger.LogInformation("Employee {EmployeeCode} checked out at {Time}", 
                            employee.EmployeeCode, existingRecord.CheckOutTime);

                        return new FaceCheckInResponseDto
                        {
                            Success = true,
                            Message = $"Check-out thành công lúc {existingRecord.CheckOutTime:HH:mm}",
                            EmployeeName = employee.FullName,
                            CheckInTime = existingRecord.CheckOutTime,
                            Status = "CheckedOut",
                            Confidence = recognizeResult.Confidence
                        };
                    }
                }

                // 8. Chưa check-in, tạo attendance record mới
                var shiftToday = await _shiftAssignmentRepository.GetCurrentShiftAssignmentAsync(
                    employee.Id, today, cancellationToken);

                var newRecord = new AttendanceRecord
                {
                    Id = Guid.NewGuid(),
                    EmployeeId = employee.Id,
                    WorkDate = today,
                    CheckInTime = request.CapturedAt,
                    ShiftId = shiftToday?.ShiftId,
                    Status = AttendanceStatus.OnTime,
                    Source = Hrms.Domain.Enums.AttendanceSource.FaceRecognition
                };

                // Tính late minutes và set status nếu có shift
                if (shiftToday?.Shift != null)
                {
                    var expectedStartTime = today.Add(shiftToday.Shift.StartTime);
                    if (newRecord.CheckInTime > expectedStartTime)
                    {
                        // Đi muộn
                        newRecord.Status = AttendanceStatus.Late;
                    }
                }

                await _attendanceRecordRepository.AddAsync(newRecord, cancellationToken);
                await _attendanceRecordRepository.SaveChangesAsync(cancellationToken);

                deviceLog.ProcessingResult = "CheckedIn";
                await _deviceLogRepository.AddAsync(deviceLog, cancellationToken);
                await _deviceLogRepository.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Employee {EmployeeCode} checked in at {Time}", 
                    employee.EmployeeCode, newRecord.CheckInTime);

                return new FaceCheckInResponseDto
                {
                    Success = true,
                    Message = $"Check-in thành công lúc {newRecord.CheckInTime:HH:mm}",
                    EmployeeName = employee.FullName,
                    CheckInTime = newRecord.CheckInTime,
                    Status = "CheckedIn",
                    Confidence = recognizeResult.Confidence
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing face check-in for device: {DeviceId}", request.DeviceId);

                deviceLog.ProcessingResult = "Error";
                deviceLog.ErrorMessage = ex.Message;
                await _deviceLogRepository.AddAsync(deviceLog, cancellationToken);
                await _deviceLogRepository.SaveChangesAsync(cancellationToken);

                return new FaceCheckInResponseDto
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi khi xử lý check-in",
                    Status = "Error"
                };
            }
        }
    }
}
