import { Component,ViewChild, ElementRef } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../shared/prismData/tables';
import { SharedModule } from '../../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {NgbModalConfig} from '@ng-bootstrap/ng-bootstrap';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormsModule} from '@angular/forms';
import {ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BridgeService } from '.././bridge.service';
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { ApiUrl } from '../../../../../shared/const';


@Component({
  selector: 'app-inspection',
  standalone: true,
  imports: [SharedModule,NgSelectModule,NgbPopoverModule,FormsModule,RouterLink,ShowcodeCardComponent],
  templateUrl: './inspection.component.html',
  styleUrl: './inspection.component.scss'
})
export class InspectionComponent {
  urlLive = ApiUrl.API_URL_fOR_iMAGE;
  inspectionId:any
  prismCode = prismCodeData;
  suggestionsData:any;
  content:any;
  tableData:any;
  selectedId: number | null = null;
  bridgeId:any;
  bridgeData:any;
  bridgeName:any;
  fileName:any;
  insepectionData:any;
  inspectionImages:any =[]
  constructor( private route: ActivatedRoute,config: NgbModalConfig, private modalService: NgbModal,private toastr: ToastrService,private bridgeService:BridgeService){
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
     this.bridgeId = Number(params.get('id'));
    });

    this.getBridgeDetailsById()
    this.getInspectionData();
  }

  getInspectionData(){
    this.bridgeService.getInspectionByBridgeId(this.bridgeId).subscribe((res)=>{
      this.tableData = res.data;
      // console.log(res.data)
    })
  }

  getBridgeDetailsById(){
    this.bridgeService.getDetailsById(this.bridgeId).subscribe((res) => {
      this.bridgeData = res.data;
      // console.log("bridge details",this.bridgeData);
      this.bridgeName = this.bridgeData.popular_name_of_bridge
      this.fileName = `Inspection List of ${this.bridgeName}.xlsx`;
    });
  }

  delete(){
    if (this.selectedId !== null) {
      this.bridgeService.deleteInspection(this.selectedId).subscribe((res)=>{
        // console.log(res)
        if(res.status){
          this.getInspectionData();
          this.toastr.success(res.msg, 'NHAI RAMS', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
        }
        else{
          this.toastr.error(res.msg, 'NHAI RAMS', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
        }
      },(err)=>{
        this.toastr.error(err.msg, 'NHAI RAMS', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
      });
    }
  }

  open(content: any,id:any) {
    this.selectedId = id;
    this.modalService.open(content);
  }

   excelExport(){
      let data = document.getElementById('inspectionListExport');
    const ws:XLSX.WorkSheet = XLSX.utils.table_to_sheet(data);
    const wscols = [
      { wpx: 150 }, // Date	
      { wpx: 100 }, // Created By
      { wpx: 200 }, // Duration
    ];
  
    ws['!cols'] = wscols;
  
    const wb:XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,'Sheet1')
  
    XLSX.writeFile(wb,this.fileName);
    }


loadInspectionData(inspection_id:number){
  this.inspectionId = inspection_id;
  this.bridgeService.getInspectionById(inspection_id).subscribe((inspection: any) => {
    if (inspection) {
      this.insepectionData = inspection.data;
      this.generatePDF(this.insepectionData);
      // this.getExtraImages(inspection_id);
       
        // console.log(this.insepectionData)
        
    }
  }, (err) => {
    this.toastr.error(err.msg, 'NHAI RAMS', {
      timeOut: 3000,
      positionClass: 'toast-top-right',
    });
  });
}
// getExtraImages(inspection_id:number){
//   this.bridgeService.getInspectionImage(inspection_id).subscribe((res)=>{
//     // console.log(res);
//     this.inspectionImages = res.data;
//       // console.log(this.inspectionImages);
//   })
// }


 
generatePDF(insepectionData: any): void {
  

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentY = 15;

  const boxMargin = 15;
  const boxWidth = pageWidth - boxMargin * 2;
  const colSplitX = boxMargin + boxWidth / 2;
  const lineHeight = 6;
  const imageWidth = 100;
  const imageHeight = 50;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`Inspection Report of ${insepectionData.popular_name_of_bridge || 'Bridge'}`, pageWidth / 2, currentY, { align: 'center' });

  currentY += 15;

  const items = [
    {
      field: "Bridge Name",
      observation: insepectionData.popular_name_of_bridge || 'N/A',
      image: null
    },
    {
      field: "Road/ Highway No",
      observation: insepectionData.highway_no || 'N/A',
      image: null
    },
    {
      field: "Type of Bridge",
      observation: insepectionData.type_of_Bridge || 'N/A',
      image: null
    },
    {
      field: "Duration Of Inspection",
      observation: insepectionData.duration_of_inspection || 'N/A',
      image:null
    },
    {
      field: "Erosion Embankment",
      observation: insepectionData.erosion_of_embankment || 'N/A',
      image: insepectionData.erosion_of_embankment_image 
        ? this.urlLive + "/upload/inspection_images/" + insepectionData.erosion_of_embankment_image
        : null
    },
    
    {
      field: "Approach Slab",
      observation: insepectionData.approach_slab || 'N/A',
      image: insepectionData.approach_slab_image 
        ? this.urlLive + "/upload/inspection_images/" + insepectionData.approach_slab_image
        : null
    },
    {
      field: "Approach Geometries",
      observation: insepectionData.approach_geometry || 'N/A',
      image: insepectionData.approach_geometry_image 
        ? this.urlLive + "/upload/inspection_images/" + insepectionData.approach_geometry_image
        : null
    },
    {
      field: "Silt And Debris On Submersible Approaches",
      observation: insepectionData.accumulation_on_approaches || 'N/A',
      image: insepectionData.accumulation_on_approaches_image 
        ? this.urlLive + "/upload/inspection_images/" + insepectionData.accumulation_on_approaches_image
        : null
    },
    {
      field: "Type Of Protective Works",
      observation: insepectionData.protective_work_type || 'N/A',
      image: insepectionData.protective_work_type_image 
        ? this.urlLive + "/upload/inspection_images/" + insepectionData.protective_work_type_image
        : null
    },
    {
      field: "Layout And Cross-Section Profile Damage",
      observation: insepectionData.protective_layout_damage || 'N/A',
      image: insepectionData.protective_layout_damage_image 
        ? this.urlLive + "/upload/inspection_images/" + insepectionData.protective_layout_damage_image
        : null
    },
    {
      field: "Slope Pitching Condition",
      observation: insepectionData.protective_slope_condition || 'N/A',
      image: insepectionData.protective_slope_condition_image 
        ? this.urlLive + "/upload/inspection_images/" + insepectionData.protective_slope_condition_image
        : null
    },
    {
      field: "Floor Protection Condition",
      observation: insepectionData.floor_protection_condition || 'N/A',
      image: insepectionData.floor_protection_condition_image 
        ? this.urlLive + "/upload/inspection_images/" + insepectionData.floor_protection_condition_image
        : null
    },
    {
      field: "Scour Condition",
      observation: insepectionData.abnormal_scour || 'N/A',
      image: insepectionData.abnormal_scour_image 
        ? this.urlLive + "/upload/inspection_images/" + insepectionData.abnormal_scour_image
        : null
    },
    {
      field: "Reserve Stone Material",
      observation: insepectionData.reserve_stone_material || 'N/A',
      image: insepectionData.reserve_stone_material_image 
        ? this.urlLive + "/upload/inspection_images/" + insepectionData.reserve_stone_material_image
        : null
    },
    {
      field: "Waterway Condition",
      observation: insepectionData.waterway_obstruction || 'N/A',
      image: insepectionData.waterway_obstruction_image 
        ? this.urlLive + "/upload/inspection_images/" + insepectionData.waterway_obstruction_image
        : null
    },
    {
      field: "Any Changes In Flow Pattern",
      observation: insepectionData.flow_pattern_change || 'N/A',
      image: insepectionData.flow_pattern_change_image 
        ? this.urlLive + "/upload/inspection_images/" + insepectionData.flow_pattern_change_image
        : null
    },
    {
      field: "Maximum Flood Level (U/S)",
      observation: insepectionData.max_flood_level || 'N/A',
      image: insepectionData.max_flood_level_image 
        ? this.urlLive + "/upload/inspection_images/" + insepectionData.max_flood_level_image
        : null
    },
    {
      field: "Abnormal Afflux",
      observation: insepectionData.abnormal_afflux || 'N/A',
      image: insepectionData.abnormal_afflux_image 
        ? this.urlLive + "/upload/inspection_images/" + insepectionData.abnormal_afflux_image
        : null
    },
    {
      field: "Adequacy Of Waterway",
      observation: insepectionData.waterway_adequacy || 'N/A',
      image: insepectionData.waterway_adequacy_image 
        ? this.urlLive + "/upload/inspection_images/" + insepectionData.waterway_adequacy_image
        : null
    },
    {
      field: "Settlement Shifting Of Wells",
      observation: insepectionData.foundation_settlement || 'N/A',
      image: insepectionData.foundation_settlement_image 
        ? this.urlLive + "/upload/inspection_images/" + insepectionData.foundation_settlement_image
        : null
    },
    {
      field: "Foundations Report",
      observation: insepectionData.foundation_cracks || 'N/A',
      image: insepectionData.foundation_cracks_image 
        ? this.urlLive + "/upload/inspection_images/" + insepectionData.foundation_cracks_image
        : null
    },
    {
      field: "Report Damage Due To Impact",
      observation: insepectionData.foundation_damage || 'N/A',
      image: insepectionData.foundation_damage_image 
        ? this.urlLive + "/upload/inspection_images/" + insepectionData.foundation_damage_image
        : null
    },
    {
      field: "Subways Report Damage To Foundations",
      observation: insepectionData.subway_damage || 'N/A',
      image: insepectionData.subway_damage_image 
        ? this.urlLive + "/upload/inspection_images/" + insepectionData.subway_damage_image
        : null
    },
    {
      field: "Substructure Drainage Efficiency Of Backfill",
      observation: insepectionData.substructure_drainage_efficiency || 'N/A',
      image: insepectionData.substructure_drainage_efficiency_image 
        ? this.urlLive + "/upload/inspection_images/" + insepectionData.substructure_drainage_efficiency_image
        : null
    },
    {
      field: "Substructure Cracking/Disintegration Decay",
      observation: insepectionData.substructure_cracks || 'N/A',
      image: insepectionData.substructure_cracks_images 
        ? this.urlLive + "/upload/inspection_images/" + insepectionData.substructure_cracks_images
        : null
    },
    {
      field: "Substructure Subways Condition",
      observation: insepectionData.subway_wall_condition || 'N/A',
      image: insepectionData.subway_wall_condition_image 
        ? this.urlLive + "/upload/inspection_images/" + insepectionData.subway_wall_condition_image
        : null
    },
    {
      field: "Substructure Large Excavations Report",
      observation: insepectionData.road_excavation || 'N/A',
      image: insepectionData.road_excavation_image 
        ? this.urlLive + "/upload/inspection_images/" + insepectionData.road_excavation_image
        : null
    },
    {
      field: "Substructure Damages To Protective Measures",
      observation: insepectionData.pier_abutment_damage || 'N/A',
      image: insepectionData.pier_abutment_damage_image 
        ? this.urlLive + "/upload/inspection_images/" + insepectionData.pier_abutment_damage_image
        : null
    },
    {
      field: "Substructure Protective Coating/Paint Damages",
      observation: insepectionData.protective_coating_condition || 'N/A',
      image: insepectionData.protective_coating_condition_image 
        ? this.urlLive + "/upload/inspection_images/" + insepectionData.protective_coating_condition_image
        : null
    },
    {
      field: "Metallic Bearings",
      observation: insepectionData.metallic_bearing_type || 'N/A',
      image: insepectionData.metallic_bearing_type_image 
        ? this.urlLive + "/upload/inspection_images/" + insepectionData.metallic_bearing_type_image
        : null
    },
    {
      field: "Bearings Condition",
      observation: insepectionData.metallic_bearing_condition || 'N/A',
      image: insepectionData.metallic_bearing_condition_image 
        ? this.urlLive + "/upload/inspection_images/" + insepectionData.metallic_bearing_condition_image
        : null
    },
    {
      field: "Bearings Functioning",
      observation: insepectionData.metallic_bearing_functioning || 'N/A',
      image: insepectionData.metallic_bearing_functioning_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.metallic_bearing_functioning_image
      : null
    },
    {
      field: "Greasing/Oil Bath",
      observation: insepectionData.metallic_bearing_greasing || 'N/A',
      image: insepectionData.metallic_bearing_greasing_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.metallic_bearing_greasing_image
      : null
    },
    {
      field: "Anchor Bolts In Position",
      observation: insepectionData.anchor_bolts_condition || 'N/A',
      image: insepectionData.anchor_bolts_condition_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.anchor_bolts_condition_image
      : null
    },
    {
      field: "Elastromeric Bearings",
      observation: insepectionData.elastomeric_bearings || 'N/A',
      image: insepectionData.elastomeric_bearings_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.elastomeric_bearings_image
      : null
    },
    {
      field: "Condition Of Pads/Oxidation/Creep Flattening/Bulging/Splitting",
      observation: insepectionData.elastomeric_bearings_condition || 'N/A',
      image: insepectionData.elastomeric_bearings_condition_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.elastomeric_bearings_condition_image
      : null
    },
    {
      field: "Bearings General Cleanliness",
      observation: insepectionData.genral_cleanliness || 'N/A',
      image: insepectionData.genral_cleanliness_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.genral_cleanliness_image
      : null
    },
    {
      field: "Concrete Bearings",
      observation: insepectionData.concrete_bearings || 'N/A',
      image: insepectionData.concrete_bearings_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.concrete_bearings_image
      : null
    },
    {
      field: "Bearings Signs Of Distress (Cracking/Spalling/Disintegration/Staining)",
      observation: insepectionData.distressSigns || 'N/A',
      image: insepectionData.signs_of_distress_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.signs_of_distress_image
      : null
    },
    {
      field: "Excessive Tilting",
      observation: insepectionData.excessive_tilting || 'N/A',
      image: insepectionData.excessive_tilting_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.excessive_tilting_image
      : null
    },
    {
      field: "Loss Of Shape",
      observation: insepectionData.loss_of_shape || 'N/A',
      image: insepectionData.loss_of_shape_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.loss_of_shape_image
      : null
    },
    {
      field: "Report Cracks In Supporting Member",
      observation: insepectionData.support_member_cracks || 'N/A',
      image: insepectionData.support_member_cracks_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.support_member_cracks_image
      : null
    },
    {
      field: "Reinforced Concrete And Prestressed Concrete",
      observation: insepectionData.superstructure_type || 'N/A',
      image: insepectionData.superstructure_type_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.superstructure_type_image
      : null
    },
    {
      field: "Spalling, Disintegration, Or Honeycombing",
      observation: insepectionData.spalling_condition || 'N/A',
      image: insepectionData.spalling_condition_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.spalling_condition_image
      : null
    },
    {
      field: "Cracking In Deck Slab",
      observation: insepectionData.deck_cracks || 'N/A',
      image: insepectionData.deck_cracks_images 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.deck_cracks_images
      : null
    },
    {
      field: "Cover Thickness (Exposed Reinforcement)",
      observation: insepectionData.deck_cover_thickness || 'N/A',
      image: insepectionData.deck_cover_thickness_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.deck_cover_thickness_image
      : null
    },
    {
      field: "Wear Of Deck Slab",
      observation: insepectionData.deck_surface_wear || 'N/A',
      image: insepectionData.deck_surface_wear_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.deck_surface_wear_image
      : null
    },
    {
      field: "Scaling (Surface Mortar Loss)",
      observation: insepectionData.deck_scaling || 'N/A',
      image: insepectionData.deck_scaling_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.deck_scaling_image
      : null
    },
    {
      field: "Report Surface Stain And Rust Stain With Locations",
      observation: insepectionData.deck_surface_stains || 'N/A',
      image: insepectionData.deck_surface_stains_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.deck_surface_stains_image
      : null
    },
    {
      field: "Leaching",
      observation: insepectionData.deck_leaching || 'N/A',
      image: insepectionData.deck_leaching_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.deck_leaching_image
      : null
    },
    {
      field: "Corrosion Of Reinforcement",
      observation: insepectionData.reinforcement_corrosion || 'N/A',
      image: insepectionData.reinforcement_corrosion_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.reinforcement_corrosion_image
      : null
    },
    {
      field: "Report Leakage",
      observation: insepectionData.deck_leakage || 'N/A',
      image: insepectionData.deck_leakage_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.deck_leakage_image
      : null
    },
    {
      field: "Report Damages Due to Moving Vehicles",
      observation: insepectionData.vehicle_damage || 'N/A',
      image: insepectionData.vehicle_damage_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.vehicle_damage_image
      : null
    },
    {
      field: "Report Condition Of Articulation (Cracks, If Any)",
      observation: insepectionData.articulation_cracks || 'N/A',
      image: insepectionData.articulation_cracks_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.articulation_cracks_image
      : null
    },
    {
      field: "Report Perceptible Vibrations",
      observation: insepectionData.deck_vibration || 'N/A',
      image: insepectionData.deck_vibration_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.deck_vibration_image
      : null
    },
    {
      field: "Report Excessive Deflection (Sag) Or Loss Of Camber",
      observation: insepectionData.deck_deflection || 'N/A',
      image: insepectionData.deck_deflection_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.deck_deflection_image
      : null
    },
    {
      field: "Report Cracks In End Anchorage Zone",
      observation: insepectionData.end_anchorage_cracks || 'N/A',
      image: insepectionData.end_anchorage_cracks_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.end_anchorage_cracks_image
      : null
    },
    {
      field: "Report Excessive Deflection (Sag) At Central Hinge Tip",
      observation: insepectionData.cantilever_deflection || 'N/A',
      image: insepectionData.cantilever_deflection_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.cantilever_deflection_image
      : null
    },
    {
      field: "Longitudinal Cracks In The Flanges",
      observation: insepectionData.longitudinal_cracks_in_flanges || 'N/A',
      image: insepectionData.longitudinal_cracks_in_flanges_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.longitudinal_cracks_in_flanges_image
      : null
    },
    {
      field: "Spalling Or Cracking Of Concrete Near Curved Cable Ducts",
      observation: insepectionData.spalling_or_cracking_of_concrete || 'N/A',
      image: insepectionData.spalling_or_cracking_of_concrete_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.spalling_or_cracking_of_concrete_image
      : null
    },
    {
      field: "Shear Cracks In Webs Nearer To Supports",
      observation: insepectionData.shear_cracks || 'N/A',
      image: insepectionData.shear_cracks_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.shear_cracks_image
      : null
    },
    {
      field: "Cracks In Box Girder",
      observation: insepectionData.box_girder_cracks || 'N/A',
      image: insepectionData.box_girder_cracks_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.box_girder_cracks_image
      : null
    },
    {
      field: "Report Accumulation Of Silt And Debris On Deck Surface",
      observation: insepectionData.accumulation_for_submersible_bridges || 'N/A',
      image: insepectionData.accumulation_for_submersible_bridges_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.accumulation_for_submersible_bridges_image
      : null
    },
    {
      field: "Report Peeling Off Of Protective Coat Or Paint",
      observation: insepectionData.protective_coating_peeling || 'N/A',
      image: insepectionData.protective_coating_peeling_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.protective_coating_peeling_image
      : null
    },
    {
      field: "Steel Members",
      observation: insepectionData.steel_members || 'N/A',
      image: insepectionData.steel_members_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.steel_members_image
      : null
    },
    {
      field: "Report Condition Of Protective System",
      observation: insepectionData.protective_system_condition || 'N/A',
      image: insepectionData.protective_system_condition_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.protective_system_condition_image
      : null
    },
    {
      field: "Report On Corrosion",
      observation: insepectionData.corrosion_if_any || 'N/A',
      image: insepectionData.corrosion_if_any_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.corrosion_if_any_image
      : null
    },
    {
      field: "Report Excessive Vibrations",
      observation: insepectionData.excessive_vibrations || 'N/A',
      image: insepectionData.excessive_vibrations_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.excessive_vibrations_image
      : null
    },
    {
      field: "Report On Alignment Of Members",
      observation: insepectionData.alignment_of_members || 'N/A',
      image: insepectionData.alignment_of_members_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.alignment_of_members_image
      : null
    },
    {
      field: "Condition Of Connection",
      observation: insepectionData.condition_of_connection || 'N/A',
      image: insepectionData.condition_of_connection_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.condition_of_connection_image
      : null
    },
    {
      field: "Excessive Loss Cf Camber",
      observation: insepectionData.excessive_loss_of_camber || 'N/A',
      image: insepectionData.excessive_loss_of_camber_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.excessive_loss_of_camber_image
      : null
    },
    {
      field: "Buckling Kinking Warping Waviness",
      observation: insepectionData.buckling_kinking_warping_waviness || 'N/A',
      image: insepectionData.buckling_kinking_warping_waviness_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.buckling_kinking_warping_waviness_image
      : null
    },
    {
      field: "Cleanliness Of Members",
      observation: insepectionData.cleanliness_of_members || 'N/A',
      image: insepectionData.cleanliness_of_members_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.cleanliness_of_members_image
      : null
    },
    {
      field: "Fracture Apparent",
      observation: insepectionData.fracture_apparent || 'N/A',
      image: insepectionData.fracture_apparent_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.fracture_apparent_image
      : null
    },
    {
      field: "Excessive Wear",
      observation: insepectionData.excessive_wear || 'N/A',
      image: insepectionData.excessive_wear_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.excessive_wear_image
      : null
    },
    {
      field: "Closed Members Conditions",
      observation: insepectionData.closed_members_conditions || 'N/A',
      image: insepectionData.closed_members_conditions_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.closed_members_conditions_image
      : null
    },
    {
      field: "Masonry Arches",
      observation: insepectionData.masonry_arches || 'N/A',
      image: insepectionData.masonry_arches_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.masonry_arches_image
      : null
    },
    {
      field: "Condition Of Joints Mortar",
      observation: insepectionData.condition_of_joints_mortar || 'N/A',
      image: insepectionData.condition_of_joints_mortar_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.condition_of_joints_mortar_image
      : null
    },
    {
      field: "Flattening By observing Rise",
      observation: insepectionData.flattening_by_observing_rise || 'N/A',
      image: insepectionData.flattening_by_observing_rise_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.flattening_by_observing_rise_image
      : null
    },
    {
      field: "Masonry Arches Cracks",
      observation: insepectionData.masonry_arches_cracks || 'N/A',
      image: insepectionData.masonry_arches_cracks_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.masonry_arches_cracks_image
      : null
    },
    {
      field: "Drainage Of Spandrel Fillings",
      observation: insepectionData.drainage_of_spandrel_fillings || 'N/A',
      image: insepectionData.drainage_of_spandrel_fillings_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.drainage_of_spandrel_fillings_image
      : null
    },
    {
      field: "Growth Of Vegetation",
      observation: insepectionData.growth_of_vegetation || 'N/A',
      image: insepectionData.growth_of_vegetation_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.growth_of_vegetation_image
      : null
    },
    {
      field: "Cast Iron And Wrought Iron",
      observation: insepectionData.cast_iron_and_wrought_iron || 'N/A',
      image: insepectionData.cast_iron_and_wrought_iron_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.cast_iron_and_wrought_iron_image
      : null
    },
    {
      field: "Casting Of Metal",
      observation: insepectionData.casting_of_metal || 'N/A',
      image: insepectionData.casting_of_metal_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.casting_of_metal_image
      : null
    },
    {
      field: "Crack Details (Near Expansion Joint)",
      observation: insepectionData.expansion_joint_functioning || 'N/A',
      image: insepectionData.expansion_joint_functioning_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.expansion_joint_functioning_image
      : null
    },
    {
      field: "Condition Of Sealing Material",
      observation: insepectionData.expansion_joint_sealing_condition || 'N/A',
      image: insepectionData.expansion_joint_sealing_condition_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.expansion_joint_sealing_condition_image
      : null
    },
    {
      field: "Joints Are Secured?",
      observation: insepectionData.expansion_joint_security || 'N/A',
      image: insepectionData.expansion_joint_security_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.expansion_joint_security_image
      : null
    },
    {
      field: "Condition Of Top Sliding Plate",
      observation: insepectionData.expansion_joint_top_plate_condition || 'N/A',
      image: insepectionData.expansion_joint_top_plate_condition_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.expansion_joint_top_plate_condition_image
      : null
    },
    {
      field: "Locking Condition Of Joints",
      observation: insepectionData.expansion_joint_locking || 'N/A',
      image: insepectionData.expansion_joint_locking_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.expansion_joint_locking_image
      : null
    },
    {
      field: "Debris In Open Joints",
      observation: insepectionData.expansion_joint_debris || 'N/A',
      image: insepectionData.expansion_joint_debris_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.expansion_joint_debris_image
      : null
    },
    {
      field: "Rattling Condition",
      observation: insepectionData.expansion_joint_rattling || 'N/A',
      image: insepectionData.expansion_joint_rattling_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.expansion_joint_rattling_image
      : null
    },
    {
      field: "Drainage Improvement Needed",
      observation: insepectionData.expansion_joint_drainage || 'N/A',
      image: insepectionData.expansion_joint_drainage_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.expansion_joint_drainage_image
      : null
    },
    {
      field: "Surface Condition",
      observation: insepectionData.wearing_coat_condition || 'N/A',
      image: insepectionData.wearing_coat_condition_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.wearing_coat_condition_image
      : null
    },
    {
      field: "Evidence Of Wear",
      observation: insepectionData.wearing_coat_wear || 'N/A',
      image: insepectionData.wearing_coat_wear_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.wearing_coat_wear_image
      : null
    },
    {
      field: "Compare Thickness",
      observation: insepectionData.wearing_coat_thickness || 'N/A',
      image: insepectionData.wearing_coat_thickness_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.wearing_coat_thickness_image
      : null
    },
    {
      field: "Clogging Deterioration And Damage",
      observation: insepectionData.drainage_spouts_condition || 'N/A',
      image: insepectionData.drainage_spouts_condition_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.drainage_spouts_condition_image
      : null
    },
    {
      field: "Projection Level",
      observation: insepectionData.spout_projection || 'N/A',
      image: insepectionData.spout_projection_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.spout_projection_image
      : null
    },
    {
      field: "Report / Adequacy Thereof",
      observation: insepectionData.adequacy_thereof || 'N/A',
      image: insepectionData.adequacy_thereof_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.adequacy_thereof_image
      : null
    },
    {
      field: "Adequacy Of Drainage And Pumping Arrangements",
      observation: insepectionData.drainage_adequacy || 'N/A',
      image: insepectionData.drainage_adequacy_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.drainage_adequacy_image
      : null
    },
    {
      field: "Drainage Spouts And Vent Holes Functioning",
      observation: insepectionData.submersible_bridges_functioning || 'N/A',
      image: insepectionData.submersible_bridges_functioning_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.submersible_bridges_functioning_image
      : null
    },
    {
      field: "Handrail/Parapet Condition",
      observation: insepectionData.handrail_condition || 'N/A',
      image: insepectionData.handrail_condition_images 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.handrail_condition_images
      : null
    },
    {
      field: "Damage Due To Collision",
      observation: insepectionData.handrail_collision || 'N/A',
      image: insepectionData.handrail_collision_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.handrail_collision_image
      : null
    },
    {
      field: "Handrails And Parapets - Check Alignment",
      observation: insepectionData.handrail_alignment || 'N/A',
      image: insepectionData.handrail_alignment_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.handrail_alignment_image
      : null
    },
    {
      field: "Footpaths- Report General Condition",
      observation: insepectionData.footpath_condition || 'N/A',
      image: insepectionData.footpath_condition_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.footpath_condition_image
      : null
    },
    {
      field: "Report Missing Footpath Slabs",
      observation: insepectionData.footpath_slabs || 'N/A',
      image: insepectionData.footpath_slabs_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.footpath_slabs_image
      : null
    },
    {
      field: "Report Leakage Of Water And Sewage Pipes",
      observation: insepectionData.utility_leakage || 'N/A',
      image: insepectionData.utility_leakage_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.utility_leakage_image
      : null
    },
    {
      field: "Any Damage By Telephone And Electric Cables",
      observation: insepectionData.utility_damage || 'N/A',
      image: insepectionData.utility_damage_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.utility_damage_image
      : null
    },
    {
      field: "Condition Of Lighting Facilities",
      observation: insepectionData.lighting_condition || 'N/A',
      image: insepectionData.lighting_condition_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.lighting_condition_image
      : null
    },
    {
      field: "Report Damages Due To Any Other Utilities",
      observation: insepectionData.utility_other_damages || 'N/A',
      image: insepectionData.utility_other_damages_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.utility_other_damages_image
      : null
    },
    {
      field: "Report Condition Of Painting",
      observation: insepectionData.condition_of_painting || 'N/A',
      image: insepectionData.condition_of_painting_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.condition_of_painting_image
      : null
    },
    {
      field: "Report Any visual Inspection",
      observation: insepectionData.aesthetics_condition || 'N/A',
      image: insepectionData.aesthetics_condition_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.aesthetics_condition_image
      : null
    },
    {
      field: "Remark",
      observation: insepectionData.remarks || 'N/A',
      image: insepectionData.remarks_image 
      ? this.urlLive + "/upload/inspection_images/" + insepectionData.remarks_image
      : null
    },
    
  ];
  const drawHeader = () => {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.rect(boxMargin, currentY, boxWidth, 8);
    doc.line(colSplitX, currentY, colSplitX, currentY + 8);
    doc.text("Inspection Item", boxMargin + 2, currentY + 6);
    doc.text("Observation", colSplitX + 2, currentY + 6);
    currentY += 8;
  };

  drawHeader();
 
  items.forEach((item, index) => {
    doc.setFont('helvetica', 'normal');
    const fieldText = `${index + 1}. ${item.field || 'N/A'}`;
    const observationText = item.observation || 'N/A';
  
    const fieldLines = doc.splitTextToSize(fieldText, boxWidth / 2 - 4);
    const observationLines = doc.splitTextToSize(observationText, boxWidth / 2 - 4);
    const maxLines = Math.max(fieldLines.length, observationLines.length);
    const textHeight = lineHeight * maxLines;
  
    // Calculate total box height
    const imageBoxHeight = item.image ? imageHeight + 5 : 0;
    const totalBoxHeight = textHeight + imageBoxHeight;
  
    // Page break check
    if (currentY + totalBoxHeight + 5 > pageHeight - 20) {
      doc.addPage();
      currentY = 15;
      drawHeader();
      doc.setFont('helvetica', 'normal');
    }
  
    // Draw outer box
    doc.rect(boxMargin, currentY, boxWidth, totalBoxHeight);
    doc.line(colSplitX, currentY, colSplitX, currentY + textHeight);
  
    // Text
    doc.text(fieldLines, boxMargin + 2, currentY + 5);
    doc.text(observationLines, colSplitX + 2, currentY + 5);
  
    let imageY = currentY + textHeight;
  
    if (item.image) {
      try {
        const imageX = (pageWidth - imageWidth) / 2;
        doc.addImage(item.image, 'JPEG', imageX, imageY + 4, imageWidth, imageHeight);
      } catch {
        doc.setFont('helvetica', 'italic');
        doc.text('Image Error', boxMargin + 2, imageY + 10);
      }
    }
  
    currentY += totalBoxHeight + 2;
  });
  


  // if (this.insepectionData.suggestions && this.insepectionData.suggestions.length > 0) {
  //   // Add a page if not enough space
  //   if (currentY + 20 > pageHeight - 20) {
  //     doc.addPage();
  //     currentY = 10;
  //   }
  
  //   // Section title
  //   doc.setFontSize(14);
  //   doc.setFont('helvetica', 'bold');
  //   currentY += 10;
  //   doc.text('Suggestions / Recommendations', pageWidth / 2, currentY, { align: 'center' });
  //   currentY += 10;
  
  //   const suggestionsBoxMargin = 15;
  //   const suggestionsBoxWidth = pageWidth - suggestionsBoxMargin * 2;
  //   const suggestionCol1 = suggestionsBoxMargin + suggestionsBoxWidth * 0.25;
  //   const suggestionCol2 = suggestionsBoxMargin + suggestionsBoxWidth * 0.55;
  //   const suggestionCol3 = suggestionsBoxMargin + suggestionsBoxWidth * 0.75;
  //   const suggestionLineHeight = 6;
  
  //   const drawSuggestionsHeader = () => {
  //     doc.setFontSize(12);
  //     doc.setFont('helvetica', 'bold');
      
  //     // Draw header row box
  //     doc.rect(suggestionsBoxMargin, currentY, suggestionsBoxWidth, 12);
  //     doc.line(suggestionCol1, currentY, suggestionCol1, currentY + 12);
  //     doc.line(suggestionCol2, currentY, suggestionCol2, currentY + 12);
  //     doc.line(suggestionCol3, currentY, suggestionCol3, currentY + 12);
  
  //     // Define column widths for wrapping
  //     const col1Width = suggestionCol1 - suggestionsBoxMargin;
  //     const col2Width = suggestionCol2 - suggestionCol1;
  //     const col3Width = suggestionCol3 - suggestionCol2;
  //     const col4Width = suggestionsBoxMargin + suggestionsBoxWidth - suggestionCol3;
  
  //     // Wrap header text
  //     const header1 = doc.splitTextToSize("Items Needing Attention", col1Width - 4);
  //     const header2 = doc.splitTextToSize("Actions Recommended", col2Width - 4);
  //     const header3 = doc.splitTextToSize("When To Be Completed", col3Width - 4);
  //     const header4 = doc.splitTextToSize("Remarks", col4Width - 4);
  
  //     const maxHeaderLines = Math.max(header1.length, header2.length, header3.length, header4.length);
  //     const headerLineHeight = 5;
  
  //     // Print each column's wrapped header text
  //     header1.forEach((line:any, i:any) => {
  //       doc.text(line, suggestionsBoxMargin + 4, currentY + 5 + i * headerLineHeight);
  //     });
  //     header2.forEach((line:any, i:any) => {
  //       doc.text(line, suggestionCol1 + 4, currentY + 5 + i * headerLineHeight);
  //     });
  //     header3.forEach((line:any, i:any) => {
  //       doc.text(line, suggestionCol2 + 4, currentY + 5 + i * headerLineHeight);
  //     });
  //     header4.forEach((line:any, i:any) => {
  //       doc.text(line, suggestionCol3 + 4, currentY + 5 + i * headerLineHeight);
  //     });
  
  //     // Update currentY based on header height
  //     currentY += maxHeaderLines * headerLineHeight;
  //   };
  
  //   drawSuggestionsHeader();
  
  //   // Loop through each suggestion and render it
  //   this.insepectionData.suggestions.forEach((suggestionItem: any, index: any) => {
  //     doc.setFont('helvetica', 'normal');
  
  //     const field1 = `${index + 1}. ${suggestionItem.items_needing_attentions || 'N/A'}`;
  //     const field2 = suggestionItem.actions_recommended || 'N/A';
  //     const field3 = suggestionItem.suggestion_time || 'N/A';
  //     const field4 = suggestionItem.remarks || 'N/A';
  
  //     // Split text to fit columns
  //     const line1 = doc.splitTextToSize(field1, suggestionCol1 - suggestionsBoxMargin - 4);
  //     const line2 = doc.splitTextToSize(field2, suggestionCol2 - suggestionCol1 - 4);
  //     const line3 = doc.splitTextToSize(field3, suggestionCol3 - suggestionCol2 - 4);
  //     const line4 = doc.splitTextToSize(field4, suggestionsBoxMargin + suggestionsBoxWidth - suggestionCol3 - 4);
  
  //     const maxLines = Math.max(line1.length, line2.length, line3.length, line4.length);
  //     const rowHeight = suggestionLineHeight * maxLines;
  
  //     // Add new page if needed
  //     if (currentY + rowHeight + 5 > pageHeight - 20) {
  //       doc.addPage();
  //       currentY = 15;
  //       drawSuggestionsHeader();
  //     }
  
  //     // Draw row box
  //     doc.rect(suggestionsBoxMargin, currentY, suggestionsBoxWidth, rowHeight);
  //     doc.line(suggestionCol1, currentY, suggestionCol1, currentY + rowHeight);
  //     doc.line(suggestionCol2, currentY, suggestionCol2, currentY + rowHeight);
  //     doc.line(suggestionCol3, currentY, suggestionCol3, currentY + rowHeight);
  
  //     // Write row text
  //     doc.text(line1, suggestionsBoxMargin + 2, currentY + 5);
  //     doc.text(line2, suggestionCol1 + 2, currentY + 5);
  //     doc.text(line3, suggestionCol2 + 2, currentY + 5);
  //     doc.text(line4, suggestionCol3 + 2, currentY + 5);
  
  //     currentY += rowHeight + 2;
  //   });
  // }


  // Suggetion
  if (this.insepectionData.suggestions && this.insepectionData.suggestions.length > 0) {
    // Add a page if not enough space
    if (currentY + 20 > pageHeight - 20) {
      doc.addPage();
      currentY = 10;
    }
  
    // Section title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    currentY += 10;
    doc.text('Suggestions / Recommendations', pageWidth / 2, currentY, { align: 'center' });
    currentY += 10;
    const suggestionsBoxMargin = 15;
    const suggestionsBoxWidth = pageWidth - suggestionsBoxMargin * 2;
    const suggestionCol1 = suggestionsBoxMargin + suggestionsBoxWidth * 0.25;
    const suggestionCol2 = suggestionsBoxMargin + suggestionsBoxWidth * 0.55;
    const suggestionCol3 = suggestionsBoxMargin + suggestionsBoxWidth * 0.75;
    const suggestionLineHeight = 6;
  
    const drawSuggestionsHeader = () => {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
  
      // Define column widths
      const col1Width = suggestionCol1 - suggestionsBoxMargin;
      const col2Width = suggestionCol2 - suggestionCol1;
      const col3Width = suggestionCol3 - suggestionCol2;
      const col4Width = suggestionsBoxMargin + suggestionsBoxWidth - suggestionCol3;
  
      // Wrap header text
      const header1 = doc.splitTextToSize("Items Needing Attention", col1Width - 4);
      const header2 = doc.splitTextToSize("Actions Recommended", col2Width - 4);
      const header3 = doc.splitTextToSize("When To Be Completed", col3Width - 4);
      const header4 = doc.splitTextToSize("Remarks", col4Width - 4);
  
      const maxHeaderLines = Math.max(header1.length, header2.length, header3.length, header4.length);
      const headerLineHeight = 6;
      const headerHeight = maxHeaderLines * headerLineHeight;
  
      // Draw header box
      doc.rect(suggestionsBoxMargin, currentY, suggestionsBoxWidth, headerHeight);
      doc.line(suggestionCol1, currentY, suggestionCol1, currentY + headerHeight);
      doc.line(suggestionCol2, currentY, suggestionCol2, currentY + headerHeight);
      doc.line(suggestionCol3, currentY, suggestionCol3, currentY + headerHeight);
  
      // Print header text
      header1.forEach((line: any, i: any) => {
        doc.text(line, suggestionsBoxMargin + 4, currentY + 5 + i * headerLineHeight);
      });
      header2.forEach((line: any, i: any) => {
        doc.text(line, suggestionCol1 + 4, currentY + 5 + i * headerLineHeight);
      });
      header3.forEach((line: any, i: any) => {
        doc.text(line, suggestionCol2 + 4, currentY + 5 + i * headerLineHeight);
      });
      header4.forEach((line: any, i: any) => {
        doc.text(line, suggestionCol3 + 4, currentY + 5 + i * headerLineHeight);
      });
  
      // Update currentY to leave space after header
      currentY += headerHeight + 5;
  
      // Reset font to normal for content
      doc.setFont('helvetica', 'normal');
    };
  
    drawSuggestionsHeader();
  
    // Loop through suggestions
    this.insepectionData.suggestions.forEach((suggestionItem: any, index: any) => {
      const field1 = `${index + 1}. ${suggestionItem.items_needing_attentions || 'N/A'}`;
      const field2 = suggestionItem.actions_recommended || 'N/A';
      const field3 = suggestionItem.suggestion_time || 'N/A';
      const field4 = suggestionItem.remarks || 'N/A';
  
      const line1 = doc.splitTextToSize(field1, suggestionCol1 - suggestionsBoxMargin - 4);
      const line2 = doc.splitTextToSize(field2, suggestionCol2 - suggestionCol1 - 4);
      const line3 = doc.splitTextToSize(field3, suggestionCol3 - suggestionCol2 - 4);
      const line4 = doc.splitTextToSize(field4, suggestionsBoxMargin + suggestionsBoxWidth - suggestionCol3 - 4);
  
      const maxLines = Math.max(line1.length, line2.length, line3.length, line4.length);
      const rowHeight = suggestionLineHeight * maxLines;
  
      // Page break check
      if (currentY + rowHeight + 5 > pageHeight - 20) {
        doc.addPage();
        currentY = 15;
        drawSuggestionsHeader();
      }
  
      // Draw row box and vertical lines
      doc.rect(suggestionsBoxMargin, currentY, suggestionsBoxWidth, rowHeight);
      doc.line(suggestionCol1, currentY, suggestionCol1, currentY + rowHeight);
      doc.line(suggestionCol2, currentY, suggestionCol2, currentY + rowHeight);
      doc.line(suggestionCol3, currentY, suggestionCol3, currentY + rowHeight);
  
      // Draw text
      doc.text(line1, suggestionsBoxMargin + 2, currentY + 5);
      doc.text(line2, suggestionCol1 + 2, currentY + 5);
      doc.text(line3, suggestionCol2 + 2, currentY + 5);
      doc.text(line4, suggestionCol3 + 2, currentY + 5);
  
      currentY += rowHeight + 2;
    });
  }
  this.bridgeService.getInspectionImage(this.inspectionId).subscribe((res) => {
    this.inspectionImages = res.data;
  
    if (res.data && res.data.length > 0) {
      // Add a page if not enough space
      if (currentY + 20 > pageHeight - 20) {
        doc.addPage();
        currentY = 20;
      }
  
      // Section title
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      currentY += 10;
  
      const gridColumns = 2;
      const imageSpacing = 5;
      const rowHeight = imageHeight + imageSpacing;
      const colWidth = imageWidth + imageSpacing;
      let imgCount = 0;
  
      (async () => {
        for (let index = 0; index < res.data.length; index++) {
          const item = res.data[index];
          const imgURL = this.urlLive + '/upload/inspection_extra_images/' + item.image_path;
  
          try {
            const base64Image = await this.getBase64ImageFromURL(imgURL);
  
            const column = imgCount % gridColumns;
            const rowInGrid = Math.floor(imgCount / gridColumns);
            const xPos = column * colWidth + (pageWidth - (imageWidth * gridColumns + imageSpacing * (gridColumns - 1))) / 2;
            const yPos = currentY + rowInGrid * rowHeight;
  
            // Check if we have enough space on current page
            if (yPos + imageHeight > pageHeight - 20) {
              doc.addPage();
              currentY = 20;
              imgCount = 0; // Reset image counter for new page
            }
  
            // Recalculate grid placement on new page
            const newColumn = imgCount % gridColumns;
            const newRowInGrid = Math.floor(imgCount / gridColumns);
            const newX = newColumn * colWidth + (pageWidth - (imageWidth * gridColumns + imageSpacing * (gridColumns - 1))) / 2;
            const newY = currentY + newRowInGrid * rowHeight;
  
            doc.addImage(base64Image, 'JPEG', newX, newY, imageWidth, imageHeight);
            imgCount++;
          } catch (error) {
            console.error('Image load failed for:', imgURL, error);
          }
        }
  
        // Optionally save after processing all images
        doc.save(`Inspection Report of ${insepectionData.popular_name_of_bridge || 'Bridge'}.pdf`);
      })();
    } else {
      console.log('No extra images found');
    }
  });

}
getBase64ImageFromURL(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute('crossOrigin', 'anonymous'); // CORS required
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Canvas context error');
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/jpeg');
      resolve(dataURL);
    };
    img.onerror = (error) => reject(error);
    img.src = url;
  });
}

}
