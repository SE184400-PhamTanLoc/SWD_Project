using MediatR;

namespace Hrms.Application.Features.Employees.Commands
{
    /// <summary>
    /// Command upload face template cho employee
    /// Nhận ảnh từ client, gửi đến Python AI Service để lấy embedding vector
    /// </summary>
    public class UploadFaceTemplateCommand : IRequest<bool>
    {
        public Guid EmployeeId { get; set; }
        
        /// <summary>
        /// Base64 encoded image
        /// </summary>
        public string ImageBase64 { get; set; } = null!;
    }
}
