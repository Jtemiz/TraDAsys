import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {ej} from "@syncfusion/ej2-heatmap/dist/global";
import heatmap = ej.heatmap;

@Injectable({
  providedIn: 'root'
})
export class DataParserService {
  constructor(private http: HttpClient) {
  }

  apiURL = 'https://api.tradasys.de/'

  setFilter(filter: {}) {
    return this.http.put<any>(this.apiURL + 'filter', {filter: filter})
  }

  getFilter(): Observable<any> {
    return this.http.get<{}>(this.apiURL + 'filter');
  }

  deleteData() {
    return this.http.delete(this.apiURL + 'upload')
  }

  importData(file: FormData) {
    return this.http.post<any>(this.apiURL + 'upload', file)
  }

  importDataInfo() {
    return this.http.get<any>(this.apiURL + 'upload')
  }

  getBarChartData() {
    return this.http.get<[]>(this.apiURL + 'barchart')
  }

  getHeatMapData(pixels: number, movementModeActive: boolean) {
    let heatmapURL = movementModeActive ? 'heatmapmovement' : 'heatmap'
    return this.http.put<{ minX: number, minY: number, maxX: number, maxY: number, dataSet: any[] }>(this.apiURL + heatmapURL, {
      'xaxis': pixels,
      'yaxis': pixels
    })
  }
}
