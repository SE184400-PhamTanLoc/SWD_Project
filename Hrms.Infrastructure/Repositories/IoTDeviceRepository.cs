using Hrms.Application.Interface;
using Hrms.Domain.Entities;
using Hrms.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Hrms.Infrastructure.Repositories
{
    /// <summary>
    /// Repository implementation cho IoTDevice entity
    /// </summary>
    public class IoTDeviceRepository : Repository<IoTDevice>, IIoTDeviceRepository
    {
        public IoTDeviceRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<IoTDevice>> GetByLineIdAsync(Guid lineId, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Where(d => d.LineId == lineId)
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<IoTDevice>> GetOnlineDevicesAsync(CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Where(d => d.Status == "Online")
                .ToListAsync(cancellationToken);
        }

        public async Task UpdateHeartbeatAsync(Guid deviceId, CancellationToken cancellationToken = default)
        {
            var device = await _dbSet.FindAsync(new object[] { deviceId }, cancellationToken);
            if (device != null)
            {
                device.LastHeartbeat = DateTime.UtcNow;
                device.Status = "Online";
                _dbSet.Update(device);
            }
        }
    }
}
