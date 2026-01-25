using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Hrms.Application.DTOs.FaceRecognition;
using Hrms.Application.Features.FaceRecognition.Commands;

namespace Hrms.Api.Controllers
{
    /// <summary>
    /// Controller xử lý Face Recognition
    /// Module 3: Face Recognition Integration
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class FaceRecognitionController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<FaceRecognitionController> _logger;

        public FaceRecognitionController(IMediator mediator, ILogger<FaceRecognitionController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        /// <summary>
        /// Xử lý nhận diện khuôn mặt từ ESP32-CAM
        /// POST /api/face-recognition/process
        /// </summary>
        [HttpPost("process")]
        [AllowAnonymous] // Cho phép ESP32-CAM gọi mà không cần authentication
        public async Task<ActionResult<FaceRecognitionResponseDto>> ProcessFaceRecognition(
            [FromBody] FaceRecognitionRequestDto request)
        {
            try
            {
                var command = new ProcessFaceRecognitionCommand
                {
                    ImageBase64 = request.ImageBase64,
                    DeviceId = request.DeviceId,
                    CapturedAt = request.CapturedAt
                };

                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing face recognition");
                return StatusCode(500, new FaceRecognitionResponseDto
                {
                    Status = "Error",
                    Message = "Đã xảy ra lỗi khi xử lý nhận diện khuôn mặt"
                });
            }
        }

        /// <summary>
        /// Lấy lịch sử nhận diện
        /// GET /api/face-recognition/results
        /// </summary>
        [HttpGet("results")]
        [Authorize]
        public async Task<ActionResult> GetRecognitionResults(
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null,
            [FromQuery] Guid? employeeId = null)
        {
            // TODO: Implement query để lấy lịch sử từ AttendanceDeviceLogs
            return Ok(new { message = "Feature coming soon" });
        }
    }
}
