import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { LabourManagementService } from '../labour-management.service';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../shared/common/custom-validators'; 
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-view-labour',
  standalone: true,
  imports: [RouterLink,SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './view-labour.component.html',
  styleUrl: './view-labour.component.scss'
})
export class ViewLabourComponent {

  labourForm!: FormGroup;
        prismCode = prismCodeData;
        topTitle:any;
        labour_id:any;
    
       constructor(private fb: FormBuilder,
          private modalService: NgbModal,
          private toastr: ToastrService,
          private labourService:LabourManagementService,
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
            first_name: [''],
            last_name: [''],
            dob: ['',[Validators.required]], 
            labour_type: [''],
            crew_id: [''],
            gender: [''],
            contact_number: [''],
            address: [''],
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
}
