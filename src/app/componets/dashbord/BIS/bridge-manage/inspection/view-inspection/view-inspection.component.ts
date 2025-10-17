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
import { ApiUrl } from '../../../../../../shared/const';

@Component({
  selector: 'app-view-inspection',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './view-inspection.component.html',
  styleUrl: './view-inspection.component.scss'
})
export class ViewInspectionComponent {

  urlLive = ApiUrl.API_URL_fOR_iMAGE;
  inspectionForm!: FormGroup;
  prismCode = prismCodeData;
  inspectionId:any
  bridge_id:any
  insepectionData:any;

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
        // trafficIntensity: [''],
        // pavementSurface : [''],
        // sideslopes: [''],
        erosionEmbankment: [''],
        approachSlab: [''],
        approachGeometries: [''],
        siltDebrisAccumulation: [''],
        protectiveWorksType: [''],
        layoutDamageReport: [''],
        slopePitchingCondition: [''],
        floorProtectionCondition: [''],
        scourCondition: [''],
        reserveStoneMaterial: [''],
        waterwayCondition: [''],
        flowPattern: [''],
        floodLevelUS: [''],
        abnormalAfflux: [''],
        adequacyOfWaterway: [''],
        settlementShifting: [''],
        foundationReport: [''],
        foundationDamageType: [''],
        subwaysReportDamageToFoundations: [''],
        SubstructureDrainageEfficiency: [''],
        crackingDisintegrationDecay: [''],
        substructureSubwaysConditions: [''],
        substructureLargeExcavationsReport: [''],
        substructureDamagesProtectiveMeasures: [''],
        substructureProtectiveCoating: [''],
        metallicBearings: [''],
        bearingsCondition: [''],
        bearingsFunctioning: [''],
        greasingOilBath: [''],
        anchorBoltsPosition: [''],
        elastromericBearings: [''],
        padsConditionBearings: [''],
        generalCleanlinessBearings: [''],
        concreteBearings: [''],
        distressSigns: [''],
        excessiveTilting: [''],
        lossOfShape: [''],
        // bearingsGeneralCleanliness: [''],
        crackReport: [''],
        reinforcedConc: [''],
        spallingDisintegration: [''],
        crackingInDeckSlab: [''],
        coverThickness: [''],
        wearDeckSurface: [''],
        scalingSurfaceMortarLoss: [''],
        stainsRust: [''],
        leaching: [''],
        corrosionOfReinforcement: [''],
        leakageReport: [''],
        damagesDueToVehicles: [''],
        articulationCondition: [''],
        perceptibleVibrations: [''],
        deflectionCondition: [''],
        reportCracks: [''],
        reportExcessiveDeflection: [''],
        longitudinalCracksInFlanges: [''],
        spallingOrCracking: [''],
        shearCracksInWebs: [''],
        cracksInBoxGirder: [''],
        siltDebrisReport: [''],
        peelingPaint: [''],
        steelMembers: [''],
        ConOfProtectiveSystem: [''],
        reportOnCorrosion: [''],
        reportExcessiveVibrations: [''],
        alignmentOfMembers: [''],
        condition_of_connection: [''],
        excessive_loss_of_camber: [''],
        buckling_kinking_warping_waviness: [''],
        cleanliness_of_members: [''],
        fracture_apparent: [''],
        excessive_wear: [''],
        closed_members_conditions: [''],
        masonry_arches: [''],
        condition_of_joints_mortar: [''],
        flattening_by_observing_rise: [''],
        masonry_arches_cracks: [''],
        drainage_of_spandrel_fillings: [''],
        growth_of_vegetation: [''],
        cast_iron_and_wrought_iron: [''],
        casting_of_metal: [''],
        expansionJointCrackDetails: [''],
        sealingMaterialCondition: [''],
        jointsAreSecured: [''],
        topSlidingPlateCondition: [''],
        lockingCondition: [''],
        debrisCondition: [''],
        rattlingCondition: [''],
        drainageImprovement: [''],
        surfaceCondition: [''],
        wearEvidence: [''],
        thicknessComparison: [''],
        cloggingCheck: [''],
        projectionLevel: [''],
        reportAdequacy: [''],
        drainageAdequacy: [''],
        drainageSpoutsFunctioning: [''],
        handrailCondition: [''],
        damageDueToCollision: [''],
        handrailsCheckAlignment: [''],
        footpathsGenCondition: [''],
        missingFootpathSlabs: [''],
        leakageWaterAndSewagePipes: [''],
        anyDamageByTelAndElecCables: [''],
        condOfLightingFacilities: [''],
        damagesDueToAnyOtherUtiliti: [''],
        reptConditionOfPainting: [''],
        reportAnyvisualInspection: [''],
        inspectionItems: this.fb.array([]),
        durationOfInspection: [''],
        // vertical_clear_of_struct: [''],
        remarks:['']
        // methodOfInspection: [''],
      });

      this.route.paramMap.subscribe(params => {
        this.inspectionId = Number(params.get('id'));
        // console.log("bridge id in add",this.inspectionId)
        if (this.inspectionId) {
          this.loadBridgeDetails(this.inspectionId);
        }
      });
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
    }

    loadBridgeDetails(id: number): void {
      this.bridgeService.getInspectionById(id).subscribe((inspection: any) => {
        // console.log("get inspection details",inspection);
        if (inspection) {
        this.insepectionData = inspection.data;

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
        remarks:inspection.data.remarks
      });
      this.addInspectionItem(inspection.data.suggestions); 
    }


    downloadImage(fieldName: string): void {
      const imageUrl = `${this.urlLive}/upload/inspection_images/${this.insepectionData[fieldName]}`;
       
       const anchor = document.createElement('a');
       anchor.href = imageUrl;
       anchor.download = ''; // Let the browser decide the file name
       anchor.target = '_blank'; // Optional: Open in a new tab if needed
   
       anchor.click();
   
       anchor.remove();
   }
}
