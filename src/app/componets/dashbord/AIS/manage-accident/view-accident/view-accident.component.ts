import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { ManageAccidentService } from '../manage-accident.service';
import { Accident, AccidentEdit } from '../accident';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../../shared/common/custom-validators'; 
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view-accident',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './view-accident.component.html',
  styleUrl: './view-accident.component.scss'
})
export class ViewAccidentComponent {

  accidentForm!: FormGroup;
  prismCode = prismCodeData;
  accidentId:any;
  topTitle:any;

  constructor(private fb: FormBuilder,
        private modalService: NgbModal,
        private toastr: ToastrService,
        private accidentService:ManageAccidentService,
        private route: ActivatedRoute,
        ) {
      
      }

      ngOnInit(): void {
        this.accidentForm = this.fb.group({
        road_code :['',[Validators.required]],
        start_chainage :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
        direction :['',[Validators.required]],
        date_of_accident :['',[Validators.required]],
        day_of_week :['',[Validators.required]],
        time :['',[Validators.required]],
        section_name :['',[Validators.required]],
        police_station :['',[Validators.required]],
        fir_no :['',[Validators.required]],
        name_of_place :['',[Validators.required]],
        accident_spot :['',[Validators.required]],
        longitude :['',[Validators.required,CustomValidators.numberValidator()]],
        latitude :['',[Validators.required,CustomValidators.numberValidator()]],
        area :['',[Validators.required]],
        accident_category :['',[Validators.required]],
        vehicle_involved_no :['',[Validators.required]],
        vehicleInvolved: this.fb.array([]),
  
        collision_type :['',[Validators.required]],
        type_one :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
        type_two :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      
        killed_if_any :[''],
        injured_if_any :[''],
        cause_one :['',[Validators.required]],
        cause_two :['',[Validators.required]],
        cause_three :['',[Validators.required]],
        remarks :['',[Validators.required]],
        })
        this.onNovehicle_involved()
      }

      get vehicleInvolved(): FormArray<FormControl> {
        return this.accidentForm.get('vehicleInvolved') as FormArray<FormControl>;
      }
  
      onNovehicle_involved(): void {
          this.accidentForm.get('vehicle_involved_no')?.valueChanges.subscribe((value: number) => {
            // console.log(value);
            this.adjustvehicleInvolved(value);
          });
      }
  
      adjustvehicleInvolved(count: number): void {
        while (this.vehicleInvolved.length < count) {
          this.vehicleInvolved.push(this.fb.control('', [Validators.required]));
        }
        while (this.vehicleInvolved.length > count) {
          this.vehicleInvolved.removeAt(this.vehicleInvolved.length - 1);
        }
      }
}
