import { Component } from '@angular/core';
import { ShowcodeCardComponent } from '../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../shared/prismData/tables';
import { SharedModule } from '../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { AddShoulderWidthComponent } from './add-shoulder-width/add-shoulder-width.component';

import { ViewEncapsulation } from '@angular/core';
import {NgbModalConfig,NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import * as prismCodeData1 from '../../../shared/prismData/advancedUi/models'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-shoulder-width',
  standalone: true,
  imports: [SharedModule, ShowcodeCardComponent,
    NgbTooltipModule,NgbPopoverModule,ReactiveFormsModule,AddShoulderWidthComponent],
  templateUrl: './shoulder-width.component.html',
  styleUrl: './shoulder-width.component.scss',
  providers: [NgbModalConfig, NgbModal],
  encapsulation: ViewEncapsulation.None,
})
export class ShoulderWidthComponent {

  prismCode = prismCodeData;

  shoulderWidthForm!: FormGroup;
  content2: any;

  shoulderWidthData = [
    { id: 1, shoulderWidth: '<1 m', status: 'Active' },
    { id: 2, shoulderWidth: '>=1 and <=2 m', status: 'Active'},
    { id: 3, shoulderWidth: '>2 m', status: 'Active' },
  ];
 

  constructor(private fb: FormBuilder,config: NgbModalConfig, private modalService: NgbModal,private toastr: ToastrService) {
    
  }

  ngOnInit(): void {
    // Initialize the form
    this.shoulderWidthForm = this.fb.group({
      shoulderWidth: ['<1 m', Validators.required],
      status: ['Active', Validators.required]
    });
  }

  onSubmit() {
    console.log(this.shoulderWidthForm)
    if (this.shoulderWidthForm.valid) {
      this.toastr.success('Shoulder Width updated successfully', 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
      this.shoulderWidthForm.reset();
    } else {
      this.toastr.error('Invalid details', 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
    }
  }

  delete(){
    this.toastr.success('Shoulder width deleted successfully', 'NHAI RAMS', {
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
