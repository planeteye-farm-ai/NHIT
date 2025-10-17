import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { PavementManageService } from '../../pavement-manage.service'; 
import { Traffic} from '../traffic'
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../../../shared/common/custom-validators'; 
import { ActivatedRoute, Router } from '@angular/router';
import { jsPDF } from 'jspdf';  // Import jsPDF
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-traffic-file-pdf',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './traffic-file-pdf.component.html',
  styleUrl: './traffic-file-pdf.component.scss'
})
export class TrafficFilePdfComponent {

   trafficForm!: FormGroup;
    prismCode = prismCodeData;
    trafficId:any;
    topTitle:any;
    years: number[] = [];

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
        this.trafficId = Number(params.get('id'));
        if(this.trafficId) {
          console.log(this.trafficId);
          this.loadTrafficDetails(this.trafficId);
        }
      })
      
      this.trafficForm = this.fb.group({
        road_code: [''],
        jurisdiction_code :[''],
        start_chainage :[''],
        end_chainage :[''],
        direction: [''],
        data_identifier:  [''], 
        vehicle_id: [''], 
        vehicle_category: [''],
        year_index: [''],
        year:  [''],
        aadt:  [''],
      })
    }
  
    loadTrafficDetails(id:number):void{
      this.pavementService.getTrafficDetailsById(id).subscribe((res) => {
        if(res){
          // console.log("fetch result",res.data)
          this.topTitle = res.data[0].road_code;
          this.patchValue(res);
        }
      },(err) =>{
        this.toastr.error(err.msg, 'NHAI RAMS', {
          timeOut:3000,
          positionClass: 'toast-top-right',
        });
      })
    }
  
    patchValue(traffic:any){
      this.trafficForm.patchValue({
        road_code: traffic.data[0].road_code,
        jurisdiction_code: traffic.data[0].jurisdiction_code,
        start_chainage: traffic.data[0].start_chainage,
        end_chainage: traffic.data[0].end_chainage,
        direction: traffic.data[0].direction,
        data_identifier: traffic.data[0].data_identifier,
        vehicle_id: traffic.data[0].vehicle_id,
        vehicle_category: traffic.data[0].vehicle_category,
        year_index: traffic.data[0].year_index,
        year: traffic.data[0].year,
        aadt: traffic.data[0].aadt,
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
        pdf.save(this.topTitle+'-traffic-file-report.pdf');
  
      }).catch((error) => {
        console.error('Error generating PDF:', error);
      });
    }
}
