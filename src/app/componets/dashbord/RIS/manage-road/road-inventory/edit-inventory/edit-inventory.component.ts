import { Component } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../../../shared/common/custom-validators'; 
import { Router } from '@angular/router';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RoadService } from '../../road.service';
import { Inventory, InventoryEdit } from '../inventory';
import { ApiUrl } from '../../../../../../shared/const';


@Component({
  selector: 'app-edit-inventory',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './edit-inventory.component.html',
  styleUrl: './edit-inventory.component.scss'
})
export class EditInventoryComponent {

  
  inventoryForm!: FormGroup;
  prismCode = prismCodeData;
  // roadId:any;
  stateList:any;
  districtList:any;
  cityList:any;
  roadData:any;
  roadName:any;
  inventoryId:any;
  inventoryData:any;
  urlLive = ApiUrl.API_URL_fOR_iMAGE;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private roadService:RoadService,
    private router: Router,
    ) {
      // this.inventoryForm = this.fb.group({
      //   inspectionItems: this.fb.array([]) // Create an empty FormArray
      // });

      
  }

  ngOnInit(): void {
  
    this.inventoryForm = this.fb.group({
      state_id: ['', Validators.required],
      district_id: ['', Validators.required],
      city_id: ['', Validators.required],
      village: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      chainage_start: ['',[Validators.required, CustomValidators.numberValidator()]],
      chainage_end: ['',[Validators.required, CustomValidators.numberValidator()]],
      terrain: ['', Validators.required],
      land_use_left: ['', Validators.required],
      land_use_right: ['', Validators.required],
      chainagewise_village: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      roadway_width: ['',[Validators.required, CustomValidators.numberValidator()]],
      formation_width: ['',[Validators.required, CustomValidators.numberValidator()]],
      carriageway_type: ['', Validators.required],
      carriageway_width: ['',[Validators.required, CustomValidators.numberValidator()]],
      shoulder_left_type: ['', Validators.required],
      shoulder_right_type: ['', Validators.required],
      shoulder_left_width: ['',[Validators.required, CustomValidators.numberValidator()]],
      shoulder_right_width: ['',[Validators.required, CustomValidators.numberValidator()]],
      submergence: ['',[Validators.required]],
      embankment_height: ['',[Validators.required, CustomValidators.numberValidator()]], 

      drainage_left: ['',[Validators.required]],
      drainage_right: ['',[Validators.required]],

      avenue_plantation_left: [0,[Validators.required]],
      avenue_plantation_right:[0,[Validators.required]],

      median_plants: ['',[Validators.required]],
      median_plants_value: [0,[Validators.required]],

      sign_board_left: [0,[Validators.required]],
      sign_board_right: [0,[Validators.required]],
      sign_board_middle:[0,[Validators.required]],

      culverts_left: [0,[Validators.required]],
      culverts_right: [0,[Validators.required]],

      street_lights_left: [0,[Validators.required]],
      street_lights_middle: [0,[Validators.required]],
      street_lights_right: [0,[Validators.required]],

      junctions: [0,[Validators.required]],
      kilometer_stone_left: [0,[Validators.required]],
      kilometer_stone_middle: [0,[Validators.required]],
      kilometer_stone_right: [0,[Validators.required]],

      bus_top_left: [0,[Validators.required]],
      bus_top_right: [0,[Validators.required]],

      truck_lay_bayes_left:[0,[Validators.required]],
      truck_lay_bayes_right:[0,[Validators.required]],

      toll_plaza: ['',[Validators.required]],

      service_road_left: [0,[Validators.required]],
      service_road_right: [0,[Validators.required]],
      adjacent_roads_left: [0,[Validators.required]],
      adjacent_roads_right: [0,[Validators.required]],
      
      toilet_blocks_left: [0,[Validators.required]],
      toilet_blocks_right: [0,[Validators.required]],

      solar_blinkers: ['',[Validators.required]],
      solar_blinkers_value: [0,[Validators.required]],

      rest_area_left: [0,[Validators.required]],
      rest_area_right: [0,[Validators.required]],
      row_fencing_left: [0,[Validators.required]],
      row_fencing_middle: [0,[Validators.required]],
      row_fencing_right: [0,[Validators.required]],
      fuel_station_left: [0,[Validators.required]],
      fuel_station_right: [0,[Validators.required]],
      emergency_call_box_left: [0,[Validators.required]],
      emergency_call_box_right: [0,[Validators.required]],
      footpath_left: ['',[Validators.required]],
      footpath_right:['',[Validators.required]],

      divider_break: ['',[Validators.required]],
      divider_break_value: [0,[Validators.required]],
      remarks: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]]
    });
    this.route.paramMap.subscribe(params => {
      this.inventoryId = Number(params.get('id'));
      // console.log("bridge id in add",this.inspectionId)
      if (this.inventoryId) {
        this.loadBridgeDetails(this.inventoryId);
      }
    });

    this.getStateList();
  }

  getStateList(){
    this.roadService.getStateList().subscribe((res)=>{
      this.stateList = res.data;
    })
  }
  getDistrctList(id:any){
    this.roadService.getDistrctList(id).subscribe((res) =>{
      this.districtList = res.data;
    })
  }

  getCitytList(id:any){
    this.roadService.getCitytList(id).subscribe((res) =>{
      this.cityList = res.data;
    })
  }

  onSubmit(): void {
    // const formData: Suggestion = this.inventoryForm.value;
    console.log('Form submitted:',this.inventoryForm);
    if (this.inventoryForm.invalid)
    {
      this.inventoryForm.markAllAsTouched();
      return;
    }

    else{
      let inventoryObj: InventoryEdit={ 
        state_id: this.inventoryForm.get('state_id')?.value,
        district_id: this.inventoryForm.get('district_id')?.value,
        city_id: this.inventoryForm.get('city_id')?.value,
        village: this.inventoryForm.get('village')?.value,
        chainage_start: this.inventoryForm.get('chainage_start')?.value,
        chainage_end: this.inventoryForm.get('chainage_end')?.value,
        terrain: this.inventoryForm.get('terrain')?.value,
        land_use_left: this.inventoryForm.get('land_use_left')?.value,
        land_use_right: this.inventoryForm.get('land_use_right')?.value,
        chainagewise_village: this.inventoryForm.get('chainagewise_village')?.value,
        roadway_width: this.inventoryForm.get('roadway_width')?.value,
        formation_width: this.inventoryForm.get('formation_width')?.value,
        carriageway_type: this.inventoryForm.get('carriageway_type')?.value,
        carriageway_width: this.inventoryForm.get('carriageway_width')?.value,
        shoulder_left_type: this.inventoryForm.get('shoulder_left_type')?.value,
        shoulder_right_type: this.inventoryForm.get('shoulder_right_type')?.value,
        shoulder_left_width: this.inventoryForm.get('shoulder_left_width')?.value,
        shoulder_right_width: this.inventoryForm.get('shoulder_right_width')?.value,
        submergence: this.inventoryForm.get('submergence')?.value,
        embankment_height: this.inventoryForm.get('embankment_height')?.value,
        
        drainage_left: this.inventoryForm.get('drainage_left')?.value,
        drainage_right: this.inventoryForm.get('drainage_right')?.value,

        avenue_plantation_left: this.inventoryForm.get('avenue_plantation_left')?.value,
        avenue_plantation_right: this.inventoryForm.get('avenue_plantation_right')?.value,

        median_plants: this.inventoryForm.get('median_plants')?.value,
        median_plants_value: this.inventoryForm.get('median_plants_value')?.value,

        sign_board_left: this.inventoryForm.get('sign_board_left')?.value,
        sign_board_right: this.inventoryForm.get('sign_board_right')?.value,
        sign_board_middle:this.inventoryForm.get('sign_board_middle')?.value,

        culverts_left: this.inventoryForm.get('culverts_left')?.value,
        culverts_right: this.inventoryForm.get('culverts_right')?.value,

        street_lights_left: this.inventoryForm.get('street_lights_left')?.value,
        street_lights_middle: this.inventoryForm.get('street_lights_middle')?.value,
        street_lights_right: this.inventoryForm.get('street_lights_right')?.value,

        junctions: this.inventoryForm.get('junctions')?.value,
        kilometer_stone_left: this.inventoryForm.get('kilometer_stone_left')?.value,
        kilometer_stone_middle: this.inventoryForm.get('kilometer_stone_middle')?.value,
        kilometer_stone_right: this.inventoryForm.get('kilometer_stone_right')?.value,

        bus_top_left: this.inventoryForm.get('bus_top_left')?.value,
        bus_top_right: this.inventoryForm.get('bus_top_right')?.value,

        truck_lay_bayes_left:this.inventoryForm.get('truck_lay_bayes_left')?.value,
        truck_lay_bayes_right:this.inventoryForm.get('truck_lay_bayes_right')?.value,

        toll_plaza: this.inventoryForm.get('toll_plaza')?.value,

        service_road_left: this.inventoryForm.get('service_road_left')?.value,
        service_road_right: this.inventoryForm.get('service_road_right')?.value,
        adjacent_roads_left: this.inventoryForm.get('adjacent_roads_left')?.value,
        adjacent_roads_right: this.inventoryForm.get('adjacent_roads_right')?.value,
        
        toilet_blocks_left: this.inventoryForm.get('toilet_blocks_left')?.value,
        toilet_blocks_right: this.inventoryForm.get('toilet_blocks_right')?.value,

        solar_blinkers: this.inventoryForm.get('solar_blinkers')?.value,
        solar_blinkers_value: this.inventoryForm.get('solar_blinkers_value')?.value,

        rest_area_left: this.inventoryForm.get('rest_area_left')?.value,
        rest_area_right: this.inventoryForm.get('rest_area_right')?.value,
        row_fencing_left: this.inventoryForm.get('row_fencing_left')?.value,
        row_fencing_middle: this.inventoryForm.get('row_fencing_middle')?.value,
        row_fencing_right: this.inventoryForm.get('row_fencing_right')?.value,
        fuel_station_left: this.inventoryForm.get('fuel_station_left')?.value,
        fuel_station_right: this.inventoryForm.get('fuel_station_right')?.value,
        emergency_call_box_left: this.inventoryForm.get('emergency_call_box_left')?.value,
        emergency_call_box_right: this.inventoryForm.get('emergency_call_box_right')?.value,
        footpath_left: this.inventoryForm.get('footpath_left')?.value,
        footpath_right:this.inventoryForm.get('footpath_right')?.value,

        divider_break: this.inventoryForm.get('divider_break')?.value,
        divider_break_value: this.inventoryForm.get('divider_break_value')?.value,
        remarks: this.inventoryForm.get('remarks')?.value 
      } 

      // console.log("inspection form details",formData);

      this.roadService.updateInventory(inventoryObj,this.inventoryId).subscribe((res)=>{
        console.log(res);
        if(res.status){
          this.loadBridgeDetails(this.inventoryId);
          this.toastr.success(res.msg, 'NHAI RAMS', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
              // this.bridgeForm.reset();
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

  loadBridgeDetails(id: number): void {
    this.roadService.getInventoryById(id).subscribe((inventory: any) => {
      console.log("get inventory details",inventory);
      if (inventory) {
        this.inventoryData = inventory.data[0];
        this.patchValue(inventory);
      }
    },(err)=>{
      this.toastr.error(err.msg, 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
    });
    
  }

  patchValue(inventory:any){
    this.inventoryForm.patchValue({
      state_id: inventory.data[0].state_id,
      district_id: inventory.data[0].district_id,
      city_id: inventory.data[0].city_id,
      village: inventory.data[0].village,
      chainage_start: inventory.data[0].chainage_start,
      chainage_end: inventory.data[0].chainage_end,
      terrain: inventory.data[0].terrain,
      land_use_left: inventory.data[0].land_use_left,
      land_use_right: inventory.data[0].land_use_right,
      chainagewise_village: inventory.data[0].chainagewise_village,
      roadway_width: inventory.data[0].roadway_width,
      formation_width: inventory.data[0].formation_width,
      carriageway_type: inventory.data[0].carriageway_type,
      carriageway_width: inventory.data[0].carriageway_width,
      shoulder_left_type: inventory.data[0].shoulder_left_type,
      shoulder_right_type: inventory.data[0].shoulder_right_type,
      shoulder_left_width: inventory.data[0].shoulder_left_width,
      shoulder_right_width: inventory.data[0].shoulder_right_width,
      submergence: inventory.data[0].submergence,
      embankment_height: inventory.data[0].embankment_height, 

      drainage_left: inventory.data[0].drainage_left,
      drainage_right: inventory.data[0].drainage_right,

      avenue_plantation_left: inventory.data[0].avenue_plantation_left,
      avenue_plantation_right:inventory.data[0].avenue_plantation_right,

      median_plants: inventory.data[0].median_plants === "0" ? "No" : "Yes",
      median_plants_value: inventory.data[0].median_plants,

      sign_board_left: inventory.data[0].sign_board_left,
      sign_board_right: inventory.data[0].sign_board_right,
      sign_board_middle:inventory.data[0].sign_board_middle,

      culverts_left: inventory.data[0].culverts_left,
      culverts_right: inventory.data[0].culverts_right,

      street_lights_left: inventory.data[0].street_lights_left,
      street_lights_middle: inventory.data[0].street_lights_middle,
      street_lights_right: inventory.data[0].street_lights_right,

      junctions: inventory.data[0].junctions,
      kilometer_stone_left: inventory.data[0].kilometer_stone_left,
      kilometer_stone_middle: inventory.data[0].kilometer_stone_middle,
      kilometer_stone_right: inventory.data[0].kilometer_stone_right,

      bus_top_left: inventory.data[0].bus_top_left,
      bus_top_right: inventory.data[0].bus_top_right,

      truck_lay_bayes_left:inventory.data[0].truck_lay_bayes_left,
      truck_lay_bayes_right:inventory.data[0].truck_lay_bayes_right,

      toll_plaza: inventory.data[0].toll_plaza,

      service_road_left: inventory.data[0].service_road_left,
      service_road_right: inventory.data[0].service_road_right,
      adjacent_roads_left: inventory.data[0].adjacent_roads_left,
      adjacent_roads_right: inventory.data[0].adjacent_roads_right,
      
      toilet_blocks_left: inventory.data[0].toilet_blocks_left,
      toilet_blocks_right: inventory.data[0].toilet_blocks_right,

      solar_blinkers: inventory.data[0].solar_blinkers === "0" ? "No" : "Yes",
      solar_blinkers_value: inventory.data[0].solar_blinkers,

      rest_area_left: inventory.data[0].rest_area_left,
      rest_area_right: inventory.data[0].rest_area_right,
      row_fencing_left: inventory.data[0].row_fencing_left,
      row_fencing_middle: inventory.data[0].row_fencing_middle,
      row_fencing_right: inventory.data[0].row_fencing_right,
      fuel_station_left: inventory.data[0].fuel_station_left,
      fuel_station_right: inventory.data[0].fuel_station_right,
      emergency_call_box_left: inventory.data[0].emergency_call_box_left,
      emergency_call_box_right: inventory.data[0].emergency_call_box_right,
      footpath_left: inventory.data[0].footpath_left,
      footpath_right:inventory.data[0].footpath_right,

      divider_break: inventory.data[0].divider_break === "0" ? "No" : "Yes",
      divider_break_value: inventory.data[0].divider_break,
      remarks: inventory.data[0].remarks
      
    });

    this.getDistrctList(inventory.data[0].state_id)
  
    this.getCitytList(inventory.data[0].district_id);
  }

  onFileChange(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
  
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('table_name','road_inventory_data');
      formData.append('record_id',this.inventoryId);
      formData.append('field_name',controlName);
      formData.append('image',file);
      formData.append('record_id_name','road_inventory_id');
      

      this.roadService.addParticularImage(formData).subscribe((res)=>{
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
    formData.append('table_name','road_inventory_data');
    formData.append('record_id',this.inventoryId);
    formData.append('field_name',filedName);
    formData.append('record_id_name','road_inventory_id');
   
    this.roadService.deleteInspectionImage(formData).subscribe((res)=>{
      // console.log(res);
      if(res.status){
        this.ngOnInit()
      }
    })
  }

  downloadImage(fieldName: string): void {
    const imageUrl = `${this.urlLive}/upload/inspection_images/${this.inventoryData[fieldName]}`;    
    const anchor = document.createElement('a');
    anchor.href = imageUrl;
    anchor.download = ''; // Let the browser decide the file name
    anchor.target = '_blank'; // Optional: Open in a new tab if needed

    anchor.click();

    anchor.remove();
}
}
