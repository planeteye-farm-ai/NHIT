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
import { ManageAccidentService } from './manage-accident.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manage-accident',
  standalone: true,
  imports: [CommonModule,SharedModule,NgSelectModule,NgbPopoverModule,FormsModule,RouterLink,ShowcodeCardComponent],
  templateUrl: './manage-accident.component.html',
  styleUrl: './manage-accident.component.scss'
})
export class ManageAccidentComponent {

  prismCode = prismCodeData;
  content:any;
  tableData:any;
  selectedId: number | null = null;

  constructor(config: NgbModalConfig, private modalService: NgbModal,private toastr: ToastrService,private accidentService:ManageAccidentService) {
    
  }

  ngOnInit(): void{
    this.getAccidentData();
  }

  getAccidentData() {
    this.tableData = [
      {
        a_id:1,
        road_code: 'R1234',
        start_chainage: '12345'
      },
    ];
  }
  

  open(content: any,id:any) {
    this.selectedId = id;
    this.modalService.open(content);
  }
  
  delete(){
     
  }

}
