import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { RwfisManageService } from '../rwfis-manage.service';
import { RWFIS } from '../rwfis';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../../shared/common/custom-validators'; 
import { Router } from '@angular/router'

@Component({
  selector: 'app-add-rwfis',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './add-rwfis.component.html',
  styleUrl: './add-rwfis.component.scss'
})
export class AddRwfisComponent {

  rwfisForm!: FormGroup;
  prismCode = prismCodeData;
  stateList:any;
  districtList:any;
  cityList:any;
  roadList:any;
  state_id:any;

  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private rwfisService:RwfisManageService,
    private router: Router,
    ) {
    
  }

  ngOnInit(): void {
    this.rwfisForm = this.fb.group({
      state_id:['', [Validators.required]],
      district_id:['', [Validators.required]],
      city_id:['', [Validators.required]],// block
      road_name:['', [Validators.required]],
      road_code:['', [Validators.required,CustomValidators.noWhitespaceValidator()]],
      total_length_km :['',[Validators.required,CustomValidators.numberValidator()]],
      survey_year:['', Validators.required],
      survey_date:['', Validators.required]
    })
    this.getDropDownData();
  }
   
  getDropDownData(){
    this.getStateList();
    this.getRoadList();
  }

  getRoadList(){
    this.rwfisService.getRoadList().subscribe((res)=>{
      this.roadList = res.data;
    })
  }

  getStateList(){
    this.rwfisService.getStateList().subscribe((res) =>{
      this.stateList = res.data
    })
  }

  getDistrctList(id:any){
    this.rwfisService.getDistrctList(id).subscribe((res) =>{
      this.districtList = res.data;
    })
  }

  getCitytList(id:any){
    this.rwfisService.getCitytList(id).subscribe((res) =>{
      this.cityList = res.data;
    })
    console.log(this.cityList)
  }
   onSubmit(): void {
      if (this.rwfisForm.invalid)
      {
        this.rwfisForm.markAllAsTouched();
        return;
      }
      else{
      let rwfisObj:RWFIS ={ 
      state_id: this.rwfisForm.get('state_id')?.value,
      district_id: this.rwfisForm.get('district_id')?.value,
      city_id: this.rwfisForm.get('city_id')?.value,
      road_name: this.rwfisForm.get('road_name')?.value,
      road_code: this.rwfisForm.get('road_code')?.value,
      total_length_km: this.rwfisForm.get('total_length_km')?.value,
      survey_year: this.rwfisForm.get('survey_year')?.value,
      survey_date: this.rwfisForm.get('survey_date')?.value,
      }
        console.log(rwfisObj);
      this.rwfisService.addRwfis(rwfisObj).subscribe((res)=>{
        if(res.status){
          this.router.navigate(['/rwfis/rwfis-manage']);
          this.toastr.success(res.msg, 'NHAI RAMS', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
              this.rwfisForm.reset();
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
