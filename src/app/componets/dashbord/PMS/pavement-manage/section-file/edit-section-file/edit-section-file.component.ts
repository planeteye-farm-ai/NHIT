import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { PavementManageService } from '../../pavement-manage.service'; 
import { Section} from '../section'
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../../../shared/common/custom-validators'; 
import { ActivatedRoute, Router } from '@angular/router'

@Component({
  selector: 'app-edit-section-file',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './edit-section-file.component.html',
  styleUrl: './edit-section-file.component.scss'
})
export class EditSectionFileComponent {

  sectionForm!: FormGroup;
  prismCode = prismCodeData;
  sectionId:any;
  topTitle:any;

  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private pavementService:PavementManageService,
    private router: Router,
    private route: ActivatedRoute,
    ) {
    
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.sectionId = Number(params.get('id'));
      if (this.sectionId) {
        console.log(this.sectionId)
         this.loadSectionDetails(this.sectionId);
      }
    });
     
    this.sectionForm = this.fb.group({
      heading_count: ['', [Validators.required]],
      strategy_code :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      road_code :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      jurisdiction_code :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      start_chainage :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      end_chainage :['',[Validators.required,,CustomValidators.noWhitespaceValidator()]],
      direction_flag :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      section_id :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      section_name :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      link_id :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      link_name :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      speed_flow :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      traffic_flow :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      accessibility_class :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      road_class :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      climatic_zone :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      surface_class :['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      
    })
    
  }

  loadSectionDetails(id:number):void{
    this.pavementService.getSectionDetailsById(id).subscribe((res) => {
      if(res){
          // console.log("fetch result",res.data)
          this.topTitle= res.data[0].road_code;
          this.patchValue(res);
      }
    },(err) =>{
      this.toastr.error(err.msg, 'NHAI RAMS', {
        timeOut:3000,
        positionClass: 'toast-top-right',
      });
    });
  }

  patchValue(section:any){
    // console.log(traffic)
    this.sectionForm.patchValue({
      heading_count: section.data[0].heading_count,
      strategy_code :section.data[0].strategy_code,
      road_code :section.data[0].road_code,
      jurisdiction_code : section.data[0].jurisdiction_code,
      start_chainage :section.data[0].start_chainage,
      end_chainage :section.data[0].end_chainage,
      direction_flag :section.data[0].direction_flag,
      section_id :section.data[0].section_id,
      section_name :section.data[0].section_name,
      link_id :section.data[0].link_id,
      link_name :section.data[0].link_name,
      speed_flow :section.data[0].speed_flow,
      traffic_flow :section.data[0].traffic_flow,
      accessibility_class :section.data[0].accessibility_class,
      road_class :section.data[0].road_class,
      climatic_zone :section.data[0].climatic_zone,
      surface_class :section.data[0].surface_class,
    })
     
  }
 
  onSubmit(): void {
    // console.log(this.sectionForm);
    if (this.sectionForm.invalid)
    {
      this.sectionForm.markAllAsTouched();
      return;
    }
    else{
    let sectionObj:Section ={ 
      heading_count: this.sectionForm.get('heading_count')?.value,
      strategy_code: this.sectionForm.get('strategy_code')?.value,
      road_code: this.sectionForm.get('road_code')?.value,
      jurisdiction_code: this.sectionForm.get('jurisdiction_code')?.value,
      start_chainage: this.sectionForm.get('start_chainage')?.value,
      end_chainage: this.sectionForm.get('end_chainage')?.value,
      direction_flag: this.sectionForm.get('direction_flag')?.value,
      section_id: this.sectionForm.get('section_id')?.value,
      section_name: this.sectionForm.get('section_name')?.value,
      link_id: this.sectionForm.get('link_id')?.value,
      link_name: this.sectionForm.get('link_name')?.value,
      speed_flow: this.sectionForm.get('speed_flow')?.value,
      traffic_flow: this.sectionForm.get('traffic_flow')?.value,
      accessibility_class: this.sectionForm.get('accessibility_class')?.value,
      road_class: this.sectionForm.get('road_class')?.value,
      climatic_zone: this.sectionForm.get('climatic_zone')?.value,
      surface_class: this.sectionForm.get('surface_class')?.value,
    }

    // console.log(sectionObj);
    this.pavementService.updateSection(sectionObj,this.sectionId).subscribe((res)=>{
      if(res.status){
        this.loadSectionDetails(this.sectionId);
        this.toastr.success(res.msg, 'NHAI RAMS', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
            this.sectionForm.reset();
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
