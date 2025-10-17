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
  selector: 'app-edit-road',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './edit-road.component.html',
  styleUrl: './edit-road.component.scss'
})
export class EditRoadComponent {

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
    ) {
      // this.roadForm = this.fb.group({
      //   inspectionItems: this.fb.array([]) // Create an empty FormArray
      // });

      
  }

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {
      this.roadId = Number(params.get('id'));
      if (this.roadId) {
        this.loadRoadDetails(this.roadId);
      }
     });
     

    this.roadForm = this.fb.group({
      name_of_road:['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      road_location:['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      type_of_road: ['', Validators.required],
      terrain:['', Validators.required],
      road_section_no: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      length_of_road: ['',[Validators.required, CustomValidators.numberValidator()]],
      roadway_width: ['',[Validators.required, CustomValidators.numberValidator()]],
      formation_width: ['',[Validators.required, CustomValidators.numberValidator()]],
      carriageway_width: ['',[Validators.required, CustomValidators.numberValidator()]],
      shoulder_type_increasing: ['', Validators.required],
      shoulder_type_decreasing: ['', Validators.required],
      shoulder_width_increasing: ['',[Validators.required, CustomValidators.numberValidator()]],
      shoulder_width_decreasing: ['',[Validators.required, CustomValidators.numberValidator()]]
    });
   
  }

  onSubmit(): void {
    // const formData: Suggestion = this.roadForm.value;
    // console.log('Form submitted:', formData);
    if (this.roadForm.invalid)
    {
      this.roadForm.markAllAsTouched();
      return;
    }

    else{
      let bridgeObj:any ={ 
        name_of_road: this.roadForm.get('name_of_road')?.value,
        road_location: this.roadForm.get('road_location')?.value,
        type_of_road: this.roadForm.get('type_of_road')?.value,
        terrain: this.roadForm.get('terrain')?.value,
        road_section_no: this.roadForm.get('road_section_no')?.value,
        length_of_road: this.roadForm.get('length_of_road')?.value,
        roadway_width: this.roadForm.get('roadway_width')?.value,
        formation_width: this.roadForm.get('formation_width')?.value,
        carriageway_width: this.roadForm.get('carriageway_width')?.value,
        shoulder_type_increasing: this.roadForm.get('shoulder_type_increasing')?.value,
        shoulder_width_increasing: this.roadForm.get('shoulder_width_increasing')?.value,
        shoulder_type_decreasing: this.roadForm.get('shoulder_type_decreasing')?.value,
        shoulder_width_decreasing: this.roadForm.get('shoulder_width_decreasing')?.value,
      } 

      // console.log("inspection form details",formData);

      this.roadService.updateRoad(bridgeObj,this.roadId).subscribe((res)=>{
        // console.log(res);
        if(res.status){
         this.loadRoadDetails(this.roadId);
          this.toastr.success(res.msg, 'NHAI RAMS', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
              // this.bridgeForm.reset();
        }
        else {
            this.toastr.error(res.msg, 'NHAI RAMS', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
            });
        }
      },
    (err)=>{
      this.toastr.error(err.msg, 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
    });    
  }   
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
