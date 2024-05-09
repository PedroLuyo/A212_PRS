import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersComponent } from './components/auth/users/users.component';
import { LoginComponent } from './components/auth/login/login.component';
import { MainComponent } from './main/main.component';
import { authGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { PlatocartaComponent } from './components/platocarta/platocarta.component';
import { SelectorComponent } from './components/roles/selector/selector.component';
import { RestauranteComponent } from './components/roles/restaurante/restaurante.component';
import { ComensalComponent } from './components/roles/comensal/comensal.component';
import { GestorComponent } from './components/roles/gestor/gestor.component';


const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  { path: 'users', component: UsersComponent, canActivate:[authGuard, RoleGuard], data: { role: 'admin' } },
  { path: 'login', component: LoginComponent },
  { path: 'main', component: MainComponent },

  { path: 'plato', component: PlatocartaComponent },
  { path: 'selector', component: SelectorComponent},
  { path: 'restaurante', component: RestauranteComponent },
  { path: 'comensal', component: ComensalComponent },
  { path: 'gestor', component: GestorComponent },
  //{ path: 'gestor', canActivate: [RoleGuard], data: { role: 'g' } },
  //{ path: 'comensal', canActivate: [RoleGuard], data: { role: 'c' } },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}