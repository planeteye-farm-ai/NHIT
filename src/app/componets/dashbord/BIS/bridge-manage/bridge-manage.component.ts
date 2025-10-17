import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../shared/prismData/tables';
import { SharedModule } from '../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {NgbModalConfig} from '@ng-bootstrap/ng-bootstrap';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule} from '@angular/forms';
import {ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { RouterLink } from '@angular/router';
import { BridgeService } from './bridge.service';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { Pipe, PipeTransform } from '@angular/core';
@Component({
  selector: 'app-bridge-manage',
  standalone: true,
  imports: [CommonModule,SharedModule,NgSelectModule,NgbPopoverModule,FormsModule,RouterLink,ShowcodeCardComponent],
  templateUrl: './bridge-manage.component.html',
  styleUrl: './bridge-manage.component.scss',

})
export class BridgeManageComponent {

  prismCode = prismCodeData;
  content:any;
  tableData:any;
  selectedId: number | null = null;
  fileName ="Bridge List.xlsx";
  searchText: string = '';

  constructor(config: NgbModalConfig, private modalService: NgbModal,private toastr: ToastrService,private bridgeService:BridgeService) {
    
  }

  ngOnInit(): void {
    this.getBridgeData();
  }

  filteredTableData(): any[] {
    if (!this.searchText) {
      return this.tableData;
    }
  
    const lowerSearch = this.searchText.toLowerCase();
  
    return this.tableData.filter((item:any) =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(lowerSearch)
      )
    );
  }

  getBridgeData(){
    this.bridgeService.getBridgeData().subscribe((res)=>{
      // console.log(res);
      this.tableData = res.data;
    })
  }
  delete(){
    if (this.selectedId !== null) {
      this.bridgeService.deleteBridge(this.selectedId).subscribe((res)=>{
        // console.log("edelete result",res);
        if(res.status){
          this.getBridgeData();
          this.toastr.success(res.msg, 'NHAI RAMS', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
        }
        else{
          this.toastr.error(res.msg, 'NHAI RAMS', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
        }
      },(err)=>{
        this.toastr.error(err.msg, 'NHAI RAMS', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
      });
      
    }
  }

  open(content: any,id:any) {
    this.selectedId = id;
    this.modalService.open(content);
  }

  excelExport(){
    let data = document.getElementById('bridgeListExport');
  const ws:XLSX.WorkSheet = XLSX.utils.table_to_sheet(data);

  const wscols = [
    { wpx: 150 }, // Bridge Name	
    { wpx: 100 }, // Road Type 
    { wpx: 200 }, // Road/ Highway No
    { wpx: 150 }, // Chainage
    { wpx: 100 }, // Created By
    { wpx: 100 }, // Consultant Name	
    { wpx: 100 }, // No of Span	
    { wpx: 100 }, // Length
    { wpx: 100 },  // Width
    { wpx: 100 },  // Bridge Type	
    { wpx: 100 },  // Age
    { wpx: 100 },  // Date
    { wpx: 100 }  // Time
  ];

  ws['!cols'] = wscols;

  const wb:XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,'Sheet1')

  XLSX.writeFile(wb,this.fileName);
  }
}
