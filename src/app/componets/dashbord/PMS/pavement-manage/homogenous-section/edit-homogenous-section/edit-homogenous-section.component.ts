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
import { ApiUrl } from '../../../../../../shared/const';
import { PavementConst } from '../../pavement-const';
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
  homogenousData:any;
  urlLive = ApiUrl.API_URL_fOR_iMAGE;

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
      chainage_start :['',[Validators.required, CustomValidators.numberValidator()]],
      chainage_end :['',[Validators.required, CustomValidators.numberValidator()]],
      date_of_survey :['',[Validators.required]],

      carriageway_type :['',[Validators.required]],
      carriageway_width :['',[Validators.required]],

      cracks :[0],
      potholes :[0],
      rutting :[0],
      patchwork :[0],
      edge_breaks :[0],


      severity_of_distress :['',[Validators.required]],
      pavement_condition_scores :[''],
      international_roughness_index :['',[Validators.required]],

      aadt_data :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      cvd_class :[''],
      axle_load_data :['',[Validators.required, CustomValidators.numberValidator()]],

      temperature :['',[Validators.required, CustomValidators.numberValidator()]],
      rainfall :['',[Validators.required, CustomValidators.numberValidator()]],
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
        this.homogenousData = res.data[0];
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
      rutting :homogenous.data[0].rutting,
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
    console.log("submit works",this.homogenousForm)
    if (this.homogenousForm.invalid)
    {
      this.homogenousForm.markAllAsTouched();
      return;
    }
    else{
    console.log("[this.homogenousForm]",this.homogenousForm)
    let total_distress = ((this.homogenousForm.get('cracks')?.value) * PavementConst.cracks_weight+
                          (this.homogenousForm.get('potholes')?.value) * PavementConst.potholes_weight+
                          (this.homogenousForm.get('rutting')?.value) * PavementConst.rutting_weight+
                          (this.homogenousForm.get('patchwork')?.value) * PavementConst.patchwork_weight+
                          (this.homogenousForm.get('edge_breaks')?.value) * PavementConst.edge_breaks_weight )

    let pcs = (total_distress/3) * 100;
    var pavement_condition_score = 'Very Poor';
    var cvd_class = 'T3';
    if( pcs >= 0 && pcs <= 29 ){
      pavement_condition_score = 'Very Poor';
      if( (this.homogenousForm.get('international_roughness_index')?.value === '4-6') || 
      (this.homogenousForm.get('international_roughness_index')?.value === 'less than 4') ){
        cvd_class = 'T3';
      }
    }
    else if( pcs >= 30 && pcs <= 49 ){
      pavement_condition_score = 'Poor';
      if( (this.homogenousForm.get('international_roughness_index')?.value === '6-8') || 
      (this.homogenousForm.get('international_roughness_index')?.value === '8-12') ){
        cvd_class = 'T2';
      }
    }
    else if( pcs >= 50 && pcs <= 69 ){
      pavement_condition_score = 'Fair';
      if( (this.homogenousForm.get('international_roughness_index')?.value === '6-8') || 
      (this.homogenousForm.get('international_roughness_index')?.value === '8-12') ){
        cvd_class = 'T2';
      }
    }
    else if( pcs >= 70 && pcs <=  89 ){
      pavement_condition_score = 'Good';
      if( (this.homogenousForm.get('international_roughness_index')?.value === '12-16') || 
      (this.homogenousForm.get('international_roughness_index')?.value === 'greater than 16') ){
        cvd_class = 'T1';
      }
    }
    else if( pcs >= 90 && pcs <=  100 ){
      pavement_condition_score = 'Excellent';
      if( (this.homogenousForm.get('international_roughness_index')?.value === '12-16') || 
      (this.homogenousForm.get('international_roughness_index')?.value === 'greater than 16') ){
        cvd_class = 'T1';
      }
    }

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
      total_distress: total_distress.toString(),
      pavement_condition_score: pavement_condition_score,
      international_roughness_index: this.homogenousForm.get('international_roughness_index')?.value,
      aadt_data: this.homogenousForm.get('aadt_data')?.value,
      cvd_class: cvd_class,
      axle_load_data: this.homogenousForm.get('axle_load_data')?.value,
      temperature: this.homogenousForm.get('temperature')?.value,
      rainfall: this.homogenousForm.get('rainfall')?.value,
      drainage_condition: this.homogenousForm.get('drainage_condition')?.value,

      last_maintenance_date: this.homogenousForm.get('last_maintenance_date')?.value,
      type_of_last_maintenance: this.homogenousForm.get('type_of_last_maintenance')?.value,
      comments_observations: this.homogenousForm.get('comments_observations')?.value,
 
    }
   console.log(homogenousObj);
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

  onFileChange(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
  
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('table_name','pavement_management_system');
      formData.append('record_id',this.pavement_manage_system_id);
      formData.append('field_name',controlName);
      formData.append('image',file);
      formData.append('record_id_name','pavement_manage_system_id');
      

      this.pavementService.addParticularImage(formData).subscribe((res)=>{
        // console.log(res);
        if(res.status){
          this.ngOnInit()
        }
      })
      // this.inspectionForm.get(controlName)?.setValue(file);

    }
  }

  delete(filedName:any){
    const formData = new FormData();
    formData.append('table_name','pavement_management_system');
    formData.append('record_id',this.pavement_manage_system_id);
    formData.append('field_name',filedName);
    formData.append('record_id_name','pavement_manage_system_id');
   
    this.pavementService.deleteInspectionImage(formData).subscribe((res)=>{
      // console.log(res);
      if(res.status){
        this.ngOnInit()
      }
    })
  }

  downloadImage(fieldName: string): void {
    const imageUrl = `${this.urlLive}/upload/inspection_images/${this.homogenousData[fieldName]}`;    
    const anchor = document.createElement('a');
    anchor.href = imageUrl;
    anchor.download = ''; // Let the browser decide the file name
    anchor.target = '_blank'; // Optional: Open in a new tab if needed

    anchor.click();

    anchor.remove();
  }

}
