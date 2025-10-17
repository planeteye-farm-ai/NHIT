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
import { ActivatedRoute, Router,RouterLink } from '@angular/router'
import { WorkOrderService } from '../work-order.service';

@Component({
  selector: 'app-edit-workorder',
  standalone: true,
  imports: [RouterLink,SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './edit-workorder.component.html',
  styleUrl: './edit-workorder.component.scss'
})
export class EditWorkorderComponent {

  workOrderForm!: FormGroup;
      prismCode = prismCodeData;
      topTitle:any;
      work_order_item_id:any
      
      constructor(private fb: FormBuilder,
        private modalService: NgbModal,
        private toastr: ToastrService,
        private workorderService:WorkOrderService,
        private router: Router,
        private route: ActivatedRoute,
        ) {
      }

      ngOnInit(): void {
        this.workOrderForm = this.fb.group({
          work_order_id: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
          type_of_work: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]], 
          other_type_of_work: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
          chainage_km_from: ['',[CustomValidators.numberValidator()]],
          chainage_km_to: ['',[CustomValidators.numberValidator()]],
          workOrderItems: this.fb.array([]),
        })

        this.addWorkOrderItem();
      }
  

      addWorkOrderItem() {
        const itemGroup = this.fb.group({
          boq_item_code:['',Validators.required],
          scope_of_work: ['', Validators.required],
          other_scope: [''],
          remark: ['',],
          work_order_item_id: this.work_order_item_id
          
        });
        this.workOrderItems.push(itemGroup);
      }
  
      get workOrderItems(): FormArray {
        return this.workOrderForm.get('workOrderItems') as FormArray;
      }
      
      removeRow(index: number){
        this.workOrderItems.removeAt(index)
      }
      
      saveRow(data:any){
        console.log(data)
      }
  
      onSubmit():void{
        console.log(this.workOrderForm);
      }

}
