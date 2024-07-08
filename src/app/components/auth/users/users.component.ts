// users.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth/authService';
import { Users } from '../../../models/users/users.model';
import { FormGroup, FormControl } from '@angular/forms';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  users: Users[] = [];
  filteredUsers: Users[] = [];
  pagedUsers: Users[] = [];
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  searchForm: FormGroup;

  constructor(private authService: AuthService) {
    this.searchForm = new FormGroup({
      nombre: new FormControl(''),
      rol: new FormControl(''),
      estado: new FormControl(''),
    });
  }

  ngOnInit(): void {
    this.retrieveUsers();
  }

  retrieveUsers(): void {
    this.authService.getAll().snapshotChanges().subscribe(
      (data) => {
        this.users = data.map((user) => ({
          ...user.payload.doc.data() as Users,
          docId: user.payload.doc.id,
          editable: false, // Agregar propiedad editable para el modo edición
        }));
        this.filteredUsers = [...this.users];
        this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
        this.paginateUsers();
        console.log('Usuarios cargados desde Firestore:', this.users);
      },
      (error) => {
        console.error('Error al cargar usuarios desde Firestore:', error);
      }
    );
  }

  editarUsuario(user: Users): void {
    user.editable = true;
  }

  
  cancelarEdicion(user: Users): void {
    user.editable = false;
  }

  confirmarEdicion(user: Users): void {
    const updatedUser: Partial<Users> = {
      dni: user.dni,
      name: user.name,
      role: user.role,
      email: user.email,
      direccion: user.direccion,
      ruc: user.ruc,
      estado: user.estado,
    };

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
        const dataToUpdate: Users = {
          ...user,
          ...updatedUser,
        };

        this.authService.updateUser(user.docId!, updatedUser as Users).then(
          () => {
            console.log('Usuario editado exitosamente en Firestore');
            const index = this.users.findIndex(u => u.docId === user.docId);
            if (index !== -1) {
              this.users[index] = {
                ...this.users[index],
                ...updatedUser,
              };
              console.log('Usuario actualizado localmente:', this.users[index]);
            }
            user.editable = false;
            Swal.fire('Éxito', 'Los cambios han sido guardados correctamente.', 'success');
          },
          (error) => {
            console.error('Error al editar usuario en Firestore', error);
            Swal.fire('Error', 'Hubo un problema al guardar los cambios.', 'error');
          }
        );
      }
    });
  }

  eliminarOrestaurarUsuario(user: Users): void {
    const newStatus = user.estado === 'A' ? 'I' : 'A';
    const message = user.estado === 'A' ? 'desactivar' : 'restaurar';

    Swal.fire({
      title: `¿${message} Usuario?`,
      text: `¿Estás seguro de ${message === 'desactivar' ? 'desactivar' : 'restaurar'} este usuario?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Sí, ${message}`,
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        // Actualiza solo el estado del usuario
        this.authService.updateUser(user.docId!, { estado: newStatus }).then(
          () => {
            console.log(`Usuario ${message}do exitosamente en Firestore`);
            const index = this.users.findIndex(u => u.docId === user.docId);
            if (index !== -1) {
              this.users[index].estado = newStatus; // Actualiza el estado localmente
              console.log('Estado actualizado localmente:', this.users[index]);
            }
            Swal.fire('Éxito', `Usuario ${message}do correctamente.`, 'success');
          },
          (error) => {
            console.error(`Error al ${message}r usuario en Firestore`, error);
            Swal.fire('Error', `Hubo un problema al ${message}r el usuario.`, 'error');
          }
        );
      }
    });
  }

  filterUsers(): void {
    const { nombre, rol, estado } = this.searchForm.value;

    this.filteredUsers = this.users.filter((user) =>

      (!nombre || user.name.toLowerCase().includes(nombre.toLowerCase())) &&
      (!rol || user.role.toLowerCase() === rol.toLowerCase()) &&
      (!estado || user.estado.toLowerCase() === estado.toLowerCase())
    );

    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
    this.currentPage = 1;
    this.paginateUsers();
  }

  exportCSV(): void {
    let csvData = 'DNI,Nombre,Rol,Correo,Dirección,RUC,Estado\n';
    this.filteredUsers.forEach(user => {
      csvData += `${user.dni},${user.name},${user.role},${user.email},${user.direccion},${user.ruc},${user.estado}\n`;
    });

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

  generarReportePDF(): void {
    const doc = new jsPDF({
        orientation: 'landscape' // también se puede usar 'portrait'
    });

    const img = new Image();
    img.src = 'assets/img/Logo Transparente Gastro Connect.png';
    img.onload = () => {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const logoWidth = pageWidth * 0.2; // Ajustar el ancho del logo al 20% de la página
        const logoHeight = img.height * (logoWidth / img.width);
        const logoX = (pageWidth - logoWidth) / 2;
        doc.addImage(img, 'PNG', logoX, 10, logoWidth, logoHeight);

        // Agregar texto debajo del logo
        const slogan = "Disfruta de la mejor gastronomía con Gastro Connect";
        const sloganX = pageWidth / 2; // Centrar el eslogan
        const sloganY = logoHeight; // Posición Y debajo del logo
        doc.setTextColor(31, 30, 30); // Color del texto #1F1E1E
        doc.setFontSize(12); // Tamaño de fuente para el eslogan
        doc.text(slogan, sloganX, sloganY, { align: 'center' }); // Alineación centrada

        const fecha = new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }).replace(/ /g, '/').replace(/\//g, '-');
        
        doc.setFont('courier', 'bold');
        doc.setFontSize(20);
        const titulo = 'Reporte de Usuarios';
        const tituloY = sloganY + 10; // Espacio después del eslogan
        doc.text(titulo, 14, tituloY); // Ajuste de la posición del título
        
        // Añadir fecha a la derecha del título
        doc.setFontSize(12); // Tamaño de fuente para la fecha
        const fechaX = pageWidth - 14; // Margen derecho

        
        doc.text(`Fecha: ${fecha}`, fechaX, tituloY, { align: 'right' }); // Posición de la fecha

        const head = [['DNI', 'Nombre', 'Rol', 'Correo', 'Dirección', 'RUC', 'Estado']];
        const data = this.filteredUsers.map((user: Users) => [
            user.dni,
            user.name,
            user.role,
            user.email,
            user.direccion,
            user.ruc,
            user.estado
        ]);

        (doc as any).autoTable({
            head: head,
            body: data,
            startY: tituloY + 10,
            styles: {
                cellWidth: 'auto',
                fontSize: 10,
                lineColor: [0, 0, 0],
                lineWidth: 0.1
            },
            headStyles: {
                fillColor: [0, 0, 0],
                textColor: 255,
                fontStyle: 'bold'
            },
            bodyStyles: {
                fillColor: [255, 255, 255],
                textColor: 0
            },
            alternateRowStyles: {
                fillColor: [235, 235, 235]
            }
        });
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          // Configurar el estilo del pie de página
          doc.setFont('courier', 'normal');
          doc.setFontSize(10);
          // Establecer el color de la letra
          doc.setTextColor(31, 30, 30); // Usando RGB
          // Calcular la posición para el número de página alineado a la esquina inferior derecha
          const pageNumberText = `Página ${i}`;
          const pageSize = doc.internal.pageSize;
          const pageWidth = pageSize.getWidth();
          const pageHeight = pageSize.getHeight();
          const footerY = pageHeight - 10; // Ajusta este valor según sea necesario
          // Añadir el número de página
          doc.text(pageNumberText, pageWidth - doc.getTextWidth(pageNumberText) - 10, footerY); // Alineado a la derecha
        }
        
        doc.save('reporte_usuarios.pdf');
    };
}



  onPageChange(page: number): void {
    this.currentPage = page;
    this.paginateUsers();
  }

  paginateUsers(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.pagedUsers = this.filteredUsers.slice(startIndex, startIndex + this.pageSize);
  }

  getPaginationArray(): number[] {
    return Array(this.totalPages).fill(0).map((x, i) => i + 1);
  }

}
