using Hrms.Application.Interface;
using Hrms.Domain.Entities;
using Hrms.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Hrms.Infrastructure.Repositories
{
    /// <summary>
    /// Repository implementation cho ProductionLine entity
    /// </summary>
    public class ProductionLineRepository : Repository<ProductionLine>, IProductionLineRepository
    {
        public ProductionLineRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<ProductionLine>> GetByDepartmentIdAsync(int departmentId, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Where(pl => pl.DepartmentId == departmentId)
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<ProductionLine>> GetActiveLinesAsync(CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Where(pl => pl.Status == "Active")
                .ToListAsync(cancellationToken);
        }
    }
}
