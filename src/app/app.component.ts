import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../environments/environment.development';

type Employee = {
  EmployeeName: string | null;
  StarTimeUtc: Date;
  EndTimeUtc: Date;
  MonthlyHours: number;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  employees: Employee[] = [];
  groupedEmployees: Map<string, Employee> = new Map();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http
      .get<Employee[]>(
        `https://rc-vault-fap-live-1.azurewebsites.net/api/gettimeentries?code=${environment.apiKey}`
      )
      .pipe(map((employees) => this.EditEmployeesDataStream(employees)))
      .subscribe({
        next: (employees) => {
          this.employees = employees;
        },
      });
  }

  private EditEmployeesDataStream(employees: Employee[]): Employee[] {
    employees.forEach((employee) => {
      if (!employee.EmployeeName) return;

      const minutes = this.CalculateMinutesDifference(
        employee.StarTimeUtc,
        employee.EndTimeUtc
      );

      if (minutes <= 0) return;
      employee.MonthlyHours = minutes;

      this.GroupEmployeesByName(employee);
    });

    this.groupedEmployees.forEach((employee) => {
      employee.MonthlyHours = Math.ceil(employee.MonthlyHours / 60);
    });

    const sortedEmployees = Array.from(this.groupedEmployees.values()).sort(
      (a, b) => b.MonthlyHours - a.MonthlyHours
    );
    return sortedEmployees;
  }

  private CalculateMinutesDifference(startDate: Date, endDate: Date): number {
    const startDateTime = new Date(startDate).getTime();
    const endDateTime = new Date(endDate).getTime();
    return Math.ceil((endDateTime - startDateTime) / (1000 * 60));
  }

  private GroupEmployeesByName(employee: Employee): void {
    if (!employee.EmployeeName) return;

    const name = employee.EmployeeName;
    if (this.groupedEmployees.has(name)) {
      const existingEmployee = this.groupedEmployees.get(name);
      existingEmployee !== undefined
        ? (existingEmployee.MonthlyHours += employee.MonthlyHours)
        : undefined;
    } else {
      this.groupedEmployees.set(name, { ...employee });
    }
  }
}
