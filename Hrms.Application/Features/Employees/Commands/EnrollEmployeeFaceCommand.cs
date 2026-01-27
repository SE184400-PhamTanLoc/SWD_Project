using MediatR;

namespace Hrms.Application.Features.Employees.Commands
{
    /// <summary>
    /// Command để enroll (đăng ký) khuôn mặt nhân viên vào Python AI Service
    /// </summary>
    public class EnrollEmployeeFaceCommand : IRequest<EnrollEmployeeFaceResponseDto>
    {
        public Guid EmployeeId { get; set; }
        public string ImageBase64 { get; set; } = string.Empty;
    }

    /// <summary>
    /// Response DTO cho enrollment
    /// </summary>
    public class EnrollEmployeeFaceResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? EmployeeCode { get; set; }
        public string? EmployeeName { get; set; }
        public int? Label { get; set; }
    }
}
