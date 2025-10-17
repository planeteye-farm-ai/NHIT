import { Component } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../../shared/common/custom-validators'; 
import { Router } from '@angular/router';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RoadService } from '../road.service';
import { jsPDF } from 'jspdf';  // Import jsPDF
import html2canvas from 'html2canvas';


@Component({
  selector: 'app-road-pdf',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './road-pdf.component.html',
  styleUrl: './road-pdf.component.scss'
})
export class RoadPdfComponent {

  roadForm!: FormGroup;
    prismCode = prismCodeData;
    roadId:any;
    roadData:any;
    topTitle:any;
    constructor(
      private route: ActivatedRoute,
      private fb: FormBuilder,
      private modalService: NgbModal,
      private toastr: ToastrService,
      private roadService:RoadService,
      private router: Router,
      ) { }
  
    ngOnInit(): void {
  
      this.route.paramMap.subscribe(params => {
        this.roadId = Number(params.get('id'));
        if (this.roadId) {
          this.loadRoadDetails(this.roadId);
        }
       });
       
  
      this.roadForm = this.fb.group({
        name_of_road:[''],
        road_location:[''],
        type_of_road: [''],
        terrain:[''],
        road_section_no: [''],
        length_of_road: [''],
        roadway_width: [''],
        formation_width: [''],
        carriageway_width: [''],
        shoulder_type_increasing: [''],
        shoulder_type_decreasing: [''],
        shoulder_width_increasing: [''],
        shoulder_width_decreasing: ['']
      });
     
    }
  
   
    loadRoadDetails(id: number): void {
      this.roadService.getDetailsById(id).subscribe((road: any) => {
        console.log("get road details",road);
        if (road) {
          this.roadData = road.data;
          this.topTitle = this.roadData[0].name_of_road;
          this.patchValue(road);
        }
      },(err)=>{
        this.toastr.error(err.msg, 'NHAI RAMS', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
      });
      
    }
  
    patchValue(road:any){
      
      this.roadForm.patchValue({
        reportAnyvisualInspection: road.data[0].aesthetics_condition,
        name_of_road: road.data[0].name_of_road,
        road_location: road.data[0].road_location,
        type_of_road: road.data[0].type_of_road,
        terrain: road.data[0].terrain,
        road_section_no: road.data[0].road_section_no,
        length_of_road: road.data[0].length_of_road,
        roadway_width: road.data[0].roadway_width,
        formation_width: road.data[0].formation_width,
        carriageway_width: road.data[0].carriageway_width,
        shoulder_type_increasing: road.data[0].shoulder_type_increasing,
        shoulder_type_decreasing: road.data[0].shoulder_type_decreasing,
        shoulder_width_increasing: road.data[0].shoulder_width_increasing,
        shoulder_width_decreasing: road.data[0].shoulder_width_decreasing
        
      });
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
        pdf.save(this.topTitle+'-report.pdf');
  
      }).catch((error) => {
        console.error('Error generating PDF:', error);
      });
    }

}
