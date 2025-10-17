import { Component } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../shared/prismData/tables';
import { SharedModule } from '../../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {NgbModalConfig} from '@ng-bootstrap/ng-bootstrap';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormsModule} from '@angular/forms';
import {ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RoadService } from '../road.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-history-of-works',
  standalone: true,
  imports: [ CommonModule,SharedModule,NgSelectModule,NgbPopoverModule,FormsModule,RouterLink,ShowcodeCardComponent],
  templateUrl: './history-of-works.component.html',
  styleUrl: './history-of-works.component.scss'
})
export class HistoryOfWorksComponent {

  prismCode = prismCodeData;
  content:any;
  tableData:any;
  selectedId: number | null = null;
  roadId:any;
  roadData:any;
  roadName:any;

  constructor( private route: ActivatedRoute,config: NgbModalConfig, private modalService: NgbModal,private toastr: ToastrService,private roadService:RoadService){
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
     this.roadId = Number(params.get('id'));
    });

    this.getRoadDetailsById()
    this.getHistoryData();
  }

  getHistoryData(){
    this.roadService.getHistoryOfWorksData(this.roadId).subscribe((res)=>{
      this.tableData = res.data;
      console.log(res.data)
    })
  }

  getRoadDetailsById(){
    this.roadService.getDetailsById(this.roadId).subscribe((res) => {
      this.roadData = res.data[0];
      console.log("road details",this.roadData);
      this.roadName = this.roadData.name_of_road;
    });
  }

  delete(){
    if (this.selectedId !== null) {
      this.roadService.deleteHistoryOfWorks(this.selectedId).subscribe((res)=>{
        console.log(res)
        if(res.status){
          this.getHistoryData();
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
}
