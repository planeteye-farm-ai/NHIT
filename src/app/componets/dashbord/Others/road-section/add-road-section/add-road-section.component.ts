import { Component, ViewEncapsulation } from '@angular/core';
import { NgbModal, NgbModalConfig,NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../../../../shared/common/sharedmodule'; 
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { ShowcodeCardComponent } from '../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../shared/prismData/advancedUi/models';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-add-road-section',
  standalone: true,
  imports: [SharedModule,NgbTooltipModule,NgbPopoverModule, ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './add-road-section.component.html',
  styleUrl: './add-road-section.component.scss',
  providers: [NgbModalConfig, NgbModal],
  encapsulation: ViewEncapsulation.None,
})
export class AddRoadSectionComponent {
  roadForm!: FormGroup;
  prismCode = prismCodeData;
  content2: any;

  constructor(private fb: FormBuilder,config: NgbModalConfig, private modalService: NgbModal,private toastr: ToastrService) {
    
  }

  ngOnInit(): void {
    this.roadForm = this.fb.group({
      sectionName: ['', Validators.required],
      chainageStart: ['', Validators.required],
      chainageEnd: ['', Validators.required],
      contractor: ['', Validators.required],
      distance: ['', Validators.required],
      cost: ['', Validators.required],
    });
  }

  openVerticallyCentered(content2:any) {
		this.modalService.open(content2, { size: 'lg' },);
	}

  onSubmit(): void {
    if (this.roadForm.valid) {
      console.log('Form Submitted:', this.roadForm.value);
      // Call your API or perform actions here
    } else {
      console.log('Form is invalid');
    }
  }
  // onSubmit(): void {
  //   console.log(this.roadForm)
  //   if (this.roadForm.valid) {
  //     this.toastr.success('Section added successfully', 'NHAI RAMS', {
  //       timeOut: 3000,
  //       positionClass: 'toast-top-right',
  //     });
  //     this.roadForm.reset(); // Reset form after successful submission
  //   } else {
  //     this.toastr.error('Invalid details', 'NHAI RAMS', {
  //       timeOut: 3000,
  //       positionClass: 'toast-top-right',
  //     });
  //   }
  // }
}
