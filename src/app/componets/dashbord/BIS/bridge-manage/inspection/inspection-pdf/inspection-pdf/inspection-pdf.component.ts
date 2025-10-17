import { Component, OnInit } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../../../shared/prismData/forms/form_layouts';
import { SharedModule } from '../../../../../../../shared/common/sharedmodule';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { BridgeService } from '../../../bridge.service';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../../../../shared/common/custom-validators';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ApiUrl } from '../../../../../../../shared/const';
import { jsPDF } from 'jspdf';  // Import jsPDF
import { Suggestion } from '../../inspection';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-inspection-pdf',
  standalone: true,
  imports: [SharedModule, NgSelectModule, FormsModule, CommonModule, ShowcodeCardComponent, ReactiveFormsModule],
  templateUrl: './inspection-pdf.component.html',
  styleUrls: ['./inspection-pdf.component.scss']
})
export class InspectionPdfComponent implements OnInit {

  urlLive = ApiUrl.API_URL_fOR_iMAGE;
  inspectionForm!: FormGroup;
  prismCode = prismCodeData;
  inspectionId: any;
  bridge_id: any;
  insepectionData: any;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private bridgeService: BridgeService,
    private router: Router,
  ) {
    this.inspectionForm = this.fb.group({
      inspectionItems: this.fb.array([]),
    })
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.inspectionId = Number(params.get('id'));
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
    // console.log(this.inspectionItems);
  }

  loadBridgeDetails(id: number): void {
    this.bridgeService.getInspectionById(id).subscribe((inspection: any) => {
      if (inspection) {
        this.insepectionData = inspection.data;
        this.patchValue(inspection)
        // console.log(this.insepectionData)
      }
    }, (err) => {
      this.toastr.error(err.msg, 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
    });
  }
  patchValue(inspection:any){
    this.addInspectionItem(inspection.data.suggestions);
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
  
      pdf.save('inspection-report.pdf');
    }).catch((error) => {
      console.error('Error generating PDF:', error);
    });
  }
  

  // generatePDF(): void {
  //   const pdfContent = document.getElementById('pdf-content')!;
  
  //   html2canvas(pdfContent, {
  //     useCORS: true,
  //     allowTaint: false,
  //     scale: 2 // Increase resolution for better quality
  //   }).then((canvas) => {
  //     const pdf = new jsPDF('p', 'mm', 'a4');
  //     const pdfWidth = pdf.internal.pageSize.getWidth();
  //     const pdfHeight = pdf.internal.pageSize.getHeight();
  //     const canvasWidth = canvas.width;
  //     const canvasHeight = canvas.height;
  
  //     const imgHeight = (canvasHeight * pdfWidth) / canvasWidth;
  //     const pageHeightInPx = (canvas.width / pdfWidth) * pdfHeight; // Page height in canvas pixels
  //     let position = 0; // Start position for each page
  
  //     // Helper function to avoid breaking content
  //     const isElementCutOff = (startY: number, endY: number): boolean => {
  //       const imageData = canvas.getContext('2d')!.getImageData(0, startY, canvas.width, endY - startY).data;
  //       return !imageData.every((pixel, index) => index % 4 === 3 && pixel === 0); // Check for transparency
  //     };
  
  //     while (position < canvasHeight) {
  //       const canvasPage = document.createElement('canvas');
  //       const context = canvasPage.getContext('2d')!;
  //       canvasPage.width = canvas.width;
  //       canvasPage.height = pageHeightInPx;
  
  //       // Check if content is being cut off
  //       let endPosition = Math.min(position + pageHeightInPx, canvasHeight);
  //       while (isElementCutOff(endPosition - 20, endPosition)) {
  //         endPosition -= 20; // Adjust to avoid cutting elements
  //       }
  
  //       // Copy the adjusted slice of the canvas
  //       context.drawImage(canvas, 0, -position, canvas.width, canvasHeight);
  
  //       const imgData = canvasPage.toDataURL('image/png');
  //       pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  
  //       position = endPosition; // Update the position
  //       if (position < canvasHeight) {
  //         pdf.addPage(); // Add a new page for remaining content
  //       }
  //     }
  
  //     pdf.save('inspection-report.pdf');
  //   }).catch((error) => {
  //     console.error('Error generating PDF:', error);
  //   });
  // }
  
  // convertImageToBase64(url: string): Promise<string> {
  //   return new Promise((resolve, reject) => {
  //     const img = new Image();
  //     img.crossOrigin = 'Anonymous'; // Enable cross-origin
  //     img.src = url;
  //     img.onload = () => {
  //       const canvas = document.createElement('canvas');
  //       canvas.width = img.width;
  //       canvas.height = img.height;
  //       const ctx = canvas.getContext('2d');
  //       if (ctx) {
  //         ctx.drawImage(img, 0, 0);
  //         resolve(canvas.toDataURL('image/png'));
  //       } else {
  //         reject('Canvas context not available');
  //       }
  //     };
  //     img.onerror = (err) => reject(err);
  //   });
  // }
  
  
}

