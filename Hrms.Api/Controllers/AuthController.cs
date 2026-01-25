using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Hrms.Application.DTOs.Auth;
using Hrms.Application.Features.Auth.Commands;
using Hrms.Application.Features.Auth.Queries;

namespace Hrms.Api.Controllers
{
    /// <summary>
    /// Controller xử lý Authentication & Authorization
    /// Module 1: Authentication & Authorization
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IMediator mediator, ILogger<AuthController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        /// <summary>
        /// Đăng ký tài khoản mới (Admin tạo account cho các role)
        /// POST /api/auth/register
        /// </summary>
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<ActionResult<RegisterResponseDto>> Register([FromBody] RegisterRequestDto request)
        {
            try
            {
                var command = new RegisterCommand
                {
                    Username = request.Username,
                    Password = request.Password,
                    ConfirmPassword = request.ConfirmPassword,
                    RoleId = request.RoleId
                };

                var result = await _mediator.Send(command);
                
                if (!result.Success)
                {
                    return BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration for user: {Username}", request.Username);
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi đăng ký tài khoản" });
            }
        }

        /// <summary>
        /// Đăng nhập vào hệ thống
        /// POST /api/auth/login
        /// </summary>
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto request)
        {
            try
            {
                var command = new LoginCommand
                {
                    Username = request.Username,
                    Password = request.Password
                };

                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for user: {Username}", request.Username);
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi đăng nhập" });
            }
        }

        /// <summary>
        /// Đăng xuất (có thể implement logout logic nếu cần)
        /// POST /api/auth/logout
        /// </summary>
        [HttpPost("logout")]
        [Authorize]
        public async Task<ActionResult> Logout()
        {
            // TODO: Có thể implement blacklist token nếu cần
            return Ok(new { message = "Đăng xuất thành công" });
        }

        /// <summary>
        /// Lấy danh sách tất cả roles (để hiển thị trong form đăng ký)
        /// GET /api/auth/roles
        /// </summary>
        [HttpGet("roles")]
        [AllowAnonymous]
        public async Task<ActionResult<List<RoleDto>>> GetAllRoles()
        {
            try
            {
                var query = new GetAllRolesQuery();
                var result = await _mediator.Send(query);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting roles");
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách roles" });
            }
        }

        /// <summary>
        /// Lấy thông tin user hiện tại
        /// GET /api/auth/me
        /// </summary>
        [HttpGet("me")]
        [Authorize]
        public ActionResult GetCurrentUser()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var username = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            var roles = User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value).ToList();
            return Ok(new
            {
                UserId = userId,
                Username = username,
                Roles = roles
            });
        }
    }
}
