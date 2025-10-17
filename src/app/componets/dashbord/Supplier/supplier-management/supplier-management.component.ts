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
import { SupplierManagementService } from '../supplier-management.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-supplier-management',
  standalone: true,
  imports: [CommonModule,SharedModule,NgSelectModule,NgbPopoverModule,FormsModule,RouterLink,ShowcodeCardComponent],
  templateUrl: './supplier-management.component.html',
  styleUrl: './supplier-management.component.scss'
})
export class SupplierManagementComponent {

  prismCode = prismCodeData;
      content:any;
      tableData:any;
      selectedId: number | null = null;
    
      constructor(config: NgbModalConfig, private modalService: NgbModal,private toastr: ToastrService,private supplierService:SupplierManagementService) {
        
      }
        
    ngOnInit(): void{
      this.getSupplierData();
    }
  
    getSupplierData() {
       this.supplierService.getSupplierData().subscribe((res) => {
        this.tableData = res.data
        // console.log(this.tableData)
       })
    }
    
    open(content: any,id:any) {
      this.selectedId = id;
      this.modalService.open(content);
    }
    
    delete(){
      if(this.selectedId !== null){
        this.supplierService.deleteSupplier(this.selectedId).subscribe((res) =>{
          if(res.status){
            this.getSupplierData();
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
