using MediatR;
using Microsoft.Extensions.Logging;
using Hrms.Application.DTOs;
using Hrms.Application.Features.Employees.Commands;
using Hrms.Application.Interface;
using Hrms.Domain.Entities;

namespace Hrms.Application.Features.Employees.Commands
{
    /// <summary>
    /// Handler tạo mới Employee
    /// </summary>
    public class CreateEmployeeCommandHandler : IRequestHandler<CreateEmployeeCommand, EmployeeDTO>
    {
        private readonly IEmployeeRepository _employeeRepository;
        private readonly ILogger<CreateEmployeeCommandHandler> _logger;

        public CreateEmployeeCommandHandler(
            IEmployeeRepository employeeRepository,
            ILogger<CreateEmployeeCommandHandler> logger)
        {
            _employeeRepository = employeeRepository;
            _logger = logger;
        }

        public async Task<EmployeeDTO> Handle(CreateEmployeeCommand request, CancellationToken cancellationToken)
        {
            // Kiểm tra EmployeeCode đã tồn tại chưa
            var exists = await _employeeRepository.EmployeeCodeExistsAsync(request.EmployeeCode, cancellationToken);

            if (exists)
            {
                throw new InvalidOperationException($"Mã nhân viên {request.EmployeeCode} đã tồn tại");
            }

            // Tạo Employee mới
            var employee = new Employee
            {
                Id = Guid.NewGuid(),
                EmployeeCode = request.EmployeeCode,
                FullName = request.FullName,
                DateOfBirth = request.DateOfBirth,
                PhoneNumber = request.PhoneNumber,
                Email = request.Email,
                IdentityNumber = request.IdentityNumber,
                DepartmentId = request.DepartmentId,
                HireDate = request.HireDate,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _employeeRepository.AddAsync(employee, cancellationToken);
            await _employeeRepository.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Created new employee: {EmployeeCode} - {FullName}", employee.EmployeeCode, employee.FullName);

            return new EmployeeDTO
            {
                Id = employee.Id,
                EmployeeCode = employee.EmployeeCode,
                FullName = employee.FullName,
                DateOfBirth = employee.DateOfBirth,
                PhoneNumber = employee.PhoneNumber,
                Email = employee.Email,
                DepartmentId = employee.DepartmentId,
                HireDate = employee.HireDate,
                IsActive = employee.IsActive
            };
        }
    }
}
