import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { BridgeService } from '../bridge.service';
import { Bridge } from '../bridge';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../../shared/common/custom-validators'; 
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view-bridge',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './view-bridge.component.html',
  styleUrl: './view-bridge.component.scss'
})
export class ViewBridgeComponent {
  bridgeForm!: FormGroup;
  prismCode = prismCodeData;
  stateList:any;
  selectedCompanies: any=[];
  bridgeId:any;

  constructor( private route: ActivatedRoute,private fb: FormBuilder,private modalService: NgbModal,private toastr: ToastrService,private bridgeService:BridgeService) {
    
  }

  ngOnInit(): void {

    this.bridgeForm = this.fb.group({
      bridgeName: [''],
      bridgeNo: [''],
      state : [''],
      zone: [''],
      roadType: [''],
      highwayNo: [''],
      chainage: [''],
      directionOfInventory: [''],
      latitude: [''],
      longitude: [''],
      consultantName: [''],
      administration_name_of_bridge: [''],
      custodian: [''],
      engineerDesignation: [''],
      contactDetails: [''],
      emailID: [''], 
      departmentalChainage: [''],
      departmentalBridgeNo: [''],
      noOfSpan: [''],
      // spanArrangement: [''],
      spanArrangement: this.fb.array([]),
      lengthOfBridge: [''],
      widthOfBridge: [''],
      trafficLaneOnBridge: [''],
      typeOfBridge: [''],
      ageOfBridge: [''],
      structureOfBridge: [''],
      // materialOfConstruction: [''],
      loadingAsPerIRC: [''],
      bridgeCrossingFeature: [''],
      ratingOfDeckGeometry: [''],
      ratingOfWaterwayAdequacy: [''],
      ratingofAverageDailyTraffic: [''],
      ratingForSocialImportance: [''],
      ratingforEconomicGrowthPotential: [''],
      ratingAlternateRoute: [''],
      ratingEnvironmentalImpact: [''],
      year_of_construction: [''],
      height_of_bridge: [''],
      soffit_level_of_bridge: [''],
      material_foundation: [''],
      material_substructure: [''],
      material_superstructure: [''],
      ground_level: [''],
      design_discharge: [''],
      design_hfl: [''],
      lowest_water_level: [''],
      scour_level_at_pier: [''],
      scour_level_at_abutment: [''],
      scour_level_of_superstructure: [''],
      highway_width: [''],
      highway_carriageway_width: [''],
      highway_shoulder_width_appr: [''],
      highway_footpath_width: [''],
      highway_footpath_width_value: [''],
      highway_median_width: [''],
      highway_median_width_value: [''],
      width_of_approach: [''],
      safety_kerb_width: [''],
      bridge_in_skew: [''],
      bridge_skew_angle: [''],
      approaches_structure: [''],
      approaches_no_of_structure: [''],
      type_of_wall: ['']
    });

     // Get bridge ID from route parameters
     this.route.paramMap.subscribe(params => {
      this.bridgeId = Number(params.get('id'));
      if (this.bridgeId) {
        this.loadBridgeDetails(this.bridgeId);
      }
    });
    //  this.bridgeForm.get('noOfSpan')?.valueChanges.subscribe(() => {
    //   this.onNoOfSpanChange();
    //  });
    this.bridgeForm.get('noOfSpan')?.valueChanges.subscribe((newSpanCount) => {
      this.updateSpanArrangement(newSpanCount);
    });
    

  }


  get spanArrangement(): FormArray<FormControl> {
    return this.bridgeForm.get('spanArrangement') as FormArray<FormControl>;
  }

  // Dynamically adjust the spanArrangement FormArray
  updateSpanArrangement(spanCount: number) {
    const currentCount = this.spanArrangement.length;

    if (spanCount > currentCount) {
      // Add new controls if spanCount is greater than current count
      for (let i = currentCount; i < spanCount; i++) {
        this.spanArrangement.push(
          this.fb.control('')
        );
      }
    } else if (spanCount < currentCount) {
      // Remove extra controls if spanCount is less than current count
      for (let i = currentCount - 1; i >= spanCount; i--) {
        this.spanArrangement.removeAt(i);
      }
    }
  }

  // Adjust the spanArrangement with existing data
  adjustSpanArrangement(spans: any[]) {
    this.spanArrangement.clear(); // Clear existing controls

    spans.forEach((span) => {
      this.spanArrangement.push(
        this.fb.control(span.span_arrangement)
      );
    });
  }

