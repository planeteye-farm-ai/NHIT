import { Component } from '@angular/core';
import { ShowcodeCardComponent } from '../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../shared/prismData/tables';
import { SharedModule } from '../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { AddPavementWidthComponent } from './add-pavement-width/add-pavement-width.component';

import { ViewEncapsulation } from '@angular/core';
import {NgbModalConfig,NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import * as prismCodeData1 from '../../../shared/prismData/advancedUi/models'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-pavement-width',
  standalone: true,
  imports: [SharedModule, ShowcodeCardComponent,
    NgbTooltipModule,NgbPopoverModule,ReactiveFormsModule,AddPavementWidthComponent],
  templateUrl: './pavement-width.component.html',
  styleUrl: './pavement-width.component.scss',
  providers: [NgbModalConfig, NgbModal],
  encapsulation: ViewEncapsulation.None,
})
export class PavementWidthComponent {
  prismCode = prismCodeData;

  pavementWidthForm!: FormGroup;
  content2: any;

  pavementWidthData = [
    { id: 1, width: '>=3.75 and <5.5 m', status: 'Active' },
    { id: 2, width: '>=5.5 and <7 m', status: 'Active'},
    { id: 3, width: '>=7 and <10.5 m', status: 'Active' },
    { id: 4, width: '>=10.5 and <12.5 m', status: 'Active' },
    { id: 5, width: '>12.5 m', status: 'Active' },

  ];
 

  constructor(private fb: FormBuilder,config: NgbModalConfig, private modalService: NgbModal,private toastr: ToastrService){

  }

  ngOnInit(): void {
    // Initialize the form
    this.pavementWidthForm = this.fb.group({
      pavementWidth: ['>=3.75 and <5.5 m', Validators.required],
      status: ['Active', Validators.required]
    });
  }

  onSubmit() {
    console.log(this.pavementWidthForm)
    if (this.pavementWidthForm.valid) {
      this.toastr.success('Pavement width updated successfully', 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
      this.pavementWidthForm.reset();
    } else {
      this.toastr.error('Invalid details', 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
    }
  }

 
  delete(){
    this.toastr.success('Pavement width deleted successfully', 'NHAI RAMS', {
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
