import { Component, OnInit } from '@angular/core';
import { jsPDF } from 'jspdf';
@Component({
  selector: 'app-iep-categories-list',
  templateUrl: './iep-categories-list.component.html',
  styleUrls: ['./iep-categories-list.component.css']
})
export class IepCategoriesListComponent implements OnInit {

  constructor() { }

  ngOnInit() {

  }

  exportToExcel() {
    /*const dataToExport = this.cargos.map((cargo) => ({
      'Cargo': cargo.charge,
      'Descripción': cargo.description,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista de Cargos');

    XLSX.writeFile(workbook, 'Lista_Cargos.xlsx');*/
  }
  exportToPdf() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Lista de Cargos', 10, 10);

   /* const dataToExport = this.cargos.map((cargo) => [
      cargo.charge,
      cargo.description,
    ]);*/

    (doc as any).autoTable({
      head: [['Cargo', 'Descripción']],
     // body: dataToExport,
      startY: 20,
    });

    doc.save('Lista_Cargos.pdf');
  }

  

}
