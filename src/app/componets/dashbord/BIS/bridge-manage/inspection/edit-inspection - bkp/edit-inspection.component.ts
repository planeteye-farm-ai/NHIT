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
import { BridgeInspection,Suggestion } from '../inspection';
import { CustomValidators } from '../../../../../../shared/common/custom-validators'; 
import { Router } from '@angular/router';
import { ActivatedRoute, RouterLink } from '@angular/router';
@Component({
  selector: 'app-edit-inspection',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './edit-inspection.component.html',
  styleUrl: './edit-inspection.component.scss'
})
export class EditInspectionComponent {

  inspectionForm!: FormGroup;
  prismCode = prismCodeData;
  stateList:any;
  inspectionId:any
  bridge_id:any
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private bridgeService:BridgeService,
    private router: Router,
    ) {}

    ngOnInit(): void {
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
        // vertical_clear_of_struct: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
        // rat_of_avg_daily_traffic: ['',Validators.required],
        remarks:['',Validators.required]
        // methodOfInspection: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      });

      
      this.route.paramMap.subscribe(params => {
        this.inspectionId = Number(params.get('id'));
        console.log("bridge id in add",this.inspectionId)
        if (this.inspectionId) {
          this.loadBridgeDetails(this.inspectionId);
        }
      });
      // Initialize form with data for each row

      
    
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
      bridge_id: this.bridge_id,
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

      this.bridgeService.updateInspection(inspection,this.inspectionId).subscribe((res)=>{
        console.log(res);
        if(res.status){
          this.loadBridgeDetails(this.inspectionId);
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

  addInspectionItem(inspectionSugession:any) {
    this.inspectionItems.clear(); // Clear existing controls

    inspectionSugession.forEach((suggestion: any) => {
      this.inspectionItems.push(
        this.fb.group({
          items_needing_attentions: [suggestion.items_needing_attentions, Validators.required],
          actions_recommended: [suggestion.actions_recommended, Validators.required],
          suggestion_time: [suggestion.suggestion_time, Validators.required],
          remarks: [suggestion.remarks, Validators.required],
        })
      );
    });
    // console.log("sugessions",inspectionSugession)
    // const itemGroup = this.fb.group({
    //   items_needing_attentions: [inspectionSugession.items_needing_attentions, Validators.required],
    //   actions_recommended: [inspectionSugession.actions_recommended, Validators.required],
    //   suggestion_time: [inspectionSugession.suggestion_time, Validators.required],
    //   remarks: [inspectionSugession.remarks, Validators.required]
    // });
    // this.inspectionItems.push(itemGroup);
  }

  loadBridgeDetails(id: number): void {
    this.bridgeService.getInspectionById(id).subscribe((inspection: any) => {
      console.log("get inspection details",inspection);
      if (inspection) {
        this.patchValue(inspection);
      }
    },(err)=>{
      this.toastr.error(err.msg, 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
    });
    
  }

  patchValue(inspection:any){
    console.log("inspection details",inspection);
    this.bridge_id = inspection.data.bridge_id
    this.inspectionForm.patchValue({
      bridgeName:inspection.data.popular_name_of_bridge,
      highwayNo:inspection.data.highway_no,
      typeOfBridge:inspection.data.type_of_Bridge,
      // trafficIntensity: inspection.data.traffic_intensity,
      // pavementSurface: inspection.data.pavement_surface_condition,
      // sideslopes: inspection.data.side_slopes,
      erosionEmbankment: inspection.data.erosion_of_embankment,
      approachSlab: inspection.data.approach_slab,
      approachGeometries: inspection.data.approach_geometry,
      siltDebrisAccumulation: inspection.data.accumulation_on_approaches,
      protectiveWorksType: inspection.data.protective_work_type,
      layoutDamageReport: inspection.data.protective_layout_damage,
      slopePitchingCondition: inspection.data.protective_slope_condition,
      floorProtectionCondition: inspection.data.floor_protection_condition,
      scourCondition: inspection.data.abnormal_scour,
      reserveStoneMaterial: inspection.data.reserve_stone_material,
      waterwayCondition: inspection.data.waterway_obstruction,
      flowPattern: inspection.data.flow_pattern_change,
      floodLevelUS: inspection.data.max_flood_level,
      abnormalAfflux: inspection.data.abnormal_afflux,
      adequacyOfWaterway: inspection.data.waterway_adequacy,
      settlementShifting: inspection.data.foundation_settlement,
      foundationReport: inspection.data.foundation_cracks,
      foundationDamageType: inspection.data.foundation_damage,
      subwaysReportDamageToFoundations: inspection.data.subway_damage,
      SubstructureDrainageEfficiency:inspection.data.substructure_drainage_efficiency,
      crackingDisintegrationDecay: inspection.data.substructure_cracks,
      substructureSubwaysConditions: inspection.data.subway_wall_condition,
      substructureLargeExcavationsReport: inspection.data.road_excavation,
      substructureDamagesProtectiveMeasures: inspection.data.pier_abutment_damage,
      substructureProtectiveCoating: inspection.data.protective_coating_condition,
      metallicBearings: inspection.data.metallic_bearing_type,
      bearingsCondition: inspection.data.metallic_bearing_condition,
      bearingsFunctioning: inspection.data.metallic_bearing_functioning,
      greasingOilBath: inspection.data.metallic_bearing_greasing,
      anchorBoltsPosition: inspection.data.anchor_bolts_condition,
      elastromericBearings: inspection.data.elastomeric_bearings,
      padsConditionBearings: inspection.data.elastomeric_bearings_condition,
      generalCleanlinessBearings: inspection.data.genral_cleanliness,
      concreteBearings: inspection.data.concrete_bearings,
      distressSigns: inspection.data.signs_of_distress,
      excessiveTilting: inspection.data.excessive_tilting,
      lossOfShape: inspection.data.loss_of_shape,
      // bearingsGeneralCleanliness: inspection.data.concrete_genral_cleanliness,
      crackReport: inspection.data.support_member_cracks,
      reinforcedConc: inspection.data.superstructure_type,
      spallingDisintegration: inspection.data.spalling_condition,
      crackingInDeckSlab: inspection.data.deck_cracks,
      coverThickness: inspection.data.deck_cover_thickness,
      wearDeckSurface: inspection.data.deck_surface_wear,
      scalingSurfaceMortarLoss: inspection.data.deck_scaling,
      stainsRust: inspection.data.deck_surface_stains,
      leaching: inspection.data.deck_leaching,
      corrosionOfReinforcement: inspection.data.reinforcement_corrosion,
      leakageReport: inspection.data.deck_leakage,
      damagesDueToVehicles: inspection.data.vehicle_damage,
      articulationCondition: inspection.data.articulation_cracks,
      perceptibleVibrations: inspection.data.deck_vibration,
      deflectionCondition: inspection.data.deck_deflection,
      reportCracks: inspection.data.end_anchorage_cracks,
      reportExcessiveDeflection: inspection.data.cantilever_deflection,
      longitudinalCracksInFlanges: inspection.data.longitudinal_cracks_in_flanges,
      spallingOrCracking: inspection.data.spalling_or_cracking_of_concrete,
      shearCracksInWebs: inspection.data.shear_cracks,
      cracksInBoxGirder: inspection.data.box_girder_cracks,
      siltDebrisReport: inspection.data.accumulation_for_submersible_bridges,
      peelingPaint: inspection.data.protective_coating_peeling,
      steelMembers: inspection.data.steel_members,
      ConOfProtectiveSystem: inspection.data.protective_system_condition,
      reportOnCorrosion: inspection.data.corrosion_if_any,
      reportExcessiveVibrations: inspection.data.excessive_vibrations,
      alignmentOfMembers: inspection.data.alignment_of_members,
      condition_of_connection: inspection.data.condition_of_connection,
      excessive_loss_of_camber: inspection.data.excessive_loss_of_camber,
      buckling_kinking_warping_waviness: inspection.data.buckling_kinking_warping_waviness,
      cleanliness_of_members: inspection.data.cleanliness_of_members,
      fracture_apparent: inspection.data.fracture_apparent,
      excessive_wear: inspection.data.excessive_wear,
      closed_members_conditions: inspection.data.closed_members_conditions,
      masonry_arches: inspection.data.masonry_arches,
      condition_of_joints_mortar: inspection.data.condition_of_joints_mortar,
      flattening_by_observing_rise: inspection.data.flattening_by_observing_rise,
      masonry_arches_cracks: inspection.data.masonry_arches_cracks,
      drainage_of_spandrel_fillings: inspection.data.drainage_of_spandrel_fillings,
      growth_of_vegetation: inspection.data.growth_of_vegetation,
      cast_iron_and_wrought_iron: inspection.data.cast_iron_and_wrought_iron,
      casting_of_metal: inspection.data.casting_of_metal,
      expansionJointCrackDetails: inspection.data.expansion_joint_functioning,
      sealingMaterialCondition: inspection.data.expansion_joint_sealing_condition,
      jointsAreSecured: inspection.data.expansion_joint_security,
      topSlidingPlateCondition: inspection.data.expansion_joint_top_plate_condition,
      lockingCondition: inspection.data.expansion_joint_locking,
      debrisCondition: inspection.data.expansion_joint_debris,
      rattlingCondition: inspection.data.expansion_joint_rattling,
      drainageImprovement: inspection.data.expansion_joint_drainage,
      surfaceCondition: inspection.data.wearing_coat_condition,
      wearEvidence: inspection.data.wearing_coat_wear,
      thicknessComparison: inspection.data.wearing_coat_thickness,
      cloggingCheck: inspection.data.drainage_spouts_condition,
      projectionLevel: inspection.data.spout_projection,
      reportAdequacy: inspection.data.adequacy_thereof,
      drainageAdequacy: inspection.data.drainage_adequacy,
      drainageSpoutsFunctioning: inspection.data.submersible_bridges_functioning,
      handrailCondition: inspection.data.handrail_condition,
      damageDueToCollision: inspection.data.handrail_collision,
      handrailsCheckAlignment: inspection.data.handrail_alignment,
      footpathsGenCondition: inspection.data.footpath_condition,
      missingFootpathSlabs: inspection.data.footpath_slabs,
      leakageWaterAndSewagePipes: inspection.data.utility_leakage,
      anyDamageByTelAndElecCables: inspection.data.utility_damage,
      condOfLightingFacilities: inspection.data.lighting_condition,
      damagesDueToAnyOtherUtiliti: inspection.data.utility_other_damages,
      reptConditionOfPainting: inspection.data.condition_of_painting,
      reportAnyvisualInspection: inspection.data.aesthetics_condition,
      durationOfInspection: inspection.data.duration_of_inspection,
      // methodOfInspection: inspection.data.method_of_inspection,
      // vertical_clear_of_struct: inspection.data.vertical_clear_of_struct,
      // rat_of_avg_daily_traffic: inspection.data.rat_of_avg_daily_traffic,
      remarks:inspection.data.remarks
    });
    this.addInspectionItem(inspection.data.suggestions);
  }
}
