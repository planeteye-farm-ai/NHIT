import { Component, Input, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalConfig,NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../../../shared/common/sharedmodule'; 
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { ShowcodeCardComponent } from '../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../shared/prismData/advancedUi/models'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-edit-carriageway-furniture',
  standalone: true,
  imports: [SharedModule,NgbTooltipModule,NgbPopoverModule, ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './edit-carriageway-furniture.component.html',
  styleUrl: './edit-carriageway-furniture.component.scss',
  providers: [NgbModalConfig, NgbModal],
  encapsulation: ViewEncapsulation.None,
})
export class EditCarriagewayFurnitureComponent {

 
  carriagewayForm!: FormGroup;
  prismCode = prismCodeData;
  // content2: any;
  carriagewayDetails = {carriageway:'Crash Barriers',status: 'Active' }

  constructor(private fb: FormBuilder,config: NgbModalConfig, private modalService: NgbModal,private toastr: ToastrService,public activeModal: NgbActiveModal) {
    
  }

  ngOnInit(): void {
    // Initialize the form
    this.carriagewayForm = this.fb.group({
      carriageway: [this.carriagewayDetails.carriageway, Validators.required],
      status: [this.carriagewayDetails.status, Validators.required]
    });

    // this.openVerticallyCentered()
  }

  onSubmitCarriageway() {
    if (this.carriagewayForm.valid) {
      this.toastr.success('Carriageway Furniture Updated successfully', 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
      this.carriagewayForm.reset();
    } else {
      this.toastr.error('Invalid details', 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
    }
  }

  // openVerticallyCentered() {
	// 	this.modalService.open(this.content2, { size: 'lg' },);
	// }
}
