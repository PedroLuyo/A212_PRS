import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersComponent } from './components/auth/users/users.component';
import { LoginComponent } from './components/auth/login/login.component';
import { MainComponent } from './main/main.component';
import { PlatocartaComponent } from './components/platocarta/platocarta.component';
import { SelectorComponent } from './components/roles/selector/selector.component';
import { RestauranteComponent } from './components/roles/restaurante/restaurante.component';
import { ComensalComponent } from './components/roles/comensal/comensal.component';
import { GestorComponent } from './components/roles/gestor/gestor.component';

const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  { path: 'users', component: UsersComponent },
  { path: 'login', component: LoginComponent },
  { path: 'main', component: MainComponent },
  { path: 'plato', component: PlatocartaComponent },
  { path: 'selector', component: SelectorComponent},
  { path: 'restaurante', component: RestauranteComponent },
  { path: 'comensal', component: ComensalComponent },
  { path: 'gestor', component: GestorComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
