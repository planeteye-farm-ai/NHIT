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
  selector: 'app-edit-bridge',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './edit-bridge.component.html',
  styleUrl: './edit-bridge.component.scss'
})
export class EditBridgeComponent {

  isFootpathWidthYes: boolean = false;
  isMedianWidthEditable: boolean = false;
  isSkewAngleEditable: boolean = false;
  isApproachesStructureEditable: boolean = false;

  bridgeForm!: FormGroup;
  prismCode = prismCodeData;
  stateList:any;
  selectedCompanies: any=[];
  bridgeId:any;
  projectList:any;

  socialImportanceDropdown:any;
  economicGrowthDropdown:any;
  alternateRrouteDropdown:any;
  environImpactDropdown:any;

  constructor( private route: ActivatedRoute,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private bridgeService:BridgeService) {

      this.projectList = [
        {project_name:"Krishnagiri Thoppur", p_id:"1",projectId:"L&T KTTL",noOfPackage:"2",structureType:"MJB",midChainage:"42+000",date:"2024-12-24"},
        {project_name:"AP04-Jadcherla Kothakota",p_id:"2",projectId:"L&T WATL",noOfPackage:"1",structureType:"MNB",midChainage:"72+000",date:"2024-12-24"},
        {project_name:"Vadodara Bharuch", p_id:"3",projectId:"L&T VBTL",noOfPackage:"3",structureType:"BC",midChainage:"112+000",date:"2024-12-24"},
        {project_name:"Panipat Elevated Corridor", p_id:"4",projectId:"L&T PECL",noOfPackage:"1",structureType:"HPC",midChainage:"114+000",date:"2024-12-24"},
        {project_name:"Ahmedabad-Viramgam-Maliya", p_id:"5", projectId:"L&T AMTL",noOfPackage:"2",structureType:"FO",midChainage:"42+000",date:"2024-12-24"},
        {project_name:"Rajkot-Jamnagar-Vadinar",p_id:"6",projectId:"L&T RVTL",noOfPackage:"2",structureType:"FOB",midChainage:"42+000",date:"2024-12-24"},
        {project_name:"Halol-Godhra-Shamlaji",p_id:"7",projectId:"L&T HSTL",noOfPackage:"1",structureType:"VUP",midChainage:"52+000",date:"2024-12-24"},
        {project_name:"Krishnagiri Walajahpet",p_id:"8",projectId:"L&T KWTL",noOfPackage:"3",structureType:"MNB",midChainage:"62+000",date:"2024-12-24"},
        {project_name:"Samakhiali Gandhidham",p_id:"9",projectId:"L&T SGTL",noOfPackage:"1",structureType:"HPC",midChainage:"49+000",date:"2024-12-24"},
        {project_name:"Devihalli Hasan",p_id:"10",projectId:"L&T DHTL",noOfPackage:"2",structureType:"VUP",midChainage:"42+000",date:"2024-12-24"},
        {project_name:"Beawar-Pali-Pindwara",p_id:"11",projectId:"L&T BPPTL",noOfPackage:"4",structureType:"BC",midChainage:"42+000",date:"2024-12-24"},
        {project_name:"Sangareddy - MH/KNT Border",p_id:"12",projectId:"L&T DTL",noOfPackage:"2",structureType:"MNB",midChainage:"114+000",date:"2024-12-24"},
        {project_name:"Sambalpur - Rourkela",p_id:"13",projectId:"L&T SRTL",noOfPackage:"4",structureType:"FOB",midChainage:"114+000",date:"2024-12-24"},
        {project_name:"Palanpur-Swaroopgan",p_id:"14",projectId:"L&T IRCL",noOfPackage:"1",structureType:"FOB",midChainage:"114+000",date:"2024-12-24"},
        {project_name:"Coimbatore Bypass",p_id:"15",projectId:"L&T TIL",noOfPackage:"3",structureType:"VUP",midChainage:"114+000",date:"2024-12-24"},
        {project_name:"Bhorkhedi - Wadner",p_id:"16",projectId:"BH-WA",noOfPackage:"-",structureType:"-",midChainage:"-",date:"2024-12-24"},
        {project_name:"Chittorgarh – Kota",p_id:"17",projectId:"CH-KO",noOfPackage:"-",structureType:"-",midChainage:"-",date:"2025-03-28"},
        {project_name:"Agra-Bypass",p_id:"18",projectId:"AG",noOfPackage:"-",structureType:"-",midChainage:"-",date:"2025-04-03"},
        {project_name:"Shivpuri to Jhansi",p_id:"19",projectId:"SHTOJH",noOfPackage:"-",structureType:"-",midChainage:"-",date:"2025-05-01"},
        
      ]
    
  }

