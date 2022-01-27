import {Component, NgZone, OnInit} from '@angular/core';
import {DataParserService} from "../../services/data-parser.service";
import {ChartComponent} from "../chart/chart.component";
import {
  HeatMap,
  Legend,
  Tooltip,
  ILoadedEventArgs,
  HeatMapTheme,
  ITooltipEventArgs,
} from '@syncfusion/ej2-angular-heatmap';
import {HttpClient} from "@angular/common/http";
import {ComparismService} from "../../services/comparism.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ModalDismissReasons, NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ej} from "@syncfusion/ej2-heatmap/dist/global";
import heatmap = ej.heatmap;

HeatMap.Inject(Tooltip, Legend);

@Component({
  selector: 'app-heatmap',
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.css']
})
export class HeatmapComponent extends ChartComponent implements OnInit {

  constructor(public dataParserService: DataParserService, public zone: NgZone, private http: HttpClient, public _snackBar: MatSnackBar, public comparismService: ComparismService, private modalService: NgbModal) {
    super(dataParserService, zone, _snackBar, comparismService);
  }

  public pixels = 300;
  public movementMode = false;

  public choosedColor = {value: 0, color: '#000'}
  public heatmapOptions: any = {
    width: '100%',
    height: '100%',
    titleSettings: {
      text: ' ',
      textStyle: {
        size: '30px',
        fontWeight: '500',
        fontStyle: 'Normal',
        fontFamily: 'Segoe UI'
      }
    },
    xAxis: {
      valueType: 'Numeric',
      minimum: -150,
      maximum: 150,
      intervalType: 'Numeric',
      interval: 30
    },
    yAxis: {
      valueType: 'Numeric',
      minimum: -150,
      maximum: 150,
      intervalType: 'Numeric',
      interval: 30
    },
    renderingMode: 'Canvas',
    dataSource: this.data,
    paletteSettings: {
      palette: [
        {value: 1, color: '#eff302'},
        {value: 2, color: '#f67602'},
        {value: 5, color: '#f62726'},
        {value: 10, color: '#f63ee7'},
        {value: 20, color: '#6636f6'},
        {value: 100, color: '#0634f6'},
        {value: 500, color: '#04f5f5'},
        {value: 1500, color: '#2ef103'},
      ],
      type: 'Fixed',
    },
    legendSettings: {
      position: 'Bottom',
      width: '75%',
      enableSmartLegend: true,
      toggleVisibility: true
    },
    cellSettings: {
      border: {
        width: 0
      },
      showLabel: false
    },
    tooltipSettings: {
      fill: '#265259',
      textStyle: {
        color: '#FFFFFF',
        size: '12px'
      },
      border: {
        width: 1,
        color: '#98BABF'
      }
    },
  }


  public tooltipRender(args: ITooltipEventArgs): void {
    args.content = ['In ' + args.yLabel + ', the ' + args.xLabel + ' produced ' + args.value + ' million barrels per day'];
  };

  public heatmap = new HeatMap(this.heatmapOptions)

  ngOnInit(): void {
    this.heatmap.appendTo('#heatmap');
    this.updateChart()
  }

  updateChart() {
    this.dataParserService.getHeatMapData(this.pixels, this.movementMode).subscribe(data => {
        this.heatmap.xAxis.minimum = (-1) * this.pixels * Math.abs(data.minX) / (Math.abs(data.maxX) + Math.abs(data.minX))
        this.heatmap.xAxis.maximum = ((-1) * this.pixels * Math.abs(data.minX) / (Math.abs(data.maxX) + Math.abs(data.minX))) + this.pixels
        this.heatmap.yAxis.minimum = (-1) * this.pixels * Math.abs(data.minY) / (Math.abs(data.maxY) + Math.abs(data.minY))
        this.heatmap.yAxis.maximum = (-1) * this.pixels * Math.abs(data.minY) / (Math.abs(data.maxY) + Math.abs(data.minY)) + this.pixels
        this.data = data.dataSet
        this.heatmap.dataSource = this.data
        this.heatmap.refresh()
      }, error => {
        if (error.status === 409) {
          this.openSnackBar('Keine Daten verfügbar')
        } else {
          this.openSnackBar('Fehler in der Datenübertragung')
        }
      }
    );
  }

  updateColor() {
    this.heatmap.paletteSettings.palette = this.heatmapOptions.paletteSettings.palette
    this.heatmap.refresh()
  }

  saveVisualization(): void {
    this.comparismService.addVisualization('heatmap', 'name', JSON.parse(JSON.stringify(this.heatmapOptions)), this.data);
    this.openSnackBar('Visualisierung gespeichert')
  }

  public closeResult: any;

  open(content: any) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.updateColor();
    }, (reason) => {
    });
  }


  public addPaletteEntry(): void {
    this.heatmapOptions.paletteSettings.palette.push({value: this.choosedColor.value, color: this.choosedColor.color})
    this.heatmapOptions.paletteSettings.palette.sort(function (a: { color: string, value: number }, b: { color: string, value: number }) {
      return a.value - b.value;
    });
  }

  public deletePaletteEntry(value: number, color: string): void {
    for (let i = 0; i < this.heatmapOptions.paletteSettings.palette.length; i++) {
      if (this.heatmapOptions.paletteSettings.palette[i].value === value) {
        if (this.heatmapOptions.paletteSettings.palette[i].color === color) {
          this.heatmapOptions.paletteSettings.palette.splice(i, 1);
        }
      }
    }
  }

}
