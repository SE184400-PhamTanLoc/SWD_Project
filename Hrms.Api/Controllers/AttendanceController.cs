using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Hrms.Application.DTOs.Attendance;
using Hrms.Application.Features.Attendance.Commands;

namespace Hrms.Api.Controllers
{
    /// <summary>
    /// Controller xử lý Attendance
    /// Module 4: Attendance Processing
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class AttendanceController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<AttendanceController> _logger;

        public AttendanceController(IMediator mediator, ILogger<AttendanceController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        /// <summary>
        /// Xử lý check-in
        /// POST /api/attendance/checkin
        /// </summary>
        [HttpPost("checkin")]
        [AllowAnonymous] // Cho phép ESP32-CAM gọi sau khi nhận diện face
        public async Task<ActionResult<CheckInResponseDto>> CheckIn([FromBody] CheckInRequestDto request)
        {
            try
            {
                var command = new CheckInCommand
                {
                    EmployeeId = request.EmployeeId,
                    DeviceId = request.DeviceId,
                    CheckInTime = request.CheckInTime
                };

                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during check-in for employee: {EmployeeId}", request.EmployeeId);
                return StatusCode(500, new CheckInResponseDto
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi khi check-in"
                });
            }
        }

        /// <summary>
        /// Xử lý check-out
        /// POST /api/attendance/checkout
        /// </summary>
        [HttpPost("checkout")]
        [AllowAnonymous]
        public async Task<ActionResult<CheckInResponseDto>> CheckOut([FromBody] CheckInRequestDto request)
        {
            try
            {
                var command = new CheckOutCommand
                {
                    EmployeeId = request.EmployeeId,
                    DeviceId = request.DeviceId,
                    CheckOutTime = request.CheckInTime // Reuse CheckInTime field for CheckOutTime
                };

                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during check-out for employee: {EmployeeId}", request.EmployeeId);
                return StatusCode(500, new CheckInResponseDto
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi khi check-out"
                });
            }
        }

        /// <summary>
        /// Lấy thông tin attendance hôm nay của employee
        /// GET /api/attendance/today/{employeeId}
        /// </summary>
        [HttpGet("today/{employeeId}")]
        [Authorize]
        public async Task<ActionResult> GetTodayAttendance(Guid employeeId)
        {
            // TODO: Implement query
            return Ok(new { message = "Feature coming soon" });
        }

        /// <summary>
        /// Lấy lịch sử attendance records
        /// GET /api/attendance/records
        /// </summary>
        [HttpGet("records")]
        [Authorize]
        public async Task<ActionResult> GetAttendanceRecords(
            [FromQuery] Guid? employeeId = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            // TODO: Implement query
            return Ok(new { message = "Feature coming soon" });
        }
    }
}
