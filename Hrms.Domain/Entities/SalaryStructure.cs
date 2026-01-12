namespace Hrms.Domain.Entities
{
    public class SalaryStructure
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = null!;
        public decimal BasicSalary { get; set; }
        public int StandardWorkingDaysPerMonth { get; set; } = 26;
        public ICollection<PayComponent> PayComponents { get; set; } = new List<PayComponent>();
        public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    }

}
