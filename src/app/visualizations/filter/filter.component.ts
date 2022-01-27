import {Component, OnInit} from '@angular/core';
import {DataParserService} from 'src/app/services/data-parser.service';
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {

  constructor(public dataParserService: DataParserService, private _snackBar: MatSnackBar) {
  }

  public filter = {
    'from': '00:00:00',
    'to': '23:59:00',
    'flyingPixDist': -1,
    'engagementFrom': 0,
    'engagementTo': 1,
    'DisplayGroups': -1,
    'DisplayAttributes': [-1, -1, -1],
    'minBodyAmount': 0,
    'maxBodyAmount': 6,
    'minDistance': 0,
    'maxDistance': -1,
    'minFrameAmount': 0
  }


  public timeFrom = {hour: 0, minute: 0, second: 0};
  public timeTo = {hour: 23, minute: 59, second: 59};

  updateDateTimeFromTo(): void {
    this.filter.from = this.timeFrom.hour + ':' + this.timeFrom.minute + ':' + this.timeFrom.second
    this.filter.to = this.timeTo.hour + ':' + this.timeTo.minute + ':' + this.timeTo.second
  }


  ngOnInit(): void {
    this.dataParserService.getFilter().subscribe(data => {
      this.filter = data
      const timeFromArray = this.filter.from.split(':')
      const timeToArray = this.filter.to.split(':')
      this.timeFrom = {
        hour: parseInt(timeFromArray[0]),
        minute: parseInt(timeFromArray[1]),
        second: parseInt(timeFromArray[2])
      };
      this.timeTo = {
        hour: parseInt(timeToArray[0]),
        minute: parseInt(timeToArray[1]),
        second: parseInt(timeToArray[2])
      };
    });
  }

  public transportFilter(): void {
    this.dataParserService.setFilter(this.filter).subscribe(data => {
      if (data == 'Filter übernommen') {
        this.openSnackBar('Filter übernommen')
      } else {
        this.openSnackBar(data);
        if (data.uploadedFilesAmount != 0) {
          this.openSnackBar((data.recordAmount * 100 / data.uploadedFilesAmount).toFixed(2) + '% der ' + data.uploadedFilesAmount + ' Records verbleibend. Verbleibend:' + data.recordAmount + ' Records mit durchscnittlich je ' + (data.frameAmount / data.recordAmount).toFixed(0) + " Frames")
        } else {
          this.openSnackBar("Filter übertragen")
        }
      }
    })
  }

  public openSnackBar(message: string) {
    this._snackBar.open(message, 'close', {duration: 10000});
  }
}
