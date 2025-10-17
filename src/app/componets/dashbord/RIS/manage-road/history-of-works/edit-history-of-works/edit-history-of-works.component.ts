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
  selector: 'app-edit-history-of-works',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './edit-history-of-works.component.html',
  styleUrl: './edit-history-of-works.component.scss'
})
export class EditHistoryOfWorksComponent {

  historyDataForm!: FormGroup;
  prismCode = prismCodeData;
  historyId:any;
  roadData:any;
  roadName:any;
  historyData:any;
  currentDate:any;
  urlLive = ApiUrl.API_URL_fOR_iMAGE;


  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private roadService:RoadService,
    private router: Router,
    ) {
      this.currentDate = new Date().toISOString().split('T')[0];
      // this.roadForm = this.fb.group({
      //   inspectionItems: this.fb.array([]) // Create an empty FormArray
      // });
      
  }

  ngOnInit(): void {
     
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
    });
   
    this.route.paramMap.subscribe(params => {
      this.historyId = Number(params.get('id'));
      // console.log("bridge id in add",this.inspectionId)
      if (this.historyId) {
        this.loadBridgeDetails(this.historyId);
      }
    });
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
      let historyObj:any ={ 
        road_location:this.historyDataForm.get('road_location')?.value,
        type_of_road: this.historyDataForm.get('type_of_road')?.value,
        road_section_no: this.historyDataForm.get('road_section_no')?.value,
        name_of_contractor: this.historyDataForm.get('name_of_contractor')?.value,
        old_road_length: this.historyDataForm.get('old_road_length')?.value,
        old_road_width: this.historyDataForm.get('old_road_width')?.value,
        cons_starting_date: this.historyDataForm.get('cons_starting_date')?.value,
        cons_ending_date: this.historyDataForm.get('cons_ending_date')?.value,
        last_routing_inspe_date: this.historyDataForm.get('last_routing_inspe_date')?.value,
        type_of_last_inspection: this.historyDataForm.get('type_of_last_inspection')?.value,
        comments_observations: this.historyDataForm.get('comments_observations')?.value,
      } 

      // console.log("inspection form details",formData);

      this.roadService.updateHistoryOfWorks(historyObj,this.historyId).subscribe((res)=>{
        console.log(res);
        if(res.status){
          this.loadBridgeDetails(this.historyId);
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
    this.roadService.getHistoryDataById(id).subscribe((history: any) => {
      console.log("get history details",history);
      if (history) {
        this.historyData = history.data[0];
        this.patchValue(history);
      }
    },(err)=>{
      this.toastr.error(err.msg, 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
    });
    
  }

  patchValue(history:any){
    this.historyDataForm.patchValue({
      name_of_road : history.data[0].name_of_road !== "" ? history.data[0].name_of_road : history.data[0].geometry_name_of_road,
      road_location: history.data[0].road_location !== "" ? history.data[0].road_location : history.data[0].geometry_road_location,
      type_of_road: history.data[0].type_of_road !== "" ? history.data[0].type_of_road : history.data[0].geometry_type_of_road,
      road_section_no: history.data[0].road_section_no !== "" ? history.data[0].road_section_no : history.data[0].geometry_road_section_no,
      name_of_contractor: history.data[0].name_of_contractor,
      old_road_length: history.data[0].old_road_length,
      old_road_width: history.data[0].old_road_width,
      cons_starting_date: history.data[0].cons_starting_date,
      cons_ending_date: history.data[0].cons_ending_date,
      last_routing_inspe_date: history.data[0].last_routing_inspe_date,
      type_of_last_inspection: history.data[0].type_of_last_inspection,
      comments_observations: history.data[0].comments_observations
      
    });
  }

  onFileChange(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
  
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('table_name','history_of_works');
      formData.append('record_id',this.historyId);
      formData.append('field_name',controlName);
      formData.append('image',file);
      formData.append('record_id_name','history_of_works_id');
      

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
    formData.append('table_name','history_of_works');
    formData.append('record_id',this.historyId);
    formData.append('field_name',filedName);
    formData.append('record_id_name','history_of_works_id');
   
    this.roadService.deleteInspectionImage(formData).subscribe((res)=>{
      // console.log(res);
      if(res.status){
        this.ngOnInit()
      }
    })
  }

  downloadImage(fieldName: string): void {
    const imageUrl = `${this.urlLive}/upload/inspection_images/${this.historyData[fieldName]}`;    
    const anchor = document.createElement('a');
    anchor.href = imageUrl;
    anchor.download = ''; // Let the browser decide the file name
    anchor.target = '_blank'; // Optional: Open in a new tab if needed

    anchor.click();

    anchor.remove();
}
}
