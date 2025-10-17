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
import { jsPDF } from 'jspdf';  // Import jsPDF
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-tis-pdf',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './tis-pdf.component.html',
  styleUrl: './tis-pdf.component.scss'
})
export class TisPdfComponent {

  trafficForm!: FormGroup;
    prismCode = prismCodeData;
    trafficId:any;
    topTitle:any;
    tisdata:any;
  
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
     
      this.trafficForm = this.fb.group({
        data_collection_year: [''],
        state_id :[''],
        district_id :[''],
        city_id :[''],
        road_code :[''],
        road_name :[''],
        direction :[''],
        total_length_km :[''],
        chainage_start :[''],
        chainage_end :[''],
        scooter_motor_cycle :[''],
        three_wheeler_auto :[''],
        car_jeep_van_taxi :[''],
        mini_bus :[''],
        standard_bus :[''],
        tempo :[''],
        lcv :[''],
        two_axle_trucks :[''],
        three_axle_trucks :[''],
        multi_axle_truck :[''],
        tractor_without_trailer :[''],
        tractor_with_trailer :[''],
  
        cycle :[''],
        cycle_rickshaw :[''],
        animal_drawn_vehicle :[''],
        other_non_motorized_traffic :[''],
        aadt_in_vehicles :[''],
        aadt_in_pcu :[''],
        commercial_vehicle_damage :[''],
        
      })
   }
  
   loadTrafficDetails(id: number): void {
    // console.log(id)
    this.trafficService.getDetailsById(id).subscribe((res) => {
      if (res) {
        // console.log("fetch result",res.data)
        this.tisdata = res.data;
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
    // console.log(traffic)
    this.trafficForm.patchValue({
      data_collection_year: traffic.data[0].data_collection_year,
      state_id :traffic.data[0].state_name,
      district_id :traffic.data[0].district_name,
      city_id : traffic.data[0].city_name,
      road_code :traffic.data[0].road_code,
      road_name :traffic.data[0].name_of_road,
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
      aadt_in_vehicles :traffic.data[0].aadt_in_vehicles,
      aadt_in_pcu :traffic.data[0].aadt_in_pcu,
      commercial_vehicle_damage :traffic.data[0].commercial_vehicle_damage,
    })
    
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
      pdf.save(this.topTitle+'-tis-report.pdf');

    }).catch((error) => {
      console.error('Error generating PDF:', error);
    });
  }
}
