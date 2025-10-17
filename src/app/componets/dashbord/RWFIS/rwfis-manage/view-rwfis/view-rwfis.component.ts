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

@Component({
  selector: 'app-view-rwfis',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './view-rwfis.component.html',
  styleUrl: './view-rwfis.component.scss'
})
export class ViewRwfisComponent {

  rwfisForm!: FormGroup;
  prismCode = prismCodeData;
  stateList:any;
  districtList:any;
  cityList:any;
  roadList:any;
  state_id:any;
  rwfis_id:any;
  topTitle:any;
  
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
      state_id:[''],
      district_id:[''],
      city_id:[''],// block
      road_name:[''],
      road_code:[''],
      total_length_km :[''],
      survey_year:[''],
      survey_date:[''],
      direction:[''],
      chainage_start:[''],
      chainage_end:[''],
      chainage:[''],
      cross_section_location:[''],
      offset_from_center_line:[''],
      feature_type:[''],
      material_type:[''],
      feature_condition:[''],
      safety_hazard:[''],
      land_use: [''],
      terrain:  [''],
      latitude: [''],
      longitude:[''],
      altitude: [''],
      remarks:  [''],

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
   
  }
}
