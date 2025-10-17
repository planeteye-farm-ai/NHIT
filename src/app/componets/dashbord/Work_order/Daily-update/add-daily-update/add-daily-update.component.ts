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
import { ActivatedRoute, Router,RouterLink } from '@angular/router';
import { WorkOrderService } from '../../work-order.service';


@Component({
  selector: 'app-add-daily-update',
  standalone: true,
  imports: [RouterLink,SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './add-daily-update.component.html',
  styleUrl: './add-daily-update.component.scss'
})
export class AddDailyUpdateComponent {

  dailyUpdateForm!: FormGroup;
    prismCode = prismCodeData;
    work_order_id: any;
      constructor(private fb: FormBuilder,
        private modalService: NgbModal,
        private toastr: ToastrService,
        private workorderService:WorkOrderService,
        private router: Router, private route: ActivatedRoute
        ) {
        
      }

      ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
          this.work_order_id = Number(params.get('id'));
        });
        this.dailyUpdateForm = this.fb.group({
          daily_update_date: ['',[Validators.required]],
          progress_update: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]], 
          site_photos: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
          gps_evidence_attached: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
          names_links: [''],
          challenges_delays_faced: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
          statistical_analysis_required: ['',[Validators.required]],
          additional_comments: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
          site_supervisor_name_signature: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
        })
      }

      onSubmit():void{
        console.log(this.dailyUpdateForm);
      }
}
