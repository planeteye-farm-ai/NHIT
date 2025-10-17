import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { PavementManageService } from '../../pavement-manage.service'; 
import { Traffic} from '../traffic'
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../../../shared/common/custom-validators'; 
import { ActivatedRoute, Router } from '@angular/router'


@Component({
  selector: 'app-view-traffic-file',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './view-traffic-file.component.html',
  styleUrl: './view-traffic-file.component.scss'
})
export class ViewTrafficFileComponent {
  trafficForm!: FormGroup;
  prismCode = prismCodeData;
  trafficId:any;
  topTitle:any;
  years: number[] = [];

  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private pavementService:PavementManageService,
    private router: Router,
    private route: ActivatedRoute,
    ) {
    
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.trafficId = Number(params.get('id'));
      if(this.trafficId) {
        console.log(this.trafficId);
        this.loadTrafficDetails(this.trafficId);
      }
    })
    
    this.trafficForm = this.fb.group({
      road_code: [''],
      jurisdiction_code :[''],
      start_chainage :[''],
      end_chainage :[''],
      direction: [''],
      data_identifier:  [''], 
      vehicle_id: [''], 
      vehicle_category: [''],
      year_index: [''],
      year:  [''],
      aadt:  [''],
    })
  }

  loadTrafficDetails(id:number):void{
    this.pavementService.getTrafficDetailsById(id).subscribe((res) => {
      if(res){
        // console.log("fetch result",res.data)
        this.topTitle = res.data[0].road_code;
        this.patchValue(res);
      }
    },(err) =>{
      this.toastr.error(err.msg, 'NHAI RAMS', {
        timeOut:3000,
        positionClass: 'toast-top-right',
      });
    })
  }

  patchValue(traffic:any){
    this.trafficForm.patchValue({
      road_code: traffic.data[0].road_code,
      jurisdiction_code: traffic.data[0].jurisdiction_code,
      start_chainage: traffic.data[0].start_chainage,
      end_chainage: traffic.data[0].end_chainage,
      direction: traffic.data[0].direction,
      data_identifier: traffic.data[0].data_identifier,
      vehicle_id: traffic.data[0].vehicle_id,
      vehicle_category: traffic.data[0].vehicle_category,
      year_index: traffic.data[0].year_index,
      year: traffic.data[0].year,
      aadt: traffic.data[0].aadt,
    })
  }
}
