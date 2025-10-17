import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { RwfisManageService } from '../rwfis-manage.service';
import { RWFIS, EditRWFIS } from '../rwfis';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../../shared/common/custom-validators'; 
import { ActivatedRoute,Router } from '@angular/router';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-edit-rwfis',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './edit-rwfis.component.html',
  styleUrl: './edit-rwfis.component.scss'
})
export class EditRwfisComponent {
  
    rwfisForm!: FormGroup;
    prismCode = prismCodeData;
    stateList:any;
    districtList:any;
    cityList:any;
    roadList:any;
    state_id:any;
    rwfis_id:any;
    topTitle:any;

    featureTypeList =[
      'Sign Board', 'Culvert', 'Street Light', 'Trees', 'Median Plants', 'KM Stone', 'Junction', 'Adjacent Road','Bus Stop', 'Toll Plaza', 'Toilet Block', 'Fuel Station', 'Truck Layby', 'Service Road', 'Tunnels', 'Row Fencing', 'RCC Drain', 'Rest Area', 'Traffic Signals', 'Solar Blinker', 'Emergency Call Box', 'Footpath', 'Divider Break'
    ]
  
    constructor(private fb: FormBuilder,
      private modalService: NgbModal,
      private toastr: ToastrService,
      private rwfisService:RwfisManageService,
      private router: Router,
      private route: ActivatedRoute,
      ) {
      
    }
    ngOnInit(): void{
      this.route.paramMap.subscribe(params => {
        this.rwfis_id = Number(params.get('id'));
        if(this.rwfis_id){
          this.loadRwfisDetails(this.rwfis_id);
        }
      })

      this.rwfisForm = this.fb.group({
        state_id:['', [Validators.required]],
        district_id:['', [Validators.required]],
        city_id:['', [Validators.required]],// block
        road_name:['', [Validators.required]],
        road_code:['', [Validators.required,CustomValidators.noWhitespaceValidator()]],
        total_length_km :['',[Validators.required,CustomValidators.numberValidator()]],
        survey_year:['', Validators.required],
        survey_date:['', Validators.required],
        direction:['',[Validators.required]],
        chainage_start:['',[Validators.required,CustomValidators.numberValidator()]],
        chainage_end:['',[Validators.required,CustomValidators.numberValidator()]],
        chainage:['',[Validators.required,CustomValidators.numberValidator()]],
        cross_section_location:['',[Validators.required]],
        offset_from_center_line:['',[Validators.required,CustomValidators.numberValidator()]],
        feature_type:['',[Validators.required]],
        material_type:['',[Validators.required]],
        feature_condition:['',[Validators.required]],
        safety_hazard:['',[Validators.required]],
        land_use: ['',[Validators.required]],
        terrain:  ['',[Validators.required]],
        latitude: ['',[Validators.required,CustomValidators.numberValidator()]],
        longitude:['',[Validators.required,CustomValidators.numberValidator()]],
        altitude: ['',[Validators.required,CustomValidators.numberValidator()]],
        remarks:  ['',[Validators.required]],

      })
      this.getDropDownData();
      
    }
    getDropDownData(){
      this.getStateList();
      this.getRoadList();
    }
  
    getRoadList(){
      this.rwfisService.getRoadList().subscribe((res)=>{
        this.roadList = res.data;
      })
    }
  
    getStateList(){
      this.rwfisService.getStateList().subscribe((res) =>{
        this.stateList = res.data
      })
    }
  
    getDistrctList(id:any){
      this.rwfisService.getDistrctList(id).subscribe((res) =>{
        this.districtList = res.data;
      })
    }
  
    getCitytList(id:any){
      this.rwfisService.getCitytList(id).subscribe((res) =>{
        this.cityList = res.data;
      })
    }

