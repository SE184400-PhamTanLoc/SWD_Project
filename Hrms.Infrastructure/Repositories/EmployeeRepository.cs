using Hrms.Application.Interface;
using Hrms.Domain.Entities;
using Hrms.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Hrms.Infrastructure.Repositories
{
    /// <summary>
    /// Repository implementation cho Employee entity
    /// </summary>
    public class EmployeeRepository : Repository<Employee>, IEmployeeRepository
    {
        public EmployeeRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Employee?> GetByEmployeeCodeAsync(string employeeCode, CancellationToken cancellationToken = default)
        {
            return await _dbSet.FirstOrDefaultAsync(e => e.EmployeeCode == employeeCode, cancellationToken);
        }

        public async Task<IEnumerable<Employee>> GetByDepartmentIdAsync(int departmentId, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Where(e => e.DepartmentId == departmentId)
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<Employee>> GetActiveEmployeesAsync(CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Where(e => e.IsActive)
                .ToListAsync(cancellationToken);
        }

        public async Task<bool> EmployeeCodeExistsAsync(string employeeCode, CancellationToken cancellationToken = default)
        {
            return await _dbSet.AnyAsync(e => e.EmployeeCode == employeeCode, cancellationToken);
        }
    }
}
