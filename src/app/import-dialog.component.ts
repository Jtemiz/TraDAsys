import {Component} from "@angular/core";
import {FileSystemDirectoryEntry, FileSystemFileEntry, NgxFileDropEntry} from "ngx-file-drop";
import {DataParserService} from "./services/data-parser.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {HttpClient} from "@angular/common/http";
import {SpinnerService} from "./services/spinner.service";

@Component({
  selector: 'import-dialog',
  templateUrl: 'import-dialog.component.html',
})
export class ImportDialog {
  constructor(private dataParserService: DataParserService, private _snackBar: MatSnackBar, private http: HttpClient, private spinnerService: SpinnerService) {
  }

  /*****************
   *File-Properties*
   *****************/
  private maxUploadSizeMB = 200
  private allowedFormats = ['.txt']

  public files: NgxFileDropEntry[] = [];
  private output: File[] = []
  private fileSize = 0

  /**
   * methode is called when files have and dropped in the File-Upload-Area
   * @param files to upload
   */
  public dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    try {
      this.spinnerService.show();
      for (const droppedFile of files) {
        // Is it a file?
        if (droppedFile.fileEntry.isFile) {
          const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
          fileEntry.file((file: File) => {
            if (this.fileSize < this.maxUploadSizeMB) {
              if (this.isFileAllowed(file.name)) {
                this.fileSize += file.size / 1000000;
                this.output.push(file);
              } else {
                this.openSnackBar("Upload nicht vollständig: Mindestens eine enthaltene Dateiendung stimmt nicht mit dem zugelassenen Format überein: " + file.name)
              }
            } else {
              this.openSnackBar("Upload nicht vollständig: Maximale Uploadgröße von " + this.maxUploadSizeMB + "MB überschritten. Datensatz wurde entsprechend gekürzt.")
            }
          });
        } else {
          // It was a directory (empty directories are added, otherwise only files)
          const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        }
      }
      this.spinnerService.hide();
    } catch (e) {
      this.openSnackBar("Fehler im Datenimport, bitte überprüfen Sie das Hochgelade File.");
      this.spinnerService.hide();
    }
  }

  /**
   * Methode is called when green Button in upload dialog is clicked.
   * Sends the dragged files to the Backend
   */
  public transportFile(): void {
    if (this.output.length == 0) {
      this.openSnackBar('Keine Datei ausgewählt.')
    } else {
      try {
        // append all available files to the FormData-File
        let formData = new FormData()
        for (let file of this.output) {
          formData.append('files[]', file, file.name)
        }
        // first delete existing dataset in the backend            => when deleting was successful import new Dataset                           => and open snackbar for success-Message
        this.dataParserService.deleteData().subscribe(success => this.dataParserService.importData(formData).subscribe(receiveMessage => this.openSnackBar(receiveMessage)));
      } catch (e) {
        this.openSnackBar(e)
      }
    }
  }

  isFileAllowed(fileName: string): boolean {
    let isFileAllowed = false;
    const regex = /(?:\.([^.]+))?$/;
    const extension = regex.exec(fileName);
    if (undefined !== extension && null !== extension) {
      for (const ext of this.allowedFormats) {
        if (ext === extension[0]) {
          isFileAllowed = true;
        }
      }
    }
    return isFileAllowed;
  }


  public openSnackBar(message: string) {
    this._snackBar.open(message, 'close', {duration: 10000});
  }
}
