import { Component } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../../../shared/common/custom-validators'; 
import { Router } from '@angular/router';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RoadService } from '../../../manage-road/road.service';
import { ApiUrl } from '../../../../../../shared/const';

@Component({
  selector: 'app-view-rigid-distress',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './view-rigid-distress.component.html',
  styleUrl: './view-rigid-distress.component.scss'
})
export class ViewRigidDistressComponent {

   
      distressForm!: FormGroup;
        prismCode = prismCodeData;
        stateList:any;
        districtList:any;
        cityList:any;
        geometryList:any;
        distressId:any;
        distressData:any;
        urlLive = ApiUrl.API_URL_fOR_iMAGE;
    
        constructor(
          private route: ActivatedRoute,
          private fb: FormBuilder,
          private modalService: NgbModal,
          private toastr: ToastrService,
          private roadService:RoadService,
          private router: Router,
        ) {}
        
        ngOnInit(): void {
    
          this.distressForm = this.fb.group({
            geometry_data_id: [''],
            state_id: [''],
            district_id: [''],
            city_id: [''],
            village: [''],
            chainage_start: [''],
            chainage_end: [''],
            type_of_rigid_distress: [''],
            cracking_single_distress: [],
            cracking_single_tra: [],
            cracking_single_long: [],
            cracking_multiple_cracks: [],
            cracking_corner_break: [],
            cracking_punchout: [],
            surface_defect_ravelling: [],
            surface_defect_scaling: [],
            surface_defect_polished: [],
            surface_defect_popout: [],
            join_defects_seal: [],
            join_defects_spalling: [],
            join_defects_faulting: [],
            join_defects_blowup: [],
            join_defects_depression: [],
            join_defects_heave: [],
            join_defects_bump: [],
            join_defects_lane: [],
            drainage_pumping: [],
            drainage_ponding: [],
            patching: [],
            texture_depth: [],
            geometry: [],
            roughness: [],
          });
         
          this.route.paramMap.subscribe(params => {
            this.distressId = Number(params.get('id'));
            // console.log("bridge id in add",this.inspectionId)
            if (this.distressId) {
              this.loadBridgeDetails(this.distressId);
            }
          });
         
    
        }
      
      
    
        loadBridgeDetails(id: number): void {
          this.roadService.geRigidDistressById(id).subscribe((distress: any) => {
            // console.log("get distress details",distress);
            if (distress) {
              this.distressData = distress.data[0];
              this.patchValue(distress);
            }
          },(err)=>{
            this.toastr.error(err.msg, 'NHAI RAMS', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
            });
          });
          
        }
    
      patchValue(distress:any){
        this.distressForm.patchValue({
          geometry_data_id: distress.data[0].geometry_data_id,
          state_id: distress.data[0].state_id,
          district_id: distress.data[0].district_id,
          city_id: distress.data[0].city_id,
          village: distress.data[0].village,
          chainage_start: distress.data[0].chainage_start,
          chainage_end: distress.data[0].chainage_end,
          type_of_rigid_distress: distress.data[0].type_of_rigid_distress,
          cracking_single_distress: distress.data[0].cracking_single_distress,
          cracking_single_tra: distress.data[0].cracking_single_tra,
          cracking_single_long: distress.data[0].cracking_single_long,
          cracking_multiple_cracks:  distress.data[0].cracking_multiple_cracks,
          cracking_corner_break: distress.data[0].cracking_corner_break,
          cracking_punchout: distress.data[0].cracking_punchout,
          surface_defect_ravelling: distress.data[0].surface_defect_ravelling,
          surface_defect_scaling: distress.data[0].surface_defect_scaling,
          surface_defect_polished: distress.data[0].surface_defect_polished,
          surface_defect_popout: distress.data[0].surface_defect_popout,
          join_defects_seal: distress.data[0].join_defects_seal,
          join_defects_spalling: distress.data[0].join_defects_spalling,
          join_defects_faulting: distress.data[0].join_defects_faulting,
          join_defects_blowup: distress.data[0].join_defects_blowup,
          join_defects_depression: distress.data[0].join_defects_depression,
          join_defects_heave: distress.data[0].join_defects_heave,
          join_defects_bump: distress.data[0].join_defects_bump,
          join_defects_lane: distress.data[0].join_defects_lane,
          drainage_pumping: distress.data[0].drainage_pumping,
          drainage_ponding: distress.data[0].drainage_ponding,
          patching: distress.data[0].patching,
          texture_depth: distress.data[0].texture_depth,
          geometry: distress.data[0].geometry,
          roughness: distress.data[0].roughness,
        });
    
        
      }
    
    
      downloadImage(fieldName: string): void {
        const imageUrl = `${this.urlLive}/upload/inspection_images/${this.distressData[fieldName]}`;    
        const anchor = document.createElement('a');
        anchor.href = imageUrl;
        anchor.download = ''; // Let the browser decide the file name
        anchor.target = '_blank'; // Optional: Open in a new tab if needed
    
        anchor.click();
    
        anchor.remove();
    }

}
