import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,    
    AngularFirestoreModule,
    AngularFireAuthModule,
    ReactiveFormsModule,
    FirebaseUIModule.forRoot(firebaseUiAuthConfig),
    AngularFireModule.initializeApp(environment.firebase), // Añade esta línea
  ],
  providers: [
    { provide: Auth, useValue: getAuth(initializeApp(environment.firebase)) },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
