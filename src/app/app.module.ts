import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AddTutorialComponent } from './components/add-tutorial/add-tutorial.component';
import { TutorialDetailsComponent } from './components/tutorial-details/tutorial-details.component';
import { TutorialsListComponent } from './components/tutorials-list/tutorials-list.component';
import { AngularFireModule } from '@angular/fire/compat';
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
import { PlatosComponent } from './components/platos/platos.component';


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
    AddTutorialComponent,
    TutorialDetailsComponent,
    TutorialsListComponent,
    UsersComponent,
    LoginComponent,
    MainComponent,
    PlatosComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFirestoreModule,
    AngularFireAuthModule,
    ReactiveFormsModule,
    FirebaseUIModule.forRoot(firebaseUiAuthConfig)
  ],
  providers: [
    { provide: Auth, useValue: getAuth(initializeApp(environment.firebase)) },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
