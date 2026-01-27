using Hrms.Domain.Entities;

namespace Hrms.Application.Interface
{
    /// <summary>
    /// Repository interface cho IoTDevice entity
    /// </summary>
    public interface IIoTDeviceRepository : IRepository<IoTDevice>
    {
        /// <summary>
        /// Lấy devices theo LineId
        /// </summary>
        Task<IEnumerable<IoTDevice>> GetByLineIdAsync(int lineId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Lấy devices online
        /// </summary>
        Task<IEnumerable<IoTDevice>> GetOnlineDevicesAsync(CancellationToken cancellationToken = default);

        /// <summary>
        /// Cập nhật heartbeat cho device
        /// </summary>
        Task UpdateHeartbeatAsync(int deviceId, CancellationToken cancellationToken = default);
    }
}
