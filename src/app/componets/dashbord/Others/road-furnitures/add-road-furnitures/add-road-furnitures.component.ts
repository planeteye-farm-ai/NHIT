import { Component, ViewEncapsulation } from '@angular/core';
import { NgbModal, NgbModalConfig,NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../../../../shared/common/sharedmodule'; 
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { ShowcodeCardComponent } from '../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../shared/prismData/advancedUi/models';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
@Component({
  selector: 'app-add-road-furnitures',
  standalone: true,
  imports: [SharedModule,NgbTooltipModule,NgSelectModule,NgbPopoverModule,FormsModule, ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './add-road-furnitures.component.html',
  styleUrl: './add-road-furnitures.component.scss',
  providers: [NgbModalConfig, NgbModal],
  encapsulation: ViewEncapsulation.None,
})
export class AddRoadFurnituresComponent {

  roadForm!: FormGroup;
  prismCode = prismCodeData;
  content2: any;
  selectedAssetType: any=[];

  constructor(private fb: FormBuilder,config: NgbModalConfig, private modalService: NgbModal,private toastr: ToastrService) {
    
  }

  ngOnInit(): void {
    this.roadForm = this.fb.group({
      nhNumber: ['', Validators.required],
      sectionCode: ['', Validators.required],
      chainageStart: ['', Validators.required],
      chainageEnd: ['', Validators.required],
      direction: ['', Validators.required],
      assetCharcters: ['', Validators.required],
      assetType: ['', Validators.required],

    });
  }

  onSubmit(): void {
    if (this.roadForm.valid) {
      this.toastr.success('Road furniture added successfully', 'NHAI RAMS', {
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
  
  openVerticallyCentered(content2:any) {
		this.modalService.open(content2, { size: 'lg' },);
	}

}
