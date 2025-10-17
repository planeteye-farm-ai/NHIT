import { Component, ViewEncapsulation } from '@angular/core';
import { NgbModal, NgbModalConfig,NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../../../shared/common/sharedmodule'; 
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { ShowcodeCardComponent } from '../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../shared/prismData/advancedUi/models'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-add-drain-type',
  standalone: true,
   imports: [SharedModule,NgbTooltipModule,NgbPopoverModule, ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './add-drain-type.component.html',
  styleUrl: './add-drain-type.component.scss',
  providers: [NgbModalConfig, NgbModal],
  encapsulation: ViewEncapsulation.None,
})
export class AddDrainTypeComponent {
  drainForm!: FormGroup;
  prismCode = prismCodeData;
  content2: any;

  constructor(private fb: FormBuilder,config: NgbModalConfig, private modalService: NgbModal,private toastr: ToastrService) {
    
  }

  ngOnInit(): void {
    // Initialize the form
    this.drainForm = this.fb.group({
      drainType: ['', Validators.required],
      status: ['', Validators.required]
    });
  }
  
  onSubmit() {
    if (this.drainForm.valid) {
      this.toastr.success('Drain type added successfully', 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
      this.drainForm.reset();
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
