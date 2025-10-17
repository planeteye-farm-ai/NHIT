import { Component } from '@angular/core';
import { ShowcodeCardComponent } from '../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../shared/prismData/tables';
import { SharedModule } from '../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { AddMedianWidthComponent } from './add-median-width/add-median-width.component';

import { ViewEncapsulation } from '@angular/core';
import {NgbModalConfig,NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import * as prismCodeData1 from '../../../shared/prismData/advancedUi/models'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-median-width',
  standalone: true,
  imports: [SharedModule, ShowcodeCardComponent,
    NgbTooltipModule,NgbPopoverModule,ReactiveFormsModule,AddMedianWidthComponent],
  templateUrl: './median-width.component.html',
  styleUrl: './median-width.component.scss',
  providers: [NgbModalConfig, NgbModal],
  encapsulation: ViewEncapsulation.None,
})
export class MedianWidthComponent {

  medianWidthForm!: FormGroup;
  prismCode = prismCodeData;
  content2: any;

  medianWidthData = [
    { id: 1, width: 'Raised', status: 'Active' },
    { id: 2, width: 'Depressed', status: 'Active'},
    { id: 3, width: 'Barrier', status: 'Active' },
    { id: 4, width: 'None', status: 'Active' },

  ];
 

  constructor(private fb: FormBuilder,config: NgbModalConfig, private modalService: NgbModal,private toastr: ToastrService){

  }

  ngOnInit(): void {
    // Initialize the form
    this.medianWidthForm = this.fb.group({
      medianWidth: ['Raised', Validators.required],
      status: ['Active', Validators.required]
    });
  }

  onSubmit() {
    console.log(this.medianWidthForm)
    if (this.medianWidthForm.valid) {
      this.toastr.success('Median width updated successfully', 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
      this.medianWidthForm.reset();
    } else {
      this.toastr.error('Invalid details', 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
    }
  }

  
  delete(){
    this.toastr.success('Median width deleted successfully', 'NHAI RAMS', {
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
