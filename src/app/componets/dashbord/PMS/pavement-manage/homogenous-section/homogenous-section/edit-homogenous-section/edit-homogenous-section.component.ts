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
  selector: 'app-edit-homogenous-section',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './edit-homogenous-section.component.html',
  styleUrl: './edit-homogenous-section.component.scss'
})
export class EditHomogenousSectionComponent {

  homogenousForm!: FormGroup;
  prismCode = prismCodeData;
  stateList:any;
  districtList:any;
  cityList:any;
  roadList:any;
  state_id:any;
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
      geometry_data_id: ['', [Validators.required]],
      state_id :['',[Validators.required]],
      district_id :['',[Validators.required]],
      city_id :['',[Validators.required]],
      road_code :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      chainage_start :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      chainage_end :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      date_of_survey :['',[Validators.required]],

      carriageway_type :['',[Validators.required]],
      carriageway_width :['',[Validators.required]],

      crackssss :['',[CustomValidators.noWhitespaceValidator()]],
      potholes :['',[CustomValidators.noWhitespaceValidator()]],
      rutting :['',[CustomValidators.noWhitespaceValidator()]],
      patchwork :['',[CustomValidators.noWhitespaceValidator()]],
      edge_breaks :['',[CustomValidators.noWhitespaceValidator()]],

      severity_of_distress :['',[Validators.required]],
      pavement_condition_scores :['',[Validators.required]],
      international_roughness_index :['',[Validators.required]],

      aadt_data :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      cvd_class :['',[Validators.required]],
      axle_load_data :['',[CustomValidators.noWhitespaceValidator()]],

      temperature :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      rainfall :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      drainage_condition :['',[Validators.required]],

      last_maintenance_date :['',[Validators.required]],
      type_of_last_maintenance :['',[Validators.required]],
      comments_observations :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      
    })
    this.getDropDownData();
  }

  getDropDownData(){
    this.getStateList();
    this.getRoadList();
  }

  getRoadList(){
    this.pavementService.getRoadList().subscribe((res)=>{
        // console.log('Road list ',res)
      this.roadList = res.data;
    })
  }
  getStateList(){
    this.pavementService.getStateList().subscribe((res)=>{
      // console.log('state list ',res)
      this.stateList = res.data;
    })
  }

  getDistrctList(id:any){
    this.state_id=id;
    this.pavementService.getDistrctList(id).subscribe((res) =>{
      this.districtList = res.data;
    })
  }


  getCitytList(id:any){
    this.pavementService.getCitytList(id).subscribe((res) =>{
      // console.log(res)
      this.cityList = res.data;

    })
  }

  loadHomogenousDetails(id: number): void {
    // console.log(id)
    this.pavementService.getHomogenousDetailsById(id).subscribe((res) => {
      if (res) {
         console.log("fetch result",res.data)
        this.topTitle = res.data[0].name_of_road;
        // console.log(res);
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
      geometry_data_id: homogenous.data[0].geometry_data_id,
      state_id :homogenous.data[0].state_id,
      district_id :homogenous.data[0].district_id,
      city_id : homogenous.data[0].city_id,
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
    if(homogenous.data[0].state_id){
      this.getDistrctList(homogenous.data[0].state_id)
    }
    if(homogenous.data[0].district_id){
      this.getCitytList(homogenous.data[0].district_id)
    }
  }

  onSubmit(): void {
    if (this.homogenousForm.invalid)
    {
      this.homogenousForm.markAllAsTouched();
      return;
    }
    else{
           
    let homogenousObj:homogenousEdit ={ 
   
      geometry_data_id: this.homogenousForm.get('geometry_data_id')?.value,
      state_id: this.homogenousForm.get('state_id')?.value,
      district_id: this.homogenousForm.get('district_id')?.value,
      city_id: this.homogenousForm.get('city_id')?.value,
      road_code: this.homogenousForm.get('road_code')?.value,
      chainage_start: this.homogenousForm.get('chainage_start')?.value,
      chainage_end: this.homogenousForm.get('chainage_end')?.value,
      date_of_survey: this.homogenousForm.get('date_of_survey')?.value,

      carriageway_type: this.homogenousForm.get('carriageway_type')?.value,
      carriageway_width: this.homogenousForm.get('carriageway_width')?.value,
      cracks: this.homogenousForm.get('cracks')?.value,
      potholes: this.homogenousForm.get('potholes')?.value,
      rutting: this.homogenousForm.get('rutting')?.value,
      patchwork: this.homogenousForm.get('patchwork')?.value,
      edge_breaks: this.homogenousForm.get('edge_breaks')?.value,
      severity_of_distress: this.homogenousForm.get('severity_of_distress')?.value,
      pavement_condition_score: this.homogenousForm.get('pavement_condition_score')?.value,
      international_roughness_index: this.homogenousForm.get('international_roughness_index')?.value,
      aadt_data: this.homogenousForm.get('aadt_data')?.value,
      cvd_class: this.homogenousForm.get('cvd_class')?.value,
      axle_load_data: this.homogenousForm.get('axle_load_data')?.value,
      temperature: this.homogenousForm.get('temperature')?.value,
      rainfall: this.homogenousForm.get('rainfall')?.value,
      drainage_condition: this.homogenousForm.get('drainage_condition')?.value,

      last_maintenance_date: this.homogenousForm.get('last_maintenance_date')?.value,
      type_of_last_maintenance: this.homogenousForm.get('type_of_last_maintenance')?.value,
      comments_observations: this.homogenousForm.get('comments_observations')?.value,
 
    }

      // console.log(homogenousObj);
    this.pavementService.updateHomogenous(homogenousObj,this.pavement_manage_system_id).subscribe((res)=>{
      if(res.status){
        this.loadHomogenousDetails(this.pavement_manage_system_id);
        this.toastr.success(res.msg, 'NHAI RAMS', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
            this.homogenousForm.reset();
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
