using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Hrms.Application.Features.Shifts.Commands;

namespace Hrms.Api.Controllers
{
    /// <summary>
    /// Controller quản lý Shifts và Shift Assignments
    /// Module 6: Shift & Assignment Management
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ShiftsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<ShiftsController> _logger;

        public ShiftsController(IMediator mediator, ILogger<ShiftsController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        /// <summary>
        /// Tạo mới shift
        /// POST /api/shifts
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin,HR")]
        public async Task<ActionResult> CreateShift([FromBody] CreateShiftCommand command)
        {
            try
            {
                var shiftId = await _mediator.Send(command);
                return Ok(new { shiftId, message = "Shift created successfully" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Gán shift cho employee
        /// POST /api/shifts/assign
        /// </summary>
        [HttpPost("assign")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<ActionResult> AssignShift([FromBody] AssignShiftToEmployeeCommand command)
        {
            try
            {
                var assignmentId = await _mediator.Send(command);
                return Ok(new { assignmentId, message = "Shift assigned successfully" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy danh sách shifts
        /// GET /api/shifts
        /// </summary>
        [HttpGet]
        public async Task<ActionResult> GetShifts()
        {
            // TODO: Implement query
            return Ok(new { message = "Feature coming soon" });
        }
    }
}
