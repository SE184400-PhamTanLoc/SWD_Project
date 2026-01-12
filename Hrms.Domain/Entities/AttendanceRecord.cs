namespace Hrms.Domain.Entities
{
    public class AttendanceRecord
    {
        public Guid Id { get; set; }

        public Guid EmployeeId { get; set; }
        public Employee Employee { get; set; } = null!;

        public DateTime WorkDate { get; set; }
        public DateTime? CheckInTime { get; set; }
        public DateTime? CheckOutTime { get; set; }

        public double TotalHours { get; set; }
        public AttendanceStatus Status { get; set; }
        public AttendanceSource Source { get; set; }

        public string? Note { get; set; }
    }
}