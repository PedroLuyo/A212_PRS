import { Component, OnInit } from '@angular/core';
import { ReservaDetalleService } from '../../../services/menu/reserva/reserva-detalle.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { ReservaDto } from '../../../models/menu/reserva/reserva'; // Assuming this is your model

@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.css']
})
export class HistorialComponent implements OnInit {
  reservas: ReservaDto[] = [];

  constructor(private reservaDetalleService: ReservaDetalleService) { }

  ngOnInit(): void {
    this.getReservas();
  }

  getReservas() {
    this.reservaDetalleService.getAllReservas()
      .subscribe(reservas => {
        this.reservas = reservas;
      }, error => {
        console.error('Error fetching reservas:', error);
        // Handle error display or retry logic
      });
  }

  cancelarReserva(id_reserva: number) {
    this.reservaDetalleService.anularReserva(id_reserva)
      .subscribe(reserva => {
        // Update reservation status or handle success as needed
        console.log(`Reserva ${id_reserva} cancelada.`);
      }, error => {
        console.error('Error canceling reserva:', error);
        // Handle error display or retry logic
      });
  }

  confirmarReserva(id_reserva: number) {
    this.reservaDetalleService.confirmarReserva(id_reserva)
      .subscribe(reserva => {
        // Update reservation status or handle success as needed
        console.log(`Reserva ${id_reserva} confirmada.`);
      }, error => {
        console.error('Error confirming reserva:', error);
        // Handle error display or retry logic
      });
  }

  exportarAExcel(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Quieres exportar las reservas a Excel.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, exportar!'
    }).then((result) => {
      if (result.isConfirmed) {
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.reservas);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Reservas');
        const today = new Date();
        const fileName = `reservas_${today.getFullYear()}${today.getMonth() + 1}${today.getDate()}.xlsx`;
        XLSX.writeFile(wb, fileName);

        Swal.fire({
          title: 'Éxito!',
          text: 'Exportación a Excel exitosa.',
          icon: 'success'
        });
      }
    });
  }


  exportarAPDF(): void {
    const doc = new jsPDF({
      orientation: 'landscape' // o 'portrait'
    });
  
    const img = new Image();
    img.src = 'assets/img/Logo Transparente Gastro Connect.png';
    img.onload = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const logoWidth = pageWidth * 0.2;
      const logoHeight = img.height * (logoWidth / img.width);
      const logoX = (pageWidth - logoWidth) / 2;
      doc.addImage(img, 'PNG', logoX, 10, logoWidth, logoHeight);
  
      // Agregar la frase debajo de la imagen
      doc.setFont('courier', 'normal');
      doc.setFontSize(14);
      const frase = 'Disfruta de la mejor gastronomía con Gastro Connect';
      const fraseY = logoHeight + 20;
      doc.text(frase, pageWidth / 2, fraseY, { align: 'center' });
  
      const fecha = this.formatDate(new Date());
  
      doc.setFont('courier', 'bold');
      doc.setFontSize(20);
      const titulo = 'Reporte de Reservas'; // Título ajustado
      const tituloY = fraseY + 20;
      doc.text(titulo, 14, tituloY);
  
      doc.setFontSize(12);
      const fechaX = pageWidth - 14;
      doc.text(`Fecha: ${fecha}`, fechaX, tituloY, { align: 'right' });
  
      const head = [['N°', 'Nombre', 'Correo', 'Hora Reserva', 'Número de Personas']];
      const data = this.reservas.map(reserva => [
        reserva.id_reserva.toString(),
        reserva.nombre,
        reserva.correo,
        reserva.hora_reserva,
        reserva.num_personas.toString()
      ]);
  
      const startY = tituloY + 10;
  
      // Generar tabla sin paginación
      (doc as any).autoTable({
        head: head,
        body: data,
        startY: startY,
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
        },
        // didDrawPage se usa para obtener la cantidad total de páginas
        didDrawPage: () => {}
      });
  
      // Obtener el número total de páginas
      const totalPages = doc.internal.pages.length - 1;
  
      // Actualizar cada página con el número de página y total de páginas
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const pageCurrentText = `Página ${i}`;
        const pageTotalText = ` de ${totalPages}`;
        const text = pageCurrentText + pageTotalText;
        doc.setFontSize(10);
        doc.text(text, pageWidth - 14, pageHeight - 10, { align: 'right' });
      }
  
      doc.save('reporte_reservas.pdf'); // Nombre del archivo PDF ajustado
    };
  }
  
  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
    
}
