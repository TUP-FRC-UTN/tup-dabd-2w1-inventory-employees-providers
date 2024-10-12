import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [Input],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
  template: `
  <div class="modal-header">
    <h4 class="modal-title">{{ titulo }}</h4>
    <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss('Cross click')"></button>
  </div>
  <div class="modal-body">
    <p>{{ mensaje }}</p>
  </div>
  <div class="modal-footer">
    <button type="button" class="btn btn-primary" (click)="activeModal.close('Close click')">Cerrar</button>
  </div>
`

})
export class ModalComponent {
  @Input() titulo!: string;
  @Input() mensaje!: string;

  constructor(public activeModal: NgbActiveModal) {

  }
}
