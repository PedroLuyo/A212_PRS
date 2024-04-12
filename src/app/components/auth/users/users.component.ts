import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/users.service';
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
  constructor(private userService: UserService) {
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
        email: user.email, // Asegúrate de que el formulario tenga un campo de correo electrónico
        name: user.nombre,
        password: user.password, // Asegúrate de que el formulario tenga un campo de contraseña
        rol: user.rol,
      });
      console.log('Usuario registrado con éxito');
    } catch (error) {
      console.log('Error al registrar el usuario', error);
    }
  }
}
