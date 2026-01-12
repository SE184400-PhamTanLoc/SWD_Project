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

        public Guid DepartmentId { get; set; }
        public Department Department { get; set; } = null!;

        public Guid PositionId { get; set; }
        public Position Position { get; set; } = null!;

        public DateTime HireDate { get; set; }
        public bool IsActive { get; set; } = true;

        // Lương & cấu trúc lương hiện tại
        public Guid SalaryStructureId { get; set; }
        public SalaryStructure SalaryStructure { get; set; } = null!;

        // Navigation
        public ICollection<ShiftAssignment> ShiftAssignments { get; set; } = new List<ShiftAssignment>();
        public ICollection<AttendanceRecord> AttendanceRecords { get; set; } = new List<AttendanceRecord>();
        public ICollection<LeaveRequest> LeaveRequests { get; set; } = new List<LeaveRequest>();
        public ICollection<PayrollItem> PayrollItems { get; set; } = new List<PayrollItem>();
        public FaceTemplate? FaceTemplate { get; set; }
    }

}
