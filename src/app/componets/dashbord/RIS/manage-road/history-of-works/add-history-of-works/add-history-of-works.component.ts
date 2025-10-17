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
import { RoadService } from '../../road.service';
import { ApiUrl } from '../../../../../../shared/const';

@Component({
  selector: 'app-add-history-of-works',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './add-history-of-works.component.html',
  styleUrl: './add-history-of-works.component.scss'
})
export class AddHistoryOfWorksComponent {

  historyDataForm!: FormGroup;
  prismCode = prismCodeData;
  roadId:any;
  roadData:any;
  roadName:any;
  currentDate:any;
  

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private roadService:RoadService,
    private router: Router,
    
    ) {
      // this.roadForm = this.fb.group({
      //   inspectionItems: this.fb.array([]) // Create an empty FormArray
      // });
      this.currentDate = new Date().toISOString().split('T')[0];
      
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.roadId = Number(params.get('id'));
     });
     
     
    this.historyDataForm = this.fb.group({
      name_of_road: [''],
      road_location: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      type_of_road: ['', Validators.required],
      road_section_no: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      name_of_contractor: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      old_road_length: ['',[Validators.required, CustomValidators.numberValidator()]],
      old_road_width: ['',[Validators.required, CustomValidators.numberValidator()]],
      cons_starting_date: ['', Validators.required],
      cons_ending_date: ['', Validators.required],
      last_routing_inspe_date: ['', Validators.required],
      type_of_last_inspection: ['', Validators.required],
      comments_observations: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      comments_observations_image: ['',[CustomValidators.imageFileValidator()]]
    });
   
    this.getRoadDetailsById();
  }

  onSubmit(): void {
    // const formData: Suggestion = this.historyDataForm.value;
    // console.log('Form submitted:', formData);
    if (this.historyDataForm.invalid)
    {
      this.historyDataForm.markAllAsTouched();
      return;
    }

    else{
      const formData = new FormData();
      formData.append('geometry_data_id',this.roadId);
      formData.append('road_location',this.historyDataForm.get('road_location')?.value);
      formData.append('type_of_road', this.historyDataForm.get('type_of_road')?.value);
      formData.append('road_section_no', this.historyDataForm.get('road_section_no')?.value);
      formData.append('name_of_contractor',this.historyDataForm.get('name_of_contractor')?.value);
      formData.append('old_road_length', this.historyDataForm.get('old_road_length')?.value);
      formData.append('old_road_width', this.historyDataForm.get('old_road_width')?.value);
      formData.append('cons_starting_date', this.historyDataForm.get('cons_starting_date')?.value);
      formData.append('cons_ending_date', this.historyDataForm.get('cons_ending_date')?.value);
      formData.append('last_routing_inspe_date', this.historyDataForm.get('last_routing_inspe_date')?.value);
      formData.append('type_of_last_inspection', this.historyDataForm.get('type_of_last_inspection')?.value);
      formData.append('comments_observations', this.historyDataForm.get('comments_observations')?.value);
      formData.append('comments_observations_image', this.historyDataForm.get('comments_observations_image')?.value);

      console.log("histroy form details",formData);

      this.roadService.addHistoryOfWorks(formData).subscribe((res)=>{
        // console.log(res);
        if(res.status){
          this.router.navigate(['/ris/road-manage/history-of-work',this.roadId]);
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

  getRoadDetailsById(){
    this.roadService.getDetailsById(this.roadId).subscribe((res) => {
      this.roadData = res.data[0];
      console.log("road details inadd history",this.roadData);
      this.roadName = this.roadData.name_of_road;
      if (this.roadData) {
        this.historyDataForm.patchValue({
          name_of_road: this.roadData.name_of_road,
          road_location: this.roadData.road_location,
          type_of_road: this.roadData.type_of_road,
          road_section_no: this.roadData.road_section_no
        });
      }

    });
  }

  onFileChange(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
  
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.historyDataForm.get(controlName)?.setValue(file);
    }
  }


}
