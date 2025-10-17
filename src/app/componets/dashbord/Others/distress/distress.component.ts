import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../shared/prismData/tables';
import { SharedModule } from '../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';

import { ViewEncapsulation } from '@angular/core';
import {NgbModalConfig,NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import * as prismCodeData1 from '../../../../shared/prismData/advancedUi/models'
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { AddDistressComponent } from './add-distress/add-distress.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-distress',
  standalone: true,
  imports: [SharedModule,NgSelectModule,NgbPopoverModule,FormsModule,RouterLink,ShowcodeCardComponent,ReactiveFormsModule,AddDistressComponent],
  templateUrl: './distress.component.html',
  styleUrl: './distress.component.scss',
  providers: [ NgbModal],
})
export class DistressComponent {

  prismCode = prismCodeData;
  roadForm!: FormGroup;
  content2: any;
  content:any;

  selectedCompanies: any=['Pothole','Oblique crack'];


  tableData = [
    { id: 1,highway:'NH-1',latitude: 19.965681, longitude: 73.626424, chainageStart: 100,chainageEnd:102.27,section:1,distressType:'Pothole',workStatus:'Completed',reportingDate:'9/10/2024',closingDate:'9/18/2024'},
    { id: 2,highway:'NH-2',latitude: 19.965532, longitude: 73.625799, chainageStart: 102.27,chainageEnd:104.54,section:1,distressType:'Pothole',workStatus:'Completed',reportingDate:'9/10/2024',closingDate:'9/18/2024'},
    { id: 3,highway:'NH-1',latitude: 19.965018, longitude: 73.625796, chainageStart: 104.54,chainageEnd:106.81,section:2,distressType:'Alligator crack',workStatus:'Work in progress',reportingDate:'9/10/2024',closingDate:'9/18/2024'},
    { id: 3,highway:'NH-1',latitude: 19.965018, longitude: 73.625796, chainageStart: 106.81,chainageEnd:109.08,section:3,distressType:'Oblique crack',workStatus:'Re-work',reportingDate:'9/10/2024',closingDate:'9/18/2024'},
    { id: 4,highway:'NH-3',latitude: 19.965018, longitude: 73.625799, chainageStart: 109.08,chainageEnd:111.35,section:4,distressType:'Edge Break',workStatus:'Overdue',reportingDate:'9/10/2024',closingDate:'9/18/2024'}
  ];

  constructor(private fb: FormBuilder,config: NgbModalConfig, private modalService: NgbModal,private toastr: ToastrService,) {
    
  }

  ngOnInit(): void {
    this.roadForm = this.fb.group({
      highway: ['NH-1', Validators.required],
      chainageStart: [ 102.27, Validators.required],
      chainageEnd: [104.54, Validators.required],
      section: [2, Validators.required],
      distressType: ['Pothole', Validators.required],
      workStatus: ['Completed', Validators.required],
      closingDate: ['2024-09-18', Validators.required]

    });
  }

  onSubmit(): void {
    if (this.roadForm.valid) {
      this.toastr.success('Distress updated successfully', 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
      // this.roadForm.reset();
    } else {
      this.toastr.error('Invalid details', 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
    }
      
  }

  delete(){
    this.toastr.success('Distress deleted successfully', 'NHAI RAMS', {
      timeOut: 3000,
      positionClass: 'toast-top-right',
    });
  }

  open(content: any) {
    this.modalService.open(content);
  }
  
  // openVerticallyCentered(content2:any) {
	// 	this.modalService.open(content2, { size: 'lg' },);
	// }
 
}
