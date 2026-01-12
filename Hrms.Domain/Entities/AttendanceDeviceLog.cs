namespace Hrms.Domain.Entities
{
    public class AttendanceDeviceLog
    {
        public Guid Id { get; set; }

        public DateTime CapturedAt { get; set; }
        public string DeviceCode { get; set; } = null!;
        public string? RawImagePath { get; set; }          // nếu lưu ảnh
        public string? FaceToken { get; set; }             // id tạm từ AI
        public Guid? EmployeeId { get; set; }
        public float? Confidence { get; set; }
    }

}
