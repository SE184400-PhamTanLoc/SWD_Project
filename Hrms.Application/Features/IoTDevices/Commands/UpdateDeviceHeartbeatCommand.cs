using MediatR;

namespace Hrms.Application.Features.IoTDevices.Commands
{
    /// <summary>
    /// Command cập nhật heartbeat từ IoT Device
    /// ESP32-CAM sẽ gọi endpoint này định kỳ để báo hiệu còn online
    /// </summary>
    public class UpdateDeviceHeartbeatCommand : IRequest<bool>
    {
        public string DeviceId { get; set; } = null!; // DeviceCode hoặc DeviceId
    }
}
