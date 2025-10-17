import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { TrafficManageService } from '../traffic-manage.service'; 
import { Traffic} from '../traffic'
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../../shared/common/custom-validators'; 
import { Router } from '@angular/router'

@Component({
  selector: 'app-add-traffic',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './add-traffic.component.html',
  styleUrl: './add-traffic.component.scss'
})
export class AddTrafficComponent {
  trafficForm!: FormGroup;
  prismCode = prismCodeData;
  stateList:any;
  districtList:any;
  cityList:any;
  roadList:any;
  years: number[] = [];
  state_id:any;

  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private trafficService:TrafficManageService,
    private router: Router,
    ) {
    
  }

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
      for (let i = currentYear; i >= 2000; i--) {
        this.years.push(i);
      }
    this.trafficForm = this.fb.group({
      data_collection_year: ['', [Validators.required]],
      state_id :['',[Validators.required]],
      district_id :['',[Validators.required]],
      city_id :['',[Validators.required]],
      road_code :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      road_name :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      direction :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      total_length_km :['',[Validators.required,CustomValidators.numberValidator()]],
      
    })
    this.getDropDownData();
  }
  getDropDownData(){
    this.getStateList();
    this.getRoadList();
  }

  getRoadList(){
    this.trafficService.getRoadList().subscribe((res)=>{
      this.roadList = res.data;
    })
  }
  getStateList(){
    this.trafficService.getStateList().subscribe((res)=>{
      this.stateList = res.data;
    })
  }
  getDistrctList(id:any){
    this.state_id=id;
    this.trafficService.getDistrctList(id).subscribe((res) =>{
      this.districtList = res.data;
    })
  }

  getCitytList(id:any){
    this.trafficService.getCitytList(id).subscribe((res) =>{
      // console.log(res)
      this.cityList = res.data;

    })

  }

   onSubmit(): void {
    if (this.trafficForm.invalid)
    {
      this.trafficForm.markAllAsTouched();
      return;
    }
    else{
      // const yearOfConstruction = this.trafficForm.get('year_of_construction')?.value;
      
    let trafficObj:Traffic ={ 
   
      data_collection_year: this.trafficForm.get('data_collection_year')?.value,
      state_id: this.trafficForm.get('state_id')?.value,
      district_id: this.trafficForm.get('district_id')?.value,
      city_id: this.trafficForm.get('city_id')?.value,
      road_code: this.trafficForm.get('road_code')?.value,
      road_name: this.trafficForm.get('road_name')?.value,
      direction: this.trafficForm.get('direction')?.value,
      total_length_km: this.trafficForm.get('total_length_km')?.value,
    }

      // console.log(trafficObj);
    this.trafficService.addTraffic(trafficObj).subscribe((res)=>{
      if(res.status){
        this.router.navigate(['/tis/traffic-manage/edit-traffic',res.traffic_info_id]);
        this.toastr.success(res.msg, 'RAMS', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
            this.trafficForm.reset();
      }
      else {
          this.toastr.error(res.msg, 'RAMS', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
        }
    },
    (err)=>{
      this.toastr.error(err.msg, 'RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
    });
    }
      
  }

}
