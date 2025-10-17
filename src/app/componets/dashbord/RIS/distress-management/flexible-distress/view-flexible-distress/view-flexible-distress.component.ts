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
  selector: 'app-view-flexible-distress',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './view-flexible-distress.component.html',
  styleUrl: './view-flexible-distress.component.scss'
})
export class ViewFlexibleDistressComponent {
  
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
          type_of_flexible_distress: [''],
          surafce_defects_bleeding: [],
          surafce_defects_smooth: [],
          surafce_defects_streaking: [],
          surafce_defects_hungry: [],
          cracks_hairline: [],
          cracks_alligator: [],
          cracks_longitudinal: [],
          cracks_transverse: [],
          cracks_edge: [],
          cracks_reflection: [],
          deformation_slippage: [],
          deformation_rutting: [],
          deformation_corrugation: [],
          deformation_shoving: [],
          deformation_shallow: [],
          deformation_settlements: [],
          disintegration_stripping: [],
          disintegration_ravelling: [],
          disintegration_potholes: [],
          disintegration_edge_breaking: [],
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
      this.roadService.geFlexibleDistressById(id).subscribe((distress: any) => {
        console.log("get distress details",distress);
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
        geometry_data_id: distress.data[0].name_of_road,
        state_id: distress.data[0].state_name,
        district_id: distress.data[0].district_name,
        city_id: distress.data[0].city_name,
        village: distress.data[0].village,
        chainage_start: distress.data[0].chainage_start,
        chainage_end: distress.data[0].chainage_end,
        type_of_flexible_distress: distress.data[0].type_of_flexible_distress,
        surafce_defects_bleeding: distress.data[0].surafce_defects_bleeding,
        surafce_defects_smooth: distress.data[0].surafce_defects_smooth,
        surafce_defects_streaking: distress.data[0].surafce_defects_streaking,
        surafce_defects_hungry:  distress.data[0].surafce_defects_hungry,
        cracks_hairline: distress.data[0].cracks_hairline,
        cracks_alligator: distress.data[0].cracks_alligator,
        cracks_longitudinal: distress.data[0].cracks_longitudinal,
        cracks_transverse: distress.data[0].cracks_transverse,
        cracks_edge: distress.data[0].cracks_edge,
        cracks_reflection: distress.data[0].cracks_reflection,
        deformation_slippage: distress.data[0].deformation_slippage,
        deformation_rutting: distress.data[0].deformation_rutting,
        deformation_corrugation: distress.data[0].deformation_corrugation,
        deformation_shoving: distress.data[0].deformation_shoving,
        deformation_shallow: distress.data[0].deformation_shallow,
        deformation_settlements: distress.data[0].deformation_settlements,
        disintegration_stripping: distress.data[0].disintegration_stripping,
        disintegration_ravelling: distress.data[0].disintegration_ravelling,
        disintegration_potholes: distress.data[0].disintegration_potholes,
        disintegration_edge_breaking: distress.data[0].disintegration_edge_breaking,
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
