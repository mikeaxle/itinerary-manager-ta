import { BrowserModule } from '@angular/platform-browser';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { CdkTableModule} from '@angular/cdk/table';
import 'hammerjs';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { CurrencyMaskConfig } from 'ng2-currency-mask/src/currency-mask.config';
import {
  MatSidenavModule,
  MatSnackBarModule,
  MatDatepickerModule,
  MatMenuModule,
  MatNativeDateModule,
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
  MatBottomSheetModule, MatProgressBarModule, MatAutocompleteModule
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
import { DayEditorComponent } from './itineraries/itinerary-editor/editors/day-editor/day-editor.component';
import { CommentEditorComponent } from './itineraries/itinerary-editor/editors/comment-editor/comment-editor.component';
import { PaymentEditorComponent } from './itineraries/itinerary-editor/editors/payment-editor/payment-editor.component';
import { ImageSelectorComponent } from './itineraries/itinerary-editor/image-selector/image-selector.component';
import { ItineraryDetailsEditorComponent } from './itineraries/itinerary-editor/editors/itinerary-details-editor/itinerary-details-editor.component';
import { CountryEditorComponent } from './itineraries/itinerary-editor/editors/country-editor/country-editor.component';
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
import { InclusionsPipe } from './filter/inclusions.pipe';
import { MoneyPipe } from './filter/money.pipe';
import { AgentPipe } from './filter/agent.pipe';
import { StatusPipe } from './filter/status.pipe';
import { SearchPipe } from './filter/search.pipe';
import { PdfDialogComponent } from './shared/pdf-dialog/pdf-dialog.component';
import { LoginComponent } from './login/login.component';
import { NgxAuthFirebaseUIModule } from 'ngx-auth-firebaseui';
import { ToolbarComponent } from './shared/toolbar/toolbar.component';
import { SearchComponent } from './shared/search/search.component';
import { ProgressBarComponent } from './shared/progress-bar/progress-bar.component';
import { SafeHtmlPipe } from './filter/safe-html.pipe';
import {AngularFireAuthGuard} from '@angular/fire/auth-guard';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { CountriesComponent } from './countries/countries.component';

// currency Mask settings
// @ts-ignore
// export const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
//   align: 'right',
//   allowNegative: false,
//   // @ts-ignore
//   allowZero: true,
//   decimal: '.',
//   precision: 2,
//   prefix: '',
//   suffix: '',
//   thousands: ','
// };

@NgModule({
  declarations: [
    AppComponent,
    ItinerariesComponent,
    InvalidTypeDirective,
    InvalidmessageDirective,
    EditorComponent,
    DayEditorComponent,
    CommentEditorComponent,
    PaymentEditorComponent,
    ImageSelectorComponent,
    CountryEditorComponent,
    ConfirmComponent,
    PageNotFoundComponent,
    ClientsComponent,
    PermissionDeniedDialogComponent,
    InventoryComponent,
    MediaComponent,
    AgentsComponent,
    FileUploaderComponent,
    ItineraryItemFilterPipePipe,
    InclusionsPipe,
    MoneyPipe,
    AgentPipe,
    StatusPipe,
    SearchPipe,
    PdfDialogComponent,
    LoginComponent,
    ToolbarComponent,
    SearchComponent,
    ProgressBarComponent,
    SafeHtmlPipe,
    CountriesComponent
  ],
  entryComponents: [
    DayEditorComponent,
    CommentEditorComponent,
    PaymentEditorComponent,
    ImageSelectorComponent,
    ItineraryDetailsEditorComponent,
    CountryEditorComponent,
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
    MatProgressBarModule,
    MatAutocompleteModule,
    DragDropModule
  ],
  providers: [AngularFireAuthGuard],
  bootstrap: [AppComponent],
  exports: [
    ProgressBarComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
  constructor(overlayContainer: OverlayContainer) {
    if (localStorage.getItem('company') === 'Planet Africa') {
      overlayContainer.getContainerElement().classList.add('planet-africa-theme');
    }
  }
}
