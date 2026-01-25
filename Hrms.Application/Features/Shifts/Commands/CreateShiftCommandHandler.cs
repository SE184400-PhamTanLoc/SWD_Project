using MediatR;
using Microsoft.Extensions.Logging;
using Hrms.Application.Features.Shifts.Commands;
using Hrms.Application.Interface;
using Hrms.Domain.Entities;

namespace Hrms.Application.Features.Shifts.Commands
{
    /// <summary>
    /// Handler tạo mới Shift
    /// </summary>
    public class CreateShiftCommandHandler : IRequestHandler<CreateShiftCommand, Guid>
    {
        private readonly IShiftRepository _shiftRepository;
        private readonly ILogger<CreateShiftCommandHandler> _logger;

        public CreateShiftCommandHandler(IShiftRepository shiftRepository, ILogger<CreateShiftCommandHandler> logger)
        {
            _shiftRepository = shiftRepository;
            _logger = logger;
        }

        public async Task<Guid> Handle(CreateShiftCommand request, CancellationToken cancellationToken)
        {
            // Kiểm tra ShiftCode đã tồn tại chưa
            var exists = await _shiftRepository.ShiftCodeExistsAsync(request.ShiftCode, cancellationToken);

            if (exists)
            {
                throw new InvalidOperationException($"Shift với mã {request.ShiftCode} đã tồn tại");
            }

            var shift = new Shift
            {
                Id = Guid.NewGuid(),
                ShiftCode = request.ShiftCode,
                Name = request.Name,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                BreakDuration = request.BreakDuration,
                AllowedLateMinutes = request.AllowedLateMinutes,
                AllowedEarlyLeaveMinutes = request.AllowedEarlyLeaveMinutes
            };

            await _shiftRepository.AddAsync(shift, cancellationToken);
            await _shiftRepository.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Shift created: {ShiftCode} - {Name}", shift.ShiftCode, shift.Name);

            return shift.Id;
        }
    }
}
