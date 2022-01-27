import {Component, NgZone, OnInit} from '@angular/core';
import {DataParserService} from 'src/app/services/data-parser.service';
import {MatSnackBar} from "@angular/material/snack-bar";
import {ComparismService} from "../../services/comparism.service";

@Component({
  selector: 'app-chart',
  template: '',
})

/**
 * Represents the Super Class of each Chart
 */
export abstract class ChartComponent implements OnInit {
  /**
   * Data-Array that contain the values, that should be visualized in the chart
   */
  public data: any[] = []

  protected constructor(public dataParserService: DataParserService, public zone: NgZone, public _snackBar: MatSnackBar, public comparismService: ComparismService) {
  }

  abstract ngOnInit(): void;

  /**
   *  method is used for load the new Options-File or Data in the chart
   */
  public abstract updateChart(): void;

  /**
   * method is used for save the currently displayed visualization in the ComparismService
   */
  public abstract saveVisualization(): void;

  /**
   * opens the snack-Bar-Service --> Pop-Up-field at the bottom of the page
   * @param message represents the message, that should be displayed on the bottom of the page
   */
  public openSnackBar(message: string) {
    this._snackBar.open(message, 'close', {duration: 5000});
  }
}
