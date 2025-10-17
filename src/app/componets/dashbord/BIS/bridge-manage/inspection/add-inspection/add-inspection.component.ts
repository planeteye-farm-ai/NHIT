import { Component } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { BridgeService } from '../../bridge.service';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../../../shared/common/custom-validators'; 
import { Router } from '@angular/router';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BridgeInspection,Suggestion } from '../inspection';
@Component({
  selector: 'app-add-inspection',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './add-inspection.component.html',
  styleUrl: './add-inspection.component.scss'
})
export class AddInspectionComponent {

  inspectionForm!: FormGroup;
  prismCode = prismCodeData;
  stateList:any;
  bridgeId:any;
  bridgeData:any;
  bridgeName:any;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private bridgeService:BridgeService,
    private router: Router,
    ) {
      // this.inspectionForm = this.fb.group({
      //   inspectionItems: this.fb.array([]) // Create an empty FormArray
      // });

      
  }

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {
      this.bridgeId = Number(params.get('id'));
     });
     

    this.inspectionForm = this.fb.group({
      bridgeName: [''],
      highwayNo: [''],
      typeOfBridge: [''],
      duration_of_inspection: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      erosionEmbankment: ['', Validators.required],
      erosion_of_embankment_image: ['',[CustomValidators.imageFileValidator()]],
      approachSlab: ['', Validators.required],
      approach_slab_image: ['',[CustomValidators.imageFileValidator()]],
      approachGeometries: ['', Validators.required],
      approach_geometry_image: ['',[CustomValidators.imageFileValidator()]],
      siltDebrisAccumulation: ['', Validators.required],
      accumulation_on_approaches_image: ['',[CustomValidators.imageFileValidator()]]
    });
    this.getBridgeDetailsById();
  }

  onSubmit(): void {
    // const formData: Suggestion = this.inspectionForm.value;
    // console.log('Form submitted:', formData);
    if (this.inspectionForm.invalid)
    {
      this.inspectionForm.markAllAsTouched();
      return;
    }

    else{
      const formData = new FormData();
      formData.append('bridge_id',this.bridgeId);
      formData.append('duration_of_inspection', this.inspectionForm.get('duration_of_inspection')?.value);
      formData.append('erosion_of_embankment', this.inspectionForm.get('erosionEmbankment')?.value);
      formData.append('approach_slab',this.inspectionForm.get('approachSlab')?.value);
      formData.append('approach_geometry', this.inspectionForm.get('approachGeometries')?.value);
      formData.append('accumulation_on_approaches', this.inspectionForm.get('siltDebrisAccumulation')?.value);
      formData.append('erosion_of_embankment_image', this.inspectionForm.get('erosion_of_embankment_image')?.value);
      formData.append('approach_slab_image', this.inspectionForm.get('approach_slab_image')?.value);
      formData.append('approach_geometry_image', this.inspectionForm.get('approach_geometry_image')?.value);
      formData.append('accumulation_on_approaches_image', this.inspectionForm.get('accumulation_on_approaches_image')?.value);

      // console.log("inspection form details",formData);

      this.bridgeService.addInspection(formData).subscribe((res)=>{
        // console.log(res);
        if(res.status){
          this.router.navigate(['/bis/bridge-manage/edit-inspection',res.inspection_id
        ]);
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
 

  getBridgeDetailsById(){
    this.bridgeService.getDetailsById(this.bridgeId).subscribe((res) => {
      this.bridgeData = res.data;
      // console.log("brige details inadd inspection",this.bridgeData);
      this.bridgeName = this.bridgeData.popular_name_of_bridge;
      if (this.bridgeData) {
        this.inspectionForm.patchValue({
          bridgeName: this.bridgeData.popular_name_of_bridge,
          highwayNo: this.bridgeData.highway_no,
          typeOfBridge: this.bridgeData.type_of_bridge
          // Other fields as needed
        });
      }

    });
  }

  onFileChange(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
  
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.inspectionForm.get(controlName)?.setValue(file);
    }
  }

}


