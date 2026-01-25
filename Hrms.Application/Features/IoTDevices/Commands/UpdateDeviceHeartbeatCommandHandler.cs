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
            Guid deviceGuid;
            if (!Guid.TryParse(request.DeviceId, out deviceGuid))
            {
                _logger.LogWarning("Invalid device ID format: {DeviceId}", request.DeviceId);
                return false;
            }

            var device = await _deviceRepository.GetByIdAsync(deviceGuid, cancellationToken);

            if (device == null)
            {
                _logger.LogWarning("Device not found for heartbeat: {DeviceId}", request.DeviceId);
                return false;
            }

            await _deviceRepository.UpdateHeartbeatAsync(deviceGuid, cancellationToken);
            await _deviceRepository.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
