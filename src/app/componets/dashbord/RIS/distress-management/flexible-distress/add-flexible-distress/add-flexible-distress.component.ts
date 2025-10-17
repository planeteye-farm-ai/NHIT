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

@Component({
  selector: 'app-add-flexible-distress',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './add-flexible-distress.component.html',
  styleUrl: './add-flexible-distress.component.scss'
})
export class AddFlexibleDistressComponent {

  distressForm!: FormGroup;
  prismCode = prismCodeData;
  stateList:any;
  districtList:any;
  cityList:any;
  geometryList:any;
  
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
      console.log(this.geometryList);
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
        chainage_end: this.distressForm.get('chainage_end')?.value
      } 

      // console.log("inspection form details",formData);

      this.roadService.addFlexibleDistress(distressObj).subscribe((res)=>{
        console.log(res);
        if(res.status){
          this.router.navigate(['/ris/road-manage/edit-flexible-distress',res.flexible_distress_id]);
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
    
}
