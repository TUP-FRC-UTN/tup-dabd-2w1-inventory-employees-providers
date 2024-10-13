import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ProductService } from '../../services/product.service';
import { CreateCategoryDto } from '../../interfaces/create-category-dto';
import { CategoriaService } from '../../services/categoria.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-select',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './modal-select.component.html',
  styleUrl: './modal-select.component.css'
})
export class ModalSelectComponent {
  
  constructor(public dialogRef: MatDialogRef<ModalSelectComponent>,private categoryService: CategoriaService) {}

  @Output() categoryAdded = new EventEmitter<void>();
  
  descripcion:String="";
  nuevo:boolean=false;

  close(): void {
    this.dialogRef.close();
    this.categoryAdded.emit();
  }


  saveCategory(form:any){

    if(form.valid){
      
      const category = new CreateCategoryDto(
        form.value.descripcion,
        new Date(),
        1,
        new Date(),
        1
    );
    console.log(category);

    return this.categoryService.postCategory(category).subscribe(
      arg => {
         
          alert("¡Categoría guardada exitosamente!");
          this.close();
      },
      error => {
          alert("Ocurrió un error al guardar la categoría.");
      }
  );

    }else{
      alert("Ocurrio un error!");
      return;
    }

  }
}
