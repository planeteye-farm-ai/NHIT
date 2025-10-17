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
    "Rough Spot",
    "Simple crack",
    "Longitudinal crack",
    "Single Discrete crack",
    "Multiple cracks",
    "Joint crack",
    "Joint seal defects",
    "Punchout",
    "Slippage",
    "Heaves"
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

  filterDistress() {
    // Create data object from form values
    let dataObj = {
      date: this.filterForm.get('date')?.value,
      project_name: this.filterForm.get('project_name')?.value,
      direction: this.filterForm.get('direction')?.value,
      chainage_start: this.filterForm.get('chainage_start')?.value,
      chainage_end: this.filterForm.get('chainage_end')?.value,
      distress_type: this.filterForm.get('distress_type')?.value,
    };

    this.filterDataShow = dataObj;
    // Fetch distress report data
    this.inventoryReportService.getDistressPredictedData(dataObj).subscribe((res) => {
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
  const doc = new jsPDF();
  // Title
  doc.setFontSize(18);
  doc.text('Predicted Distress Report', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

  // Meta info
  doc.setFontSize(10);
  doc.setTextColor(50);

  const leftX = 14;
  const rightX = 105;
  let y = 30;

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

  const leftLines1 = doc.splitTextToSize(leftText1, 90);
  const rightLines1 = doc.splitTextToSize(rightText1, 90);
  const leftLines2 = doc.splitTextToSize(leftText2, 90);
  const rightLines2 = doc.splitTextToSize(rightText2, 90);
  const leftLines3 = doc.splitTextToSize(leftText3, 90);


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
  doc.line(14, y, doc.internal.pageSize.getWidth() - 14, y);
  y += 5;

   const tableColumns = ['Distress Type','Chainage Start', 'Chainage End', 'Latitude', 'Longitude', `Carriage Type`,`Lane`];

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
      // item.length?.toFixed(2),
      // item.area?.toFixed(2),
      item.carriage_type || '-',
      item.lane|| '-',

    ]);
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
    let filename = `${this.filterDataShow.project_name} - Predicted Distress Report.xlsx`;
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
    let type = 'distress_predicted'
    this.inventoryReportService.getProjectRange(project_name,type).subscribe((res)=>{
      // console.log("res",res);
      const projectData = res["Distress Predicted"]?.[project_name];
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
