import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { PavementManageService } from '../../pavement-manage.service'; 
import { Section} from '../section'
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../../../shared/common/custom-validators'; 
import { ActivatedRoute, Router } from '@angular/router';
import { jsPDF } from 'jspdf';  // Import jsPDF
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-section-file-pdf',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './section-file-pdf.component.html',
  styleUrl: './section-file-pdf.component.scss'
})
export class SectionFilePdfComponent {
  
    sectionForm!: FormGroup;
    prismCode = prismCodeData;
    sectionId:any;
    topTitle:any;
  
    constructor(private fb: FormBuilder,
      private modalService: NgbModal,
      private toastr: ToastrService,
      private pavementService:PavementManageService,
      private router: Router,
      private route: ActivatedRoute,
      ) {
      
    }
  
    ngOnInit(): void {
      this.route.paramMap.subscribe(params => {
        this.sectionId = Number(params.get('id'));
        if (this.sectionId) {
          // console.log(this.sectionId)
           this.loadSectionDetails(this.sectionId);
        }
      });
       
      this.sectionForm = this.fb.group({
        heading_count: [''],
        strategy_code :[''],
        road_code :[''],
        jurisdiction_code :[''],
        start_chainage :[''],
        end_chainage :[''],
        direction_flag :[''],
        section_id :[''],
        section_name :[''],
        link_id :[''],
        link_name :[''],
        speed_flow :[''],
        traffic_flow :[''],
        accessibility_class :[''],
        road_class :[''],
        climatic_zone :[''],
        surface_class :[''],
        
      })
      
    }
  
    loadSectionDetails(id:number):void{
      this.pavementService.getSectionDetailsById(id).subscribe((res) => {
        if(res){
            // console.log("fetch result",res.data)
            this.topTitle= res.data[0].road_code;
            this.patchValue(res);
        }
      },(err) =>{
        this.toastr.error(err.msg, 'NHAI RAMS', {
          timeOut:3000,
          positionClass: 'toast-top-right',
        });
      });
    }
  
    patchValue(section:any){
      // console.log(traffic)
      this.sectionForm.patchValue({
        heading_count: section.data[0].heading_count,
        strategy_code :section.data[0].strategy_code,
        road_code :section.data[0].road_code,
        jurisdiction_code : section.data[0].jurisdiction_code,
        start_chainage :section.data[0].start_chainage,
        end_chainage :section.data[0].end_chainage,
        direction_flag :section.data[0].direction_flag,
        section_id :section.data[0].section_id,
        section_name :section.data[0].section_name,
        link_id :section.data[0].link_id,
        link_name :section.data[0].link_name,
        speed_flow :section.data[0].speed_flow,
        traffic_flow :section.data[0].traffic_flow,
        accessibility_class :section.data[0].accessibility_class,
        road_class :section.data[0].road_class,
        climatic_zone :section.data[0].climatic_zone,
        surface_class :section.data[0].surface_class,
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
        pdf.save(this.topTitle+'-section-file-report.pdf');
  
      }).catch((error) => {
        console.error('Error generating PDF:', error);
      });
    }
}
