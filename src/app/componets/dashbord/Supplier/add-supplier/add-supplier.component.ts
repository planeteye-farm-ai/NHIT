import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../shared/common/custom-validators'; 
import { Router,RouterLink } from '@angular/router'
import { SupplierManagementService } from '../supplier-management.service';
import { Supplier } from '../supplier';

@Component({
  selector: 'app-add-supplier',
  standalone: true,
  imports: [RouterLink, SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './add-supplier.component.html',
  styleUrl: './add-supplier.component.scss'
})
export class AddSupplierComponent {
  
  supplierForm!: FormGroup;
  prismCode = prismCodeData;
  stateList : any;
  
    constructor(private fb: FormBuilder,
      private modalService: NgbModal,
      private toastr: ToastrService,
      private supplierService:SupplierManagementService,
      private router: Router,
      ) {
      
    }

    ngOnInit(): void {
      this.supplierForm = this.fb.group({
        supl_comp: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
        supl_address:['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
        supl_mobile:['',[Validators.required,CustomValidators.numberValidator()]],
        supl_email:['',[Validators.required,CustomValidators.emailValidator()]],
        supl_conperson:['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
        supl_city:['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
        supl_state_id:['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
        // gstin_num:['',],
      })
      this.getStateList();
    }
  

    getStateList(){
      this.supplierService.getStateList().subscribe((res)=>{
        this.stateList = res.data;
        // console.log(this.stateList)
      })
    }

    onSubmit():void{
      if(this.supplierForm.invalid){
        this.supplierForm.markAllAsTouched();
        return;
      }else{
        let supplierObj:Supplier = {
          supl_comp: this.supplierForm.get('supl_comp')?.value,
          supl_address: this.supplierForm.get('supl_address')?.value,
          supl_mobile: this.supplierForm.get('supl_mobile')?.value,
          supl_email: this.supplierForm.get('supl_email')?.value,
          supl_conperson: this.supplierForm.get('supl_conperson')?.value,
          supl_city: this.supplierForm.get('supl_city')?.value,
          supl_state_id: this.supplierForm.get('supl_state_id')?.value
        }
        console.log(supplierObj)
        this.supplierService.addSuppliers(supplierObj).subscribe((res) =>{
          if(res.status){
            this.router.navigate(['supplier/supplier-management']);
            this.toastr.success(res.msg, 'RAMS', {
              timeOut: 3000,
              positionClass: 'toast-top-right'
            });
            this.supplierForm.reset();
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
