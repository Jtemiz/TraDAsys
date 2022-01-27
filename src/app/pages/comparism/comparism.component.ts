import {Component, OnInit} from '@angular/core';
import {ComparismService} from "../../services/comparism.service";
import {
  HeatMap,
  Legend,
  Tooltip,
  ILoadedEventArgs,
  HeatMapTheme,
  ITooltipEventArgs
} from '@syncfusion/ej2-angular-heatmap';
import {Internationalization} from '@syncfusion/ej2-base';
import {Chart} from "angular-highcharts";


@Component({
  selector: 'app-comparism',
  templateUrl: './comparism.component.html',
  styleUrls: ['./comparism.component.css']
})
export class ComparismComponent implements OnInit {

  constructor(public comparismService: ComparismService) {
  }

  public barCharts: Chart[] = []

  ngOnInit(): void {
    for (let chart of this.comparismService.getBarCharts()) {
      this.barCharts.push(this.createBarChart(chart))
    }
  }

  public createBarChart(options: { name: string, options: any, dataSource: number[] }): Chart {
    return new Chart(options.options)
  }
}
