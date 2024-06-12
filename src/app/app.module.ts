import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from '../environments/environment';
import { UsersComponent } from './components/auth/users/users.component';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { ReactiveFormsModule } from '@angular/forms';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { Auth } from '@angular/fire/auth';
import { LoginComponent } from './components/auth/login/login.component';
import { MainComponent } from './main/main.component';
import { FirebaseUIModule, firebase, firebaseui } from 'firebaseui-angular';
import { AngularFireModule } from '@angular/fire/compat';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PlatocartaComponent } from './components/platocarta/platocarta.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { SelectorComponent } from './components/roles/selector/selector.component';
import { GestorComponent } from './components/roles/gestor/gestor.component';
import { RestauranteComponent } from './components/roles/restaurante/restaurante.component';
import {MatIconModule} from '@angular/material/icon';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';

const firebaseUiAuthConfig: firebaseui.auth.Config = {
  signInFlow: 'popup',
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
  ],
  credentialHelper: firebaseui.auth.CredentialHelper.NONE
};
@NgModule({
  declarations: [
    AppComponent,
    UsersComponent,
    LoginComponent,
    MainComponent,
    PlatocartaComponent,
    GestorComponent,
    RestauranteComponent,
    SelectorComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,    
    AppRoutingModule,
    FormsModule,    
    AngularFirestoreModule,
    AngularFireAuthModule,
    ReactiveFormsModule,
    FirebaseUIModule.forRoot(firebaseUiAuthConfig),
    AngularFireModule.initializeApp(environment.firebase),
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    HttpClientModule,
    MatFormFieldModule,
    NgSelectModule,
    AngularFireDatabaseModule,
    MatAutocompleteModule,
    MatInputModule,
    MatIconModule,
  ],
  providers: [
    { provide: Auth, useValue: getAuth(initializeApp(environment.firebase)) },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
