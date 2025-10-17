import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../shared/prismData/tables';
import { SharedModule } from '../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {NgbModalConfig} from '@ng-bootstrap/ng-bootstrap';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup,FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import {ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WorkOrderService } from '../work-order.service';
@Component({
  selector: 'app-work-order',
  standalone: true,
  imports: [CommonModule,SharedModule,NgSelectModule,NgbPopoverModule,FormsModule,RouterLink,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './work-order.component.html',
  styleUrl: './work-order.component.scss'
})
export class WorkOrderComponent {

    workOrderAssignForm !: FormGroup;
    workOrderDatesForm !: FormGroup;
    prismCode = prismCodeData;
    work_order_id: any;
    content1:any;
    content2:any;
    content3:any;

    tableData:any;
    selectedId: number | null = null;
  
    constructor(private fb: FormBuilder,config: NgbModalConfig, private modalService: NgbModal,private toastr: ToastrService,private workorderService:WorkOrderService) {
      
    }

    ngOnInit(): void{
       this.workOrderAssignForm = this.fb.group({
          work_status: ['',[Validators.required]],
          field_crew_assigned: ['',[Validators.required]], 
          work_order_id :this.work_order_id
        })

        this.workOrderDatesForm = this.fb.group({
          planned_start_date: ['',[Validators.required]],
          planned_completion_date: [''], 
          actual_start_date: [''], 
          actual_completion_date: [''], 
          work_order_id :this.work_order_id
        })
      this.getWorkOrderData();
    }
  
    getWorkOrderData() {
       this.workorderService.getWorkOrderList().subscribe((res) => {
        this.tableData = res.data;
       })
    }

    open(content: any,id:any) {
      this.selectedId = id;
      this.modalService.open(content);
    }
    restworkOrderDatesForm(){
      this.workOrderDatesForm.reset();
    }
    restworkOrderAssignForm(){
      this.workOrderAssignForm.reset();
    }
    onSubmit():void{
      console.log(this.workOrderAssignForm);
    }

    onSubmitDates():void{
      console.log(this.workOrderDatesForm);

    }
    
    delete(){
       
    }
}
