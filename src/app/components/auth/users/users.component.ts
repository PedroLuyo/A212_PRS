import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/authService';
import { Users } from '../../../models/users.model';
import { FormGroup, FormControl } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  users?: Users[];
  filteredUsers?: Users[];
  currentUser?: Users;
  currentIndex = -1;
  formRegister: FormGroup;
  searchForm: FormGroup;

  constructor(private authService: AuthService) {
    this.formRegister = new FormGroup({
      email: new FormControl(),
      nombre: new FormControl(),
      password: new FormControl(),
      rol: new FormControl(),
      direccion: new FormControl(),
      dni: new FormControl(),
      estado: new FormControl('A'),
      ruc: new FormControl(),
    });

    this.searchForm = new FormGroup({
      rol: new FormControl(''),
    });
  }

  ngOnInit(): void {
    this.retrieveUsers();
  }

  retrieveUsers(): void {
    this.authService
      .getAll()
      .snapshotChanges()
      .subscribe((data) => {
        this.users = data.map((user) => ({
          ...user.payload.doc.data() as Users,
          docId: user.payload.doc.id, // Store the document ID from Firestore
        }));
        this.filteredUsers = this.users;
      });
  }

  editarUsuario(user: Users): void {
    user.editable = true;
    // Copiar datos a formRegister para edición
    this.formRegister.patchValue({
      email: user.email,
      nombre: user.name,
      password: user.password,
      rol: user.role,
      direccion: user.direccion,
      dni: user.dni,
      estado: user.estado,
      ruc: user.ruc,
    });
  }

  confirmarEdicion(user: Users): void {
    Swal.fire({
      title: '¿Confirmar Edición?',
      text: '¿Deseas confirmar los cambios?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedUser = {
          ...user,
          email: this.formRegister.value.email,
          name: this.formRegister.value.nombre,
          password: this.formRegister.value.password,
          role: this.formRegister.value.rol,
          direccion: this.formRegister.value.direccion,
          dni: this.formRegister.value.dni,
          estado: this.formRegister.value.estado,
          ruc: this.formRegister.value.ruc,
        };
  
        // Actualizar en Firestore
        this.authService.updateUser(user.docId!, updatedUser).then(
          () => {
            console.log('Usuario editado exitosamente');
            // Actualizar el objeto `user` con los nuevos valores
            Object.assign(user, updatedUser);
            // Salir del modo de edición
            user.editable = false;
            // Actualizar la lista de usuarios después de confirmar la edición
            this.retrieveUsers();
            // Si necesitas resetear el formulario, hazlo aquí
            this.formRegister.reset();
          },
          (error) => {
            console.error('Error al editar usuario', error);
          }
        );
      }
    });
}

cancelarEdicion(user: Users): void {
    user.editable = false;
}


  cambiarEstadoUsuario(user: Users): void {
    const nuevoEstado = user.estado === 'A' ? 'I' : 'A';
    const nuevoEstadoTexto = user.estado === 'A' ? 'Desactivar' : 'Restaurar';
    const mensajeConfirmacion = `Esta acción ${nuevoEstadoTexto.toLowerCase()}á el usuario. ¿Quieres continuar?`;

    Swal.fire({
      title: `¿Estás seguro?`,
      text: mensajeConfirmacion,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: `Sí, ${nuevoEstadoTexto.toLowerCase()}`,
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        user.estado = nuevoEstado;
        this.authService.updateUser(user.docId!, user).then(
          () => {
            console.log(`Usuario ${nuevoEstadoTexto.toLowerCase()}do exitosamente`);
            this.retrieveUsers();
          },
          (error) => {
            console.error(`Error al ${nuevoEstadoTexto.toLowerCase()}r usuario`, error);
          }
        );
      }
    });
  }

  eliminarOrestaurarUsuario(user: Users): void {
    const accion = user.estado === 'A' ? 'Desactivar' : 'Restaurar';
    const nuevoEstado = user.estado === 'A' ? 'I' : 'A';

    Swal.fire({
      title: `¿Estás seguro?`,
      text: `Esta acción ${accion.toLowerCase()}á el usuario permanentemente. ¿Quieres continuar?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: `Sí, ${accion.toLowerCase()}`,
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        user.estado = nuevoEstado;
        this.authService.updateUser(user.docId!, user).then(
          () => {
            console.log(`Usuario ${accion.toLowerCase()}do exitosamente`);
            this.retrieveUsers();
          },
          (error) => {
            console.error(`Error al ${accion.toLowerCase()}r usuario`, error);
          }
        );
      }
    });
  }

  setActiveUser(user: Users, index: number): void {
    this.currentUser = user;
    this.currentIndex = index;
  }

  filterUsers(): void {
    const role = this.searchForm.value.rol;
    if (role === '') {
      this.filteredUsers = this.users;
    } else {
      this.filteredUsers = this.users?.filter(user => user.role === role);
    }
  }

  loginWithGoogle(): void {
    this.authService
      .loginWithGoogle()
      .then(() => {
        console.log('Logeado con Google');
      })
      .catch((error) => {
        console.log(error);
      });
  }

  logout(): void {
    this.authService
      .logout()
      .then(() => {
        console.log('Salir de Google');
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async onSubmit(): Promise<void> {
    try {
      const user = this.formRegister.value;
      await this.authService.register({
        email: user.email,
        name: user.nombre,
        password: user.password,
        role: user.rol,
        direccion: user.direccion,
        dni: user.dni,
        estado: user.estado,
        ruc: user.ruc,
      });
      console.log('Usuario registrado con éxito');
    } catch (error) {
      console.log('Error al registrar el usuario', error);
    }
  }

  exportCSV(): void {
    let csvData = 'Correo,Nombre,Rol,Dirección,DNI,Estado,RUC\n';
    if (this.filteredUsers) {
      this.filteredUsers.forEach(user => {
        csvData += `${user.email},${user.name},${user.role},${user.direccion},${user.dni},${user.estado},${user.ruc}\n`;
      });
    }

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'reporte_usuarios.csv');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
