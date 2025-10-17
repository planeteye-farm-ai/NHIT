import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../../shared/common/custom-validators'; 
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { WorkOrderService } from '../../work-order.service';


@Component({
  selector: 'app-view-daily-update',
  standalone: true,
  imports: [RouterLink,SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './view-daily-update.component.html',
  styleUrl: './view-daily-update.component.scss'
})
export class ViewDailyUpdateComponent {

    dailyUpdateForm!: FormGroup;
    prismCode = prismCodeData;
    daily_update_id: any;
    work_order_id: any
      constructor(private fb: FormBuilder,
        private modalService: NgbModal,
        private toastr: ToastrService,
        private workorderService:WorkOrderService,
        private router: Router, private route: ActivatedRoute
        ) {
        
      }

      ngOnInit(): void{
        this.route.paramMap.subscribe(params => {
          this.daily_update_id = Number(params.get('id'));
          this.work_order_id = Number(params.get('work_order_id'));
          if (this.daily_update_id) {
            this.loadDailyUpdateDetails(this.daily_update_id);
          }
        });
        this.dailyUpdateForm = this.fb.group({
          daily_update_date: [''],
          progress_update:[''],
          site_photos:[''],
          gps_evidence_attached:[''],
          names_links:[''],
          challenges_delays_faced:[''],
          statistical_analysis_required:[''],
          additional_comments:[''],
          site_supervisor_name_signature:[''],
        })
      }

      loadDailyUpdateDetails(daily_update_id: any){

      }
  

}
