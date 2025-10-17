import { Component } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../../shared/common/custom-validators'; 
import { Router } from '@angular/router';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RoadService } from '../road.service';


@Component({
  selector: 'app-view-road',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './view-road.component.html',
  styleUrl: './view-road.component.scss'
})
export class ViewRoadComponent {

  roadForm!: FormGroup;
  prismCode = prismCodeData;
  roadId:any;
  roadData:any;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private roadService:RoadService,
    private router: Router,
    ) { }

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {
      this.roadId = Number(params.get('id'));
      if (this.roadId) {
        this.loadRoadDetails(this.roadId);
      }
     });
     

    this.roadForm = this.fb.group({
      name_of_road:[''],
      road_location:[''],
      type_of_road: [''],
      terrain:[''],
      road_section_no: [''],
      length_of_road: [''],
      roadway_width: [''],
      formation_width: [''],
      carriageway_width: [''],
      shoulder_type_increasing: [''],
      shoulder_type_decreasing: [''],
      shoulder_width_increasing: [''],
      shoulder_width_decreasing: ['']
    });
   
  }

 
  loadRoadDetails(id: number): void {
    this.roadService.getDetailsById(id).subscribe((road: any) => {
      console.log("get road details",road);
      if (road) {
        this.roadData = road.data;
        this.patchValue(road);
      }
    },(err)=>{
      this.toastr.error(err.msg, 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
    });
    
  }

  patchValue(road:any){
    
    this.roadForm.patchValue({
      reportAnyvisualInspection: road.data[0].aesthetics_condition,
      name_of_road: road.data[0].name_of_road,
      road_location: road.data[0].road_location,
      type_of_road: road.data[0].type_of_road,
      terrain: road.data[0].terrain,
      road_section_no: road.data[0].road_section_no,
      length_of_road: road.data[0].length_of_road,
      roadway_width: road.data[0].roadway_width,
      formation_width: road.data[0].formation_width,
      carriageway_width: road.data[0].carriageway_width,
      shoulder_type_increasing: road.data[0].shoulder_type_increasing,
      shoulder_type_decreasing: road.data[0].shoulder_type_decreasing,
      shoulder_width_increasing: road.data[0].shoulder_width_increasing,
      shoulder_width_decreasing: road.data[0].shoulder_width_decreasing
      
    });
  }

}
