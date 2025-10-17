import { Component } from '@angular/core';
import { ShowcodeCardComponent } from '../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../shared/prismData/tables';
import { SharedModule } from '../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { AddRoadTypeComponent } from './add-road-type/add-road-type.component';

import { ViewEncapsulation } from '@angular/core';
import {NgbModalConfig,NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import * as prismCodeData1 from '../../../shared/prismData/advancedUi/models'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { MastersService } from '../masters.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-road-type',
  standalone: true,
  imports: [SharedModule, ShowcodeCardComponent,
    NgbTooltipModule,NgbPopoverModule,ReactiveFormsModule,
    AddRoadTypeComponent],
  templateUrl: './road-type.component.html',
  styleUrl: './road-type.component.scss',
  providers: [NgbModalConfig, NgbModal],
  encapsulation: ViewEncapsulation.None,

})
export class RoadTypeComponent {
  prismCode = prismCodeData;

  roadTypeForm!: FormGroup;
  content2: any;
  content: any
  deleteId:any;
  roadTypeData:any;
 

  constructor(private fb: FormBuilder, private router: Router,config: NgbModalConfig, private modalService: NgbModal,private toastr: ToastrService,private mastersService:MastersService){

  }

  ngOnInit(): void {
    // Initialize the form
    this.roadTypeForm = this.fb.group({
      roadType: ['Single Lane', Validators.required],
      status: ['Active', Validators.required]
    });

    this.getRoadTypeList();
  }

  getRoadTypeList(){
    console.log("abc")
    this.mastersService.getRoadType().subscribe((res)=>{
      
      this.roadTypeData = res.data;
      console.log(this.roadTypeData);
    })
  }

  onSubmit() {
    console.log(this.roadTypeForm)
    if (this.roadTypeForm.valid) {
      this.toastr.success('Road type updated successfully', 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',    
      });
      this.router.navigate(['/masters/road-type']);
      // this.roadTypeForm.reset();
    } else {
      this.toastr.error('Invalid details', 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
    }
  }

  delete(){
    this.mastersService.deleteRoadType(this.deleteId).subscribe((res)=>{
      if(res.status){
        this.getRoadTypeList();
        this.toastr.success(res.msg, 'NHAI RAMS', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
      }
      else{
        this.toastr.error(res.msg, 'NHAI RAMS', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
      }
    },(err)=>{
      this.toastr.error(err.msg, 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
    });
    
   
  }

  openVerticallyCentered(content2:any) {
		this.modalService.open(content2, { size: 'lg' },);
	}

  open(content: any,id:any) {
    this.deleteId = id;
    this.modalService.open(content);
    
  }

}
