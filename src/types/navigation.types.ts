export type AppStackParamList = {
  Home: undefined;
  Dashboard: undefined;
  EmployeeList: undefined;
  AddEmployee: undefined;
  EnrollFace: { employeeId: string; employeeName: string };
  IoTDeviceList: undefined;
  AddIoTDevice: undefined;
  DepartmentList: undefined;
  AddDepartment:
    | {
        department?: {
          id: number;
          departmentCode: string;
          name: string;
          description?: string;
        };
      }
    | undefined;
  ProductionLineList: undefined;
  AddProductionLine: undefined;
  ShiftList: undefined;
  AddShift: undefined;
  ShiftAssignmentList: undefined;
  AddShiftAssignment: undefined;
  AttendanceCheckIn: undefined;
  AttendanceHistory: {
    employeeId?: string;
    departmentId?: number;
    productionLineId?: number;
    fromDate?: string;
    toDate?: string;
  };
  AttendanceDetail: { recordId: string };
};
