namespace Hrms.Domain.Entities
{
    public class Department
    {
        public Guid Id { get; set; }
        public string DepartmentCode { get; set; } = null!;
        public string Name { get; set; } = null!;
        public Guid? ManagerId { get; set; }
        public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    }

}
