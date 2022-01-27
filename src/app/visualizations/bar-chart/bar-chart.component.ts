import {Component, Input, NgZone, OnInit} from '@angular/core';
import {Chart} from 'angular-highcharts'
import {DataParserService} from "../../services/data-parser.service";
import {ChartComponent} from "../chart/chart.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ComparismService} from 'src/app/services/comparism.service';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent extends ChartComponent implements OnInit {

  constructor(public dataParserService: DataParserService, public zone: NgZone, public _snackBar: MatSnackBar, public comparismService: ComparismService) {
    super(dataParserService, zone, _snackBar, comparismService);
  }

  public chartOptions: any = {
    chart: {
      type: 'column'
    },
    title: {
      text: 'Anzahl aufgetretener Personen'
    },

    xAxis: {
      categories: [
        '0:00',
        '1:00',
        '2:00',
        '3:00',
        '4:00',
        '5:00',
        '6:00',
        '7:00',
        '8:00',
        '9:00',
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '15:00',
        '16:00',
        '17:00',
        '18:00',
        '19:00',
        '20:00',
        '21:00',
        '22:00',
        '23:00'
      ],
      crosshair: true
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Anzahl Personen'
      }
    },
    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y: f}</b></td></tr>',
      footerFormat: '</table>',
      shared: true,
      useHTML: true
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0
      }
    },
    series: []
  }
  public chart = new Chart(this.chartOptions);


  ngOnInit(): void {
    this.updateChart();
  }

  updateChart(): void {
    this.getBarChartData();
  }

  saveVisualization(): void {
    this.comparismService.addVisualization('barchart', 'name', JSON.parse(JSON.stringify(this.chartOptions)), this.data);
    this.openSnackBar('Visualisierung gespeichert')
  }

  getBarChartData(): void {
    this.dataParserService.getBarChartData().subscribe(data => {
      this.data = data
      this.chartOptions.series?.pop()
      this.chartOptions.series?.push({name: '', data: this.data, type: 'column'}
      )
      this.chart = new Chart(this.chartOptions);
    }, error => {
      if (error.status === 409) {
        this.openSnackBar('Keine Daten verfügbar')
      } else {
        this.openSnackBar('Fehler in der Datenübertragung')
      }
    });
  }
}