  ngOnInit(): void {

    // Get bridge ID from route parameters
    this.route.paramMap.subscribe(params => {
      this.bridgeId = Number(params.get('id'));
      if (this.bridgeId) {
        this.loadBridgeDetails(this.bridgeId);
      }
    });
    this.bridgeForm = this.fb.group({

      bridgeName: ['', [Validators.required,CustomValidators.noWhitespaceValidator()]],
      bridgeNo: ['', [Validators.required,CustomValidators.noWhitespaceValidator()]],
      projectName: ['', Validators.required],
      projectId: [''],
      state : ['', Validators.required],
      zone: ['', [Validators.required,CustomValidators.noWhitespaceValidator()]],

      roadType: [''],
      highwayNo: [''],
      chainage: ['', [CustomValidators.numberValidator()]],
      direction_of_inventory: [''],
      latitude: [''],
      longitude: [''],
      consultantName: [''],
      administration_name_of_bridge: [''],
      custodian: [''],
      engineerDesignation: [''],
      contactDetails: [''],
      emailID: [''], 
      departmentalChainage: ['', [CustomValidators.numberValidator()]],
      departmentalBridgeNo: [''],
      noOfSpan: [''],
      // spanArrangement: ['', Validators.required],
      spanArrangement: this.fb.array([]),
      lengthOfBridge: ['', [CustomValidators.numberValidator()]],
      widthOfBridge: ['', [CustomValidators.numberValidator()]],
      trafficLaneOnBridge: [''],
      typeOfBridge: [''],
      structureOfBridge: [''],
      // materialOfConstruction: ['', Validators.required],
      loadingAsPerIRC: [''],
      bridgeCrossingFeature: [''],
      ratingOfDeckGeometry: [''],
      ratingOfWaterwayAdequacy: [''],
      ratingofAverageDailyTraffic: [''],
      ratingForSocialImportance: [''],
      ratingforEconomicGrowthPotential: [''],
      ratingAlternateRoute: [''],
      rating_environmental_impact: [''],
      year_of_construction: [''],
      height_of_bridge: ['', [CustomValidators.numberValidator()]],
      soffit_level_of_bridge: ['', [CustomValidators.numberValidator()]],
      material_foundation: [''],
      material_substructure: [''],
      material_superstructure: [''],
      ground_level: ['',[CustomValidators.numberValidator()]],
      design_discharge: ['',[CustomValidators.numberValidator()]],
      design_hfl: ['',[CustomValidators.numberValidator()]],
      lowest_water_level: ['',[CustomValidators.numberValidator()]],
      scour_level_at_pier: ['',[CustomValidators.numberValidator()]],
      scour_level_at_abutment: ['',[CustomValidators.numberValidator()]],
      scour_level_of_superstructure: ['',[CustomValidators.numberValidator()]],
      highway_width: ['',[CustomValidators.numberValidator()]],
      highway_carriageway_width: ['',[CustomValidators.numberValidator()]],
      highway_shoulder_width_appr: ['',[CustomValidators.numberValidator()]],
      highway_footpath_width: [''],
      highway_footpath_width_value: [{ value: '', disabled: true },[CustomValidators.numberValidator()]],
      highway_median_width: [''],
      highway_median_width_value: [{ value: '', disabled: true },[CustomValidators.numberValidator()]],
      width_of_approach: ['',[CustomValidators.numberValidator()]],
      safety_kerb_width: ['',[CustomValidators.numberValidator()]],
      bridge_in_skew: [''],
      bridge_skew_angle: [{ value: '', disabled: true }],
      approaches_structure: [''],
      approaches_no_of_structure: [{ value: '', disabled: true }],
      type_of_wall: [''],
      
    });

     

    this.getDropDownData();
    //  this.bridgeForm.get('noOfSpan')?.valueChanges.subscribe(() => {
    //   this.onNoOfSpanChange();
    //  });
    this.bridgeForm.get('noOfSpan')?.valueChanges.subscribe((newSpanCount) => {
      this.updateSpanArrangement(newSpanCount);
    });
    

  }

