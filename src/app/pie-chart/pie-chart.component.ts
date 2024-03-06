import { Component, Input, OnInit } from '@angular/core';
import { EmployeesPercentages } from '../app.component';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.css',
})
export class PieChartComponent implements OnInit {
  @Input() employeesData: EmployeesPercentages[] = [];

  chartOptions = {
    animationEnabled: true,
    title: {
      text: '',
    },
    data: [
      {
        type: 'pie',
        startAngle: -90,
        indexLabel: '{name}: {y}',
        indexLabelPlacement: 'outside',
        yValueFormatString: "#,###.##'%'",
        dataPoints: [] as { y: number; name: string | null }[],
      },
    ],
  };
  ngOnInit(): void {
    this.employeesData.forEach((employee) => {
      this.chartOptions.data[0].dataPoints.push({
        y: employee.Percentage,
        name: employee.EmployeeName,
      });
    });
  }
}
