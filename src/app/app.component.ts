import {Component} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {ImportDialog} from "./import-dialog.component";
import {SpinnerService} from "./services/spinner.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'TraDAsys';

  constructor(private dialog: MatDialog, public spinnerService: SpinnerService) {
  }

  /**
   * Opens the Input-Dialog. Is called when user clicks on UploadButton in UpperNavBar or SideNavBar
   */
  openDialog() {
    const dialogRef = this.dialog.open(ImportDialog);
    dialogRef.afterClosed().subscribe(result => {
    })
  }
}
