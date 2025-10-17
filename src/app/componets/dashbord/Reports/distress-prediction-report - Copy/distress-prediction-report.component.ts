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
  selector: 'app-distress-prediction-report',
  standalone: true,
  imports: [CommonModule, SharedModule, NgSelectModule, NgbPopoverModule, FormsModule, ReactiveFormsModule, RouterLink, ShowcodeCardComponent],
  templateUrl: './distress-prediction-report.component.html',
  styleUrl: './distress-prediction-report.component.scss'
})
export class DistressPredictionReportComponent {

  filterForm!: FormGroup;
  prismCode = prismCodeData;
  content: any;
  projectNameList = ["Agra Bypass Road", "Abu Road to Swaroopganj","Borkhedi to Wadner","Chittorgarh to kota","Shivpuri to Jhasi"];
  directionList = ["Increasing", "Decreasing"];
  distressReport:any;
  tableData:any
  currentDate: any;
  objectKeys = Object.keys;
  filterDataShow:any
  selectedAssets: any;
  distressList = [
    "Pothole",
    "Alligator crack",
    "Oblique crack",
    "Edge Break",
    "Patchwork",
    "Bleeding",
    "Hotspots",
    "Rutting",
    "Raveling",
    "Transverse crack",
    "Rough Spot"
  ]

    constructor(config: NgbModalConfig,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private inventoryReportService: ReportService,
    private fb: FormBuilder,
  ) {

  }

   ngOnInit(): void {
    const currentDate = new Date();
    this.currentDate = currentDate.toISOString().split('T')[0];

    this.filterForm = this.fb.group({
      date: [this.currentDate],
      project_name: [null],
      direction: [null],
      chainage_start: [''],
      chainage_end: [''],
      distress_type: [[]],
    });

    
  }

   filterDistress(){
    // console.log('Form value ',this.filterForm.value)
    let project_name: string[] = Object.values(this.filterForm.get('project_name')?.value);
    let dataObj = {
      date: this.filterForm.get('date')?.value,
      project_name: this.filterForm.get('project_name')?.value,
      direction: this.filterForm.get('direction')?.value,
      chainage_start: this.filterForm.get('chainage_start')?.value,
      chainage_end: this.filterForm.get('chainage_end')?.value,
      distress_type: this.filterForm.get('distress_type')?.value,
    }
    this.filterDataShow = dataObj
   this.inventoryReportService.getDistressPredictedData(dataObj).subscribe((res) => {
    // console.log("get data ", res);
    this.distressReport = res;

    let summaryByLatLong: any[] = [];

    res.forEach((group: any[]) => {
      if (!Array.isArray(group) || group.length === 0) return;

      let summary: any = {
        latitude: group[0].latitude,
        longitude: group[0].longitude
      };

      group.forEach((item: any) => {
        for (let key in item) {
          const value = item[key];

          if (
            typeof value === 'number' &&
            key !== 'latitude' &&
            key !== 'longitude' &&
            key !== 'chainage_start' &&
            key !== 'chainage_end'
          ) {
            summary[key] = (summary[key] || 0) + value;
          }
        }
      });

      summaryByLatLong.push(summary);
    });
    this.tableData = summaryByLatLong;  
  });
}
  resetFilter() {
    this.filterForm.reset();
  } 
  
 generatePDF() {
  // console.log('table data', this.tableData)
  const doc = new jsPDF();
  // === Title ===
  doc.setFontSize(18);
  doc.text('Predicted Distress Report', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

  // === Date below the title ===
  const reportDate = this.filterDataShow.date || '';
  doc.setFontSize(12);
  // doc.text(`Date: ${reportDate}`, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });

  // === Project, Chainage, Direction, Distress Info ===
  doc.setFontSize(10);
  doc.setTextColor(50);

  const leftX = 14;
  const rightX = 105;
  let y = 30;

  // Convert to comma-separated strings if arrays
  const projectNames = Array.isArray(this.filterDataShow.project_name) 
    ? this.filterDataShow.project_name.join(', ') 
    : this.filterDataShow.project_name;

  const distressType = Array.isArray(this.filterDataShow.distress_type) 
    ? this.filterDataShow.distress_type.join(', ') 
    : this.filterDataShow.distress_type;

  const direction = this.filterDataShow.direction || '';
  const chainage = `Chainage: ${this.filterDataShow.chainage_start} TO ${this.filterDataShow.chainage_end}`;

  const leftText1 = `Project Name: ${projectNames}`;
  const rightText1 = `Direction: ${direction}`;
  const leftText2 = chainage;
  const rightText2 = `Distress Type: ${distressType}`;

  const leftLines1 = doc.splitTextToSize(leftText1, 90);
  const rightLines1 = doc.splitTextToSize(rightText1, 90);
  const leftLines2 = doc.splitTextToSize(leftText2, 90);
  const rightLines2 = doc.splitTextToSize(rightText2, 90);

  const rowHeight = 6;
  const maxLines1 = Math.max(leftLines1.length, rightLines1.length);
  const maxLines2 = Math.max(leftLines2.length, rightLines2.length);

  // Draw Row 1
  for (let i = 0; i < maxLines1; i++) {
    if (leftLines1[i]) doc.text(leftLines1[i], leftX, y);
    if (rightLines1[i]) doc.text(rightLines1[i], rightX, y);
    y += rowHeight;
  }

  // Draw Row 2
  for (let i = 0; i < maxLines2; i++) {
    if (leftLines2[i]) doc.text(leftLines2[i], leftX, y);
    if (rightLines2[i]) doc.text(rightLines2[i], rightX, y);
    y += rowHeight;
  }

  // === Horizontal separator ===
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(14, y, doc.internal.pageSize.getWidth() - 14, y);
  y += 5;

  // === Table ===
  const tableColumns = ['Distress Type', 'Latitude', 'Longitude', `${this.filterDataShow.date}`];
  const tableRows: any[] = [];

   this.tableData.forEach((group: any) => {
    const { latitude, longitude } = group;
    for (let key in group) {
      if (
        key !== 'latitude' &&
        key !== 'longitude' &&
        key !== 'total_distress' &&
        typeof group[key] === 'number' &&
        group[key] > 0 // ✅ Only include values > 0
      ) {
        tableRows.push([
          key,
          // latitude.toFixed(5),
          // longitude.toFixed(5),
          latitude,
          longitude,
          group[key].toFixed(2)
        ]);
      }
    }
  });

  autoTable(doc, {
    head: [tableColumns],
    body: tableRows,
    startY: y + 5,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [100, 100, 255] },
  });

  doc.save(`${this.filterDataShow.project_name} - Predicted Distress Report.pdf`);
}

 excelExport() {
    let filename = 'Predicted Distress Report.xlsx';
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
}
