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
  selector: 'app-inventory-report',
  standalone: true,
  imports: [CommonModule, SharedModule, NgSelectModule, NgbPopoverModule, FormsModule, ReactiveFormsModule, RouterLink, ShowcodeCardComponent],
  templateUrl: './inventory-report.component.html',
  styleUrl: './inventory-report.component.scss'
})
export class InventoryReportComponent {
  filterForm!: FormGroup;
  prismCode = prismCodeData;
  content: any;
  projectNameList = ["Agra Bypass Road", "Abu Road to Swaroopganj","Borkhedi to Wadner","Chittorgarh to kota","Shivpuri to Jhasi"];
  directionList = ["Increasing", "Decreasing", "Median"];
  assetList =[
  "Trees",
  "Culvert",
  "Street Lights",
  "Bridges",
  "Traffic Signals",
  "KM Stones",
  "Bus Stop",
  "Truck LayBy",
  "Toll Plaza",
  "Adjacent Road",
  "Toilet Blocks",
  "Rest Area",
  "RCC Drain",
  "Fuel Station",
  "Emergency Call Box",
  "Tunnels",
  "Footpath",
  "Junction",
  "Sign Boards",
  "Solar Blinker",
  "Median Opening",
  "Median Plants",
  "Crash Barrier",
  "Service Road"
]

  assetListWithSelectAll = [];
  inventoryReport:any;
  tableData:any
  currentDate: any;
  objectKeys = Object.keys;
  filterDataShow:any
  selectedAssets: any;
  // form!: FormGroup;

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
      project_name: [[]],
      direction: [null],
      chainage_start: [''],
      chainage_end: [''],
      asset_type: [[]],
    });

    
  }


  filterDistress() {
    // console.log(this.filterForm.value)
    let project_name: string[] = Object.values(this.filterForm.get('project_name')?.value);
    // console.log(project_name)
    let dataObj = {
      date: this.filterForm.get('date')?.value,
      project_name: this.filterForm.get('project_name')?.value,
      direction: this.filterForm.get('direction')?.value,
      chainage_start: this.filterForm.get('chainage_start')?.value,
      chainage_end: this.filterForm.get('chainage_end')?.value,
      asset_type: this.filterForm.get('asset_type')?.value,
    }

    this.filterDataShow = dataObj
    this.inventoryReportService.getInventoryReportData(dataObj).subscribe((res)=>{
        // console.log("get data",res);  
      this.inventoryReport = res;
        // console.log("inventoryReport",this.inventoryReport);  
      let summary: any = {};
      // res.forEach((item: any) => {
      //   for (let key in item) {
      //     if (!isNaN(item[key]) && item[key] !== '' && typeof item[key] !== 'string' && key!=='chainage_start' && key!=='chainage_end' && item[key] !== 0 ) {
      //       summary[key] = (summary[key] || 0) + item[key];
      //     }
      //   }

      // });
        let flatData = res.flat();
       flatData.forEach((item: any) => {
          for (let key in item) {
            if (
              !isNaN(item[key]) &&
              item[key] !== '' &&
              typeof item[key] !== 'string' &&
              key !== 'chainage_start' &&
              key !== 'chainage_end' &&
              key !== 'latitude' &&
              key !== 'longitude' &&
              item[key] !== 0
            ) {
              summary[key] = (summary[key] || 0) + item[key];
            }
          }
        });

      this.tableData = summary;  
      //  console.log('Summed Data:', this.tableData);

      })
  }

  resetFilter() {
    this.filterForm.reset();
  }

  excelExport() {
    let filename = 'inventoryReport.xlsx';
    let data = document.getElementById('inventoryReportExport');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(data);
    const wscols = [
      { wpx: 150 }, // Date	
      { wpx: 100 }, // Created By

    ];

    ws['!cols'] = wscols;

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

    XLSX.writeFile(wb, filename);
  }
 
  generatePDF() {
  const doc = new jsPDF();

  // Title - Centered
  doc.setFontSize(18);
  doc.text('Inventory Report', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

  // Project details
  doc.setFontSize(11);
  doc.setTextColor(50);

  const leftX = 14;
  const rightX = 105;
  let y = 25;

  // Format multi-select fields as comma-separated strings
  const projectNames = Array.isArray(this.filterDataShow.project_name) 
    ? this.filterDataShow.project_name.join(', ') 
    : this.filterDataShow.project_name;

  const assetTypes = Array.isArray(this.filterDataShow.asset_type) 
    ? this.filterDataShow.asset_type.join(', ') 
    : this.filterDataShow.asset_type;

  const direction = this.filterDataShow.direction || '';
  const chainage = `Chainage: ${this.filterDataShow.chainage_start} TO ${this.filterDataShow.chainage_end}`;

  // Calculate how many lines each side will take
  const leftText1 = `Project Name: ${projectNames}`;
  const leftLines1 = doc.splitTextToSize(leftText1, 90); // split to max width
  const rightText1 = `Direction: ${direction}`;
  const rightLines1 = doc.splitTextToSize(rightText1, 90);

  const leftText2 = chainage;
  const leftLines2 = doc.splitTextToSize(leftText2, 90);
  const rightText2 = `Asset Type: ${assetTypes}`;
  const rightLines2 = doc.splitTextToSize(rightText2, 90);

  const rowHeight = 6;
  const maxLines1 = Math.max(leftLines1.length, rightLines1.length);
  const maxLines2 = Math.max(leftLines2.length, rightLines2.length);

  // Draw row 1
  for (let i = 0; i < maxLines1; i++) {
    if (leftLines1[i]) doc.text(leftLines1[i], leftX, y);
    if (rightLines1[i]) doc.text(rightLines1[i], rightX, y);
    y += rowHeight;
  }

  // Draw row 2
  for (let i = 0; i < maxLines2; i++) {
    if (leftLines2[i]) doc.text(leftLines2[i], leftX, y);
    if (rightLines2[i]) doc.text(rightLines2[i], rightX, y);
    y += rowHeight;
  }

  // Horizontal line before table
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(14, y, doc.internal.pageSize.getWidth() - 14, y);
  y += 5;

  // Table
  const tableColumns = ['Inventory', `${this.filterDataShow.date}`];
  const tableRows = Object.keys(this.tableData).map(key => [key,this.tableData[key].toFixed(2)]);

  // const tableRows = Object.keys(this.tableData).map(key => [ key, parseFloat(this.tableData[key].toFixed(2)) ]);


  autoTable(doc, {
    head: [tableColumns],
    body: tableRows,
    startY: y + 5,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [100, 100, 255] },
  });

  // doc.save('Inventory_Report.pdf');
}


}
