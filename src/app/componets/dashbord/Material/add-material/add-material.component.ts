import { Component, Renderer2, viewChild, ElementRef, ViewChild } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../shared/common/custom-validators'; 
import { Router, RouterLink } from '@angular/router'
import { MaterialManagementService } from '../material-management.service';
import { Material } from '../material';

@Component({
  selector: 'app-add-material',
  standalone: true,
  imports: [RouterLink,SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './add-material.component.html',
  styleUrl: './add-material.component.scss'
})
export class AddMaterialComponent {

  materialForm!: FormGroup;
  prismCode = prismCodeData;
  
    constructor(private fb: FormBuilder,
      private modalService: NgbModal,
      private toastr: ToastrService,
      private materialService:MaterialManagementService,
      private router: Router,
      ) {
    }

    ngOnInit(): void {
      this.materialForm = this.fb.group({
        product_name: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
        product_desc: ['',[CustomValidators.noWhitespaceValidator()]], 
        prod_unit: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
        prod_type: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
        other_type: [''],
      })

    }

    onSubmit():void{
      if(this.materialForm.invalid){
        this.materialForm.markAllAsTouched();
        return;
      }else{
        let materialObj:Material = {
          product_name: this.materialForm.get('product_name')?.value,
          product_desc: this.materialForm.get('product_desc')?.value,
          prod_unit: this.materialForm.get('prod_unit')?.value,
          prod_type: this.materialForm.get('prod_type')?.value,
          other_type: this.materialForm.get('other_type')?.value,
        }
        console.log(materialObj)
        this.materialService.addMaterials(materialObj).subscribe((res) =>{
          if(res.status){
            this.router.navigate(['material/material-management']);
            this.toastr.success(res.msg, 'RAMS', {
              timeOut: 3000,
              positionClass: 'toast-top-right'
            });
            this.materialForm.reset();
          }else{
            this.toastr.error(res.msg, 'RAMS', {
              timeOut:3000,
              positionClass: 'toast-top-right',
            });
          }
        },
        (err) => {
          this.toastr.error(err.msg, 'RAMS', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
        });
      }
   }
}
