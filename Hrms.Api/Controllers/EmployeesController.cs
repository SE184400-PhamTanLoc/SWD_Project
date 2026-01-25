using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Hrms.Application.DTOs;
using Hrms.Application.Features.Employees.Commands;
using Hrms.Application.Features.Employees.Queries;

namespace Hrms.Api.Controllers
{
    /// <summary>
    /// Controller quản lý Employees
    /// Module 2: Employee Management
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EmployeesController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<EmployeesController> _logger;

        public EmployeesController(IMediator mediator, ILogger<EmployeesController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        /// <summary>
        /// Lấy danh sách tất cả employees
        /// GET /api/employees
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<EmployeeDTO>>> GetAllEmployees(
            [FromQuery] bool? isActive = null,
            [FromQuery] Guid? departmentId = null)
        {
            var query = new GetAllEmployeesQuery
            {
                IsActive = isActive,
                DepartmentId = departmentId
            };

            var result = await _mediator.Send(query);
            return Ok(result);
        }

        /// <summary>
        /// Tạo mới employee
        /// POST /api/employees
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin,HR")]
        public async Task<ActionResult<EmployeeDTO>> CreateEmployee([FromBody] CreateEmployeeCommand command)
        {
            try
            {
                var result = await _mediator.Send(command);
                return CreatedAtAction(nameof(GetAllEmployees), new { id = result.Id }, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Upload face template cho employee
        /// POST /api/employees/{id}/face-template
        /// </summary>
        [HttpPost("{id}/face-template")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<ActionResult> UploadFaceTemplate(Guid id, [FromBody] UploadFaceTemplateCommand command)
        {
            try
            {
                command.EmployeeId = id;
                var result = await _mediator.Send(command);
                return Ok(new { message = "Face template uploaded successfully", success = result });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading face template for employee: {EmployeeId}", id);
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi upload face template" });
            }
        }
    }
}