  getDropDownData(){
    this.getStateList();
    this.getRatingDropdown();

  }

  getStateList(){
    this.bridgeService.getStateList().subscribe((res)=>{
      this.stateList = res.data;
    })
  }

  getRatingDropdown(){
    this.bridgeService.getSocialImportance().subscribe((res)=>{
      this.socialImportanceDropdown = res.data;
    });
    
    this.bridgeService.getEconomicGrowth().subscribe((res)=>{
      this.economicGrowthDropdown = res.data;
    });

    this.bridgeService.getAlternateRoute().subscribe((res)=>{
      this.alternateRrouteDropdown = res.data;
    });
    
    this.bridgeService.getEnvironmentalImpact().subscribe((res)=>{
      // console.log(res);
      this.environImpactDropdown = res.data;
    })  

  }

  onProjectChange(event: Event): void {
    const selectedProjectName = (event.target as HTMLSelectElement).value;
    const selectedProject = this.projectList.find(
      (project:any) => project.project_name === selectedProjectName
    );
    // console.log("selectedProject",selectedProject);
    if (selectedProject) {
      this.bridgeForm.patchValue({
        projectId: selectedProject.projectId,
      });
    }
  }


  onSubmit(): void {
    if (this.bridgeForm.invalid)
    {
      this.bridgeForm.markAllAsTouched();
      return;
    }
    else{
      const yearOfConstruction = this.bridgeForm.get('year_of_construction')?.value;

      // Calculate the age of the bridge
      const currentYear = new Date().getFullYear();
      const ageOfBridge = currentYear - yearOfConstruction;
    let bridgeObj:Bridge ={ 
    bridge_no: this.bridgeForm.get('bridgeNo')?.value,
    state_id: this.bridgeForm.get('state')?.value,
    zone: this.bridgeForm.get('zone')?.value,
    road_type: this.bridgeForm.get('roadType')?.value,
    highway_no: this.bridgeForm.get('highwayNo')?.value,
    chainage: this.bridgeForm.get('chainage')?.value,
    direction_of_inventory: this.bridgeForm.get('direction_of_inventory')?.value,
    latitude: this.bridgeForm.get('latitude')?.value,
    longitude: this.bridgeForm.get('longitude')?.value,
    consultant_name: this.bridgeForm.get('consultantName')?.value,
    popular_name_of_bridge: this.bridgeForm.get('bridgeName')?.value,
    administration_name_of_bridge: this.bridgeForm.get('administration_name_of_bridge')?.value,
    custodian: this.bridgeForm.get('custodian')?.value,
    engineer_designation: this.bridgeForm.get('engineerDesignation')?.value,
    contact_details: this.bridgeForm.get('contactDetails')?.value,
    email_id: this.bridgeForm.get('emailID')?.value,
    departmental_chainage: this.bridgeForm.get('departmentalChainage')?.value,
    departmental_bridge_number: this.bridgeForm.get('departmentalBridgeNo')?.value,
    total_no_of_span: this.bridgeForm.get('noOfSpan')?.value,
    span_arrangement: this.bridgeForm.get('spanArrangement')?.value,
    length_of_bridge: this.bridgeForm.get('lengthOfBridge')?.value,
    width_of_bridge: this.bridgeForm.get('widthOfBridge')?.value,
    traffic_lane_on_bridge: this.bridgeForm.get('trafficLaneOnBridge')?.value,
    type_of_bridge: this.bridgeForm.get('typeOfBridge')?.value,
    age_of_bridge: ageOfBridge.toString(),
    structural_form: this.bridgeForm.get('structureOfBridge')?.value,
    // material_of_construction: this.bridgeForm.get('materialOfConstruction')?.value,
    loading_as_per_IRC: this.bridgeForm.get('loadingAsPerIRC')?.value,
    bridge_crossing_feature: this.bridgeForm.get('bridgeCrossingFeature')?.value,
    rating_of_desk_geometry: this.bridgeForm.get('ratingOfDeckGeometry')?.value,
    rating_of_waterway_adequacy: this.bridgeForm.get('ratingOfWaterwayAdequacy')?.value,
    rating_of_average_daily_traffic: this.bridgeForm.get('ratingofAverageDailyTraffic')?.value,
    rating_for_social_importance: this.bridgeForm.get('ratingForSocialImportance')?.value,
    rating_for_economic_growth_potential: this.bridgeForm.get('ratingforEconomicGrowthPotential')?.value,
    rating_alternate_route: this.bridgeForm.get('ratingAlternateRoute')?.value,
    rating_environmental_impact: this.bridgeForm.get('rating_environmental_impact')?.value,
    year_of_construction: this.bridgeForm.get('year_of_construction')?.value,
    height_of_bridge: this.bridgeForm.get('height_of_bridge')?.value,
    soffit_level_of_bridge: this.bridgeForm.get('soffit_level_of_bridge')?.value,
    material_foundation: this.bridgeForm.get('material_foundation')?.value,
    material_substructure: this.bridgeForm.get('material_substructure')?.value,
    material_superstructure: this.bridgeForm.get('material_superstructure')?.value,
    ground_level: this.bridgeForm.get('ground_level')?.value,
    design_discharge: this.bridgeForm.get('design_discharge')?.value,
    design_hfl: this.bridgeForm.get('design_hfl')?.value,
    lowest_water_level: this.bridgeForm.get('lowest_water_level')?.value,
    scour_level_at_pier: this.bridgeForm.get('scour_level_at_pier')?.value,
    scour_level_at_abutment: this.bridgeForm.get('scour_level_at_abutment')?.value,
    scour_level_of_superstructure: this.bridgeForm.get('scour_level_of_superstructure')?.value,
    highway_width: this.bridgeForm.get('highway_width')?.value,
    highway_carriageway_width: this.bridgeForm.get('highway_carriageway_width')?.value,
    highway_shoulder_width_appr: this.bridgeForm.get('highway_shoulder_width_appr')?.value,
    highway_footpath_width: this.bridgeForm.get('highway_footpath_width')?.value,
    highway_footpath_width_value: this.bridgeForm.get('highway_footpath_width_value')?.value,
    highway_median_width: this.bridgeForm.get('highway_median_width')?.value,
    highway_median_width_value: this.bridgeForm.get('highway_median_width_value')?.value,
    width_of_approach: this.bridgeForm.get('width_of_approach')?.value,
    safety_kerb_width: this.bridgeForm.get('safety_kerb_width')?.value,
    bridge_in_skew: this.bridgeForm.get('bridge_in_skew')?.value,
    bridge_skew_angle: this.bridgeForm.get('bridge_skew_angle')?.value,
    approaches_structure: this.bridgeForm.get('approaches_structure')?.value,
    approaches_no_of_structure: this.bridgeForm.get('approaches_no_of_structure')?.value,
    type_of_wall: this.bridgeForm.get('type_of_wall')?.value,
    project_name: this.bridgeForm.get('projectName')?.value,
    project_id: this.bridgeForm.get('projectId')?.value,
    }
    // console.log("data for api",bridgeObj)
    this.bridgeService.updateBridge(bridgeObj,this.bridgeId).subscribe((res)=>{
      // console.log(res)
      if(res.status){
        this.loadBridgeDetails(this.bridgeId);
        this.toastr.success(res.msg, 'NHAI RAMS', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
            });
            this.bridgeForm.reset();
      }
      else {
          this.toastr.error(res.msg, 'NHAI RAMS', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
        }
    },
    (err)=>{
      // console.log(err)
      this.toastr.error(err.msg, 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
    });
    }
  }

  get spanArrangement(): FormArray<FormControl> {
    return this.bridgeForm.get('spanArrangement') as FormArray<FormControl>;
  }

  // onNoOfSpanChange(): void {
  //   this.bridgeForm.get('noOfSpan')?.valueChanges.subscribe((value: number) => {
  //     this.adjustSpanArrangement(value);
  //   });
  // }

  // adjustSpanArrangement(count: number): void {
  //   while (this.spanArrangement.length < count) {
  //     this.spanArrangement.push(this.fb.control('', [Validators.required, CustomValidators.numberValidator()]));
  //   }
  //   while (this.spanArrangement.length > count) {
  //     this.spanArrangement.removeAt(this.spanArrangement.length - 1);
  //   }
  // }

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
        this.fb.control(span.span_arrangement, [Validators.required])
      );
    });
  }

  loadBridgeDetails(id: number): void {
    // console.log(id)
    this.bridgeService.getDetailsById(id).subscribe((res) => {
      if (res) {
        // console.log("fetch result",res.data)
        this.patchValue(res);
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
    state: bridge.data.state_id,
    zone: bridge.data.zone,
    roadType: bridge.data.road_type,
    highwayNo: bridge.data.highway_no,
    chainage: bridge.data.chainage,
    direction_of_inventory: bridge.data.direction_of_inventory,
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
    ratingForSocialImportance: bridge.data.rating_for_social_importance,
    ratingforEconomicGrowthPotential: bridge.data.rating_for_economic_growth_potential,
    ratingAlternateRoute: bridge.data.rating_alternate_route,
    rating_environmental_impact: bridge.data.rating_environmental_impact,
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
    type_of_wall: bridge.data.type_of_wall ,
    projectName: bridge.data.project_name ,
    projectId: bridge.data.project_id 
    });

    if (bridge.data.span_arrangements) {
      this.adjustSpanArrangement(bridge.data.span_arrangements);
    }
    if (bridge.data.highway_footpath_width != "0") {
      // console.log("on true",bridge.data.highway_footpath_width)
      this.isFootpathWidthYes = true;
      this.bridgeForm.get('highway_footpath_width_value')?.enable();
    } else {
      // console.log("on false",bridge.data.highway_footpath_width)
      this.isFootpathWidthYes = false;
      this.bridgeForm.get('highway_footpath_width_value')?.disable();
      this.bridgeForm.get('highway_footpath_width_value')?.reset();
    }

    if (bridge.data.highway_median_width != "0") {
      this.isMedianWidthEditable = true;
      this.bridgeForm.get('highway_median_width_value')?.enable();
    } else {
      this.isMedianWidthEditable = false;
      this.bridgeForm.get('highway_median_width_value')?.disable();
      this.bridgeForm.get('highway_median_width_value')?.reset();
    }

    if (bridge.data.bridge_in_skew === 'Yes') {
      this.isSkewAngleEditable = true;
      this.bridgeForm.get('bridge_skew_angle')?.enable();
    } else {
      this.isSkewAngleEditable = false;
      this.bridgeForm.get('bridge_skew_angle')?.disable();
      this.bridgeForm.get('bridge_skew_angle')?.reset();
    }

    if (bridge.data.approaches_structure === 'Yes') {
      this.isApproachesStructureEditable = true;
      this.bridgeForm.get('approaches_no_of_structure')?.enable();
    } else {
      this.isApproachesStructureEditable = false;
      this.bridgeForm.get('approaches_no_of_structure')?.disable();
      this.bridgeForm.get('approaches_no_of_structure')?.reset();
    }
    this.adjustSpanArrangement(bridge.data.total_no_of_span);
    // console.log(this.bridgeForm);
  }

  
  onFootpathWidthChange(event: any): void {
    const  value=event.target.value
     if (value === 'Yes') {
       this.isFootpathWidthYes = true;
       this.bridgeForm.get('highway_footpath_width_value')?.enable();
     } else {
       this.isFootpathWidthYes = false;
       this.bridgeForm.get('highway_footpath_width_value')?.disable();
       this.bridgeForm.get('highway_footpath_width_value')?.reset();
     }
   }
 
   onMedianWidthChange(event: any): void {
     const  value=event.target.value
     if (value === 'Yes') {
       this.isMedianWidthEditable = true;
       this.bridgeForm.get('highway_median_width_value')?.enable();
     } else {
       this.isMedianWidthEditable = false;
       this.bridgeForm.get('highway_median_width_value')?.disable();
       this.bridgeForm.get('highway_median_width_value')?.reset();
     }
   }
 
   onBridgeInSkewChange(event: any): void {
     const  value=event.target.value
     if (value === 'Yes') {
       this.isSkewAngleEditable = true;
       this.bridgeForm.get('bridge_skew_angle')?.enable();
     } else {
       this.isSkewAngleEditable = false;
       this.bridgeForm.get('bridge_skew_angle')?.disable();
       this.bridgeForm.get('bridge_skew_angle')?.reset();
     }
   }
 
   onApproachesStructureChange(event: any): void {
     const  value=event.target.value
     if (value === 'Yes') {
       this.isApproachesStructureEditable = true;
       this.bridgeForm.get('approaches_no_of_structure')?.enable();
     } else {
       this.isApproachesStructureEditable = false;
       this.bridgeForm.get('approaches_no_of_structure')?.disable();
       this.bridgeForm.get('approaches_no_of_structure')?.reset();
     }
   }
}
