namespace Hrms.Domain.Entities
{
    public class Employee
    {
        public Guid Id { get; set; }
        public string EmployeeCode { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public DateTime DateOfBirth { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }

        public Guid? DepartmentId { get; set; }
        public Department? Department { get; set; }

        public DateTime HireDate { get; set; }
        public bool IsActive { get; set; } = true;

        // Navigation properties - CHỈ GIỮ PHẦN CHẤM CÔNG
        public ICollection<ShiftAssignment> ShiftAssignments { get; set; } = new List<ShiftAssignment>();
        public ICollection<AttendanceRecord> AttendanceRecords { get; set; } = new List<AttendanceRecord>();
        public FaceTemplate? FaceTemplate { get; set; }
    }
}