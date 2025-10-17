import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../shared/prismData/tables';
import { SharedModule } from '../../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {NgbModalConfig} from '@ng-bootstrap/ng-bootstrap';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule} from '@angular/forms';
import {ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { ActivatedRoute, Router,RouterLink } from '@angular/router'
import { MaterialManagementService } from '../../material-management.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-material-stock',
  standalone: true,
  imports: [CommonModule,SharedModule,NgSelectModule,NgbPopoverModule,FormsModule,RouterLink,ShowcodeCardComponent],
  templateUrl: './material-stock.component.html',
  styleUrl: './material-stock.component.scss'
})
export class MaterialStockComponent {

  prismCode = prismCodeData;
  content:any;
  tableData:any;
  selectedId: number | null = null;
  pid:any;

  constructor(config: NgbModalConfig, private modalService: NgbModal,private toastr: ToastrService,private materialService:MaterialManagementService, private router: Router,
    private route: ActivatedRoute,) {
      
  }
  
  ngOnInit(): void{
    this.route.paramMap.subscribe(params => {
      this.pid = Number(params.get('id'));
      if (this.pid) {
        this.getMaterialStockData(this.pid);
      }
    });
  }

  getMaterialStockData(id:number) {
   this.materialService.getMaterialStock(id).subscribe((res) => {
    this.tableData = res.data;
   })
  }

  open(content: any,id:any) {
    this.selectedId = id;
    this.modalService.open(content);
  }

}
