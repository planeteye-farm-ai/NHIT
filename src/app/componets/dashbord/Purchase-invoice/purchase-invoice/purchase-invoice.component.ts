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
import { PurchaseInvoiceService } from '../purchase-invoice.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-purchase-invoice',
  standalone: true,
  imports: [CommonModule,SharedModule,NgSelectModule,NgbPopoverModule,FormsModule,RouterLink,ShowcodeCardComponent],
  templateUrl: './purchase-invoice.component.html',
  styleUrl: './purchase-invoice.component.scss'
})
export class PurchaseInvoiceComponent {

  prismCode = prismCodeData;
  content:any;
  tableData:any;
  selectedId: number | null = null;

  constructor(config: NgbModalConfig, private modalService: NgbModal,private toastr: ToastrService,private purchaseService:PurchaseInvoiceService) {
    
  }

  ngOnInit(): void{
    this.getPurchaseData();
  }

  getPurchaseData() {
    this.purchaseService.getPurcaseInvoiceData().subscribe((res)=>{
      this.tableData = res.data
    })
  }

  open(content: any,id:any) {
    this.selectedId = id;
    this.modalService.open(content);
  }
  
  delete(){
    if(this.selectedId !== null){
      this.purchaseService.deletePurchaseInvoice(this.selectedId).subscribe((res) =>{
        if(res.status){
          this.getPurchaseData();
          this.toastr.success(res.msg, 'NHAI RAMS',{
            timeOut:3000,
            positionClass: 'toast-top-right'
          });
        }else{
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
}
