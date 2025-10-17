import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { BridgeService } from '../../bridge-manage/bridge.service';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../../shared/common/custom-validators'; 
import { Router } from '@angular/router';
@Component({
  selector: 'app-add-project',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './add-project.component.html',
  styleUrl: './add-project.component.scss'
})
export class AddProjectComponent {

    
    projectForm!: FormGroup;
    prismCode = prismCodeData;

    projectList:any;
  
    constructor(private fb: FormBuilder,
      private modalService: NgbModal,
      private toastr: ToastrService,
      private bridgeService:BridgeService,
      private router: Router,
      ) {

        this.projectList = [
          {project_name:"Krishnagiri Thoppur",projectId:"L&T KTTL",noOfPackage:"2",structureType:"MJB",midChainage:"42+000",date:"2024-12-24"},
          {project_name:"AP04-Jadcherla Kothakota",projectId:"L&T WATL",noOfPackage:"1",structureType:"MNB",midChainage:"72+000",date:"2024-12-24"},
          {project_name:"Vadodara Bharuch",projectId:"L&T VBTL",noOfPackage:"3",structureType:"BC",midChainage:"112+000",date:"2024-12-24"},
          {project_name:"Panipat Elevated Corridor",projectId:"L&T PECL",noOfPackage:"1",structureType:"HPC",midChainage:"114+000",date:"2024-12-24"},
          {project_name:"Ahmedabad-Viramgam-Maliya",projectId:"L&T AMTL",noOfPackage:"2",structureType:"FO",midChainage:"42+000",date:"2024-12-24"},
          {project_name:"Rajkot-Jamnagar-Vadinar",projectId:"L&T RVTL",noOfPackage:"2",structureType:"FOB",midChainage:"42+000",date:"2024-12-24"},
          {project_name:"Halol-Godhra-Shamlaji",projectId:"L&T HSTL",noOfPackage:"1",structureType:"VUP",midChainage:"52+000",date:"2024-12-24"},
          {project_name:"Krishnagiri Walajahpet",projectId:"L&T KWTL",noOfPackage:"3",structureType:"MNB",midChainage:"62+000",date:"2024-12-24"},
          {project_name:"Samakhiali Gandhidham",projectId:"L&T SGTL",noOfPackage:"1",structureType:"HPC",midChainage:"49+000",date:"2024-12-24"},
          {project_name:"Devihalli Hasan",projectId:"L&T DHTL",noOfPackage:"2",structureType:"VUP",midChainage:"42+000",date:"2024-12-24"},
          {project_name:"Beawar-Pali-Pindwara",projectId:"L&T BPPTL",noOfPackage:"4",structureType:"BC",midChainage:"42+000",date:"2024-12-24"},
          {project_name:"Sangareddy - MH/KNT Border",projectId:"L&T DTL",noOfPackage:"2",structureType:"MNB",midChainage:"114+000",date:"2024-12-24"},
          {project_name:"Sambalpur - Rourkela",projectId:"L&T SRTL",noOfPackage:"4",structureType:"FOB",midChainage:"114+000",date:"2024-12-24"},
          {project_name:"Palanpur-Swaroopgan",projectId:"L&T IRCL",noOfPackage:"1",structureType:"FOB",midChainage:"114+000",date:"2024-12-24"},
          {project_name:"Coimbatore Bypass",projectId:"L&T TIL",noOfPackage:"3",structureType:"VUP",midChainage:"114+000",date:"2024-12-24"},
    
        ]
    }
  
    ngOnInit(): void {
      this.projectForm = this.fb.group({
        projectName: ['', [Validators.required,CustomValidators.noWhitespaceValidator()]],
        projectId: ['', [Validators.required,CustomValidators.noWhitespaceValidator()]],
        no_of_packages: ['',[Validators.required, CustomValidators.numberValidator()]],
        structureType: ['', Validators.required],
        midChainage: ['',[Validators.required, CustomValidators.numberValidator()]],
        bmsStructure: ['', Validators.required],
      });
  
    }
  
    onProjectChange(event: Event): void {
      const selectedProjectName = (event.target as HTMLSelectElement).value;
      const selectedProject = this.projectList.find(
        (project:any) => project.project_name === selectedProjectName
      );
      console.log("selectedProject",selectedProject);
      if (selectedProject) {
        this.projectForm.patchValue({
          projectId: selectedProject.projectId,
        });
      }
    }
    
