using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Hrms.Application.Features.IoTDevices.Commands;
using Hrms.Application.Features.IoTDevices.Queries;

namespace Hrms.Api.Controllers
{
    /// <summary>
    /// Controller quản lý IoT Devices
    /// Module 5: IoT Device Management
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class IoTDevicesController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<IoTDevicesController> _logger;

        public IoTDevicesController(IMediator mediator, ILogger<IoTDevicesController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        /// <summary>
        /// Đăng ký IoT Device
        /// POST /api/iot-devices/register
        /// </summary>
        [HttpPost("register")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<ActionResult> RegisterDevice([FromBody] RegisterDeviceCommand command)
        {
            try
            {
                var deviceId = await _mediator.Send(command);
                return Ok(new { deviceId, message = "Device registered successfully" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Cập nhật heartbeat từ device
        /// POST /api/iot-devices/{deviceId}/heartbeat
        /// </summary>
        [HttpPost("{deviceId}/heartbeat")]
        [AllowAnonymous] // Cho phép ESP32-CAM gọi
        public async Task<ActionResult> UpdateHeartbeat(string deviceId)
        {
            try
            {
                var command = new UpdateDeviceHeartbeatCommand { DeviceId = deviceId };
                var result = await _mediator.Send(command);
                return Ok(new { success = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating heartbeat for device: {DeviceId}", deviceId);
                return StatusCode(500, new { message = "Error updating heartbeat" });
            }
        }

        /// <summary>
        /// Lấy danh sách devices
        /// GET /api/iot-devices
        /// </summary>
        [HttpGet]
        [Authorize]
        public async Task<ActionResult> GetDevices()
        {
            var query = new GetIoTDevicesQuery();
            var devices = await _mediator.Send(query);
            return Ok(devices);
        }
    }
}
