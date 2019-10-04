import { BrowserModule } from '@angular/platform-browser';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { CdkTableModule} from '@angular/cdk/table';
import 'hammerjs';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AppComponent } from './app.component';
import { SavePdfService } from './save-pdf.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CountryService } from './country.service';
import { MyDateAdapter, MY_DATE_FORMATS } from './custom-date-adapter';
import { DragulaModule } from 'ng2-dragula';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { CurrencyMaskConfig, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask/src/currency-mask.config';
import {
  MatSidenavModule,
  MatSnackBarModule,
  MatDatepickerModule,
  MatMenuModule,
  MatNativeDateModule,
  DateAdapter,
  NativeDateAdapter,
  MAT_DATE_FORMATS,
  MatToolbarModule,
  MatInputModule,
  MatSelectModule,
  MatCardModule,
  MatButtonModule,
  MatIconModule,
  MatChipsModule,
  MatProgressSpinnerModule,
  MatDialogModule,
  MatTableModule,
  MatSortModule,
  MatGridListModule,
  MatListModule,
  MatRadioModule,
  MatHeaderCell,
  MatCell,
  MatFooterCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRowDef,
  MatHeaderCellDef,
  MatCellDef, MatSort, MatTable, MatSortHeader, MatBottomSheetModule
} from '@angular/material';
import { CapitalizePipe } from './capitalize.pipe';
import { InvalidTypeDirective } from './invalid-type.directive';
import { InvalidmessageDirective } from './invalidmessage.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { OverlayContainer } from '@angular/cdk/overlay';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';
import {AngularFireStorageModule} from '@angular/fire/storage';
import {AngularFireAuthGuard} from '@angular/fire/auth-guard';
import {DataService} from './data.service';
import {AngularFireAuthModule} from '@angular/fire/auth';
import {AngularFireDatabaseModule} from '@angular/fire/database';
import { AppRoutingModule } from './app-routing.module';
import {ItinerariesComponent} from './itineraries/itineraries.component';
import {MatPaginatorModule} from '@angular/material/paginator';
import {RouterModule, ROUTES} from '@angular/router';
import { EditorComponent } from './editor/editor.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { ItineraryEditorComponent } from './itinerary-editor/itinerary-editor.component';
import { DayComponent } from './day/day.component';
import { CommentComponent } from './comment/comment.component';
import { PaymentComponent } from './payment/payment.component';
import { ImageSelectorComponent } from './image-selector/image-selector.component';
import { ItineraryDetailsEditorComponent } from './itinerary-details-editor/itinerary-details-editor.component';
import { AddCountryNumberComponent } from './add-country-number/add-country-number.component';
import { ConfirmComponent } from './confirm/confirm.component';
import {HttpClientModule} from '@angular/common/http';

// currency Mask settings
// @ts-ignore
export const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
  align: 'right',
  allowNegative: false,
  // @ts-ignore
  allowZero: true,
  decimal: '.',
  precision: 2,
  prefix: '',
  suffix: '',
  thousands: ','
};

@NgModule({
  declarations: [
    AppComponent,
    ItinerariesComponent,
    CapitalizePipe,
    InvalidTypeDirective,
    InvalidmessageDirective,
    EditorComponent,
    ItineraryEditorComponent,
    DayComponent,
    CommentComponent,
    PaymentComponent,
    ImageSelectorComponent,
    ItineraryDetailsEditorComponent,
    AddCountryNumberComponent,
    ConfirmComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularSvgIconModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireStorageModule,
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    BrowserAnimationsModule,
    MatNativeDateModule,
    FlexLayoutModule,
    DragulaModule,
    CdkTableModule,
    MatMenuModule,
    MatDatepickerModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatToolbarModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTableModule,
    MatSortModule,
    MatGridListModule,
    MatListModule,
    CurrencyMaskModule,
    MatRadioModule,
    MatPaginatorModule,
    MatTableModule,
    MatBottomSheetModule,
    ReactiveFormsModule,
    MatSelectModule,
    FormsModule
  ],
  providers: [],
  entryComponents: [
    DayComponent,
    CommentComponent,
    PaymentComponent,
    ImageSelectorComponent,
    ItineraryDetailsEditorComponent,
    AddCountryNumberComponent,
    EditorComponent
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
  constructor(overlayContainer: OverlayContainer){
    if (localStorage.getItem('currentCompany') === 'Planet Africa') {
      overlayContainer.getContainerElement().classList.add('planet-africa-theme');
    }
  }
}
