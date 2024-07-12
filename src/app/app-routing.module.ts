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
import { VistaMenuPlatosComponent } from './components/vista-menu-platos/vista-menu-platos.component';
import { ReservaComponent } from './components/menu/reserva/reserva.component';
import { HistorialComponent } from './components/menu/historial/historial.component';
import { CrearComidaComponent } from './components/menu/crear-comida/crear-comida.component';
import { MenuComponent } from './components/menu/menu.component';
import { ProductosComponent } from './components/platocarta/productos/productos.component';
import { CategoriaComponent } from './components/platocarta/categoria/categoria.component';
import { PresentacionComponent } from './components/platocarta/presentacion/presentacion.component';
import { DetallesComponent } from './components/detalles/detalles.component';
import { CrearMenu } from './components/menu/crear-menu/crear-menu';


const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  { path: 'monitorear', component: UsersComponent, canActivate: [authGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'login', component: LoginComponent },

  { path: 'main', component: MainComponent },
  { path: 'detalles/:id', component: DetallesComponent },

  { path: 'selector', component: SelectorComponent, canActivate: [authGuard, RoleGuard], data: { roles: ['admin', 'gestor', 'comensal'] } },
  { path: 'restaurante', component: RestauranteComponent, canActivate: [authGuard, RoleGuard], data: { roles: ['admin', 'gestor'] } },
  { path: 'gestor', component: GestorComponent, canActivate: [authGuard, RoleGuard], data: { roles: ['admin', 'gestor', 'comensal'] } },
  { path: 'platos', component: VistaMenuPlatosComponent, canActivate: [authGuard, RoleGuard], data: { roles: ['admin', 'gestor'] } },

  
  { path: 'comida', component: CrearComidaComponent, canActivate: [authGuard, RoleGuard], data: { roles: ['admin', 'gestor' ] }},
  { path: 'reserva', component: ReservaComponent, canActivate: [authGuard, RoleGuard], data: { roles: ['comensal' ] } },
  { path: 'historial', component: HistorialComponent, canActivate: [authGuard, RoleGuard], data: { roles: ['admin', 'gestor'] }  },
  { path: 'menu', component: CrearMenu, canActivate: [authGuard, RoleGuard], data: { roles: ['admin', 'gestor', 'comensal'] } },


  {path: 'productos' , component: ProductosComponent, canActivate: [authGuard, RoleGuard], data: { roles: ['admin', 'gestor'] } },
  {path: 'categorias' , component: CategoriaComponent, canActivate: [authGuard, RoleGuard], data: { roles: ['admin', 'gestor'] } },
  {path: 'presentaciones' , component: PresentacionComponent, canActivate: [authGuard, RoleGuard], data: { roles: ['admin', 'gestor'] } },
  {path: 'reservas' , component: PresentacionComponent, canActivate: [authGuard, RoleGuard], data: { roles: ['admin', 'gestor'] } }



];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