    loadRwfisDetails(rwfis_id:number): void{
      // console.log(rwfis_id);
      this.rwfisService.getRwfisDetailsByID(rwfis_id).subscribe((res) =>{
        if(res){
          // consconsoleole.log(res.data)
          this.patchValue(res);
        }
      },(err)=>{
        this.toastr.error(err.msg, 'NHAI RAMS', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
      });
    }
    patchValue(rwfis:any){
      // console.log(rwfis);
      this.rwfisForm.patchValue({
        state_id: rwfis.data[0].state_id,
        district_id:rwfis.data[0].district_id,
        city_id:rwfis.data[0].city_id,
        road_name:rwfis.data[0].road_name,
        road_code:rwfis.data[0].road_code,
        total_length_km:rwfis.data[0].total_length_km,
        survey_year:rwfis.data[0].survey_year,
        survey_date:rwfis.data[0].survey_date,
        direction:rwfis.data[0].direction,
        chainage_start:rwfis.data[0].chainage_start,
        chainage_end:rwfis.data[0].chainage_end,
        chainage:rwfis.data[0].chainage,
        cross_section_location:rwfis.data[0].cross_section_location,
        offset_from_center_line:rwfis.data[0].offset_from_center_line,
        feature_type:rwfis.data[0].feature_type,
        material_type:rwfis.data[0].material_type,
        feature_condition:rwfis.data[0].feature_condition,
        safety_hazard:rwfis.data[0].safety_hazard,
        land_use:rwfis.data[0].land_use,
        terrain:rwfis.data[0].terrain,
        latitude:rwfis.data[0].latitude,
        longitude:rwfis.data[0].longitude,
        altitude:rwfis.data[0].altitude,
        remarks:rwfis.data[0].remarks,
      })
      if(rwfis.data[0].state_id){
        this.getDistrctList(rwfis.data[0].state_id)
      }
      if(rwfis.data[0].district_id){
        this.getCitytList(rwfis.data[0].district_id)
      }
    }
  

     onSubmit(): void {
        if (this.rwfisForm.invalid)
        {
          this.rwfisForm.markAllAsTouched();
          return;
        }
        else{
        let rwfisObj:EditRWFIS ={ 
        state_id: this.rwfisForm.get('state_id')?.value,
        district_id: this.rwfisForm.get('district_id')?.value,
        city_id: this.rwfisForm.get('city_id')?.value,
        road_name: this.rwfisForm.get('road_name')?.value,
        road_code: this.rwfisForm.get('road_code')?.value,
        total_length_km: this.rwfisForm.get('total_length_km')?.value,
        survey_year: this.rwfisForm.get('survey_year')?.value,
        survey_date: this.rwfisForm.get('survey_date')?.value,
        direction: this.rwfisForm.get('direction')?.value,
        chainage_start: this.rwfisForm.get('chainage_start')?.value,
        chainage_end: this.rwfisForm.get('chainage_end')?.value,
        chainage: this.rwfisForm.get('chainage')?.value,
        cross_section_location: this.rwfisForm.get('cross_section_location')?.value,
        offset_from_center_line: this.rwfisForm.get('offset_from_center_line')?.value,
        feature_type: this.rwfisForm.get('feature_type')?.value,
        material_type: this.rwfisForm.get('material_type')?.value,
        feature_condition: this.rwfisForm.get('feature_condition')?.value,
        safety_hazard: this.rwfisForm.get('safety_hazard')?.value,
        land_use: this.rwfisForm.get('land_use')?.value,
        terrain: this.rwfisForm.get('terrain')?.value,
        latitude: this.rwfisForm.get('latitude')?.value,
        longitude: this.rwfisForm.get('longitude')?.value,
        altitude: this.rwfisForm.get('altitude')?.value,
        remarks: this.rwfisForm.get('remarks')?.value,
        }
        // console.log("data for api",bridgeObj)
        this.rwfisService.updateRwfis(rwfisObj,this.rwfis_id).subscribe((res)=>{
          // console.log(res)
          if(res.status){
            this.loadRwfisDetails(this.rwfis_id);
            this.toastr.success(res.msg, 'NHAI RAMS', {
                  timeOut: 3000,
                  positionClass: 'toast-top-right',
                });
                this.rwfisForm.reset();
          }
          else {
              this.toastr.error(res.msg, 'NHAI RAMS', {
                timeOut: 3000,
                positionClass: 'toast-top-right',
              });
            }
        },
        (err)=>{
          console.log(err)
          this.toastr.error(err.msg, 'NHAI RAMS', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
        });
        }
      }
}
