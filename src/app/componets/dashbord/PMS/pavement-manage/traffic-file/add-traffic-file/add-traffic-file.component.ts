import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { PavementManageService } from '../../pavement-manage.service'; 
import { Traffic} from '../traffic'
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../../../shared/common/custom-validators'; 
import { Router } from '@angular/router'

@Component({
  selector: 'app-add-traffic-file',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './add-traffic-file.component.html',
  styleUrl: './add-traffic-file.component.scss'
})
export class AddTrafficFileComponent {

  trafficForm!: FormGroup;
  prismCode = prismCodeData;
  years: number[] = [];

  
  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private pavementService:PavementManageService,
    private router: Router,
    ) {
    
  }
  ngOnInit(): void{
    const currentYear = new Date().getFullYear();
      for (let i = currentYear; i >= 2000; i--) {
        this.years.push(i);
      }
    this.trafficForm = this.fb.group({
      road_code: ['', [Validators.required]],
      jurisdiction_code :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      start_chainage :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      end_chainage :['',[Validators.required,,CustomValidators.noWhitespaceValidator()]],
      direction: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      data_identifier:  ['', [Validators.required]], 
      vehicle_id: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]], 
      vehicle_category: ['', [Validators.required]],
      year_index: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      year:  ['', [Validators.required]],
      aadt:  ['',[Validators.required,CustomValidators.noWhitespaceValidator(),CustomValidators.numberValidator]],

    })
  }

  onSubmit(): void {
    //  console.log(this.trafficForm);
    if (this.trafficForm.invalid)
    {
      this.trafficForm.markAllAsTouched();
      return;
    }
    else{
    let trafficObj:Traffic ={ 
      road_code: this.trafficForm.get('road_code')?.value,
      jurisdiction_code: this.trafficForm.get('jurisdiction_code')?.value,
      start_chainage: this.trafficForm.get('start_chainage')?.value,
      end_chainage: this.trafficForm.get('end_chainage')?.value,
      direction: this.trafficForm.get('direction')?.value,
      data_identifier: this.trafficForm.get('data_identifier')?.value,
      vehicle_id: this.trafficForm.get('vehicle_id')?.value,
      vehicle_category: this.trafficForm.get('vehicle_category')?.value,
      year_index: this.trafficForm.get('year_index')?.value,
      year: this.trafficForm.get('year')?.value,
      aadt: this.trafficForm.get('aadt')?.value,
    }

    //  console.log(trafficObj);
    this.pavementService.addTraffic(trafficObj).subscribe((res)=>{
      if(res.status){
        this.router.navigate(['/pms/traffic-file']);
        this.toastr.success(res.msg, 'NHAI RAMS', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
            this.trafficForm.reset();
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
