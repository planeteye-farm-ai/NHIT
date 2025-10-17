import { Component } from '@angular/core';
import { ShowcodeCardComponent } from '../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../shared/prismData/tables';
import { SharedModule } from '../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { AddPavementTypeComponent } from './add-pavement-type/add-pavement-type.component';

import { ViewEncapsulation } from '@angular/core';
import {NgbModalConfig,NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import * as prismCodeData1 from '../../../shared/prismData/advancedUi/models'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-pavement-type',
  standalone: true,
  imports: [SharedModule, ShowcodeCardComponent,
    NgbTooltipModule,NgbPopoverModule,ReactiveFormsModule,AddPavementTypeComponent],
  templateUrl: './pavement-type.component.html',
  styleUrl: './pavement-type.component.scss',
  providers: [NgbModalConfig, NgbModal],
  encapsulation: ViewEncapsulation.None,
})
export class PavementTypeComponent {
  prismCode = prismCodeData;

  pavementTypeForm!: FormGroup;
  content2: any;

  pavementTypeData = [
    { id: 1, roadType: 'Asphalt', status: 'Active' },
    { id: 2, roadType: 'Cement Concrete', status: 'Active'},
    { id: 3, roadType: 'Paver Block', status: 'Active' },
    

  ];
 

  constructor(private fb: FormBuilder,config: NgbModalConfig, private modalService: NgbModal,private toastr: ToastrService){

  }

  ngOnInit(): void {
    // Initialize the form
    this.pavementTypeForm = this.fb.group({
      pavementType: ['Asphalt', Validators.required],
      status: ['Active', Validators.required]
    });
  }

  onSubmit() {
    console.log(this.pavementTypeForm)
    if (this.pavementTypeForm.valid) {
      this.toastr.success('Pavement type updated successfully', 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
      this.pavementTypeForm.reset();
    } else {
      this.toastr.error('Invalid details', 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
    }
  }

  delete(){
    this.toastr.success('Pavement type deleted successfully', 'NHAI RAMS', {
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
