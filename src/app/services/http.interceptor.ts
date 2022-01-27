import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import {SpinnerService} from "./spinner.service";
import {tap} from "rxjs/operators";

@Injectable()
export class CustomHttpInterceptor implements HttpInterceptor {

  constructor(private spinnerService: SpinnerService) { }

  /**
   * Method is on each http-request in the AppComponent
   * Opens the global spinner in AppComponent when Request starts and hides the spinner at the response
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.spinnerService.show();
    return next
      .handle(req)
      .pipe(
        tap((event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            this.spinnerService.hide();
          }
        }, (error) => {
          this.spinnerService.hide();
        })
      );
  }
}
