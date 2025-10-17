import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { TrafficManageService } from '../traffic-manage.service'; 
import { Traffic, TrafficEdit} from '../traffic'
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../../shared/common/custom-validators'; 
import { ActivatedRoute, Router } from '@angular/router'

@Component({
  selector: 'app-edit-traffic',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './edit-traffic.component.html',
  styleUrl: './edit-traffic.component.scss'
})
export class EditTrafficComponent {

  trafficForm!: FormGroup;
  prismCode = prismCodeData;
  stateList:any;
  districtList:any;
  cityList:any;
  roadList:any;
  years: number[] = [];
  trafficId:any;
  topTitle:any;

  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private trafficService:TrafficManageService,
    private router: Router,
    private route: ActivatedRoute,
    ) {
    
  }

  ngOnInit(): void {
     // Get bridge ID from route parameters
     this.route.paramMap.subscribe(params => {
      this.trafficId = Number(params.get('id'));
      if (this.trafficId) {
        this.loadTrafficDetails(this.trafficId);
      }
    });
    
    const currentYear = new Date().getFullYear();
      for (let i = currentYear; i >= 2000; i--) {
        this.years.push(i);
      }
    this.trafficForm = this.fb.group({
      data_collection_year: ['', [Validators.required]],
      state_id :['',[Validators.required]],
      district_id :['',[Validators.required]],
      city_id :['',[Validators.required]],
      road_code :['',[Validators.required,,CustomValidators.noWhitespaceValidator()]],
      road_name :['',[Validators.required,,CustomValidators.noWhitespaceValidator()]],
      direction :['',[Validators.required,,CustomValidators.noWhitespaceValidator()]],
      total_length_km :['',[Validators.required,,CustomValidators.numberValidator()]],

      chainage_start :['',[Validators.required,,CustomValidators.numberValidator()]],
      chainage_end :['',[Validators.required,,CustomValidators.numberValidator()]],

      scooter_motor_cycle :['',[Validators.required,,CustomValidators.numberValidator()]],
      three_wheeler_auto :['',[Validators.required,,CustomValidators.numberValidator()]],
      car_jeep_van_taxi :['',[Validators.required,,CustomValidators.numberValidator()]],
      mini_bus :['',[Validators.required,,CustomValidators.numberValidator()]],
      standard_bus :['',[Validators.required,,CustomValidators.numberValidator()]],

      tempo :['',[Validators.required,,CustomValidators.numberValidator()]],
      lcv :['',[Validators.required,,CustomValidators.numberValidator()]],
      two_axle_trucks :['',[Validators.required,,CustomValidators.numberValidator()]],
      three_axle_trucks :['',[Validators.required,,CustomValidators.numberValidator()]],
      multi_axle_truck :['',[Validators.required,,CustomValidators.numberValidator()]],
      tractor_without_trailer :['',[Validators.required,,CustomValidators.numberValidator()]],
      tractor_with_trailer :['',[Validators.required,,CustomValidators.numberValidator()]],

      cycle :['',[Validators.required,,CustomValidators.numberValidator()]],
      cycle_rickshaw :['',[Validators.required,,CustomValidators.numberValidator()]],
      animal_drawn_vehicle :['',[Validators.required,,CustomValidators.numberValidator()]],
      other_non_motorized_traffic :['',[Validators.required]],
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
      
    let trafficObj:TrafficEdit ={ 
   
      data_collection_year: this.trafficForm.get('data_collection_year')?.value,
      state_id: this.trafficForm.get('state_id')?.value,
      district_id: this.trafficForm.get('district_id')?.value,
      city_id: this.trafficForm.get('city_id')?.value,
      road_code: this.trafficForm.get('road_code')?.value,
      road_name: this.trafficForm.get('road_name')?.value,
      direction: this.trafficForm.get('direction')?.value,
      total_length_km: this.trafficForm.get('total_length_km')?.value,
      chainage_start: this.trafficForm.get('chainage_start')?.value,
      chainage_end: this.trafficForm.get('chainage_end')?.value,
      scooter_motor_cycle: this.trafficForm.get('scooter_motor_cycle')?.value,
      three_wheeler_auto: this.trafficForm.get('three_wheeler_auto')?.value,
      car_jeep_van_taxi: this.trafficForm.get('car_jeep_van_taxi')?.value,
      mini_bus: this.trafficForm.get('mini_bus')?.value,
      standard_bus: this.trafficForm.get('standard_bus')?.value,
      tempo: this.trafficForm.get('tempo')?.value,
      lcv: this.trafficForm.get('lcv')?.value,
      two_axle_trucks: this.trafficForm.get('two_axle_trucks')?.value,
      three_axle_trucks: this.trafficForm.get('three_axle_trucks')?.value,
      multi_axle_truck: this.trafficForm.get('multi_axle_truck')?.value,
      tractor_without_trailer: this.trafficForm.get('tractor_without_trailer')?.value,
      tractor_with_trailer: this.trafficForm.get('tractor_with_trailer')?.value,
      cycle: this.trafficForm.get('cycle')?.value,
      cycle_rickshaw: this.trafficForm.get('cycle_rickshaw')?.value,
      animal_drawn_vehicle: this.trafficForm.get('animal_drawn_vehicle')?.value,
      other_non_motorized_traffic: this.trafficForm.get('other_non_motorized_traffic')?.value,
    }

    // console.log(bridgeObj);
    this.trafficService.updateTraffic(trafficObj,this.trafficId).subscribe((res)=>{
      if(res.status){
        this.loadTrafficDetails(this.trafficId);
        this.toastr.success(res.msg, 'NHAI RAMS', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
            this.trafficForm.reset();
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

  loadTrafficDetails(id: number): void {
    // console.log(id)
    this.trafficService.getDetailsById(id).subscribe((res) => {
      if (res) {
         console.log("fetch result",res.data)
        this.topTitle = res.data[0].name_of_road;
         this.patchValue(res);
      }
    },(err)=>{
      this.toastr.error(err.msg, 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
    });
    
  }
  patchValue(traffic:any){
    console.log(traffic)
    this.trafficForm.patchValue({
      data_collection_year: traffic.data[0].data_collection_year,
      state_id :traffic.data[0].state_id,
      district_id :traffic.data[0].district_id,
      city_id : traffic.data[0].city_id,
      road_code :traffic.data[0].road_code,
      road_name :traffic.data[0].road_name,
      direction :traffic.data[0].direction,
      total_length_km :traffic.data[0].total_length_km,

      chainage_start :traffic.data[0].chainage_start,
      chainage_end :traffic.data[0].chainage_end,

      scooter_motor_cycle :traffic.data[0].scooter_motor_cycle,
      three_wheeler_auto :traffic.data[0].three_wheeler_auto,
      car_jeep_van_taxi :traffic.data[0].car_jeep_van_taxi,
      mini_bus :traffic.data[0].mini_bus,
      standard_bus :traffic.data[0].standard_bus,

      tempo :traffic.data[0].tempo,
      lcv :traffic.data[0].lcv,
      two_axle_trucks :traffic.data[0].two_axle_trucks,
      three_axle_trucks :traffic.data[0].three_axle_trucks,
      multi_axle_truck :traffic.data[0].multi_axle_truck,
      tractor_without_trailer :traffic.data[0].tractor_without_trailer,
      tractor_with_trailer :traffic.data[0].tractor_with_trailer,

      cycle :traffic.data[0].cycle,
      cycle_rickshaw :traffic.data[0].cycle_rickshaw,
      animal_drawn_vehicle :traffic.data[0].animal_drawn_vehicle,
      other_non_motorized_traffic :traffic.data[0].other_non_motorized_traffic,
    })
    if(traffic.data[0].state_id){
      this.getDistrctList(traffic.data[0].state_id)
    }
    if(traffic.data[0].district_id){
      this.getCitytList(traffic.data[0].district_id)
    }
  }

}
