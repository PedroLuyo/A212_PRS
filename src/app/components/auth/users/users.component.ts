import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/authService';
import { Users } from '../../../models/users.model';
import { map } from 'rxjs/operators';
import { FormGroup, FormControl } from '@angular/forms';
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  users?: Users[];
  currentUser?: Users;
  currentIndex = -1;
  formRegister: FormGroup;
  constructor(private userService: AuthService) {
    this.formRegister = new FormGroup({
      nombre: new FormControl(),
      apellidos: new FormControl(),
      rol: new FormControl(),
    });
  }

  ngOnInit(): void {
    this.retrieveUsers();
  }

  retrieveUsers(): void {
    this.userService
      .getAll()
      .snapshotChanges()
      .pipe(
        map((changes) =>
          changes.map((c) => ({
            id: c.payload.doc.id,
            ...(c.payload.doc.data() as Users),
          }))
        )
      )
      .subscribe((data) => {
        this.users = data;
      });
  }

  setActiveUser(user: Users, index: number): void {
    this.currentUser = user;
    this.currentIndex = index;
  }

  loginWithGoogle() {
    this.userService
      .loginWithGoogle()
      .then(() => {
        console.log('Logeado con Google');
      })
      .catch((error) => {
        console.log(error);
      });
  }

  logout() {
    this.userService
      .logout()
      .then(() => {
        console.log('Salir de Google');
      })
      .catch((error) => {
        console.log(error);
      });
  }
  async onSubmit() {
    try {
      const user = this.formRegister.value;
      await this.userService.register({
        email: user.email, 
        name: user.nombre,
        password: user.password, 
        rol: user.rol,
      });
      console.log('Usuario registrado con éxito');
    } catch (error) {
      console.log('Error al registrar el usuario', error);
    }
  }

  exportCSV(): void {
    let csvData = 'Correo,Nombre,Rol\n';
    if (this.users) {
      this.users.forEach(user => {
        csvData += `${user.email},${user.name},${user.role}\n`;
      });
    }
  
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url= window.URL.createObjectURL(blob);
  
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'reporte_usuarios.csv');
    link.style.visibility = 'hidden';
  
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
