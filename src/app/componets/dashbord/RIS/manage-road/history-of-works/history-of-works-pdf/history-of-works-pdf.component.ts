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
import { ApiUrl } from '../../../../../../shared/const';
import { jsPDF } from 'jspdf';  // Import jsPDF
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-history-of-works-pdf',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './history-of-works-pdf.component.html',
  styleUrl: './history-of-works-pdf.component.scss'
})
export class HistoryOfWorksPdfComponent {
  
  historyDataForm!: FormGroup;
  prismCode = prismCodeData;
  historyId:any;
  roadData:any;
  roadName:any;
  historyData:any;
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
      // this.roadForm = this.fb.group({
      //   inspectionItems: this.fb.array([]) // Create an empty FormArray
      // });

      
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.historyId = Number(params.get('id'));
     });
     
     
    this.historyDataForm = this.fb.group({
      name_of_road: [''],
      road_location: [''],
      type_of_road: ['', Validators.required],
      road_section_no: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      name_of_contractor: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      old_road_length: ['',[Validators.required, CustomValidators.numberValidator()]],
      old_road_width: ['',[Validators.required, CustomValidators.numberValidator()]],
      cons_starting_date: ['', Validators.required],
      cons_ending_date: ['', Validators.required],
      last_routing_inspe_date: ['', Validators.required],
      type_of_last_inspection: ['', Validators.required],
      comments_observations: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
    });
   
    this.route.paramMap.subscribe(params => {
      this.historyId = Number(params.get('id'));
      // console.log("bridge id in add",this.inspectionId)
      if (this.historyId) {
        this.loadBridgeDetails(this.historyId);
      }
    });
  }


  loadBridgeDetails(id: number): void {
    this.roadService.getHistoryDataById(id).subscribe((history: any) => {
      console.log("get history details",history);
      if (history) {
        this.historyData = history.data[0];
        this.topTitle = this.historyData.geometry_name_of_road
        this.patchValue(history);
      }
    },(err)=>{
      this.toastr.error(err.msg, 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
    });
    
  }

  patchValue(history:any){
    this.historyDataForm.patchValue({
      name_of_road : history.data[0].name_of_road !== "" ? history.data[0].name_of_road : history.data[0].geometry_name_of_road,
      road_location: history.data[0].road_location !== "" ? history.data[0].road_location : history.data[0].geometry_road_location,
      type_of_road: history.data[0].type_of_road !== "" ? history.data[0].type_of_road : history.data[0].geometry_type_of_road,
      road_section_no: history.data[0].road_section_no !== "" ? history.data[0].road_section_no : history.data[0].geometry_road_section_no,
      name_of_contractor: history.data[0].name_of_contractor,
      old_road_length: history.data[0].old_road_length,
      old_road_width: history.data[0].old_road_width,
      cons_starting_date: history.data[0].cons_starting_date,
      cons_ending_date: history.data[0].cons_ending_date,
      last_routing_inspe_date: history.data[0].last_routing_inspe_date,
      type_of_last_inspection: history.data[0].type_of_last_inspection,
      comments_observations: history.data[0].comments_observations
      
    });
  }

  downloadImage(fieldName: string): void {
    const imageUrl = `${this.urlLive}/upload/inspection_images/${this.historyData[fieldName]}`;    
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
    pdf.save(this.topTitle+'-History-of-works-report.pdf');

  }).catch((error) => {
    console.error('Error generating PDF:', error);
  });
}

}
