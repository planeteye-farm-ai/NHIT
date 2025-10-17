import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../shared/common/custom-validators'; 
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LabourManagementService } from '../labour-management.service';
import { timeout } from 'rxjs';
import { position } from 'html2canvas/dist/types/css/property-descriptors/position';
import { Labour } from '../Labour';

@Component({
  selector: 'app-edit-labour',
  standalone: true,
  imports: [RouterLink,SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './edit-labour.component.html',
  styleUrl: './edit-labour.component.scss'
})
export class EditLabourComponent {
    
  labourForm!: FormGroup;
    prismCode = prismCodeData;
    topTitle:any;
    labour_id:any;
    
    constructor(private fb: FormBuilder,
      private modalService: NgbModal,
      private toastr: ToastrService,
      private labourService:LabourManagementService,
      private router: Router,
      private route: ActivatedRoute,
      ) {
    }

    ngOnInit(): void {
      this.route.paramMap.subscribe(params => {
        this.labour_id = Number(params.get('id'));
        if (this.labour_id) {
          this.loadLabourDetails(this.labour_id);
        }
      });
      this.labourForm = this.fb.group({
        first_name: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
        last_name: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
        dob: ['',[Validators.required]], 
        labour_type: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
        crew_id: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
        gender: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
        contact_number: ['',[Validators.required,CustomValidators.numberValidator()]],
        address: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
        other_type: ['']
      })
    }
    loadLabourDetails(id:number): void{
      this.labourService.getDetailsById(id).subscribe((res) => {
        if(res){
          this.topTitle = res.data[0].first_name + res.data.last_name;
          this.patchValue(res);
        }
      },(err) => {
        this.toastr.error(err.msg, 'NHAI RAMS', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
      });
     }

     patchValue(Labour:any){
      this.labourForm.patchValue({
        first_name:Labour.data[0].first_name,
        last_name:Labour.data[0].last_name,
        dob:Labour.data[0].dob,
        labour_type:Labour.data[0].labour_type,
        crew_id:Labour.data[0].crew_id,
        gender:Labour.data[0].gender,
        contact_number:Labour.data[0].contact_number,
        address:Labour.data[0].address,
        other_type:Labour.data[0].other_type
      })
     }

     resetOtherType(){
        this.labourForm.get('other_type')?.setValue('');
     }

     
    onSubmit():void{
         if(this.labourForm.invalid){
           this.labourForm.markAllAsTouched();
           return;
         }
         else{
           let labourObj:Labour = {
              first_name: this.labourForm.get('first_name')?.value,
              last_name: this.labourForm.get('last_name')?.value,
              dob: this.labourForm.get('dob')?.value,
              labour_type: this.labourForm.get('labour_type')?.value,
              crew_id: this.labourForm.get('crew_id')?.value,
              gender: this.labourForm.get('gender')?.value,
              contact_number: this.labourForm.get('contact_number')?.value,
              address: this.labourForm.get('address')?.value,
              other_type: this.labourForm.get('other_type')?.value,
            }
           // console.log(labourObj)
             this.labourService.updateLabourData(labourObj,this.labour_id).subscribe((res) => {
             if(res.status){
               this.loadLabourDetails(this.labour_id);
               this.toastr.success(res.msg, 'NHAI RAMS', {
                 timeOut: 3000,
                 positionClass: 'toast-top-right',
               });
             } else {
               this.toastr.error(res.msg, 'NHAI RAMS', {
                 timeOut: 3000,
                 positionClass: 'toast-top-right',
               });
             }
             },  (err)=>{
             this.toastr.error(err.msg, 'NHAI RAMS', {
               timeOut: 3000,
               positionClass: 'toast-top-right',
             });
           });
           }
         }

}
