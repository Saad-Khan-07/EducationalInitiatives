// ==================== Interfaces (Interface Segregation Principle) ====================

interface IEmployee {
  getId(): string;
  getName(): string;
  getDepartment(): string;
  getSalary(): number;
}

interface IReport {
  getReportId(): string;
  getEmployeeId(): string;
  getReportType(): string;
  getGeneratedDate(): Date;
  getContent(): string;
}

interface IReportGenerator {
  generateReport(employee: IEmployee, reportType: string): IReport;
}

interface IReportStorage {
  saveReport(report: IReport): void;
  getReportById(reportId: string): IReport | undefined;
  getAllReports(): IReport[];
}

// ==================== Employee Class ====================

class Employee implements IEmployee {
  private id: string;
  private name: string;
  private department: string;
  private salary: number;

  constructor(id: string, name: string, department: string, salary: number) {
    this.id = id;
    this.name = name;
    this.department = department;
    this.salary = salary;
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getDepartment(): string {
    return this.department;
  }

  public getSalary(): number {
    return this.salary;
  }
}

// ==================== Report Class ====================

class Report implements IReport {
  private reportId: string;
  private employeeId: string;
  private reportType: string;
  private generatedDate: Date;
  private content: string;

  constructor(
    reportId: string,
    employeeId: string,
    reportType: string,
    content: string
  ) {
    this.reportId = reportId;
    this.employeeId = employeeId;
    this.reportType = reportType;
    this.generatedDate = new Date();
    this.content = content;
  }

  public getReportId(): string {
    return this.reportId;
  }

  public getEmployeeId(): string {
    return this.employeeId;
  }

  public getReportType(): string {
    return this.reportType;
  }

  public getGeneratedDate(): Date {
    return this.generatedDate;
  }

  public getContent(): string {
    return this.content;
  }
}

// ==================== Report Generator (Single Responsibility Principle) ====================

class ReportGenerator implements IReportGenerator {
  public generateReport(employee: IEmployee, reportType: string): IReport {
    const reportId = this.generateReportId();
    let content = '';

    switch (reportType.toLowerCase()) {
      case 'performance':
        content = this.generatePerformanceReport(employee);
        break;
      case 'salary':
        content = this.generateSalaryReport(employee);
        break;
      case 'summary':
        content = this.generateSummaryReport(employee);
        break;
      default:
        content = this.generateSummaryReport(employee);
    }

    return new Report(reportId, employee.getId(), reportType, content);
  }