  loadBridgeDetails(id: number): void {
    this.bridgeService.getDetailsById(id).subscribe((bridge: Bridge) => {
      // console.log(bridge);
      if (bridge) {
        this.patchValue(bridge);
      }
    },(err)=>{
      this.toastr.error(err.msg, 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
    });
    
  }

  patchValue(bridge:any){
  
    this.bridgeForm.patchValue({
    bridgeName: bridge.data.popular_name_of_bridge,
    bridgeNo: bridge.data.bridge_no,
    state: bridge.data.state_name,
    zone: bridge.data.zone,
    roadType: bridge.data.road_type,
    highwayNo: bridge.data.highway_no,
    chainage: bridge.data.chainage,
    directionOfInventory: bridge.data.direction_of_inventory,
    latitude: bridge.data.latitude,
    longitude: bridge.data.longitude,
    consultantName: bridge.data.consultant_name,
    administration_name_of_bridge: bridge.data.administration_name_of_bridge,
    custodian: bridge.data.custodian,
    engineerDesignation: bridge.data.engineer_designation,
    contactDetails: bridge.data.contact_details,
    emailID: bridge.data.email_id,
    departmentalChainage: bridge.data.departmental_chainage,
    departmentalBridgeNo: bridge.data.departmental_bridge_number,
    noOfSpan: bridge.data.total_no_of_span,
    lengthOfBridge: bridge.data.length_of_bridge,
    widthOfBridge: bridge.data.width_of_bridge,
    trafficLaneOnBridge: bridge.data.traffic_lane_on_bridge,
    typeOfBridge: bridge.data.type_of_bridge,
    ageOfBridge: bridge.data.age_of_bridge,
    structureOfBridge: bridge.data.structural_form,
    // materialOfConstruction: bridge.data.material_of_construction,
    loadingAsPerIRC: bridge.data.loading_as_per_IRC,
    bridgeCrossingFeature: bridge.data.bridge_crossing_feature,
    ratingOfDeckGeometry: bridge.data.rating_of_desk_geometry,
    ratingOfWaterwayAdequacy: bridge.data.rating_of_waterway_adequacy,
    ratingofAverageDailyTraffic: bridge.data.rating_of_average_daily_traffic,
    ratingForSocialImportance: bridge.data.social_importance_description,
    ratingforEconomicGrowthPotential: bridge.data.economic_growth_potential_description,
    ratingAlternateRoute: bridge.data.alternate_route_description,
    ratingEnvironmentalImpact: bridge.data.environmental_impact_description,
    year_of_construction: bridge.data.year_of_construction,
    height_of_bridge: bridge.data.height_of_bridge,
    soffit_level_of_bridge: bridge.data.soffit_level_of_bridge,
    material_foundation: bridge.data.material_foundation,
    material_substructure: bridge.data.material_substructure,
    material_superstructure: bridge.data.material_superstructure,
    ground_level: bridge.data.ground_level,
    design_discharge: bridge.data.design_discharge,
    design_hfl: bridge.data.design_hfl,
    lowest_water_level: bridge.data.lowest_water_level,
    scour_level_at_pier: bridge.data.scour_level_at_pier,
    scour_level_at_abutment: bridge.data.scour_level_at_abutment,
    scour_level_of_superstructure: bridge.data.scour_level_of_superstructure,
    highway_width: bridge.data.highway_width,
    highway_carriageway_width: bridge.data.highway_carriageway_width,
    highway_shoulder_width_appr: bridge.data.highway_shoulder_width_appr,
    highway_footpath_width: bridge.data.highway_footpath_width === "0" ? "No" : "Yes",
    highway_footpath_width_value: bridge.data.highway_footpath_width,
    highway_median_width: bridge.data.highway_median_width === "0" ? "No" : "Yes",
    highway_median_width_value: bridge.data.highway_median_width,
    width_of_approach: bridge.data.width_of_approach,
    safety_kerb_width: bridge.data.safety_kerb_width,
    bridge_in_skew: bridge.data.bridge_in_skew,
    bridge_skew_angle: bridge.data.bridge_skew_angle,
    approaches_structure: bridge.data.approaches_structure,
    approaches_no_of_structure: bridge.data.approaches_no_of_structure,
    type_of_wall: bridge.data.type_of_wall 
    });

    if (bridge.data.span_arrangements) {
      this.adjustSpanArrangement(bridge.data.span_arrangements);
    }
    // this.adjustSpanArrangement(bridge.data.total_no_of_span);
  }

  
  

}
