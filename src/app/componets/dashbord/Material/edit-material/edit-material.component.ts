import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { MaterialManagementService } from '../material-management.service';
import { Material } from '../material';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../shared/common/custom-validators'; 
import { ActivatedRoute, Router,RouterLink } from '@angular/router'

@Component({
  selector: 'app-edit-material',
  standalone: true,
  imports: [RouterLink,SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './edit-material.component.html',
  styleUrl: './edit-material.component.scss'
})
export class EditMaterialComponent {
    materialForm!: FormGroup;
    prismCode = prismCodeData;
    topTitle:any;
    pid : any;
    
    constructor(private fb: FormBuilder,
      private modalService: NgbModal,
      private toastr: ToastrService,
      private materialService:MaterialManagementService,
      private router: Router,
      private route: ActivatedRoute,
      ) {
    }

    ngOnInit(): void {
      this.route.paramMap.subscribe(params => {
        this.pid = Number(params.get('id'));
        if (this.pid) {
          this.loadMaterialDetails(this.pid);
        }
      });
      this.materialForm = this.fb.group({
        product_name: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
        product_desc: ['',[CustomValidators.noWhitespaceValidator()]], 
        prod_unit: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
        prod_type: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
        other_type: [''],
      })
    }

    loadMaterialDetails(id:number): void{
      this.materialService.getDetailsById(id).subscribe((res) => {
        if(res){
          this.topTitle = res.data[0].product_name;
          this.patchValue(res);
          // console.log(res)
        }
      },(err) => {
        this.toastr.error(err.msg, 'NHAI RAMS', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
      });
     }

     patchValue(Material:any){
      this.materialForm.patchValue({
        product_name: Material.data[0].product_name,
        product_desc:Material.data[0].product_desc,
        prod_unit:Material.data[0].prod_unit,
        prod_type:Material.data[0].prod_type,
        other_type:Material.data[0].other_type,
      })
     }
     onSubmit():void{
      if(this.materialForm.invalid){
        this.materialForm.markAllAsTouched();
        return;
      }
      else{
        let materialObj:Material = {
          product_name: this.materialForm.get('product_name')?.value,
          product_desc: this.materialForm.get('product_desc')?.value,
          prod_unit: this.materialForm.get('prod_unit')?.value,
          prod_type: this.materialForm.get('prod_type')?.value,
          other_type: this.materialForm.get('other_type')?.value,
        }
        // console.log(supplierObj)
          this.materialService.updateMaterial(materialObj,this.pid).subscribe((res) => {
          if(res.status){
            this.loadMaterialDetails(this.pid);
            this.toastr.success(res.msg, 'NHAI RAMS', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
            });
          } else {
            this.toastr.error(res.msg, 'NHAI RAMS', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
            });
          }
          },  (err)=>{
          this.toastr.error(err.msg, 'NHAI RAMS', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
        });
        }
      }
}
