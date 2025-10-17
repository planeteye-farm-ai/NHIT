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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { WorkOrderService } from '../work-order.service';


@Component({
  selector: 'app-view-workorder',
  standalone: true,
  imports: [RouterLink,SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './view-workorder.component.html',
  styleUrl: './view-workorder.component.scss'
})
export class ViewWorkorderComponent {

  workOrderForm!: FormGroup;
        prismCode = prismCodeData;
        topTitle:any;
    
       constructor(private fb: FormBuilder,
          private modalService: NgbModal,
          private toastr: ToastrService,
          private workorderService:WorkOrderService,
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
        }

}
