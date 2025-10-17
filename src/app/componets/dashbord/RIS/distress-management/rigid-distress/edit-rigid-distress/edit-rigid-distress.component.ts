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
  selector: 'app-edit-rigid-distress',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './edit-rigid-distress.component.html',
  styleUrl: './edit-rigid-distress.component.scss'
})
export class EditRigidDistressComponent {

  
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
          type_of_rigid_distress: ['', Validators.required],
          cracking_single_distress: [0,[Validators.required]],
          cracking_single_tra: [0,[Validators.required]],
          cracking_single_long: [0,[Validators.required]],
          cracking_multiple_cracks: [0,[Validators.required]],
          cracking_corner_break: [0,[Validators.required]],
          cracking_punchout: [0,[Validators.required]],
          surface_defect_ravelling: [0,[Validators.required]],
          surface_defect_scaling: [0,[Validators.required]],
          surface_defect_polished: [0,[Validators.required]],
          surface_defect_popout: [0,[Validators.required]],
          join_defects_seal: [0,[Validators.required]],
          join_defects_spalling: [0,[Validators.required]],
          join_defects_faulting: [0,[Validators.required]],
          join_defects_blowup: [0,[Validators.required]],
          join_defects_depression: [0,[Validators.required]],
          join_defects_heave: [0,[Validators.required]],
          join_defects_bump: [0,[Validators.required]],
          join_defects_lane: [0,[Validators.required]],
          drainage_pumping: [0,[Validators.required]],
          drainage_ponding: [0,[Validators.required]],
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
            type_of_rigid_distress: this.distressForm.get('type_of_rigid_distress')?.value,
            cracking_single_distress: this.distressForm.get('cracking_single_distress')?.value,
            cracking_single_tra: this.distressForm.get('cracking_single_tra')?.value,
            cracking_single_long: this.distressForm.get('cracking_single_long')?.value,
            cracking_multiple_cracks: this.distressForm.get('cracking_multiple_cracks')?.value,
            cracking_corner_break: this.distressForm.get('cracking_corner_break')?.value,
            cracking_punchout: this.distressForm.get('cracking_punchout')?.value,
            surface_defect_ravelling: this.distressForm.get('surface_defect_ravelling')?.value,
            surface_defect_scaling: this.distressForm.get('surface_defect_scaling')?.value,
            surface_defect_polished: this.distressForm.get('surface_defect_polished')?.value,
            surface_defect_popout: this.distressForm.get('surface_defect_popout')?.value,
            join_defects_seal: this.distressForm.get('join_defects_seal')?.value,
            join_defects_spalling: this.distressForm.get('join_defects_spalling')?.value,
            join_defects_faulting: this.distressForm.get('join_defects_faulting')?.value,
            join_defects_blowup: this.distressForm.get('join_defects_blowup')?.value,
            join_defects_depression: this.distressForm.get('join_defects_depression')?.value,
            join_defects_heave: this.distressForm.get('join_defects_heave')?.value,
            join_defects_bump: this.distressForm.get('join_defects_bump')?.value,
            join_defects_lane: this.distressForm.get('join_defects_lane')?.value,
            drainage_pumping: this.distressForm.get('drainage_pumping')?.value,
            drainage_ponding: this.distressForm.get('drainage_ponding')?.value,
            patching: this.distressForm.get('patching')?.value,
            texture_depth: this.distressForm.get('texture_depth')?.value,
            geometry: this.distressForm.get('geometry')?.value,
            roughness: this.distressForm.get('roughness')?.value,
          } 
    
          // console.log("inspection form details",distressObj);
    
          this.roadService.updateRigidDistress(distressObj,this.distressId).subscribe((res)=>{
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
  
      this.getDistrctList(distress.data[0].state_id)
    
      this.getCitytList(distress.data[0].district_id);
    }
  
    onFileChange(event: Event, controlName: string): void {
      const input = event.target as HTMLInputElement;
    
      if (input.files && input.files.length > 0) {
        const file = input.files[0];
        const formData = new FormData();
        formData.append('table_name','rigid_distress');
        formData.append('record_id',this.distressId);
        formData.append('field_name',controlName);
        formData.append('image',file);
        formData.append('record_id_name','rigid_distress_id');
        
  
        this.roadService.addParticularImage(formData).subscribe((res)=>{
          // console.log(res);
          if(res.status){
            this.ngOnInit()
          }
        })
        // this.inspectionForm.get(controlName)?.setValue(file);
  
      }
    }
  
    delete(filedName:any){
      const formData = new FormData();
      formData.append('table_name','rigid_distress');
      formData.append('record_id',this.distressId);
      formData.append('field_name',filedName);
      formData.append('record_id_name','rigid_distress_id');
     
      this.roadService.deleteInspectionImage(formData).subscribe((res)=>{
        // console.log(res);
        if(res.status){
          this.ngOnInit()
        }
      })
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
        formData.append('table_name','rigid_distress');
        formData.append('record_id',this.distressId);
        formData.append('field_name',controlName);
        formData.append('video',file);
        formData.append('record_id_name','rigid_distress_id');
        
  
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
    formData.append('table_name','rigid_distress');
    formData.append('record_id',this.distressId);
    formData.append('field_name',filedName);
    formData.append('record_id_name','rigid_distress_id');
   
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
