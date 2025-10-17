import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { ManageAccidentService } from '../manage-accident.service';
import { Accident } from '../accident';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../../shared/common/custom-validators'; 
import { Router } from '@angular/router'
@Component({
  selector: 'app-add-accident',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './add-accident.component.html',
  styleUrl: './add-accident.component.scss'
})
export class AddAccidentComponent {

  accidentForm!: FormGroup;
  prismCode = prismCodeData;

  constructor(private fb: FormBuilder,
      private modalService: NgbModal,
      private toastr: ToastrService,
      private accidentService:ManageAccidentService,
      private router: Router,
      ) {}
  
  ngOnInit(): void {
    this.accidentForm = this.fb.group({
      road_code: ['', [Validators.required,CustomValidators.noWhitespaceValidator()]],
      start_chainage :['',[Validators.required]],
      direction :['',[Validators.required]],
      date_of_accident :['',[Validators.required]],
      day_of_week :['',[Validators.required]],
      time :['',[Validators.required]],
      section_name :['',[Validators.required]],
      police_station :['',[Validators.required]],
      fir_no :['',[Validators.required]],

    })
  }

  onSubmit(): void {
      if (this.accidentForm.invalid)
      {
        this.accidentForm.markAllAsTouched();
        return;
      }
      else{
      let accidentObj:Accident ={ 
        road_code: this.accidentForm.get('road_code')?.value,
        start_chainage: this.accidentForm.get('start_chainage')?.value,
        direction: this.accidentForm.get('direction')?.value,
        date_of_accident: this.accidentForm.get('date_of_accident')?.value,
        day_of_week: this.accidentForm.get('day_of_week')?.value,
        time: this.accidentForm.get('time')?.value,
        section_name: this.accidentForm.get('section_name')?.value,
        police_station: this.accidentForm.get('police_station')?.value,
        fir_no: this.accidentForm.get('fir_no')?.value,
      }
  
        console.log(accidentObj);
      // this.trafficService.addTraffic(trafficObj).subscribe((res)=>{
      //   if(res.status){
      //     this.router.navigate(['/tis/traffic-manage/edit-traffic',res.traffic_info_id]);
      //     this.toastr.success(res.msg, 'RAMS', {
      //       timeOut: 3000,
      //       positionClass: 'toast-top-right',
      //     });
      //         this.trafficForm.reset();
      //   }
      //   else {
      //       this.toastr.error(res.msg, 'RAMS', {
      //         timeOut: 3000,
      //         positionClass: 'toast-top-right',
      //       });
      //     }
      // },
      // (err)=>{
      //   this.toastr.error(err.msg, 'RAMS', {
      //     timeOut: 3000,
      //     positionClass: 'toast-top-right',
      //   });
      // });
      }
        
    }
      

}
