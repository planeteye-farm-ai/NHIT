import { Component } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../shared/prismData/tables';
import { SharedModule } from '../../../../shared/common/sharedmodule';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReportService } from '../report.service';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-distress-reported-report',
  standalone: true,
  imports: [CommonModule, SharedModule, NgSelectModule, NgbPopoverModule, FormsModule, ReactiveFormsModule, RouterLink, ShowcodeCardComponent],
  templateUrl: './distress-reported-report.component.html',
  styleUrl: './distress-reported-report.component.scss'
})
export class DistressReportedReportComponent {
 filterForm!: FormGroup;
  prismCode = prismCodeData;
  content: any;
   projectNameList = ["Agra Bypass Road", "Abu Road to Swaroopganj","Borkhedi to Wadner","Chittorgarh to kota","Shivpuri to Jhasi","Kochugaon to Kaljhar-1","Kochugaon to Kaljhar-2","Kaljhar to Patacharkuchi"];
  directionList = ["Increasing", "Decreasing"];
  distressReport:any;
  tableData:any
  currentDate: any;
  objectKeys = Object.keys;
  filterDataShow:any
  selectedAssets: any;
  distressList = [
    "All",
    "Oblique crack",
    "Pothole",
    "Edge Break",
    "Patchwork",
    "Bleeding",
    "Hotspots",
    "Alligator crack",
    "Rough Spot",
    "Repair",
    "Block crack",
    "Rutting",
    "Longitudinal crack",
    "Raveling",
    "Simple crack",
    "Transverse crack",
    "Single Discrete crack",
    "Multiple cracks",
    "Joint crack",
    "Joint seal defects",
    "Punchout",
    "Slippage",
    "Heaves",
    "Hungry Surface",
    "Hairline crack",
    "Shoving",
    "Stripping",
    "Settlement"
  ]
   constructor(config: NgbModalConfig,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private inventoryReportService: ReportService,
    private fb: FormBuilder,
  ) {

  }

  ngOnInit(): void {
    // const currentDate = new Date();
    // this.currentDate = currentDate.toISOString().split('T')[0];
     const defaultDate = new Date(2025, 5, 21); // Note: Month is 0-indexed, so 5 = June
    const formattedDate = defaultDate.toISOString().split('T')[0]; // Gives '2025-06-20'
    this.currentDate = formattedDate;

    this.filterForm = this.fb.group({
      date: [this.currentDate],
      project_name: [null],
      direction: [null],
      chainage_start: [''],
      chainage_end: [''],
      distress_type: [[]],
    });

    
  }

  // filterDistress(){
  //   // console.log('Form value ',this.filterForm.value)
  //   let project_name: string[] = Object.values(this.filterForm.get('project_name')?.value);
  //   let dataObj = {
  //     date: this.filterForm.get('date')?.value,
  //     project_name: this.filterForm.get('project_name')?.value,
  //     direction: this.filterForm.get('direction')?.value,
  //     chainage_start: this.filterForm.get('chainage_start')?.value,
  //     chainage_end: this.filterForm.get('chainage_end')?.value,
  //     distress_type: this.filterForm.get('distress_type')?.value,
  //   }
  //   this.filterDataShow = dataObj
  //  this.inventoryReportService.getDistressReportedData(dataObj).subscribe((res) => {
  //   // console.log("get data ", res);
  //   this.distressReport = res;

  //   let summaryByLatLong: any[] = [];

  //   res.forEach((group: any[]) => {
  //     if (!Array.isArray(group) || group.length === 0) return;

  //     let summary: any = {
  //       latitude: group[0].latitude,
  //       longitude: group[0].longitude
  //     };

  //     group.forEach((item: any) => {
  //       for (let key in item) {
  //         const value = item[key];

  //         if (
  //           typeof value === 'number' &&
  //           key !== 'latitude' &&
  //           key !== 'longitude'
  //           //  &&
  //           // key !== 'chainage_start' &&
  //           // key !== 'chainage_end'
  //         ) {
  //           summary[key] = (summary[key] || 0) + value;
  //         }
  //       }
  //     });

