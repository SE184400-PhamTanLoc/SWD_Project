namespace Hrms.Domain.Entities
{
    public class PayrollItem
    {
        public Guid Id { get; set; }
        public Guid PayrollPeriodId { get; set; }
        public PayrollPeriod PayrollPeriod { get; set; } = null!;
        public Guid EmployeeId { get; set; }
        public Employee Employee { get; set; } = null!;
        public int WorkingDays { get; set; }
        public double OtHoursNormal { get; set; }
        public double OtHoursWeekend { get; set; }
        public double OtHoursHoliday { get; set; }
        public decimal TotalEarnings { get; set; }
        public decimal TotalDeductions { get; set; }
        public decimal NetPay { get; set; }
    }

}
