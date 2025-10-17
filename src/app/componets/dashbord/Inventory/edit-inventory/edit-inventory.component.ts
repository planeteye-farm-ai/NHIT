import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { InventoryManagementService } from '../inventory-management.service';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../shared/common/custom-validators'; 
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Equipment } from '../Equipment';

@Component({
  selector: 'app-edit-inventory',
  standalone: true,
  imports: [RouterLink,SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './edit-inventory.component.html',
  styleUrl: './edit-inventory.component.scss'
})
export class EditInventoryComponent {

  inventoryForm!: FormGroup;
      prismCode = prismCodeData;
      topTitle:any;
      e_id:any;
      
      constructor(private fb: FormBuilder,
        private modalService: NgbModal,
        private toastr: ToastrService,
        private inventoryService:InventoryManagementService,
        private router: Router,
        private route: ActivatedRoute,
        ) {
      }
  
      ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
          this.e_id = Number(params.get('id'));
          if (this.e_id) {
            this.loadEquipmentDetails(this.e_id);
          }
        });
        this.inventoryForm = this.fb.group({
          item_name: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
          yom: ['',[Validators.required]], 
          make_and_model: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
          equipment_code: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
          estimate_cost: ['',[Validators.required,CustomValidators.numberValidator()]],
          working_status: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
          remark: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]]
        })
      }
      
      loadEquipmentDetails(id:number): void{
        this.inventoryService.getDetailsById(id).subscribe((res) => {
          if(res){
            this.topTitle = res.data[0].item_name;
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

       patchValue(Equipment:any){
        this.inventoryForm.patchValue({
          item_name: Equipment.data[0].item_name,
          yom:Equipment.data[0].yom,
          make_and_model:Equipment.data[0].make_and_model,
          equipment_code:Equipment.data[0].equipment_code,
          estimate_cost:Equipment.data[0].estimate_cost,
          working_status:Equipment.data[0].working_status,
          remark:Equipment.data[0].remark,
        })
       }
       
       onSubmit():void{
        if(this.inventoryForm.invalid){
          this.inventoryForm.markAllAsTouched();
          return;
        }
        else{
          let equipmentObj:Equipment = {
              item_name: this.inventoryForm.get('item_name')?.value,
              yom: this.inventoryForm.get('yom')?.value,
              make_and_model: this.inventoryForm.get('make_and_model')?.value,
              equipment_code: this.inventoryForm.get('equipment_code')?.value,
              estimate_cost: this.inventoryForm.get('estimate_cost')?.value,
              working_status: this.inventoryForm.get('working_status')?.value,
              remark: this.inventoryForm.get('remark')?.value,
            }
          // console.log(equipmentObj)
            this.inventoryService.updateEquipment(equipmentObj,this.e_id).subscribe((res) => {
            if(res.status){
              this.loadEquipmentDetails(this.e_id);
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
