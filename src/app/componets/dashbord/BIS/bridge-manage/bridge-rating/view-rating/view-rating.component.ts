import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { BridgeService } from '../../bridge.service';
import { Bridge } from '../../bridge';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../../../shared/common/custom-validators'; 
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-view-rating',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './view-rating.component.html',
  styleUrl: './view-rating.component.scss'
})
export class ViewRatingComponent {
  ratingForm!: FormGroup;
  prismCode = prismCodeData;
  ratingId:any;
  bridgeData:any;
  bridgeName:any;
 
  
  conditionMap:any = {
    1: "Critical condition",
    2: "Poor condition",
    3: "Fair condition",
    4: "Good condition",
    5: "Excellent condition"
  };


  constructor(private route: ActivatedRoute,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private bridgeService:BridgeService,
    private router: Router,
    ) {
    
  }

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {
      this.ratingId = Number(params.get('id'));
      if (this.ratingId) {
        this.loadBridgeDetails(this.ratingId);
      }
    });

    this.ratingForm = this.fb.group({
      visual_inspection_rating: [''],
      visual_inspection_remark: [''],
      assessment_of_damage_rating:[''],
      assessment_of_damage_remark: [''],
      operational_considerations_rating: [''],
      operational_considerations_remark: [''],
      safety_risk_factor_rating: [''],
      safety_risk_factor_remark: [''],
    });

   

  }

  

  loadBridgeDetails(id: number): void {
    
    this.bridgeService.getRatingById(id).subscribe((res) => {
      if (res) {
        console.log("fetch result",res.data)
        this.patchValue(res);
      }
    },(err)=>{
      this.toastr.error(err.msg, 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
    });
    
  }
 
  patchValue(rating:any){
    this.ratingForm.patchValue({
      // visual_inspection_rating: rating.data[0].visual_inspection_rating,
      visual_inspection_rating: this.conditionMap[rating.data[0].visual_inspection_rating],
      visual_inspection_remark: rating.data[0].visual_inspection_remark,
      assessment_of_damage_rating:this.conditionMap[rating.data[0].assessment_of_damage_rating],
      assessment_of_damage_remark: rating.data[0].assessment_of_damage_remark,
      operational_considerations_rating: this.conditionMap[rating.data[0].operational_considerations_rating],
      operational_considerations_remark: rating.data[0].operational_considerations_remark,
      safety_risk_factor_rating: this.conditionMap[rating.data[0].safety_risk_factor_rating],
      safety_risk_factor_remark: rating.data[0].safety_risk_factor_remark,
     
    });
  }
}
