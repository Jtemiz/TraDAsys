import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent} from './app.component';
import {MatSidenavModule} from '@angular/material/sidenav'
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatIconModule} from "@angular/material/icon";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatDividerModule} from "@angular/material/divider";
import {MatButtonModule} from "@angular/material/button";
import {AppRoutingModule} from "./app-routing.module";
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {BarChartComponent} from './visualizations/bar-chart/bar-chart.component';
import {ChartModule} from 'angular-highcharts';
import {FilterComponent} from './visualizations/filter/filter.component';
import {MatSliderModule} from "@angular/material/slider";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ImportDialog} from "./import-dialog.component";
import {NgxFileDropModule} from 'ngx-file-drop';
import {MatDialogModule} from '@angular/material/dialog';
import {ScrollingModule} from "@angular/cdk/scrolling";
import {CdkTreeModule} from "@angular/cdk/tree";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {HeatmapComponent} from './visualizations/heatmap/heatmap.component';
import {HeatMapModule} from '@syncfusion/ej2-angular-heatmap';
import {MatCheckboxModule} from "@angular/material/checkbox";
import {CustomHttpInterceptor} from "./services/http.interceptor";
import {MatFormFieldModule} from "@angular/material/form-field";
import {ComparismComponent} from './pages/comparism/comparism.component';
import {CreateComponent} from './pages/create/create.component';
import {MatInputModule} from "@angular/material/input";
import {MatRadioModule} from "@angular/material/radio";
import {MatTableModule} from "@angular/material/table";
import {MatSortModule} from "@angular/material/sort";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";

@NgModule({
  declarations: [
    AppComponent,
    BarChartComponent,
    FilterComponent,
    ImportDialog,
    HeatmapComponent,
    ComparismComponent,
    CreateComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatIconModule,
    MatToolbarModule,
    MatDividerModule,
    MatButtonModule,
    NgbModule,
    HttpClientModule,
    ChartModule,
    MatSliderModule,
    FormsModule,
    NgxFileDropModule,
    MatDialogModule,
    ScrollingModule,
    CdkTreeModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    HeatMapModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatSlideToggleModule
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: CustomHttpInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule {
}
