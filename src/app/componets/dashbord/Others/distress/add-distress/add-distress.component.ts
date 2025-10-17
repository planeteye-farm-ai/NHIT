// import { Component, ViewEncapsulation } from '@angular/core';
// import { NgbModal, NgbModalConfig,NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
// import { SharedModule } from '../../../../shared/common/sharedmodule'; 
// import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
// import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
// import { ShowcodeCardComponent } from '../../../../shared/common/includes/showcode-card/showcode-card.component';
// import * as prismCodeData from '../../../../shared/prismData/advancedUi/models';
// import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
// import { ReactiveFormsModule } from '@angular/forms';
// import { ToastrModule, ToastrService } from 'ngx-toastr';
// import { NgSelectModule } from '@ng-select/ng-select';

// @Component({
//   selector: 'app-add-distress',
//   standalone: true,
//   imports: [SharedModule,NgbTooltipModule,NgSelectModule,NgbPopoverModule,FormsModule, ShowcodeCardComponent,ReactiveFormsModule],
//   templateUrl: './add-distress.component.html',
//   styleUrl: './add-distress.component.scss',
//   providers: [NgbModalConfig, NgbModal],
//   encapsulation: ViewEncapsulation.None,
// })
// export class AddDistressComponent {

//   roadForm!: FormGroup;
//   prismCode = prismCodeData;
//   content2: any;
//   selectedCompanies: any=[];

//   constructor(private fb: FormBuilder,config: NgbModalConfig, private modalService: NgbModal,private toastr: ToastrService) {
    
//   }

//   ngOnInit(): void {
//     this.roadForm = this.fb.group({
//       highway: ['', Validators.required],
//       chainageStart: ['', Validators.required],
//       chainageEnd: ['', Validators.required],
//       section: ['', Validators.required],
//       distressType: ['', Validators.required],
//       workStatus: ['', Validators.required],
//       closingDate: ['', Validators.required]

//     });
//   }

//   onSubmit(): void {
//     if (this.roadForm.valid) {
//       this.toastr.success('Distress added successfully', 'NHAI RAMS', {
//         timeOut: 3000,
//         positionClass: 'toast-top-right',
//       });
//       this.roadForm.reset();
//     } else {
//       this.toastr.error('Invalid details', 'NHAI RAMS', {
//         timeOut: 3000,
//         positionClass: 'toast-top-right',
//       });
//     }
      
//   }
  
//   openVerticallyCentered(content2:any) {
// 		this.modalService.open(content2, { size: 'lg' },);
// 	}

// }


import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';


@Component({
  selector: 'app-add-distress',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './add-distress.component.html',
  styleUrl: './add-distress.component.scss',
  providers: [NgbModal]
})
export class AddDistressComponent {

  roadForm!: FormGroup;
  prismCode = prismCodeData;
  selectedCompanies: any=[];

  constructor(private fb: FormBuilder,private modalService: NgbModal,private toastr: ToastrService) {
    
  }

  ngOnInit(): void {
    this.roadForm = this.fb.group({
      highway: ['', Validators.required],
      chainageStart: ['', Validators.required],
      chainageEnd: ['', Validators.required],
      section: ['', Validators.required],
      // distressType: ['', Validators.required],
      workStatus: ['', Validators.required],
      // closingDate: ['', Validators.required]

    });
  }

  onSubmit(): void {
    if (this.roadForm.valid) {
      this.toastr.success('Distress added successfully', 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
      this.roadForm.reset();
    } else {
      this.toastr.error('Invalid details', 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
    }
      
  }
  

}