  private generateReportId(): string {
    return `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generatePerformanceReport(employee: IEmployee): string {
    return `Performance Report for ${employee.getName()}\n` +
           `Employee ID: ${employee.getId()}\n` +
           `Department: ${employee.getDepartment()}\n` +
           `Performance metrics and evaluation details...`;
  }

  private generateSalaryReport(employee: IEmployee): string {
    return `Salary Report for ${employee.getName()}\n` +
           `Employee ID: ${employee.getId()}\n` +
           `Current Salary: $${employee.getSalary()}\n` +
           `Salary breakdown and payment history...`;
  }

  private generateSummaryReport(employee: IEmployee): string {
    return `Employee Summary for ${employee.getName()}\n` +
           `Employee ID: ${employee.getId()}\n` +
           `Department: ${employee.getDepartment()}\n` +
           `Salary: $${employee.getSalary()}\n` +
           `General employee information and statistics...`;
  }
}

// ==================== Report Storage (Single Responsibility Principle) ====================

class ReportStorage implements IReportStorage {
  private reports: Map<string, IReport>;

  constructor() {
    this.reports = new Map<string, IReport>();
  }

  public saveReport(report: IReport): void {
    this.reports.set(report.getReportId(), report);
  }

  public getReportById(reportId: string): IReport | undefined {
    return this.reports.get(reportId);
  }

  public getAllReports(): IReport[] {
    return Array.from(this.reports.values());
  }

  public getReportsByEmployeeId(employeeId: string): IReport[] {
    return this.getAllReports().filter(
      report => report.getEmployeeId() === employeeId
    );
  }
}

// ==================== SINGLETON PATTERN: Administrator ====================

class Administrator {
  private static instance: Administrator | null = null;
  private adminName: string;
  private reportGenerator: IReportGenerator;
  private reportStorage: IReportStorage;
  private employees: Map<string, IEmployee>;

  // Private constructor prevents direct instantiation (Singleton Pattern)
  private constructor(adminName: string) {
    this.adminName = adminName;
    this.reportGenerator = new ReportGenerator();
    this.reportStorage = new ReportStorage();
    this.employees = new Map<string, IEmployee>();
    console.log(`Administrator ${adminName} initialized.`);
  }

  // Static method to get the single instance (Singleton Pattern)
  public static getInstance(adminName: string = 'System Admin'): Administrator {
    if (Administrator.instance === null) {
      Administrator.instance = new Administrator(adminName);
    }
    return Administrator.instance;
  }

  // Reset singleton (useful for testing)
  public static resetInstance(): void {
    Administrator.instance = null;
  }

  public getAdminName(): string {
    return this.adminName;
  }

  // Employee Management
  public addEmployee(employee: IEmployee): void {
    this.employees.set(employee.getId(), employee);
    console.log(`Employee ${employee.getName()} added by ${this.adminName}`);
  }

  public getEmployee(employeeId: string): IEmployee | undefined {
    return this.employees.get(employeeId);
  }

  public getAllEmployees(): IEmployee[] {
    return Array.from(this.employees.values());
  }

  // Report Management (Delegation to ReportGenerator and ReportStorage)
  public createReport(employeeId: string, reportType: string): IReport | null {
    const employee = this.getEmployee(employeeId);
    
    if (!employee) {
      console.error(`Employee with ID ${employeeId} not found.`);
      return null;
    }

    const report = this.reportGenerator.generateReport(employee, reportType);
    this.reportStorage.saveReport(report);
    
    console.log(
      `Report ${report.getReportId()} created for employee ${employee.getName()}`
    );
    
    return report;
  }

  public getReport(reportId: string): IReport | undefined {
    return this.reportStorage.getReportById(reportId);
  }

  public getAllReports(): IReport[] {
    return this.reportStorage.getAllReports();
  }

  public getEmployeeReports(employeeId: string): IReport[] {
    return this.reportStorage.getAllReports().filter(
      report => report.getEmployeeId() === employeeId
    );
  }

  public displaySystemInfo(): void {
    console.log('\n========== Employee Report System ==========');
    console.log(`Administrator: ${this.adminName}`);
    console.log(`Total Employees: ${this.employees.size}`);
    console.log(`Total Reports: ${this.reportStorage.getAllReports().length}`);
    console.log('============================================\n');
  }
}

// ==================== Usage Example ====================

// Demonstrating Singleton Pattern
console.log('=== Singleton Pattern Demo ===\n');

// First attempt to get instance
const admin1 = Administrator.getInstance('John Doe');
admin1.displaySystemInfo();

// Second attempt - returns the same instance
const admin2 = Administrator.getInstance('Jane Smith');
console.log(`Are both admin instances same? ${admin1 === admin2}`);
console.log(`Admin name is still: ${admin2.getAdminName()}\n`);

// Adding employees
const employee1 = new Employee('EMP001', 'Alice Johnson', 'Engineering', 95000);
const employee2 = new Employee('EMP002', 'Bob Smith', 'Marketing', 75000);
const employee3 = new Employee('EMP003', 'Charlie Brown', 'Sales', 68000);

admin1.addEmployee(employee1);
admin1.addEmployee(employee2);
admin1.addEmployee(employee3);

// Creating reports
console.log('\n=== Creating Reports ===\n');
const report1 = admin1.createReport('EMP001', 'performance');
const report2 = admin1.createReport('EMP001', 'salary');
const report3 = admin1.createReport('EMP002', 'summary');

// Displaying system information
admin1.displaySystemInfo();

// Retrieving reports
if (report1) {
  console.log(`\nReport Content:\n${report1.getContent()}\n`);
}

// Getting all reports for a specific employee
const aliceReports = admin1.getEmployeeReports('EMP001');
console.log(`Total reports for Alice: ${aliceReports.length}`);

// Demonstrating that admin2 has access to same data
console.log(`\nAdmin2 can see ${admin2.getAllEmployees().length} employees`);
console.log(`Admin2 can see ${admin2.getAllReports().length} reports`);