  //     summaryByLatLong.push(summary);
  //   });
  //   this.tableData = summaryByLatLong;  
  //   // console.log('Summary by Latitude/Longitude:', summaryByLatLong);
  // });

  // }


  filterDistress() {
    // Get form values
    const formDate = this.filterForm.get('date')?.value;
    const formProjectName = this.filterForm.get('project_name')?.value || [];
    const formDirection = this.filterForm.get('direction')?.value;
    const formChainageStart = this.filterForm.get('chainage_start')?.value;
    const formChainageEnd = this.filterForm.get('chainage_end')?.value;
    const formDistressType = this.filterForm.get('distress_type')?.value || [];

    // Format data according to API requirements
    let dataObj = {
      date: formDate || new Date().toISOString().split('T')[0],
      project_name: Array.isArray(formProjectName)
        ? formProjectName
        : formProjectName
        ? [formProjectName]
        : [],
      direction: formDirection
        ? Array.isArray(formDirection)
          ? formDirection
          : [formDirection]
        : [],
      chainage_start: formChainageStart ? parseFloat(formChainageStart) : 0,
      chainage_end: formChainageEnd ? parseFloat(formChainageEnd) : 0,
      distress_type: Array.isArray(formDistressType)
        ? formDistressType
        : formDistressType
        ? [formDistressType]
        : [],
    };

    // Store filter data for display or export
    this.filterDataShow = dataObj;

    // Fetch distress report data
    this.inventoryReportService.getDistressReportedData(dataObj).subscribe({
      next: (res) => {
        // 🔁 Flatten nested arrays from API response
        const flatData = res.flat();

        // ✅ Assign flattened data directly to tableData for display
        this.tableData = flatData;

        // ✅ Keep original nested array for export (PDF or Excel, if needed)
        this.distressReport = res;

        // Optional debugging logs
        // console.log('Raw Response:', res);
        // console.log('Flattened Table Data:', this.tableData);
        console.log('tableData', this.tableData);
      },
      error: (error) => {
        console.error('Error fetching distress reported report:', error);
        this.toastr.error('Failed to fetch distress reported report data', 'Error');
      },
    });
  }

   resetFilter() {
    this.filterForm.reset();
  }
  
