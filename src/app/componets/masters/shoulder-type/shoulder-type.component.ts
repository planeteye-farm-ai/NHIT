import { Component } from '@angular/core';
import { ShowcodeCardComponent } from '../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../shared/prismData/tables';
import { SharedModule } from '../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { AddShoulderTypeComponent } from './add-shoulder-type/add-shoulder-type.component';

import { ViewEncapsulation } from '@angular/core';
import {NgbModalConfig,NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import * as prismCodeData1 from '../../../shared/prismData/advancedUi/models'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-shoulder-type',
  standalone: true,
  imports: [SharedModule, ShowcodeCardComponent,
    NgbTooltipModule,NgbPopoverModule,ReactiveFormsModule,AddShoulderTypeComponent],
  templateUrl: './shoulder-type.component.html',
  styleUrl: './shoulder-type.component.scss',
  providers: [NgbModalConfig, NgbModal],
  encapsulation: ViewEncapsulation.None,
})
export class ShoulderTypeComponent {

  prismCode = prismCodeData;

  shoulderTypeForm!: FormGroup;
  content2: any;

  shoulderTypeData = [
    { id: 1, shoulderType: 'None', status: 'Active' },
    { id: 2, shoulderType: 'Paved', status: 'Active'},
    { id: 3, shoulderType: 'Earthen', status: 'Active' },
    { id: 4, shoulderType: 'Gravel', status: 'Active' },
  ];
 

  constructor(private fb: FormBuilder,config: NgbModalConfig, private modalService: NgbModal,private toastr: ToastrService) {
    
  }

  ngOnInit(): void {
    // Initialize the form
    this.shoulderTypeForm = this.fb.group({
      shoulderType: ['None', Validators.required],
      status: ['Active', Validators.required]
    });
  }

  onSubmit() {
    if (this.shoulderTypeForm.valid) {
      this.toastr.success('Shoulder type updated successfully', 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
      this.shoulderTypeForm.reset();
    } else {
      this.toastr.error('Invalid details', 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
    }
  }

  delete(){
    this.toastr.success('Shoulder type deleted successfully', 'NHAI RAMS', {
      timeOut: 3000,
      positionClass: 'toast-top-right',
    });
  }

  open(content: any) {
    this.modalService.open(content);
  }

  openVerticallyCentered(content2:any) {
		this.modalService.open(content2, { size: 'lg' },);
	}

}
