namespace Hrms.Domain.Entities
{
    public class FaceTemplate
    {
        public Guid Id { get; set; }

        public Guid EmployeeId { get; set; }
        public Employee Employee { get; set; } = null!;

        // Lưu base64 / byte[] embedding, tuỳ bạn map sang EF
        public byte[] Embedding { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;
    }

}
