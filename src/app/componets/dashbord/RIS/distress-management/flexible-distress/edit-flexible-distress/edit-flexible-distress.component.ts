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
  selector: 'app-edit-flexible-distress',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './edit-flexible-distress.component.html',
  styleUrl: './edit-flexible-distress.component.scss'
})
export class EditFlexibleDistressComponent {

  distressForm!: FormGroup;
    prismCode = prismCodeData;
    stateList:any;
    districtList:any;
    cityList:any;
    geometryList:any;
    distressId:any;
    distressData:any;
    urlLive = ApiUrl.API_URL_fOR_iMAGE;
    videoSpeenerShow = false;

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
        geometry_data_id: ['', Validators.required],
        state_id: ['', Validators.required],
        district_id: ['', Validators.required],
        city_id: ['', Validators.required],
        village: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
        chainage_start: ['',[Validators.required, CustomValidators.numberValidator()]],
        chainage_end: ['',[Validators.required, CustomValidators.numberValidator()]],
        type_of_flexible_distress: ['', Validators.required],
        surafce_defects_bleeding: [0,[Validators.required]],
        surafce_defects_smooth: [0,[Validators.required]],
        surafce_defects_streaking: [0,[Validators.required]],
        surafce_defects_hungry: [0,[Validators.required]],
        cracks_hairline: [0,[Validators.required]],
        cracks_alligator: [0,[Validators.required]],
        cracks_longitudinal: [0,[Validators.required]],
        cracks_transverse: [0,[Validators.required]],
        cracks_edge: [0,[Validators.required]],
        cracks_reflection: [0,[Validators.required]],
        deformation_slippage: [0,[Validators.required]],
        deformation_rutting: [0,[Validators.required]],
        deformation_corrugation: [0,[Validators.required]],
        deformation_shoving: [0,[Validators.required]],
        deformation_shallow: [0,[Validators.required]],
        deformation_settlements: [0,[Validators.required]],
        disintegration_stripping: [0,[Validators.required]],
        disintegration_ravelling: [0,[Validators.required]],
        disintegration_potholes: [0,[Validators.required]],
        disintegration_edge_breaking: [0,[Validators.required]],
        patching: [0,[Validators.required]],
        texture_depth: [0,[Validators.required]],
        geometry: [0,[Validators.required]],
        roughness: [0,[Validators.required]],
      });
     
      this.route.paramMap.subscribe(params => {
        this.distressId = Number(params.get('id'));
        // console.log("bridge id in add",this.inspectionId)
        if (this.distressId) {
          this.loadBridgeDetails(this.distressId);
        }
      });
      this.getStateList();
      this.getGeometryList();

    }
  
    getStateList(){
      this.roadService.getStateList().subscribe((res)=>{
        this.stateList = res.data;
      })
    }
    getDistrctList(id:any){
      this.roadService.getDistrctList(id).subscribe((res) =>{
        this.districtList = res.data;
      })
    }
  
    getCitytList(id:any){
      this.roadService.getCitytList(id).subscribe((res) =>{
        this.cityList = res.data;
      })
    }
  
    getGeometryList(){
      this.roadService.getGeometryList().subscribe((res) =>{
        this.geometryList = res.data;
        // console.log(this.geometryList);
      })
    }
  
    onSubmit(): void {
      // const formData: Suggestion = this.roadForm.value;
      // console.log('Form submitted:', formData);
      if (this.distressForm.invalid)
      {
        this.distressForm.markAllAsTouched();
        return;
      }
  
      else{
        let distressObj:any ={ 
          geometry_data_id: this.distressForm.get('geometry_data_id')?.value,
          state_id: this.distressForm.get('state_id')?.value,
          district_id: this.distressForm.get('district_id')?.value,
          city_id: this.distressForm.get('city_id')?.value,
          village: this.distressForm.get('village')?.value,
          chainage_start: this.distressForm.get('chainage_start')?.value,
          chainage_end: this.distressForm.get('chainage_end')?.value,
          type_of_flexible_distress: this.distressForm.get('type_of_flexible_distress')?.value,
          surafce_defects_bleeding: this.distressForm.get('surafce_defects_bleeding')?.value,
          surafce_defects_smooth: this.distressForm.get('surafce_defects_smooth')?.value,
          surafce_defects_streaking: this.distressForm.get('surafce_defects_streaking')?.value,
          surafce_defects_hungry: this.distressForm.get('surafce_defects_hungry')?.value,
          cracks_hairline: this.distressForm.get('cracks_hairline')?.value,
          cracks_alligator: this.distressForm.get('cracks_alligator')?.value,
          cracks_longitudinal: this.distressForm.get('cracks_longitudinal')?.value,
          cracks_transverse: this.distressForm.get('cracks_transverse')?.value,
          cracks_edge: this.distressForm.get('cracks_edge')?.value,
          cracks_reflection: this.distressForm.get('cracks_reflection')?.value,
          deformation_slippage: this.distressForm.get('deformation_slippage')?.value,
          deformation_rutting: this.distressForm.get('deformation_rutting')?.value,
          deformation_corrugation: this.distressForm.get('deformation_corrugation')?.value,
          deformation_shoving: this.distressForm.get('deformation_shoving')?.value,
          deformation_shallow: this.distressForm.get('deformation_shallow')?.value,
          deformation_settlements: this.distressForm.get('deformation_settlements')?.value,
          disintegration_stripping: this.distressForm.get('disintegration_stripping')?.value,
          disintegration_ravelling: this.distressForm.get('disintegration_ravelling')?.value,
          disintegration_potholes: this.distressForm.get('disintegration_potholes')?.value,
          disintegration_edge_breaking: this.distressForm.get('disintegration_edge_breaking')?.value,
          patching: this.distressForm.get('patching')?.value,
          texture_depth: this.distressForm.get('texture_depth')?.value,
          geometry: this.distressForm.get('geometry')?.value,
          roughness: this.distressForm.get('roughness')?.value,
        } 
  
        // console.log("inspection form details",distressObj);
  
        this.roadService.updateFlexibleDistress(distressObj,this.distressId).subscribe((res)=>{
          // console.log(res);
          if(res.status){
            this.loadBridgeDetails(this.distressId);
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

  loadBridgeDetails(id: number): void {
    this.roadService.geFlexibleDistressById(id).subscribe((distress: any) => {
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

    this.getDistrctList(distress.data[0].state_id)
  
    this.getCitytList(distress.data[0].district_id);
  }

  onFileChange(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      console.log(this.videoSpeenerShow)
      const file = input.files[0];
      const formData = new FormData();
      formData.append('table_name','flexible_distress');
      formData.append('record_id',this.distressId);
      formData.append('field_name',controlName);
      formData.append('image',file);
      formData.append('record_id_name','flexible_distress_id');
      

      this.roadService.addParticularImage(formData).subscribe((res)=>{
        // console.log(res);
        if(res.status){
          this.videoSpeenerShow = false;
          this.ngOnInit()
          // this.toastr.success(res.msg, 'NHAI RAMS', {
          //   timeOut: 3000,
          //   positionClass: 'toast-top-right',
          // });
        }
        else{
          // this.toastr.error(res.msg, 'NHAI RAMS', {
          //   timeOut: 3000,
          //   positionClass: 'toast-top-right',
          // });
        }
      },(err)=>{
        // this.toastr.error(err.msg, 'NHAI RAMS', {
        //   timeOut: 3000,
        //   positionClass: 'toast-top-right',
        // });
      });
      // this.inspectionForm.get(controlName)?.setValue(file);

    }
  }

  delete(filedName:any){
    const formData = new FormData();
    formData.append('table_name','flexible_distress');
    formData.append('record_id',this.distressId);
    formData.append('field_name',filedName);
    formData.append('record_id_name','flexible_distress_id');
   
      this.roadService.deleteInspectionImage(formData).subscribe((res)=>{
        // console.log(res);
        if(res.status){
          this.ngOnInit()
          // this.toastr.success(res.msg, 'NHAI RAMS', {
          //   timeOut: 3000,
          //   positionClass: 'toast-top-right',
          // });
        }  
        // else{
        //   this.toastr.error(res.msg, 'NHAI RAMS', {
        //     timeOut: 3000,
        //     positionClass: 'toast-top-right',
        //   });
        // }
    },(err)=>{
      // this.toastr.error(err.msg, 'NHAI RAMS', {
      //   timeOut: 3000,
      //   positionClass: 'toast-top-right',
      // });
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

addVideo(event: Event, controlName: string): void {
  const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.videoSpeenerShow = true; 
      const file = input.files[0];
      const formData = new FormData();
      formData.append('table_name','flexible_distress');
      formData.append('record_id',this.distressId);
      formData.append('field_name',controlName);
      formData.append('video',file);
      formData.append('record_id_name','flexible_distress_id');
      

      this.roadService.addDistressVideo(formData).subscribe((res)=>{
        console.log(res);
        if(res.status){
          this.ngOnInit()
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
      // this.inspectionForm.get(controlName)?.setValue(file);

    }
}

deleteVideo(filedName:any){
  const formData = new FormData();
  formData.append('table_name','flexible_distress');
  formData.append('record_id',this.distressId);
  formData.append('field_name',filedName);
  formData.append('record_id_name','flexible_distress_id');
 
  this.roadService.deleteDistressVideo(formData).subscribe((res)=>{
    // console.log(res);
      if(res.status){
        this.ngOnInit()
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
