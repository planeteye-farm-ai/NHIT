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
  selector: 'app-add-carriageway-furniture',
  standalone: true,
  imports: [SharedModule,NgbTooltipModule,NgbPopoverModule, ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './add-carriageway-furniture.component.html',
  styleUrl: './add-carriageway-furniture.component.scss',
  providers: [NgbModalConfig, NgbModal],
  encapsulation: ViewEncapsulation.None,
})
export class AddCarriagewayFurnitureComponent {
  carriagewayForm!: FormGroup;
  prismCode = prismCodeData;
  content2: any;

  constructor(private fb: FormBuilder,config: NgbModalConfig, private modalService: NgbModal,private toastr: ToastrService) {
    
  }

  ngOnInit(): void {
    // Initialize the form
    this.carriagewayForm = this.fb.group({
      carriageway: ['', Validators.required],
      status: ['', Validators.required]
    });
  }

  onSubmitCarriageway() {
    if (this.carriagewayForm.valid) {
      this.toastr.success('Carriageway Furniture added successfully', 'NHAI RAMS', {
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

  openVerticallyCentered(content2:any) {
		this.modalService.open(content2, { size: 'lg' },);
	}
}
