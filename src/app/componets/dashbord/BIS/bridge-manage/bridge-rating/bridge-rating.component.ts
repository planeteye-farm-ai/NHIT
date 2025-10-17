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
import { BridgeService } from '.././bridge.service';
import { Bridge } from '../bridge';

@Component({
  selector: 'app-bridge-rating',
  standalone: true,
  imports: [SharedModule,NgSelectModule,NgbPopoverModule,FormsModule,RouterLink,ShowcodeCardComponent],
  templateUrl: './bridge-rating.component.html',
  styleUrl: './bridge-rating.component.scss'
})
export class BridgeRatingComponent {

  prismCode = prismCodeData;
  content:any;
  tableData:any;
  selectedId: number | null = null;
  bridgeId:any;
  bridgeData:any;
  bridgeName:any;
  
  conditionMap:any = {
    1: "Critical condition",
    2: "Poor condition",
    3: "Fair condition",
    4: "Good condition",
    5: "Excellent condition"
  };

  constructor( private route: ActivatedRoute,config: NgbModalConfig, private modalService: NgbModal,private toastr: ToastrService,private bridgeService:BridgeService){
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
     this.bridgeId = Number(params.get('id'));

    });
    console.log(this.bridgeId);

    this.getBridgeDetailsById()
    this.getRatingData();
  }

  getRatingData(){
    this.bridgeService.getRatingByBridgeId(this.bridgeId).subscribe((res)=>{
      this.tableData = res.data;
      console.log(res.data)
    })
  }

  getBridgeDetailsById(){
    this.bridgeService.getDetailsById(this.bridgeId).subscribe((res) => {
      this.bridgeData = res.data;
      console.log("bridge details",this.bridgeData);
      this.bridgeName = this.bridgeData.popular_name_of_bridge;
    });
  }

  delete(){
    if (this.selectedId !== null) {
      this.bridgeService.deleteRating(this.selectedId).subscribe((res)=>{
        console.log(res)
        if(res.status){
          this.getRatingData();
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
