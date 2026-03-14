using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Hrms.Application.DTOs.Attendance;
using Hrms.Application.Features.Attendance.Commands;

namespace Hrms.Api.Controllers
{
    /// <summary>
    /// Controller xử lý Attendance
    /// Module 4: Attendance Processing
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class AttendanceController : ControllerBase
    {
        public class FaceCheckInForm
        {
            public IFormFile File { get; set; } = null!;
            public string? DeviceId { get; set; }
        }

        private readonly IMediator _mediator;
        private readonly ILogger<AttendanceController> _logger;

        public AttendanceController(IMediator mediator, ILogger<AttendanceController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }
 
        /// <summary>
        /// Xử lý face check-in/check-out từ ESP32-CAM hoặc Upload tay
        /// POST /api/attendance/face-checkin
        /// </summary>
        [HttpPost("face-checkin")]
        [AllowAnonymous]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<FaceCheckInResponseDto>> FaceCheckIn(
            [FromForm] FaceCheckInForm form)
        {
            try
            {
                if (form.File == null || form.File.Length == 0)
                {
                    return BadRequest(new { message = "Vui lòng chọn một file ảnh" });
                }

                // Chuyển file sang Base64
                using var ms = new MemoryStream();
                await form.File.CopyToAsync(ms);
                var imageBase64 = Convert.ToBase64String(ms.ToArray());

                var command = new FaceCheckInCommand
                {
                    DeviceId = form.DeviceId ?? "Manual-Upload",
                    ImageBase64 = imageBase64,
                    CapturedAt = DateTime.UtcNow
                };

                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during manual face check-in");
                return Ok(new FaceCheckInResponseDto
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi khi xử lý check-in",
                    Status = "Error"
                });
            }
        }

    }
}
