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
import { ActivatedRoute, Router } from '@angular/router'

@Component({
  selector: 'app-edit-accident',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './edit-accident.component.html',
  styleUrl: './edit-accident.component.scss'
})
export class EditAccidentComponent {

  accidentForm!: FormGroup;
  prismCode = prismCodeData;
  accidentId:any;
  topTitle:any;

   constructor(private fb: FormBuilder,
      private modalService: NgbModal,
      private toastr: ToastrService,
      private accidentService:ManageAccidentService,
      private router: Router,
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
      collisionTypeNo: this.fb.array([]),

      killed_if_any :[''],
      injured_if_any :[''],
      cause_one :['',[Validators.required]],
      cause_two :['',[Validators.required]],
      cause_three :['',[Validators.required]],
      remarks :['',[Validators.required]],
      })

      this.onNovehicle_involved();
      this.oncollisionType();
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

    get collisionTypeNo(): FormArray<FormControl> {
      return this.accidentForm.get('collisionTypeNo') as FormArray<FormControl>;
    }

    oncollisionType(): void {
        this.accidentForm.get('collision_type')?.valueChanges.subscribe((value: number) => {
          this.adjustoncollisionType(value);
        });
    }

    adjustoncollisionType(count: number): void {
      while (this.collisionTypeNo.length < count) {
        this.collisionTypeNo.push(this.fb.control('', [Validators.required,CustomValidators.noWhitespaceValidator()]));
      }
      while (this.collisionTypeNo.length > count) {
        this.collisionTypeNo.removeAt(this.collisionTypeNo.length - 1);
      }
    }
    onSubmit(): void {

    }

}
