namespace Hrms.Domain.Entities
{
    public class PayrollPeriod
    {
        public Guid Id { get; set; }
        public string PeriodCode { get; set; } = null!;
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public bool IsClosed { get; set; }
        public ICollection<PayrollItem> PayrollItems { get; set; } = new List<PayrollItem>();
    }
}
