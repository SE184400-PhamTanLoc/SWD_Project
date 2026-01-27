using MediatR;
using Microsoft.Extensions.Logging;
using Hrms.Application.Features.IoTDevices.Commands;
using Hrms.Application.Interface;

namespace Hrms.Application.Features.IoTDevices.Commands
{
    /// <summary>
    /// Handler cập nhật heartbeat
    /// </summary>
    public class UpdateDeviceHeartbeatCommandHandler : IRequestHandler<UpdateDeviceHeartbeatCommand, bool>
    {
        private readonly IIoTDeviceRepository _deviceRepository;
        private readonly ILogger<UpdateDeviceHeartbeatCommandHandler> _logger;

        public UpdateDeviceHeartbeatCommandHandler(
            IIoTDeviceRepository deviceRepository,
            ILogger<UpdateDeviceHeartbeatCommandHandler> logger)
        {
            _deviceRepository = deviceRepository;
            _logger = logger;
        }

        public async Task<bool> Handle(UpdateDeviceHeartbeatCommand request, CancellationToken cancellationToken)
        {
            if (!int.TryParse(request.DeviceId, out var deviceIdInt))
            {
                _logger.LogWarning("Invalid device ID format: {DeviceId}", request.DeviceId);
                return false;
            }
 
            var device = await _deviceRepository.GetByIdAsync(deviceIdInt, cancellationToken);
 
            if (device == null)
            {
                _logger.LogWarning("Device not found for heartbeat: {DeviceId}", request.DeviceId);
                return false;
            }
 
            await _deviceRepository.UpdateHeartbeatAsync(deviceIdInt, cancellationToken);
            await _deviceRepository.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
