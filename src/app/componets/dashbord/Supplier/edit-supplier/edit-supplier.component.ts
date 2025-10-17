import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { SupplierManagementService } from '../supplier-management.service';
import { Supplier } from '../supplier';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../shared/common/custom-validators'; 
import { ActivatedRoute, Router,RouterLink } from '@angular/router';

@Component({
  selector: 'app-edit-supplier',
  standalone: true,
  imports: [RouterLink,SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './edit-supplier.component.html',
  styleUrl: './edit-supplier.component.scss'
})
export class EditSupplierComponent {

    supplierForm!: FormGroup;
    prismCode = prismCodeData;
    topTitle:any;
    stateList:any;
    supl_id:any;

    constructor(private fb: FormBuilder,
      private modalService: NgbModal,
      private toastr: ToastrService,
      private supplierService:SupplierManagementService,
      private router: Router,
      private route: ActivatedRoute,
      ) {
    }
    ngOnInit(): void {
      this.route.paramMap.subscribe(params => {
        this.supl_id = Number(params.get('id'));
        if (this.supl_id) {
          this.loadSupplierDetails(this.supl_id);
        }
      });
      this.supplierForm = this.fb.group({
        supl_comp: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
        supl_address:['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
        supl_mobile:['',[Validators.required,CustomValidators.numberValidator()]],
        supl_email:['',[Validators.required,CustomValidators.emailValidator()]],
        supl_conperson:['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
        supl_city:['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
        supl_state_id:['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      })
      this.getStateList();
    }

    getStateList(){
      this.supplierService.getStateList().subscribe((res)=>{
        this.stateList = res.data;
      })
    }

    loadSupplierDetails(id:number): void{
      this.supplierService.getDetailsById(id).subscribe((res) => {
        if(res){
          this.topTitle = res.data[0].supl_comp;
          this.patchValue(res);
        }
      },(err) => {
        this.toastr.error(err.msg, 'NHAI RAMS', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
      });
     }

     patchValue(Supplier:any){
      this.supplierForm.patchValue({
        supl_comp: Supplier.data[0].supl_comp,
        supl_address:Supplier.data[0].supl_address,
        supl_mobile:Supplier.data[0].supl_mobile,
        supl_email:Supplier.data[0].supl_email,
        supl_conperson:Supplier.data[0].supl_conperson,
        supl_city:Supplier.data[0].supl_city,
        supl_state_id: Supplier.data[0].supl_state_id
      })
     }
    onSubmit():void{
      if(this.supplierForm.invalid){
        this.supplierForm.markAllAsTouched();
        return;
      }
      else{
        let supplierObj:Supplier = {
          supl_comp: this.supplierForm.get('supl_comp')?.value,
          supl_address: this.supplierForm.get('supl_address')?.value,
          supl_mobile: this.supplierForm.get('supl_mobile')?.value,
          supl_email: this.supplierForm.get('supl_email')?.value,
          supl_conperson: this.supplierForm.get('supl_conperson')?.value,
          supl_city: this.supplierForm.get('supl_city')?.value,
          supl_state_id: this.supplierForm.get('supl_state_id')?.value
        }
        // console.log(supplierObj)
         this.supplierService.updateSupplier(supplierObj,this.supl_id).subscribe((res) => {
          if(res.status){
            this.loadSupplierDetails(this.supl_id);
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
