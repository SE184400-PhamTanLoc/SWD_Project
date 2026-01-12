namespace Hrms.Domain.Entities
{
    public class UserAccount
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public Guid? EmployeeId { get; set; }
        public Employee? Employee { get; set; }
        public bool IsActive { get; set; } = true;
        public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    }
}
