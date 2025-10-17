import { Component } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { BridgeService } from '../../bridge.service';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../../../shared/common/custom-validators'; 
import { Router } from '@angular/router';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BridgeInspection,Suggestion } from '../inspection';
@Component({
  selector: 'app-add-inspection',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './add-inspection.component.html',
  styleUrl: './add-inspection.component.scss'
})
export class AddInspectionComponent {

  inspectionForm!: FormGroup;
  prismCode = prismCodeData;
  stateList:any;
  bridgeId:any;
  bridgeData:any;
  bridgeName:any;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private bridgeService:BridgeService,
    private router: Router,
    ) {
      // this.inspectionForm = this.fb.group({
      //   inspectionItems: this.fb.array([]) // Create an empty FormArray
      // });

      
  }

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {
      this.bridgeId = Number(params.get('id'));
      console.log("bridge id in add",this.bridgeId)
     });
     

    this.inspectionForm = this.fb.group({
      bridgeName: [''],
      highwayNo: [''],
      typeOfBridge: [''],
      // trafficIntensity: ['', [Validators.required,CustomValidators.noWhitespaceValidator()]],
      // pavementSurface : ['', Validators.required],
      // sideslopes: ['', Validators.required],
      erosionEmbankment: ['', Validators.required],
      approachSlab: ['', Validators.required],
      approachGeometries: ['', Validators.required],
      siltDebrisAccumulation: ['', Validators.required],
      protectiveWorksType: ['', Validators.required],
      layoutDamageReport: ['', Validators.required],
      slopePitchingCondition: ['', Validators.required],
      floorProtectionCondition: ['',Validators.required],
      scourCondition: ['',Validators.required],
      reserveStoneMaterial: ['',Validators.required],
      waterwayCondition: ['',Validators.required],
      flowPattern: ['',Validators.required],
      floodLevelUS: ['',Validators.required],
      abnormalAfflux: ['',Validators.required],
      adequacyOfWaterway: ['',Validators.required],
      settlementShifting: ['',Validators.required],
      foundationReport: ['',Validators.required],
      foundationDamageType: ['',Validators.required],
      subwaysReportDamageToFoundations: ['',Validators.required],
      SubstructureDrainageEfficiency: ['',Validators.required],
      crackingDisintegrationDecay: ['',Validators.required],
      substructureSubwaysConditions: ['',Validators.required],
      substructureLargeExcavationsReport: ['',Validators.required],
      substructureDamagesProtectiveMeasures: ['',Validators.required],
      substructureProtectiveCoating: ['',Validators.required],
      metallicBearings: ['',Validators.required],
      bearingsCondition: ['',Validators.required],
      bearingsFunctioning: ['',Validators.required],
      greasingOilBath: ['',Validators.required],
      anchorBoltsPosition: ['',Validators.required],
      elastromericBearings: ['',Validators.required],
      padsConditionBearings: ['',Validators.required],
      generalCleanlinessBearings: ['',Validators.required],
      concreteBearings: ['',Validators.required],
      distressSigns: ['',Validators.required],
      excessiveTilting: ['',Validators.required],
      lossOfShape: ['',Validators.required],
      // bearingsGeneralCleanliness: ['',Validators.required],
      crackReport: ['',Validators.required],
      // 10point add
      reinforcedConc: ['', Validators.required],
      spallingDisintegration: ['',Validators.required],
      crackingInDeckSlab: ['',Validators.required],
      coverThickness: ['',Validators.required],
      wearDeckSurface: ['', Validators.required],
      scalingSurfaceMortarLoss: ['',Validators.required],
      stainsRust: ['',Validators.required],
      leaching: ['', Validators.required],
      corrosionOfReinforcement: ['',Validators.required],
      leakageReport: ['', [Validators.required,CustomValidators.noWhitespaceValidator()]],
      damagesDueToVehicles: ['',Validators.required],
      articulationCondition: ['', [Validators.required,CustomValidators.noWhitespaceValidator()]],
      perceptibleVibrations: ['',Validators.required],
      deflectionCondition: ['', [Validators.required,CustomValidators.noWhitespaceValidator()]],
      reportCracks: ['',Validators.required],
      reportExcessiveDeflection: ['',Validators.required],
      longitudinalCracksInFlanges: ['',Validators.required],
      spallingOrCracking: ['',Validators.required],
      shearCracksInWebs: ['',Validators.required],
      cracksInBoxGirder: ['',Validators.required],
      siltDebrisReport: ['', [Validators.required,CustomValidators.noWhitespaceValidator()]],
      peelingPaint: ['', [Validators.required,CustomValidators.noWhitespaceValidator()]],
      steelMembers: ['',Validators.required],
      ConOfProtectiveSystem: ['',Validators.required],
      reportOnCorrosion: ['',Validators.required],
      reportExcessiveVibrations: ['',Validators.required],
      alignmentOfMembers: ['',Validators.required],
      condition_of_connection: ['',Validators.required],//new
      excessive_loss_of_camber: ['',Validators.required],
      buckling_kinking_warping_waviness: ['',Validators.required],
      cleanliness_of_members: ['',Validators.required],
      fracture_apparent: ['',Validators.required],
      excessive_wear: ['',Validators.required],
      closed_members_conditions: ['',Validators.required],
      masonry_arches: ['',Validators.required],
      condition_of_joints_mortar: ['',Validators.required],
      flattening_by_observing_rise: ['',Validators.required],
      masonry_arches_cracks: ['',Validators.required],
      drainage_of_spandrel_fillings: ['',Validators.required],
      growth_of_vegetation: ['',Validators.required],
      cast_iron_and_wrought_iron: ['',Validators.required],
      casting_of_metal: ['',Validators.required],
      // 10point end
      expansionJointCrackDetails: ['', [Validators.required,CustomValidators.noWhitespaceValidator()]],
      sealingMaterialCondition: ['',Validators.required],
      jointsAreSecured: ['',Validators.required],
      topSlidingPlateCondition: ['',Validators.required],
      lockingCondition: ['',Validators.required],
      debrisCondition: ['',Validators.required],
      rattlingCondition: ['',Validators.required],
      drainageImprovement: ['', Validators.required],
      surfaceCondition: ['',Validators.required],
      wearEvidence: ['',Validators.required],
      thicknessComparison: ['',Validators.required],
      cloggingCheck: ['', [Validators.required,CustomValidators.noWhitespaceValidator()]],
      projectionLevel: ['',Validators.required],
      reportAdequacy: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      drainageAdequacy: ['',Validators.required],
      drainageSpoutsFunctioning: ['',Validators.required],
      handrailCondition: ['',Validators.required],
      damageDueToCollision: ['',Validators.required],
      handrailsCheckAlignment: ['',Validators.required],
      footpathsGenCondition: ['',Validators.required],
      missingFootpathSlabs: ['',Validators.required],
      leakageWaterAndSewagePipes: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      anyDamageByTelAndElecCables: ['',Validators.required],
      condOfLightingFacilities: ['',Validators.required],
      damagesDueToAnyOtherUtiliti: ['',Validators.required],
      reptConditionOfPainting: ['',Validators.required],
      reportAnyvisualInspection: ['',Validators.required],
      inspectionItems: this.fb.array([]),
      durationOfInspection: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      // add new 
      // vertical_clear_of_struct: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      // rat_of_avg_daily_traffic: ['',Validators.required],
      remarks:['',Validators.required]
      // methodOfInspection: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
    });
    // Initialize form with data for each row

    this.addInspectionItem('Cracks In Deck Slab And Leakages');
    this.addInspectionItem('I Beam Leakage');
    this.addInspectionItem('Expansion Joints');
    this.addInspectionItem('Bearings');
    this.addInspectionItem('Drainage Pipe');

    this.getBridgeDetailsById();

  }

  onSubmit(): void {
    const formData: Suggestion = this.inspectionForm.value;
      console.log('Form submitted:', formData);
    console.log(this.inspectionForm)
    if (this.inspectionForm.invalid)
    {
      this.inspectionForm.markAllAsTouched();
      return;
    }

    else{
      console.log(this.inspectionForm)
      
    let inspection:BridgeInspection ={ 
      bridge_id:this.bridgeId,
      // traffic_intensity: this.inspectionForm.get('trafficIntensity')?.value,
      // pavement_surface_condition: this.inspectionForm.get('pavementSurface')?.value,
      // side_slopes: this.inspectionForm.get('sideslopes')?.value,
      erosion_of_embankment: this.inspectionForm.get('erosionEmbankment')?.value,
      approach_slab: this.inspectionForm.get('approachSlab')?.value,
      approach_geometry: this.inspectionForm.get('approachGeometries')?.value,
      accumulation_on_approaches: this.inspectionForm.get('siltDebrisAccumulation')?.value,
      protective_work_type: this.inspectionForm.get('protectiveWorksType')?.value,
      protective_layout_damage: this.inspectionForm.get('layoutDamageReport')?.value,
      protective_slope_condition: this.inspectionForm.get('slopePitchingCondition')?.value,
      floor_protection_condition: this.inspectionForm.get('floorProtectionCondition')?.value,
      abnormal_scour: this.inspectionForm.get('scourCondition')?.value,
      reserve_stone_material: this.inspectionForm.get('reserveStoneMaterial')?.value,
      waterway_obstruction: this.inspectionForm.get('waterwayCondition')?.value,
      flow_pattern_change: this.inspectionForm.get('flowPattern')?.value,
      max_flood_level: this.inspectionForm.get('floodLevelUS')?.value,
      abnormal_afflux: this.inspectionForm.get('abnormalAfflux')?.value,
      waterway_adequacy: this.inspectionForm.get('adequacyOfWaterway')?.value,
      foundation_settlement: this.inspectionForm.get('settlementShifting')?.value,
      foundation_cracks: this.inspectionForm.get('foundationReport')?.value,
      foundation_damage: this.inspectionForm.get('foundationDamageType')?.value,
      subway_damage: this.inspectionForm.get('subwaysReportDamageToFoundations')?.value,
      substructure_drainage_efficiency: this.inspectionForm.get('SubstructureDrainageEfficiency')?.value,
      substructure_cracks: this.inspectionForm.get('crackingDisintegrationDecay')?.value,
      subway_wall_condition: this.inspectionForm.get('substructureSubwaysConditions')?.value,
      road_excavation: this.inspectionForm.get('substructureLargeExcavationsReport')?.value,
      pier_abutment_damage: this.inspectionForm.get('substructureDamagesProtectiveMeasures')?.value,
      protective_coating_condition: this.inspectionForm.get('substructureProtectiveCoating')?.value,
      metallic_bearing_type: this.inspectionForm.get('metallicBearings')?.value,
      metallic_bearing_condition: this.inspectionForm.get('bearingsCondition')?.value,
      metallic_bearing_functioning: this.inspectionForm.get('bearingsFunctioning')?.value,
      metallic_bearing_greasing: this.inspectionForm.get('greasingOilBath')?.value,
      anchor_bolts_condition: this.inspectionForm.get('anchorBoltsPosition')?.value,
      elastomeric_bearings: this.inspectionForm.get('elastromericBearings')?.value,
      elastomeric_bearings_condition: this.inspectionForm.get('padsConditionBearings')?.value,
      genral_cleanliness: this.inspectionForm.get('generalCleanlinessBearings')?.value,
      concrete_bearings: this.inspectionForm.get('concreteBearings')?.value,
      signs_of_distress: this.inspectionForm.get('distressSigns')?.value,
      excessive_tilting: this.inspectionForm.get('excessiveTilting')?.value,
      loss_of_shape: this.inspectionForm.get('lossOfShape')?.value,
      // concrete_genral_cleanliness: this.inspectionForm.get('bearingsGeneralCleanliness')?.value,
      support_member_cracks: this.inspectionForm.get('crackReport')?.value,
      superstructure_type: this.inspectionForm.get('reinforcedConc')?.value,
      spalling_condition: this.inspectionForm.get('spallingDisintegration')?.value,
      deck_cracks: this.inspectionForm.get('crackingInDeckSlab')?.value,
      deck_cover_thickness: this.inspectionForm.get('coverThickness')?.value,
      deck_surface_wear: this.inspectionForm.get('wearDeckSurface')?.value,
      deck_scaling: this.inspectionForm.get('scalingSurfaceMortarLoss')?.value,
      deck_surface_stains: this.inspectionForm.get('stainsRust')?.value,
      deck_leaching: this.inspectionForm.get('leaching')?.value,
      reinforcement_corrosion: this.inspectionForm.get('corrosionOfReinforcement')?.value,
      deck_leakage: this.inspectionForm.get('leakageReport')?.value,
      vehicle_damage: this.inspectionForm.get('damagesDueToVehicles')?.value,
      articulation_cracks: this.inspectionForm.get('articulationCondition')?.value,
      deck_vibration: this.inspectionForm.get('perceptibleVibrations')?.value,
      deck_deflection: this.inspectionForm.get('deflectionCondition')?.value,
      end_anchorage_cracks: this.inspectionForm.get('reportCracks')?.value,
      cantilever_deflection: this.inspectionForm.get('reportExcessiveDeflection')?.value,
      longitudinal_cracks_in_flanges: this.inspectionForm.get('longitudinalCracksInFlanges')?.value,
      spalling_or_cracking_of_concrete: this.inspectionForm.get('spallingOrCracking')?.value,
      shear_cracks: this.inspectionForm.get('shearCracksInWebs')?.value,
      box_girder_cracks: this.inspectionForm.get('cracksInBoxGirder')?.value,
      accumulation_for_submersible_bridges: this.inspectionForm.get('siltDebrisReport')?.value,
      protective_coating_peeling: this.inspectionForm.get('peelingPaint')?.value,
      steel_members: this.inspectionForm.get('steelMembers')?.value,
      protective_system_condition: this.inspectionForm.get('ConOfProtectiveSystem')?.value,
      corrosion_if_any: this.inspectionForm.get('reportOnCorrosion')?.value,
      excessive_vibrations: this.inspectionForm.get('reportExcessiveVibrations')?.value,
      alignment_of_members: this.inspectionForm.get('alignmentOfMembers')?.value,
      condition_of_connection: this.inspectionForm.get('condition_of_connection')?.value,
      excessive_loss_of_camber: this.inspectionForm.get('excessive_loss_of_camber')?.value,
      buckling_kinking_warping_waviness: this.inspectionForm.get('buckling_kinking_warping_waviness')?.value,
      cleanliness_of_members: this.inspectionForm.get('cleanliness_of_members')?.value,
      fracture_apparent: this.inspectionForm.get('fracture_apparent')?.value,
      excessive_wear: this.inspectionForm.get('excessive_wear')?.value,
      closed_members_conditions: this.inspectionForm.get('closed_members_conditions')?.value,
      masonry_arches: this.inspectionForm.get('masonry_arches')?.value,
      condition_of_joints_mortar: this.inspectionForm.get('condition_of_joints_mortar')?.value,
      flattening_by_observing_rise: this.inspectionForm.get('flattening_by_observing_rise')?.value,
      masonry_arches_cracks: this.inspectionForm.get('masonry_arches_cracks')?.value,
      drainage_of_spandrel_fillings: this.inspectionForm.get('drainage_of_spandrel_fillings')?.value,
      growth_of_vegetation: this.inspectionForm.get('growth_of_vegetation')?.value,
      cast_iron_and_wrought_iron: this.inspectionForm.get('cast_iron_and_wrought_iron')?.value,
      casting_of_metal: this.inspectionForm.get('casting_of_metal')?.value,
      expansion_joint_functioning: this.inspectionForm.get('expansionJointCrackDetails')?.value,
      expansion_joint_sealing_condition: this.inspectionForm.get('sealingMaterialCondition')?.value,
      expansion_joint_security: this.inspectionForm.get('jointsAreSecured')?.value,
      expansion_joint_top_plate_condition: this.inspectionForm.get('topSlidingPlateCondition')?.value,
      expansion_joint_locking: this.inspectionForm.get('lockingCondition')?.value,
      expansion_joint_debris: this.inspectionForm.get('debrisCondition')?.value,
      expansion_joint_rattling: this.inspectionForm.get('rattlingCondition')?.value,
      expansion_joint_drainage: this.inspectionForm.get('drainageImprovement')?.value,
      wearing_coat_condition: this.inspectionForm.get('surfaceCondition')?.value,
      wearing_coat_wear: this.inspectionForm.get('wearEvidence')?.value,
      wearing_coat_thickness: this.inspectionForm.get('thicknessComparison')?.value,
      drainage_spouts_condition: this.inspectionForm.get('cloggingCheck')?.value,
      spout_projection: this.inspectionForm.get('projectionLevel')?.value,
      adequacy_thereof: this.inspectionForm.get('reportAdequacy')?.value,
      drainage_adequacy: this.inspectionForm.get('drainageAdequacy')?.value,
      submersible_bridges_functioning: this.inspectionForm.get('drainageSpoutsFunctioning')?.value,
      handrail_condition: this.inspectionForm.get('handrailCondition')?.value,
      handrail_collision: this.inspectionForm.get('damageDueToCollision')?.value,
      handrail_alignment: this.inspectionForm.get('handrailsCheckAlignment')?.value,
      footpath_condition: this.inspectionForm.get('footpathsGenCondition')?.value,
      footpath_slabs: this.inspectionForm.get('missingFootpathSlabs')?.value,
      utility_leakage: this.inspectionForm.get('leakageWaterAndSewagePipes')?.value,
      utility_damage: this.inspectionForm.get('anyDamageByTelAndElecCables')?.value,
      lighting_condition: this.inspectionForm.get('condOfLightingFacilities')?.value,
      utility_other_damages: this.inspectionForm.get('damagesDueToAnyOtherUtiliti')?.value,
      condition_of_painting: this.inspectionForm.get('reptConditionOfPainting')?.value,
      aesthetics_condition: this.inspectionForm.get('reportAnyvisualInspection')?.value,
      duration_of_inspection: this.inspectionForm.get('durationOfInspection')?.value,
      // method_of_inspection: this.inspectionForm.get('methodOfInspection')?.value,
      suggestions: this.inspectionForm.get('inspectionItems')?.value,
      // vertical_clear_of_struct: this.inspectionForm.get('vertical_clear_of_struct')?.value,
      // rat_of_avg_daily_traffic: this.inspectionForm.get('rat_of_avg_daily_traffic')?.value,
      remarks: this.inspectionForm.get('remarks')?.value,
      
    }


      console.log("inspection form details",inspection);

      this.bridgeService.addInspection(inspection).subscribe((res)=>{
        console.log(res);
        if(res.status){
          this.router.navigate(['/bis/bridge-manage/inspection/'+this.bridgeId]);
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

  get inspectionItems(): FormArray {
    return this.inspectionForm.get('inspectionItems') as FormArray;
  }

  addInspectionItem(itemName: string) {
    const itemGroup = this.fb.group({
      items_needing_attentions: [itemName, Validators.required],
      actions_recommended: ['', Validators.required],
      suggestion_time: ['', Validators.required],
      remarks: ['', Validators.required]
    });
    this.inspectionItems.push(itemGroup);
  }


  getBridgeDetailsById(){
    this.bridgeService.getDetailsById(this.bridgeId).subscribe((res) => {
      this.bridgeData = res.data;
      console.log("brige details inadd inspection",this.bridgeData);
      this.bridgeName = this.bridgeData.popular_name_of_bridge;
      if (this.bridgeData) {
        this.inspectionForm.patchValue({
          bridgeName: this.bridgeData.popular_name_of_bridge,
          highwayNo: this.bridgeData.highway_no,
          typeOfBridge: this.bridgeData.type_of_bridge
          // Other fields as needed
        });
      }

    });
  }

}


