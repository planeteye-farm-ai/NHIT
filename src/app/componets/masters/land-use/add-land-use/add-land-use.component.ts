import { Component, ViewEncapsulation } from '@angular/core';
import { NgbModal, NgbModalConfig,NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../../../shared/common/sharedmodule'; 
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { ShowcodeCardComponent } from '../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../shared/prismData/advancedUi/models';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-add-land-use',
  standalone: true,
  imports: [SharedModule,NgbTooltipModule,NgbPopoverModule, ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './add-land-use.component.html',
  styleUrl: './add-land-use.component.scss',
  providers: [NgbModalConfig, NgbModal],
  encapsulation: ViewEncapsulation.None,
})
export class AddLandUseComponent {

  landUseForm!: FormGroup;
  prismCode = prismCodeData;
  content2: any;

  constructor(private fb: FormBuilder,config: NgbModalConfig, private modalService: NgbModal,private toastr: ToastrService) {
    
  }

  ngOnInit(): void {
    // Initialize the form
    this.landUseForm = this.fb.group({
      landUse: ['', Validators.required],
      status: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.landUseForm.valid) {
      this.toastr.success('Land use added successfully', 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
      this.landUseForm.reset();
    } else {
      this.toastr.error('Invalid details', 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
    }
  }

  openVerticallyCentered(content2:any) {
		this.modalService.open(content2, { size: 'lg' },);
	}
  
}
