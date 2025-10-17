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
  projectNameList = ["Agra Bypass Road", "Abu Road to Swaroopganj","Borkhedi to Wadner","Chittorgarh to kota","Shivpuri to Jhasi","Kochugaon to Kaljhar-1","Kochugaon to Kaljhar-2","Kaljhar to Patacharkuchi"];
  directionList = ["Increasing", "Decreasing", "Median"];
  assetList =[
    "All",
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
  inventoryArray: any;
  // form!: FormGroup;

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
      project_name: [[]],
      direction: [null],
      chainage_start: [''],
      chainage_end: [''],
      asset_type: [[]],
    });

    
  }


 filterDistress() {
  let dataObj = {
    date: this.filterForm.get('date')?.value,
    project_name: this.filterForm.get('project_name')?.value,
    direction: this.filterForm.get('direction')?.value,
    chainage_start: this.filterForm.get('chainage_start')?.value,
    chainage_end: this.filterForm.get('chainage_end')?.value,
    asset_type: this.filterForm.get('asset_type')?.value,
  };

  this.filterDataShow = dataObj;

  this.inventoryReportService.getInventoryReportData(dataObj).subscribe((res) => {
    // Flattening response
    let flatData = res.flat();

    // Assign to tableData for summary view (if needed)
    this.tableData = flatData;

    // ✅ Create inventoryArray here for use in PDF export
    this.inventoryArray = res;  // Original grouped format (nested arrays)
    
    // Optional: log the parsed structure
    // console.log('Raw Response:', res);
    // console.log('Flattened Table Data:', this.tableData);
    // console.log('Inventory Array for PDF:', this.inventoryArray);
  });
}


  resetFilter() {
    this.filterForm.reset();
  }

  excelExport() {
    let filename = 'inventoryReport.xlsx';
    let data = document.getElementById('inventoryReportExport');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(data);
    const wscols = [
      { wpx: 100 }, // Date	
      { wpx: 100 }, //
      { wpx: 100 }, //
      { wpx: 100 }, //
      { wpx: 100 }, //
      { wpx: 100 }, //

    ];

    ws['!cols'] = wscols;

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

    XLSX.writeFile(wb, filename);
  }
 
generatePDF() {
  // console.log('table',this.inventoryArray);
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text('Inventory Report', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

  // Project Filters Info
  doc.setFontSize(11);
  doc.setTextColor(50);
  const leftX = 14;
  const rightX = 105;
  let y = 25;

  const projectNames = Array.isArray(this.filterDataShow.project_name)
    ? this.filterDataShow.project_name.join(', ')
    : this.filterDataShow.project_name;

  const assetTypes = Array.isArray(this.filterDataShow.asset_type)
    ? this.filterDataShow.asset_type.join(', ')
    : this.filterDataShow.asset_type;

  const direction = this.filterDataShow.direction || '';
  const chainage = `Chainage: ${this.filterDataShow.chainage_start} TO ${this.filterDataShow.chainage_end}`;
   const date = `Date: ${this.filterDataShow.date}`;

  const leftLines1 = doc.splitTextToSize(`Project Name: ${projectNames}`, 90);
  const rightLines1 = doc.splitTextToSize(`Direction: ${direction}`, 90);

  const leftLines2 = doc.splitTextToSize(chainage, 90);
  const rightLines2 = doc.splitTextToSize(`Asset Type: ${assetTypes}`, 90);

  const leftLines3 =  doc.splitTextToSize(date, 90);

  const rowHeight = 6;
  const maxLines1 = Math.max(leftLines1.length, rightLines1.length);
  const maxLines2 = Math.max(leftLines2.length, rightLines2.length);
  const maxLines3 = Math.max(leftLines3.length);

  for (let i = 0; i < maxLines1; i++) {
    if (leftLines1[i]) doc.text(leftLines1[i], leftX, y);
    if (rightLines1[i]) doc.text(rightLines1[i], rightX, y);
    y += rowHeight;
  }

  for (let i = 0; i < maxLines2; i++) {
    if (leftLines2[i]) doc.text(leftLines2[i], leftX, y);
    if (rightLines2[i]) doc.text(rightLines2[i], rightX, y);
    y += rowHeight;
  }

  for (let i = 0; i < maxLines3; i++) {
    if (leftLines3[i]) doc.text(leftLines3[i], leftX, y);
    y += rowHeight;
  }

  doc.setLineWidth(0.5);
  doc.line(14, y, doc.internal.pageSize.getWidth() - 14, y);
  y += 5;

  // Prepare table header and data
  const tableHead = ['Asset Type ', 'Chainage Start', 'Chainage End', 'Latitude', 'Longitude', 'Carriage Type','Lane']; 
  //this.filterDataShow.date
  const tableBody: any[] = [];

  // Assuming `inventoryArray` is your parsed input (array of arrays)
  this.inventoryArray.forEach((records: any[]) => {
  records.forEach((row) => {
    const inventoryName = row.asset_type || 'Unknown';
    // const quantity = row[inventoryName.toLowerCase()] || 0;
    const key = inventoryName.toLowerCase().replace(/\s+/g, '_');
    const quantity = row[key] || 0;

    // Only push rows where any field EXCEPT quantity is > 0
    if (
      parseFloat(row.chainage_start) > 0 ||
      parseFloat(row.chainage_end) > 0 ||
      parseFloat(row.latitude) > 0 ||
      parseFloat(row.longitude) > 0
    ) {
      let inventoryCount:any = 0 ;
        // console.log("inventoryName",inventoryName)
       if(inventoryName == 'Crash Barrier' || inventoryName =='crash_barrier' || inventoryName =='Service Road' || inventoryName =='service_road'){
        inventoryCount =  parseFloat(quantity).toFixed(1)
        
        }else{
          inventoryCount = Math.floor(parseFloat(quantity))
        }
      tableBody.push([
        inventoryName,
        parseFloat(row.chainage_start).toFixed(3),
        parseFloat(row.chainage_end).toFixed(3),
        parseFloat(row.latitude).toFixed(6),
        parseFloat(row.longitude).toFixed(6),
        // Math.floor(parseFloat(quantity)),
        // inventoryCount
        row.carriage_type,
        row.lane,

      ]);
    }
  });
});

  // Render table
  autoTable(doc, {
    head: [tableHead],
    body: tableBody,
    startY: y + 5,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [100, 100, 255] },
  });

  // Save
  doc.save('Inventory_Report.pdf');
}

getValueFromRow(row: any): any {
  const key = (row.asset_type || '').toLowerCase().replace(/ /g, '_');
  return row[key] || 0;
}

changeRange(project_name:any){
  this.filterForm.get('chainage_start')?.setValue(''); 
  this.filterForm.get('chainage_end')?.setValue(''); 
  let type = 'inventory'
  this.inventoryReportService.getProjectRange(project_name,type).subscribe((res)=>{
    const projectData = res.Inventory[project_name];
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

