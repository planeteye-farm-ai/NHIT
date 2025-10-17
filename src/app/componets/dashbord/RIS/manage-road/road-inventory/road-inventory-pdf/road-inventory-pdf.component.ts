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
import { jsPDF } from 'jspdf';  // Import jsPDF
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-road-inventory-pdf',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './road-inventory-pdf.component.html',
  styleUrl: './road-inventory-pdf.component.scss'
})
export class RoadInventoryPdfComponent {

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
    topTitle:any;

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
       
      this.route.paramMap.subscribe(params => {
        this.inventoryId = Number(params.get('id'));
       });
       
  
      this.inventoryForm = this.fb.group({
        state_id: [''],
        district_id: [''],
        city_id: [''],
        village: [''],
        chainage_start: [''],
        chainage_end: [''],
        terrain: [''],
        land_use_left: [''],
        land_use_right: [''],
        chainagewise_village: [''],
        roadway_width: [''],
        formation_width: [''],
        carriageway_type: [''],
        carriageway_width: [''],
        shoulder_left_type: [''],
        shoulder_right_type: [''],
        shoulder_left_width: [''],
        shoulder_right_width: [''],
        submergence: [''],
        embankment_height: [''], 
  
        drainage_left: [''],
        drainage_right: [''],
  
        avenue_plantation_left: [0],
        avenue_plantation_right:[0],
  
        median_plants: [''],
        median_plants_value: [0],
  
        sign_board_left: [0],
        sign_board_right: [0],
        sign_board_middle:[0],
  
        culverts_left: [0],
        culverts_right: [0],
  
        street_lights_left: [0],
        street_lights_middle: [0],
        street_lights_right: [0],
  
        junctions: [0],
        kilometer_stone_left: [0],
        kilometer_stone_middle: [0],
        kilometer_stone_right: [0],
  
        bus_top_left: [0],
        bus_top_right: [0],
  
        truck_lay_bayes_left:[0],
        truck_lay_bayes_right:[0],
  
        toll_plaza: [''],
  
        service_road_left: [0],
        service_road_right: [0],
        adjacent_roads_left: [0],
        adjacent_roads_right: [0],
        
        toilet_blocks_left: [0],
        toilet_blocks_right: [0],
  
        solar_blinkers: [''],
        solar_blinkers_value: [0],
  
        rest_area_left: [0],
        rest_area_right: [0],
        row_fencing_left: [0],
        row_fencing_middle: [0],
        row_fencing_right: [0],
        fuel_station_left: [0],
        fuel_station_right: [0],
        emergency_call_box_left: [0],
        emergency_call_box_right: [0],
        footpath_left: [''],
        footpath_right:[''],
  
        divider_break: [''],
        divider_break_value: [0],
        remarks: ['']
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
  
    
  
    loadBridgeDetails(id: number): void {
      this.roadService.getInventoryById(id).subscribe((inventory: any) => {
        console.log("get inventory details",inventory);
        if (inventory) {
          this.inventoryData = inventory.data[0];
          this.topTitle = this.inventoryData.name_of_road;
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
  
   
    downloadImage(fieldName: string): void {
      const imageUrl = `${this.urlLive}/upload/inspection_images/${this.inventoryData[fieldName]}`;    
      const anchor = document.createElement('a');
      anchor.href = imageUrl;
      anchor.download = ''; // Let the browser decide the file name
      anchor.target = '_blank'; // Optional: Open in a new tab if needed
  
      anchor.click();
  
      anchor.remove();
  }

  generatePDF(): void {
    const pdfContent = document.getElementById('pdf-content')!;
  
    html2canvas(pdfContent, {
      useCORS: true, // Enable cross-origin resource sharing
      allowTaint: false, // Ensure it doesn't mark images as tainted
      scale: 2 // Increase resolution for better quality
    }).then((canvas) => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
  
      const imgHeight = (canvasHeight * pdfWidth) / canvasWidth;
      const pageHeightInPx = (canvas.width / pdfWidth) * pdfHeight; // Page height in canvas pixels
      let position = 0; // Start position for each page
  
      while (position < canvasHeight) {
        const canvasPage = document.createElement('canvas');
        const context = canvasPage.getContext('2d')!;
        canvasPage.width = canvas.width;
        canvasPage.height = pageHeightInPx;
  
        // Copy a portion of the canvas into a new one
        context.drawImage(canvas, 0, -position, canvas.width, canvasHeight);
  
        const imgData = canvasPage.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  
        position += pageHeightInPx; // Move position for next slice
        if (position < canvasHeight) {
          pdf.addPage(); // Add new page if there's more content
        }
      }
      pdf.save(this.topTitle+'-Inventory-report.pdf');
  
    }).catch((error) => {
      console.error('Error generating PDF:', error);
    });
  }
  

}
