import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TutorialsListComponent } from './components/tutorials-list/tutorials-list.component';
import { AddTutorialComponent } from './components/add-tutorial/add-tutorial.component';
import { UsersComponent } from './components/auth/users/users.component';
import { LoginComponent } from './components/auth/login/login.component';
import { MainComponent } from './main/main.component';

const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  { path: 'tutorials', component: TutorialsListComponent },
  { path: 'add', component: AddTutorialComponent },
  { path: 'users', component: UsersComponent },
  { path: 'login', component: LoginComponent },
  { path: 'main', component: MainComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
