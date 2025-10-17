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
import { Router,RouterLink } from '@angular/router'
import { LabourManagementService } from '../labour-management.service';
import { Labour } from '../Labour';

@Component({
  selector: 'app-add-labour',
  standalone: true,
  imports: [RouterLink,SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './add-labour.component.html',
  styleUrl: './add-labour.component.scss'
})
export class AddLabourComponent {
      labourForm!: FormGroup;
      prismCode = prismCodeData;
      
        constructor(private fb: FormBuilder,
          private modalService: NgbModal,
          private toastr: ToastrService,
          private labourService:LabourManagementService,
          private router: Router,
          ) {
          
        }
    
        ngOnInit(): void {
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

        resetOtherType(){
          this.labourForm.get('other_type')?.setValue('');
       }
    
      onSubmit():void{
        if(this.labourForm.invalid){
          this.labourForm.markAllAsTouched();
          return;
        }else{
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
          this.labourService.addLabourData(labourObj).subscribe((res) =>{
            if(res.status){
              this.router.navigate(['/labour-management']);
              this.toastr.success(res.msg, 'RAMS', {
                timeOut: 3000,
                positionClass: 'toast-top-right'
              });
              this.labourForm.reset();
            }else{
              this.toastr.error(res.msg, 'RAMS', {
                timeOut:3000,
                positionClass: 'toast-top-right',
              });
            }
          },
          (err) => {
            this.toastr.error(err.msg, 'RAMS', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
            });
          });
        }
      }
  

}