  formatKey(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

getDistressKeys(row: any): string[] {
  const excludeKeys = [
    'latitude',
    'longitude',
    'chainage_start',
    'chainage_end',
    'project_name',
    'length',
    'area',
    'total_distress'
  ];
  return Object.keys(row).filter(
    key => !excludeKeys.includes(key) && typeof row[key] === 'number'
  );
}

 generatePDF() {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - 2 * margin;

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Reported Distress Report', pageWidth / 2, 15, { align: 'center' });
  doc.setFont('helvetica', 'normal');

  // Meta info
  doc.setFontSize(10);
  doc.setTextColor(50);

  const leftX = margin;
  const rightX = pageWidth / 2 + 5;
  let y = 28;

  const projectNames = Array.isArray(this.filterDataShow.project_name) 
    ? this.filterDataShow.project_name.join(', ') 
    : this.filterDataShow.project_name;

  const distressType = Array.isArray(this.filterDataShow.distress_type) 
    ? this.filterDataShow.distress_type.join(', ') 
    : this.filterDataShow.distress_type;

  const direction = this.filterDataShow.direction || '';
  const chainage = `Chainage: ${this.filterDataShow.chainage_start} TO ${this.filterDataShow.chainage_end}`;
  const date = `Date: ${this.filterDataShow.date}`;

  const leftText1 = `Project Name: ${projectNames}`;
  const rightText1 = `Direction: ${direction}`;
  const leftText2 = chainage;
  const rightText2 = `Distress Type: ${distressType}`;
   const leftText3 = date;

  const leftLines1 = doc.splitTextToSize(leftText1, contentWidth / 2 - 5);
  const rightLines1 = doc.splitTextToSize(rightText1, contentWidth / 2 - 5);
  const leftLines2 = doc.splitTextToSize(leftText2, contentWidth / 2 - 5);
  const rightLines2 = doc.splitTextToSize(rightText2, contentWidth / 2 - 5);
  const leftLines3 = doc.splitTextToSize(leftText3, contentWidth);


  const rowHeight = 6;
  const maxLines1 = Math.max(leftLines1.length, rightLines1.length);
  const maxLines2 = Math.max(leftLines2.length, rightLines2.length);
  const maxLines3 = Math.max(leftLines3.length);

  // Row 1
  for (let i = 0; i < maxLines1; i++) {
    if (leftLines1[i]) doc.text(leftLines1[i], leftX, y);
    if (rightLines1[i]) doc.text(rightLines1[i], rightX, y);
    y += rowHeight;
  }

  // Row 2
  for (let i = 0; i < maxLines2; i++) {
    if (leftLines2[i]) doc.text(leftLines2[i], leftX, y);
    if (rightLines2[i]) doc.text(rightLines2[i], rightX, y);
    y += rowHeight;
  }
  // Row 3
  for (let i = 0; i < maxLines3; i++) {
    if (leftLines3[i]) doc.text(leftLines3[i], leftX, y);   
    y += rowHeight;
  }

  // Horizontal line
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // Table headers with units
  const tableColumns = [
    'Distress Type',
    'Chainage Start',
    'Chainage End',
    'Latitude',
    'Longitude',
    'Carriage Type',
    'Lane',
    'Length (m)',
    'Area (m²)',
    'Width (m)',
    'Depth (m)',
  ];

  const excludedKeys = [
    'latitude',
    'longitude',
    'chainage_start',
    'chainage_end',
    'length',
    'area',
    'project_name',
    'direction',
    'date',
    'distress_type',
    'total_distress'
  ];

  const tableRows: any[] = [];
  this.tableData.forEach((item: any) => {
    const distressKey = item.distress_type?.toLowerCase().replace(/\s+/g, '_') || '';
    let eventValue = '-';

    // Find first valid distress value from keys (not excluded)
    for (const key in item) {
      if (
        !excludedKeys.includes(key) &&
        typeof item[key] === 'number' &&
        item[key] > 0
      ) {
        eventValue = item[key].toFixed(2);
        break;
      }
    }

    tableRows.push([
      item.distress_type || '-',
      parseFloat(item.chainage_start)?.toFixed(3),
      parseFloat(item.chainage_end)?.toFixed(3),
      item.latitude || '-',
      item.longitude || '-',
      // eventValue,
      item.carriage_type,
      item.lane,
      item.length?.toFixed(2),
      item.area?.toFixed(2),
      item.width?.toFixed(2),
      item.depth?.toFixed(2),
    ]);
  });

  autoTable(doc, {
    head: [tableColumns],
    body: tableRows,
    startY: y + 5,
    margin: { left: margin, right: margin },
    tableWidth: 'auto',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [70, 130, 180],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    showHead: 'everyPage',
    didDrawPage: (data: { pageNumber: number }) => {
      doc.setFontSize(8);
      doc.setTextColor(128);
      doc.text(
        `Reported Distress Report - Page ${data.pageNumber}`,
        pageWidth - margin,
        pageHeight - 8,
        { align: 'right' }
      );
    },
  });

  doc.save(`${this.filterDataShow.project_name} - Reported Distress Report.pdf`);
}

 excelExport() {
    let filename = `${this.filterDataShow.project_name} - Reported Distress Report.xlsx`;
    let data = document.getElementById('distressReportExport');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(data);
    const wscols = [
      { wpx: 150 }, // Distress Type		
      { wpx: 100 }, // Latitude
      { wpx: 100 }, // Longitude
      { wpx: 100 }, // date

    ];

    ws['!cols'] = wscols;

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

    XLSX.writeFile(wb, filename);
  }

  changeRange(project_name:any){
  this.filterForm.get('chainage_start')?.setValue(''); 
  this.filterForm.get('chainage_end')?.setValue(''); 
  let type = 'distress_reported'
  this.inventoryReportService.getProjectRange(project_name,type).subscribe((res)=>{
    // console.log("res",res);
    const projectData = res["Distress Reported"]?.[project_name];
   this.patchValue(projectData);
  })
}
patchValue(res:any){
  this.filterForm.patchValue({
    chainage_start:res['Start First'],
  chainage_end: res['Start Last']
  });
}
}
