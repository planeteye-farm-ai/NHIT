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
import { InventoryManagementService } from '../inventory-management.service';
import { Equipment } from '../Equipment';

@Component({
  selector: 'app-add-inventory',
  standalone: true,
  imports: [RouterLink,SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './add-inventory.component.html',
  styleUrl: './add-inventory.component.scss'
})
export class AddInventoryComponent {

    inventoryForm!: FormGroup;
    prismCode = prismCodeData;
    
      constructor(private fb: FormBuilder,
        private modalService: NgbModal,
        private toastr: ToastrService,
        private inventoryService:InventoryManagementService,
        private router: Router,
        ) {
        
      }
  
      ngOnInit(): void {
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
  
    onSubmit():void{
      if(this.inventoryForm.invalid){
        this.inventoryForm.markAllAsTouched();
        return;
      }else{
        let equipmentObj:Equipment = {
          item_name: this.inventoryForm.get('item_name')?.value,
          yom: this.inventoryForm.get('yom')?.value,
          make_and_model: this.inventoryForm.get('make_and_model')?.value,
          equipment_code: this.inventoryForm.get('equipment_code')?.value,
          estimate_cost: this.inventoryForm.get('estimate_cost')?.value,
          working_status: this.inventoryForm.get('working_status')?.value,
          remark: this.inventoryForm.get('remark')?.value,
        }
        console.log(equipmentObj)
        this.inventoryService.addEquipments(equipmentObj).subscribe((res) =>{
          if(res.status){
            this.router.navigate(['inventory/inventory-management']);
            this.toastr.success(res.msg, 'RAMS', {
              timeOut: 3000,
              positionClass: 'toast-top-right'
            });
            this.inventoryForm.reset();
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
