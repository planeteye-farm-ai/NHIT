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
import { WorkOrderService } from '../work-order.service';
import { work_order } from '../work_order';

@Component({
  selector: 'app-add-workorder',
  standalone: true,
  imports: [RouterLink,SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './add-workorder.component.html',
  styleUrl: './add-workorder.component.scss'
})
export class AddWorkorderComponent {
   workOrderForm!: FormGroup;
    prismCode = prismCodeData;
    stateList:any;
      constructor(private fb: FormBuilder,
        private modalService: NgbModal,
        private toastr: ToastrService,
        private workorderService:WorkOrderService,
        private router: Router,
        ) {
        
      }

      ngOnInit(): void {
        this.workOrderForm = this.fb.group({
          work_order_id: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
          type_of_work: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]], 
          other_type_of_work: [''],
          chainage_km_from: ['',[Validators.required]],
          chainage_km_to: ['',[Validators.required]],
        })
      }

      onSubmit():void{
        // console.log(this.workOrderForm);
        if(this.workOrderForm.invalid){
        this.workOrderForm.markAllAsTouched();
          return;
        }
        else{
           let work_orderObj:work_order ={ 
            work_order_id: this.workOrderForm.get('work_order_id')?.value,
            type_of_work: this.workOrderForm.get('type_of_work')?.value,
            other: this.workOrderForm.get('other_type_of_work')?.value,
            chainage_from: this.workOrderForm.get('chainage_km_from')?.value,
            chainage_to: this.workOrderForm.get('chainage_km_to')?.value,
           }
           console.log(work_orderObj);
           this.workorderService.addWorkOrder(work_orderObj).subscribe((res) =>{
           if(res.status){
              this.router.navigate(['/work-order']);
              this.toastr.success(res.msg, 'NHAI RAMS', {
                timeOut: 3000,
                positionClass: 'toast-top-right',
              });
            }
            else {
                this.toastr.error(res.msg, 'NHAI RAMS', {
                  timeOut: 3000,
                  positionClass: 'toast-top-right',
                });
              }
          },
          (err)=>{
            this.toastr.error(err.msg, 'NHAI RAMS', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
            });
          });
          }
            
        }

}
     