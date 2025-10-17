import { Component, ViewEncapsulation } from '@angular/core';
import { NgbModal, NgbModalConfig,NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../../../shared/common/sharedmodule'; 
import { CommonModule } from '@angular/common';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { ShowcodeCardComponent } from '../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../shared/prismData/advancedUi/models';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { MastersService } from '../../masters.service';
@Component({
  selector: 'app-add-road-type',
  standalone: true,
  imports: [SharedModule,NgbTooltipModule,CommonModule,NgbPopoverModule, ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './add-road-type.component.html',
  styleUrl: './add-road-type.component.scss',
  providers: [NgbModalConfig, NgbModal],
  encapsulation: ViewEncapsulation.None,
})
export class AddRoadTypeComponent {
  roadTypeForm!: FormGroup;
  prismCode = prismCodeData;
  content2: any;

  constructor(private fb: FormBuilder,config: NgbModalConfig, private modalService: NgbModal,private toastr: ToastrService,private mastersService:MastersService) {
    
  }
  ngOnInit(): void {
    // Initialize the form
    this.roadTypeForm = this.fb.group({
      roadType: ['', Validators.required],
      status: ['', Validators.required]
    });
  }

  onSubmit() {
    console.log(this.roadTypeForm);
    if (this.roadTypeForm.invalid) {
      this.roadTypeForm.markAllAsTouched();
      return;
    } else {
      let dataObj: any = {
        road_type: this.roadTypeForm.get('roadType')?.value,
        status: this.roadTypeForm.get('status')?.value
      };
  
      this.mastersService.addRoadType(dataObj).subscribe(
        (res) => {
          if (res.status) {
            this.toastr.success(res.msg, 'NHAI RAMS', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
            });
            this.roadTypeForm.reset();
          } else {
            this.toastr.error(res.msg, 'NHAI RAMS', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
            });
          }
        },
        (err) => {
          this.toastr.error(err.msg, 'NHAI RAMS', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
        }
      );
    }
  }
  


  openVerticallyCentered(content2:any) {
		this.modalService.open(content2, { size: 'lg' },);
	}

}
