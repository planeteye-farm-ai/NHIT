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
import { InventoryManagementService } from '../inventory-management.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventory-management',
  standalone: true,
  imports: [CommonModule,SharedModule,NgSelectModule,NgbPopoverModule,FormsModule,RouterLink,ShowcodeCardComponent],
  templateUrl: './inventory-management.component.html',
  styleUrl: './inventory-management.component.scss'
})
export class InventoryManagementComponent {

    prismCode = prismCodeData;
    content:any;
    tableData:any;
    selectedId: number | null = null;
  
    constructor(config: NgbModalConfig, private modalService: NgbModal,private toastr: ToastrService,private inventoryService:InventoryManagementService) {
      
    }

    ngOnInit(): void{
      this.getInventoryData();
    }
  
    getInventoryData() {
      this.inventoryService.getEquipmentData().subscribe((res) => {
        this.tableData = res.data
       })
    }
    
    open(content: any,id:any) {
      this.selectedId = id;
      this.modalService.open(content);
    }
    delete(){
      if(this.selectedId !== null){
        this.inventoryService.deleteEquipment(this.selectedId).subscribe((res) =>{
          if(res.status){
            this.getInventoryData();
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
