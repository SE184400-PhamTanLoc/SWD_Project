namespace Hrms.Domain.Entities
{
    public class PayComponent
    {
        public Guid Id { get; set; }
        public Guid SalaryStructureId { get; set; }
        public SalaryStructure SalaryStructure { get; set; } = null!;
        public string Code { get; set; } = null!;
        public string Name { get; set; } = null!;
        public PayComponentType Type { get; set; }
        // Ví dụ: fixed amount, percent of basic, per hour OT...
        public string CalculationFormula { get; set; } = null!;
    }
}
