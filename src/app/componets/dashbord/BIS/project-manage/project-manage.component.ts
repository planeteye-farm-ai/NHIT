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
import { BridgeService } from '../bridge-manage/bridge.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-project-manage',
  standalone: true,
  imports: [CommonModule,SharedModule,NgSelectModule,NgbPopoverModule,FormsModule,RouterLink,ShowcodeCardComponent],
  templateUrl: './project-manage.component.html',
  styleUrl: './project-manage.component.scss'
})
export class ProjectManageComponent {
prismCode = prismCodeData;
  content:any;
  tableData:any;
  selectedId: number | null = null;

  constructor(config: NgbModalConfig, private modalService: NgbModal,private toastr: ToastrService,private bridgeService:BridgeService) {
    
  }

  ngOnInit(): void {
    this.getProjectData();
  }
 
  getProjectData(){
    // this.bridgeService.getBridgeData().subscribe((res)=>{
    //   // console.log(res);
    //   this.tableData = res.data;
    // })
    this.tableData = [{projectname:"Krishnagiri Thoppur",projectId:"L&T KTTL",noOfPackage:"2",structureType:"MJB",midChainage:"42+000",date:"2024-12-24"},
      {projectname:"AP04-Jadcherla Kothakota",projectId:"L&T WATL",noOfPackage:"1",structureType:"MNB",midChainage:"72+000",date:"2024-12-24"},
      {projectname:"Vadodara Bharuch",projectId:"L&T VBTL",noOfPackage:"3",structureType:"BC",midChainage:"112+000",date:"2024-12-24"},
      {projectname:"Panipat Elevated Corridor",projectId:"L&T PECL",noOfPackage:"1",structureType:"HPC",midChainage:"114+000",date:"2024-12-24"},
      {projectname:"Ahmedabad-Viramgam-Maliya",projectId:"L&T AMTL",noOfPackage:"2",structureType:"FO",midChainage:"42+000",date:"2024-12-24"},
      {projectname:"Rajkot-Jamnagar-Vadinar",projectId:"L&T RVTL",noOfPackage:"2",structureType:"FOB",midChainage:"42+000",date:"2024-12-24"},
      {projectname:"Halol-Godhra-Shamlaji",projectId:"L&T HSTL",noOfPackage:"1",structureType:"VUP",midChainage:"52+000",date:"2024-12-24"},
      {projectname:"Krishnagiri Walajahpet",projectId:"L&T KWTL",noOfPackage:"3",structureType:"MNB",midChainage:"62+000",date:"2024-12-24"},
      {projectname:"Samakhiali Gandhidham",projectId:"L&T SGTL",noOfPackage:"1",structureType:"HPC",midChainage:"49+000",date:"2024-12-24"},
      {projectname:"Devihalli Hasan",projectId:"L&T DHTL",noOfPackage:"2",structureType:"VUP",midChainage:"42+000",date:"2024-12-24"},
      {projectname:"Beawar-Pali-Pindwara",projectId:"L&T BPPTL",noOfPackage:"4",structureType:"BC",midChainage:"42+000",date:"2024-12-24"},
      {projectname:"Sangareddy - MH/KNT Border",projectId:"L&T DTL",noOfPackage:"2",structureType:"MNB",midChainage:"114+000",date:"2024-12-24"},
      {projectname:"Sambalpur - Rourkela",projectId:"L&T SRTL",noOfPackage:"4",structureType:"FOB",midChainage:"114+000",date:"2024-12-24"},
      {projectname:"Palanpur-Swaroopgan",projectId:"L&T IRCL",noOfPackage:"1",structureType:"FOB",midChainage:"114+000",date:"2024-12-24"},
      {projectname:"Coimbatore Bypass",projectId:"L&T TIL",noOfPackage:"3",structureType:"VUP",midChainage:"114+000",date:"2024-12-24"},

    ]
  }
  delete(){
    if (this.selectedId !== null) {
      this.bridgeService.deleteBridge(this.selectedId).subscribe((res)=>{
        // console.log("edelete result",res);
        if(res.status){
          this.getProjectData();
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
