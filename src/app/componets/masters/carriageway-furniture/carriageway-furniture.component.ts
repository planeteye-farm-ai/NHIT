// import { Component } from '@angular/core';
// import { ShowcodeCardComponent } from '../../../shared/common/includes/showcode-card/showcode-card.component';
// import * as prismCodeData from '../../../shared/prismData/tables';
// import { SharedModule } from '../../../shared/common/sharedmodule';
// import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
// import { AddCarriagewayFurnitureComponent } from './add-carriageway-furniture/add-carriageway-furniture.component';
// import { EditCarriagewayFurnitureComponent } from './edit-carriageway-furniture/edit-carriageway-furniture.component';

// @Component({
//   selector: 'app-carriageway-furniture',
//   standalone: true,
//   imports: [SharedModule, ShowcodeCardComponent,AddCarriagewayFurnitureComponent],
//   templateUrl: './carriageway-furniture.component.html',
//   styleUrl: './carriageway-furniture.component.scss',
//   providers: [ NgbModal],
// })
// export class CarriagewayFurnitureComponent {

//   prismCode = prismCodeData;

//   carriagewayfurnitureData = [
//     { id: 1, carriagewayfurniture: 'Crash Barriers', status: 'Active' },
//     { id: 2, carriagewayfurniture: 'Signs', status: 'Active'},
//     { id: 3, carriagewayfurniture: 'Street Lights', status: 'Active' },
//     { id: 4, carriagewayfurniture: 'Km Stone', status: 'Active' },
//     { id: 5, carriagewayfurniture: 'Junction', status: 'Active' },
//     { id: 6, carriagewayfurniture: 'Speed Breakers', status: 'Active' },

    

//   ];
 

//   constructor(private modalService: NgbModal){

//   }

//   openEditModal(furniture: any) {
//     const modalRef = this.modalService.open(EditCarriagewayFurnitureComponent, { size: 'lg' });
//     modalRef.componentInstance.furnitureData = furniture;
//     modalRef.result.then((result) => {
//       if (result) {
       
//       }
//     }).catch((error) => {
//       console.log('Modal dismissed', error);
//     });
//   }
// }

import { Component } from '@angular/core';
import { ShowcodeCardComponent } from '../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../shared/prismData/tables';
import { SharedModule } from '../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { AddCarriagewayFurnitureComponent } from './add-carriageway-furniture/add-carriageway-furniture.component';

import { ViewEncapsulation } from '@angular/core';
import {NgbModalConfig,NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import * as prismCodeData1 from '../../../shared/prismData/advancedUi/models'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { EditCarriagewayFurnitureComponent } from './edit-carriageway-furniture/edit-carriageway-furniture.component';
@Component({
  selector: 'app-carriageway-furniture',
  standalone: true,
  imports: [SharedModule, ShowcodeCardComponent,
    NgbTooltipModule,NgbPopoverModule,ReactiveFormsModule,
    AddCarriagewayFurnitureComponent,EditCarriagewayFurnitureComponent],
  templateUrl: './carriageway-furniture.component.html',
  styleUrl: './carriageway-furniture.component.scss',
  providers: [NgbModalConfig, NgbModal],
  encapsulation: ViewEncapsulation.None,
})
export class CarriagewayFurnitureComponent {

  prismCode = prismCodeData;
  prismCode1 = prismCodeData1;
  carriagewayForm!: FormGroup;
  carriagewayDetails = {carriageway:'Crash Barriers',status: 'Active' }

  // content2: any;
  carriagewayfurnitureData = [
    { id: 1, carriagewayfurniture: 'Crash Barriers', status: 'Active' },
    { id: 2, carriagewayfurniture: 'Signs', status: 'Active'},
    { id: 3, carriagewayfurniture: 'Street Lights', status: 'Active' },
    { id: 4, carriagewayfurniture: 'Km Stone', status: 'Active' },
    { id: 5, carriagewayfurniture: 'Junction', status: 'Active' },
    { id: 6, carriagewayfurniture: 'Speed Breakers', status: 'Active' },

    

  ];
 

  constructor(private fb: FormBuilder,config: NgbModalConfig, private modalService: NgbModal,private toastr: ToastrService){

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
      this.toastr.success('Carriageway Furniture updated successfully', 'NHAI RAMS', {
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

  
  delete(){
    this.toastr.success('Carriageway Furniture deleted successfully', 'NHAI RAMS', {
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
