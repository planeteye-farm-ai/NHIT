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
import { Inventory } from '../inventory';

@Component({
  selector: 'app-add-inventory',
  standalone: true,
  imports: [SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './add-inventory.component.html',
  styleUrl: './add-inventory.component.scss'
})
export class AddInventoryComponent {

  inventoryForm!: FormGroup;
  prismCode = prismCodeData;
  roadId:any;
  stateList:any;
  districtList:any;
  cityList:any;
  roadData:any;
  roadName:any;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private roadService:RoadService,
    private router: Router,
    ) {
      // this.inventoryForm = this.fb.group({
      //   inspectionItems: this.fb.array([]) // Create an empty FormArray
      // });

      
  }

  ngOnInit(): void {
     
    this.route.paramMap.subscribe(params => {
      this.roadId = Number(params.get('id'));
     });
     

    this.inventoryForm = this.fb.group({
      state_id: ['', Validators.required],
      district_id: ['', Validators.required],
      city_id: ['', Validators.required],
      village: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      chainage_start: ['',[Validators.required, CustomValidators.numberValidator()]],
      chainage_end: ['',[Validators.required, CustomValidators.numberValidator()]],
      terrain: ['', Validators.required],
      land_use_left: ['', Validators.required],
      land_use_right: ['', Validators.required],
      chainagewise_village: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
      roadway_width: ['',[Validators.required, CustomValidators.numberValidator()]],
      formation_width: ['',[Validators.required, CustomValidators.numberValidator()]],
      carriageway_type: ['', Validators.required],
      carriageway_width: ['',[Validators.required, CustomValidators.numberValidator()]],
      shoulder_left_type: ['', Validators.required],
      shoulder_right_type: ['', Validators.required],
      shoulder_left_width: ['',[Validators.required, CustomValidators.numberValidator()]],
      shoulder_right_width: ['',[Validators.required, CustomValidators.numberValidator()]],
      submergence: ['',[Validators.required]],
      embankment_height: ['',[Validators.required, CustomValidators.numberValidator()]], 
    });
   
    this.getRoadDetailsById()
    this.getStateList();
  }

  getStateList(){
    this.roadService.getStateList().subscribe((res)=>{
      this.stateList = res.data;
    })
  }
  getDistrctList(id:any){
    this.roadService.getDistrctList(id).subscribe((res) =>{
      this.districtList = res.data;
    })
  }

  getCitytList(id:any){
    this.roadService.getCitytList(id).subscribe((res) =>{
      this.cityList = res.data;
    })
  }

  getRoadDetailsById(){
    this.roadService.getDetailsById(this.roadId).subscribe((res) => {
      this.roadData = res.data[0];
      console.log("road details",this.roadData);
      this.roadName = this.roadData.name_of_road;
    });
  }


  onSubmit(): void {
    // const formData: Suggestion = this.inventoryForm.value;
    // console.log('Form submitted:', formData);
    if (this.inventoryForm.invalid)
    {
      this.inventoryForm.markAllAsTouched();
      return;
    }

    else{
      let inventoryObj: Inventory={ 
        geometry_data_id: this.roadId,
        state_id: this.inventoryForm.get('state_id')?.value,
        district_id: this.inventoryForm.get('district_id')?.value,
        city_id: this.inventoryForm.get('city_id')?.value,
        village: this.inventoryForm.get('village')?.value,
        chainage_start: this.inventoryForm.get('chainage_start')?.value,
        chainage_end: this.inventoryForm.get('chainage_end')?.value,
        terrain: this.inventoryForm.get('terrain')?.value,
        land_use_left: this.inventoryForm.get('land_use_left')?.value,
        land_use_right: this.inventoryForm.get('land_use_right')?.value,
        chainagewise_village: this.inventoryForm.get('chainagewise_village')?.value,
        roadway_width: this.inventoryForm.get('roadway_width')?.value,
        formation_width: this.inventoryForm.get('formation_width')?.value,
        carriageway_type: this.inventoryForm.get('carriageway_type')?.value,
        carriageway_width: this.inventoryForm.get('carriageway_width')?.value,
        shoulder_left_type: this.inventoryForm.get('shoulder_left_type')?.value,
        shoulder_right_type: this.inventoryForm.get('shoulder_right_type')?.value,
        shoulder_left_width: this.inventoryForm.get('shoulder_left_width')?.value,
        shoulder_right_width: this.inventoryForm.get('shoulder_right_width')?.value,
        submergence: this.inventoryForm.get('submergence')?.value,
        embankment_height: this.inventoryForm.get('embankment_height')?.value, 
      } 

      // console.log("inspection form details",formData);

      this.roadService.addInventory(inventoryObj).subscribe((res)=>{
        console.log(res);
        if(res.status){
          this.router.navigate(['/ris/road-manage/edit-inventory',res.road_inventory_id]);
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

}
