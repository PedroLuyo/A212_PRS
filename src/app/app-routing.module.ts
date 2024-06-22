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
import { GestorComponent } from './components/roles/gestor/gestor.component';
import { ComidaVistaComponent } from './components/menu/comida-vista/comida-vista.component';
import { CrearMenuComponent } from './components/menu/crear-menu/crear-menu.component';
import { ReservaComponent } from './components/menu/reserva/reserva.component';
import { HistorialComponent } from './components/menu/historial/historial.component';
import { CrearComidaComponent } from './components/menu/crear-comida/crear-comida.component';

const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  { path: 'users', component: UsersComponent, canActivate: [authGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'login', component: LoginComponent },

  { path: 'main', component: MainComponent},
  { path: 'platos', component: PlatocartaComponent, canActivate: [authGuard, RoleGuard], data: { roles: ['admin', 'gestor'] } },
  { path: 'selector', component: SelectorComponent, canActivate: [authGuard, RoleGuard], data: { roles: ['admin', 'gestor'] } },
  { path: 'restaurante', component: RestauranteComponent, canActivate: [authGuard, RoleGuard], data: { roles: ['admin', 'gestor'] } },
  { path: 'gestor', component: GestorComponent, canActivate: [authGuard, RoleGuard], data: { roles: ['admin', 'gestor'] } },


  { path: 'comida', component: CrearComidaComponent },
  { path: 'vista', component: ComidaVistaComponent },
  { path: 'menu', component: CrearMenuComponent },
  { path: 'reserva', component: ReservaComponent },
  { path: 'historial', component: HistorialComponent  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
