namespace Hrms.Domain.Entities
{
    public class Position
    {
        public Guid Id { get; set; }
        public string PositionCode { get; set; } = null!;
        public string Name { get; set; } = null!;
        public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    }

}
