import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../shared/prismData/forms/form_layouts'
import { SharedModule } from '../../../../shared/common/sharedmodule';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { UserManagementService } from '../user-management.service';
import { UserEdit } from '../user';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../shared/common/custom-validators'; 
import { ActivatedRoute, Router,RouterLink } from '@angular/router'


@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [RouterLink,SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss'
})
export class EditUserComponent {

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
          username: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
          first_name: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
          last_name: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
          email: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
          phone_number: ['',[Validators.required,CustomValidators.numberValidator()]],
          user_role: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
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

    onSubmit(): void {
      if (this.userForm.invalid)
      {
        this.userForm.markAllAsTouched();
        return;
      }
      else{
      let userObj:UserEdit ={ 
          username: this.userForm.get('username')?.value,
          first_name: this.userForm.get('first_name')?.value,
          last_name: this.userForm.get('last_name')?.value,
          email: this.userForm.get('email')?.value,
          phone_number: this.userForm.get('phone_number')?.value,
          user_role: this.userForm.get('user_role')?.value,
        }
        console.log(userObj)
  
      this.userService.updateUser(userObj,this.uid).subscribe((res)=>{
        if(res.status){
          this.loadUserDetails(this.uid);
          this.toastr.success(res.msg, 'NHAI RAMS', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
              // this.userForm.reset();
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
