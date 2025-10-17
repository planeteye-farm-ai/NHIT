import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { UserManagementService } from '../user-management.service';
import { User } from '../user';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../shared/common/custom-validators'; 
import { ActivatedRoute, Router,RouterLink } from '@angular/router'


@Component({
  selector: 'app-view-user',
  standalone: true,
  imports: [RouterLink,SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './view-user.component.html',
  styleUrl: './view-user.component.scss'
})
export class ViewUserComponent {

  userForm!: FormGroup;
  prismCode = prismCodeData;
  topTitle:any;
  uid:any;
    
    constructor(private fb: FormBuilder,
      private modalService: NgbModal,
      private toastr: ToastrService,
      private userService:UserManagementService,
      private router: Router,
      private route: ActivatedRoute,
      ) {
    }

    ngOnInit(): void {
      this.route.paramMap.subscribe(params => {
        this.uid = Number(params.get('id'));
        if (this.uid) {
          this.loadUserDetails(this.uid);
        }
      });
      this.userForm = this.fb.group({
        username: [''],
        first_name: [''],
        last_name: [''],
        email: [''],
        phone_number: [''],
        user_role: [''],
        user_status: ['']
      })
    }

    loadUserDetails(id:number): void {
      this.userService.getDetailsById(id).subscribe((res) =>{
        if(res){
            // console.log(res.data)
          this.topTitle = res.data[0].first_name +' ' + res.data[0].last_name;
           this.patchValue(res);
        }
      },(err) => {
        this.toastr.error(err.msg, 'NHAI RAMS', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
      });
     }

     patchValue(user:any){
      this.userForm.patchValue({
        username: user.data[0].username,
        first_name: user.data[0].first_name,
        last_name: user.data[0].last_name,
        email: user.data[0].email,
        phone_number: user.data[0].phone_number,
        user_role: user.data[0].user_role, 
      })
     }


}
