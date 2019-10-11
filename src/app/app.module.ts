import { BrowserModule } from '@angular/platform-browser';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { CdkTableModule} from '@angular/cdk/table';
import 'hammerjs';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragulaModule } from 'ng2-dragula';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { CurrencyMaskConfig } from 'ng2-currency-mask/src/currency-mask.config';
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
  MatBottomSheetModule
} from '@angular/material';
import { InvalidTypeDirective } from './directives/invalid-type.directive';
import { InvalidmessageDirective } from './directives/invalidmessage.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { OverlayContainer } from '@angular/cdk/overlay';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';
import {AngularFireStorageModule} from '@angular/fire/storage';
import {AngularFireAuthModule} from '@angular/fire/auth';
import {AngularFireDatabaseModule} from '@angular/fire/database';
import { AppRoutingModule } from './app-routing.module';
import {ItinerariesComponent} from './itineraries/itineraries.component';
import {MatPaginatorModule} from '@angular/material/paginator';
import { EditorComponent } from './shared/editor/editor.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { DayComponent } from './itineraries/itinerary-editor/day/day.component';
import { CommentComponent } from './itineraries/itinerary-editor/comment/comment.component';
import { PaymentComponent } from './itineraries/itinerary-editor/payment/payment.component';
import { ImageSelectorComponent } from './itineraries/itinerary-editor/image-selector/image-selector.component';
import { ItineraryDetailsEditorComponent } from './itineraries/itinerary-editor/itinerary-details-editor/itinerary-details-editor.component';
import { AddCountryNumberComponent } from './itineraries/itinerary-editor/add-country-number/add-country-number.component';
import { ConfirmComponent } from './shared/confirm/confirm.component';
import {HttpClientModule} from '@angular/common/http';
import { ItinerariesModule } from './itineraries/itineraries.module';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ClientsComponent } from './clients/clients.component';
import { PermissionDeniedDialogComponent } from './shared/permission-denied-dialog/permission-denied-dialog.component';
import { InventoryComponent } from './inventory/inventory.component';
import { MediaComponent } from './media/media.component';
import { AgentsComponent } from './agents/agents.component';
import { FileUploaderComponent } from './shared/file-uploader/file-uploader.component';
import { ItineraryItemFilterPipePipe } from './filter/itinerary.pipe';
import { CommentsPipe } from './filter/comments.pipe';
import { InclusionsPipe } from './filter/inclusions.pipe';
import { MoneyPipe } from './filter/money.pipe';
import { AgentPipe } from './filter/agent.pipe';
import { StatusPipe } from './filter/status.pipe';
import { SearchPipe } from './filter/search.pipe';
import { PdfDialogComponent } from './shared/pdf-dialog/pdf-dialog.component';
import { LoginComponent } from './login/login.component';
import { NgxAuthFirebaseUIModule } from 'ngx-auth-firebaseui';

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
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    ItinerariesComponent,
    InvalidTypeDirective,
    InvalidmessageDirective,
    EditorComponent,
    DayComponent,
    CommentComponent,
    PaymentComponent,
    ImageSelectorComponent,
    AddCountryNumberComponent,
    ConfirmComponent,
    PageNotFoundComponent,
    ClientsComponent,
    PermissionDeniedDialogComponent,
    InventoryComponent,
    MediaComponent,
    AgentsComponent,
    FileUploaderComponent,
    ItineraryItemFilterPipePipe,
    CommentsPipe,
    InclusionsPipe,
    MoneyPipe,
    AgentPipe,
    StatusPipe,
    SearchPipe,
    PdfDialogComponent,
    LoginComponent
  ],
  entryComponents: [
    DayComponent,
    CommentComponent,
    PaymentComponent,
    ImageSelectorComponent,
    ItineraryDetailsEditorComponent,
    AddCountryNumberComponent,
    EditorComponent,
    ConfirmComponent,
    PermissionDeniedDialogComponent,
    PdfDialogComponent

  ],
  imports: [
    NgxAuthFirebaseUIModule.forRoot(environment.firebase),
    BrowserModule,
    FormsModule,
    ItinerariesModule,
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
    MatSelectModule
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
  constructor(overlayContainer: OverlayContainer) {
    if (localStorage.getItem('currentCompany') === 'Planet Africa') {
      overlayContainer.getContainerElement().classList.add('planet-africa-theme');
    }
  }
}