    onSubmit(): void {
      if (this.projectForm.invalid)
      {
        this.projectForm.markAllAsTouched();
        return;
      }
      else{
        const yearOfConstruction = this.projectForm.get('year_of_construction')?.value;
  
        // Calculate the age of the bridge
        const currentYear = new Date().getFullYear();
        const ageOfBridge = currentYear - yearOfConstruction;
      let projectObj:any ={ 
      bridge_no: this.projectForm.get('bridgeNo')?.value,
      state_id: this.projectForm.get('state')?.value,
      zone: this.projectForm.get('zone')?.value,
      road_type: this.projectForm.get('roadType')?.value,
      highway_no: this.projectForm.get('highwayNo')?.value,
      chainage: this.projectForm.get('chainage')?.value,
      direction_of_inventory: this.projectForm.get('direction_of_inventory')?.value,
      latitude: this.projectForm.get('longitude')?.value,
      longitude: this.projectForm.get('latitude')?.value,
      consultant_name: this.projectForm.get('consultantName')?.value,
      popular_name_of_bridge: this.projectForm.get('bridgeName')?.value,
      administration_name_of_bridge: this.projectForm.get('administration_name_of_bridge')?.value,
      custodian: this.projectForm.get('custodian')?.value,
      engineer_designation: this.projectForm.get('engineerDesignation')?.value,
      contact_details: this.projectForm.get('contactDetails')?.value,
      email_id: this.projectForm.get('emailID')?.value,
      departmental_chainage: this.projectForm.get('departmentalChainage')?.value,
      departmental_bridge_number: this.projectForm.get('departmentalBridgeNo')?.value,
      total_no_of_span: this.projectForm.get('noOfSpan')?.value,
      span_arrangement: this.projectForm.get('spanArrangement')?.value,
      length_of_bridge: this.projectForm.get('lengthOfBridge')?.value,
      width_of_bridge: this.projectForm.get('widthOfBridge')?.value,
      traffic_lane_on_bridge: this.projectForm.get('trafficLaneOnBridge')?.value,
      type_of_bridge: this.projectForm.get('typeOfBridge')?.value,
      age_of_bridge: ageOfBridge.toString(),
      structural_form: this.projectForm.get('structureOfBridge')?.value,
      loading_as_per_IRC: this.projectForm.get('loadingAsPerIRC')?.value,
      bridge_crossing_feature: this.projectForm.get('bridgeCrossingFeature')?.value,
      rating_of_desk_geometry: this.projectForm.get('ratingOfDeckGeometry')?.value,
      rating_of_waterway_adequacy: this.projectForm.get('ratingOfWaterwayAdequacy')?.value,
      rating_of_average_daily_traffic: this.projectForm.get('ratingofAverageDailyTraffic')?.value,
      rating_for_social_importance: this.projectForm.get('ratingForSocialImportance')?.value,
      rating_for_economic_growth_potential: this.projectForm.get('ratingforEconomicGrowthPotential')?.value,
      rating_alternate_route: this.projectForm.get('ratingAlternateRoute')?.value,
      rating_environmental_impact: this.projectForm.get('rating_environmental_impact')?.value,
      year_of_construction: this.projectForm.get('year_of_construction')?.value,
      height_of_bridge: this.projectForm.get('height_of_bridge')?.value,
      soffit_level_of_bridge: this.projectForm.get('soffit_level_of_bridge')?.value,
      material_foundation: this.projectForm.get('material_foundation')?.value,
      material_substructure: this.projectForm.get('material_substructure')?.value,
      material_superstructure: this.projectForm.get('material_superstructure')?.value,
      ground_level: this.projectForm.get('ground_level')?.value,
      design_discharge: this.projectForm.get('design_discharge')?.value,
      design_hfl: this.projectForm.get('design_hfl')?.value,
      lowest_water_level: this.projectForm.get('lowest_water_level')?.value,
      scour_level_at_pier: this.projectForm.get('scour_level_at_pier')?.value,
      scour_level_at_abutment: this.projectForm.get('scour_level_at_abutment')?.value,
      scour_level_of_superstructure: this.projectForm.get('scour_level_of_superstructure')?.value,
      highway_width: this.projectForm.get('highway_width')?.value,
      highway_carriageway_width: this.projectForm.get('highway_carriageway_width')?.value,
      highway_shoulder_width_appr: this.projectForm.get('highway_shoulder_width_appr')?.value,
      highway_footpath_width: this.projectForm.get('highway_footpath_width')?.value,
      highway_footpath_width_value: this.projectForm.get('highway_footpath_width_value')?.value,
      highway_median_width: this.projectForm.get('highway_median_width')?.value,
      highway_median_width_value: this.projectForm.get('highway_median_width_value')?.value,
      width_of_approach: this.projectForm.get('width_of_approach')?.value,
      safety_kerb_width: this.projectForm.get('safety_kerb_width')?.value,
      bridge_in_skew: this.projectForm.get('bridge_in_skew')?.value,
      bridge_skew_angle: this.projectForm.get('bridge_skew_angle')?.value,
      approaches_structure: this.projectForm.get('approaches_structure')?.value,
      approaches_no_of_structure: this.projectForm.get('approaches_no_of_structure')?.value,
      type_of_wall: this.projectForm.get('type_of_wall')?.value,
      }
  
      // console.log(bridgeObj);
      this.bridgeService.addBridge(projectObj).subscribe((res)=>{
        if(res.status){
          this.router.navigate(['/bis/bridge-manage']);
          this.toastr.success(res.msg, 'NHAI RAMS', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
              // this.projectForm.reset();
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
