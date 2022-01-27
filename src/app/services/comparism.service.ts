import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ComparismService {

  private savedHeatMaps: any = []
  private savedBarCharts: any = []

  /**
   * set method for the Chart-Arrays
   * @param type decides if a chart is a HeatMap or a Barchart. Important for choosing the right ChartModule (ej2 or Highcharts)
   * @param name title of the chart
   * @param options configurations of the chart
   * @param values dataset that should me saved
   */
  public addVisualization(type: string, name: string, options: any, values: any): void {
    if (type == 'heatmap') {
      this.savedHeatMaps.push(
        {
          'name': name,
          'options': options,
          'dataSource': values
        });
    } else if (type == 'barchart') {
      this.savedBarCharts.push(
        {
          'name': name,
          'options': options,
          'dataSource': values
        }
      )
    }
    console.log(this.savedBarCharts)
  }

  public getHeatMaps(): any[] {
    return this.savedHeatMaps
  }

  public getBarCharts(): any[] {
    return this.savedBarCharts
  }
}
