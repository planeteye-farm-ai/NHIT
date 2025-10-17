import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { PavementManageService } from '../../pavement-manage.service'; 
import { homogenousAdd, homogenousEdit } from '../homogenous';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../../../shared/common/custom-validators'; 
import { ActivatedRoute , Router } from '@angular/router'
@Component({
  selector: 'app-view-homogenous-section',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './view-homogenous-section.component.html',
  styleUrl: './view-homogenous-section.component.scss'
})
export class ViewHomogenousSectionComponent {

  homogenousForm!: FormGroup;
  prismCode = prismCodeData;
  pavement_manage_system_id :any;
  topTitle:any;

  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private pavementService:PavementManageService,
    private router: Router,
    private route: ActivatedRoute,
    ) {
    
  }

  ngOnInit(): void {
    // Get bridge ID from route parameters
    this.route.paramMap.subscribe(params => {
     this.pavement_manage_system_id = Number(params.get('id'));
     if (this.pavement_manage_system_id) {
       this.loadHomogenousDetails(this.pavement_manage_system_id);
     }
   });
    
   this.homogenousForm = this.fb.group({
     geometry_data_id: [''],
     state_id :[''],
     district_id :[''],
     city_id :[''],
     road_code :[''],
     chainage_start :[''],
     chainage_end :[''],
     date_of_survey :[''],
     carriageway_type :[''],
     carriageway_width :[''],
     crackssss :[''],
     potholes :[''],
     rutting :[''],
     patchwork :[''],
     edge_breaks :[''],
     severity_of_distress :[''],
     pavement_condition_scores :[''],
     international_roughness_index :[''],
     aadt_data :[''],
     cvd_class :[''],
     axle_load_data :[''],
     temperature :[''],
     rainfall :[''],
     drainage_condition :[''],
     last_maintenance_date :[''],
     type_of_last_maintenance :[''],
     comments_observations :[''],
     
   })
 }

 loadHomogenousDetails(id: number): void {
  // console.log(id)
  this.pavementService.getHomogenousDetailsById(id).subscribe((res) => {
    if (res) {
       console.log("fetch result",res.data)
      this.topTitle = res.data[0].name_of_road;
      console.log(res);
       this.patchValue(res);
    }
  },(err)=>{
    this.toastr.error(err.msg, 'NHAI RAMS', {
      timeOut: 3000,
      positionClass: 'toast-top-right',
    });
  });
}

patchValue(homogenous:any){
  // console.log(homogenous)
  this.homogenousForm.patchValue({
    geometry_data_id: homogenous.data[0].name_of_road,
    state_id :homogenous.data[0].state_name,
    district_id :homogenous.data[0].district_name,
    city_id : homogenous.data[0].city_name,
    road_code :homogenous.data[0].road_code,
    chainage_start :homogenous.data[0].chainage_start,
    chainage_end :homogenous.data[0].chainage_end,
    date_of_survey :homogenous.data[0].date_of_survey,
    carriageway_type :homogenous.data[0].carriageway_type,
    carriageway_width :homogenous.data[0].carriageway_width,
    cracks :homogenous.data[0].cracks,
    potholes :homogenous.data[0].potholes,
    rutting :homogenous.data[0].car_jeep_van_taxi,
    patchwork :homogenous.data[0].patchwork,
    edge_breaks :homogenous.data[0].edge_breaks,
    severity_of_distress :homogenous.data[0].severity_of_distress,
    pavement_condition_score :homogenous.data[0].pavement_condition_score,
    international_roughness_index :homogenous.data[0].international_roughness_index,
    aadt_data :homogenous.data[0].aadt_data,
    cvd_class :homogenous.data[0].cvd_class,
    axle_load_data :homogenous.data[0].axle_load_data,
    temperature :homogenous.data[0].temperature,
    rainfall :homogenous.data[0].rainfall,
    drainage_condition :homogenous.data[0].drainage_condition,
    last_maintenance_date :homogenous.data[0].last_maintenance_date,
    type_of_last_maintenance :homogenous.data[0].type_of_last_maintenance,
    comments_observations :homogenous.data[0].comments_observations,
  })
}

}
