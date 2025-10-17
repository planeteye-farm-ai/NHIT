import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { PavementManageService } from '../../pavement-manage.service'; 
import { homogenousAdd } from '../homogenous';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../../../shared/common/custom-validators'; 
import { Router } from '@angular/router'

@Component({
  selector: 'app-add-homogenous-section',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './add-homogenous-section.component.html',
  styleUrl: './add-homogenous-section.component.scss'
})
export class AddHomogenousSectionComponent {

  homogenousForm!: FormGroup;
  prismCode = prismCodeData;
  stateList:any;
  districtList:any;
  cityList:any;
  roadList:any;
  state_id:any;

  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private pavementService:PavementManageService,
    private router: Router,
    ) {
    
  }

  ngOnInit(): void {
     
    this.homogenousForm = this.fb.group({
      geometry_data_id: ['', [Validators.required]],
      state_id :['',[Validators.required]],
      district_id :['',[Validators.required]],
      city_id :['',[Validators.required]],
      road_code :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      chainage_start :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      chainage_end :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      date_of_survey :['',[Validators.required]],
      
    })
    this.getDropDownData();
  }

  getDropDownData(){
    this.getStateList();
    this.getRoadList();
  }

  getRoadList(){
    this.pavementService.getRoadList().subscribe((res)=>{
        // console.log('Road list ',res)
      this.roadList = res.data;
    })
  }
  getStateList(){
    this.pavementService.getStateList().subscribe((res)=>{
      // console.log('state list ',res)
      this.stateList = res.data;
    })
  }

  getDistrctList(id:any){
    this.state_id=id;
    this.pavementService.getDistrctList(id).subscribe((res) =>{
      this.districtList = res.data;
    })
  }


  getCitytList(id:any){
    this.pavementService.getCitytList(id).subscribe((res) =>{
      // console.log(res)
      this.cityList = res.data;

    })
  }

  onSubmit(): void {
    if (this.homogenousForm.invalid)
    {
      this.homogenousForm.markAllAsTouched();
      return;
    }
    else{
           
    let homogenousObj:homogenousAdd ={ 
   
      geometry_data_id: this.homogenousForm.get('geometry_data_id')?.value,
      state_id: this.homogenousForm.get('state_id')?.value,
      district_id: this.homogenousForm.get('district_id')?.value,
      city_id: this.homogenousForm.get('city_id')?.value,
      road_code: this.homogenousForm.get('road_code')?.value,
      chainage_start: this.homogenousForm.get('chainage_start')?.value,
      chainage_end: this.homogenousForm.get('chainage_end')?.value,
      date_of_survey: this.homogenousForm.get('date_of_survey')?.value,
    }

      // console.log(homogenousObj);
    this.pavementService.addHomogenous(homogenousObj).subscribe((res)=>{
      if(res.status){
        this.router.navigate(['/pms/homogenous-section/edit-homogenous-section',res.pavement_manage_system_id]);
        this.toastr.success(res.msg, 'NHAI RAMS', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
            this.homogenousForm.reset();
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
