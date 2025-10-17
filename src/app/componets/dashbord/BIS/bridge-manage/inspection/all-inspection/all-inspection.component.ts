import { Component,ViewChild, ElementRef } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../../shared/prismData/tables';
import { SharedModule } from '../../../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {NgbModalConfig} from '@ng-bootstrap/ng-bootstrap';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormsModule} from '@angular/forms';
import {ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BridgeService } from '../.././bridge.service';
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { ApiUrl } from '../../../../../../shared/const';
@Component({
  selector: 'app-all-inspection',
  standalone: true,
  imports: [SharedModule,NgSelectModule,NgbPopoverModule,FormsModule,RouterLink,ShowcodeCardComponent],
  templateUrl: './all-inspection.component.html',
  styleUrl: './all-inspection.component.scss'
})
export class AllInspectionComponent {

      urlLive = ApiUrl.API_URL_fOR_iMAGE;
      prismCode = prismCodeData;
      content:any;
      tableData:any;
      selectedId: number | null = null;
      bridgeId:any;
      bridgeData:any;
      bridgeName:any;
      fileName:any;
      insepectionData:any
      constructor( private route: ActivatedRoute,config: NgbModalConfig, private modalService: NgbModal,private toastr: ToastrService,private bridgeService:BridgeService){
      }

      
  ngOnInit(): void {
    this.getAllInspectionDetails()
  }

  getAllInspectionDetails(){
    this.bridgeService.getAllInspectionDetails().subscribe((res)=>{
      this.tableData = res.data;
      this.fileName = `All Inspection List.xlsx`;
      //  console.log(res.data)
    })
  }


  open(content: any,id:any) {
      this.selectedId = id;
      this.modalService.open(content);
    }
  
     excelExport(){
      let data = document.getElementById('inspectionListExport');
      const ws:XLSX.WorkSheet = XLSX.utils.table_to_sheet(data);
      const wscols = [
        { wpx: 200 }, // Name of bridge	
        { wpx: 150 }, // Date	
        { wpx: 100 }, // Created By
        { wpx: 200 }, // Duration
      ];
    
      ws['!cols'] = wscols;
    
      const wb:XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb,ws,'Sheet1')
    
      XLSX.writeFile(wb,this.fileName);
      }
  
}
