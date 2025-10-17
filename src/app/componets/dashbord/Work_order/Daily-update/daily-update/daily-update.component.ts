import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../shared/prismData/tables';
import { SharedModule } from '../../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {NgbModalConfig} from '@ng-bootstrap/ng-bootstrap';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup,FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import {ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { ActivatedRoute, Router,RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WorkOrderService } from '../../work-order.service';

@Component({
  selector: 'app-daily-update',
  standalone: true,
  imports: [CommonModule,SharedModule,NgSelectModule,NgbPopoverModule,FormsModule,RouterLink,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './daily-update.component.html',
  styleUrl: './daily-update.component.scss'
})
export class DailyUpdateComponent {
      dailyUpdateForm !: FormGroup;
      prismCode = prismCodeData;
      work_order_id: any;
      content:any;

      tableData:any;
      selectedId: number | null = null;
    
      constructor(private fb: FormBuilder,config: NgbModalConfig, private modalService: NgbModal,private toastr: ToastrService,private workorderService:WorkOrderService, private router: Router, private route: ActivatedRoute) {
        
      }

      ngOnInit(): void{
        this.route.paramMap.subscribe(params => {
          this.work_order_id = Number(params.get('id'));
        });
       this.getDailyUpdateData();
     }
   
     getDailyUpdateData() {
       this.tableData = [
         {
           daily_update_id:2,
           daily_update_date:'22/02/2025',
           progress_update: '5',
           statistical_analysis_required:'Yes',
         },
       ];
     }
     
    open(content: any,id:any) {
      this.selectedId = id;
      this.modalService.open(content);
    }

    onSubmit():void{
      console.log(this.dailyUpdateForm);
    }
 
    delete(){
       
    }
     

}
