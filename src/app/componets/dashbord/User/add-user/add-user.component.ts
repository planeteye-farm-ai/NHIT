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
import { User } from '../user';
import { UserManagementService } from '../user-management.service';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [RouterLink,SharedModule,NgSelectModule,FormsModule,CommonModule,ShowcodeCardComponent,ReactiveFormsModule],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss'
})
export class AddUserComponent {

    userForm!: FormGroup;
    prismCode = prismCodeData;
    
      constructor(private fb: FormBuilder,
        private modalService: NgbModal,
        private toastr: ToastrService,
        private userService:UserManagementService,
        private router: Router,
        ) {
        
      }
  
      ngOnInit(): void {
        this.userForm = this.fb.group({
          username: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
          pass: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]], 
          first_name: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
          last_name: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
          email: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
          phone_number: ['',[Validators.required,CustomValidators.numberValidator()]],
          user_role: ['',[Validators.required,CustomValidators.noWhitespaceValidator()]],
        })
      }
  
       onSubmit(): void {
          if (this.userForm.invalid)
          {
            this.userForm.markAllAsTouched();
            return;
          }
          else{
          let userObj:User ={ 
            username: this.userForm.get('username')?.value,
            password: this.userForm.get('pass')?.value,
            first_name: this.userForm.get('first_name')?.value,
            last_name: this.userForm.get('last_name')?.value,
            email: this.userForm.get('email')?.value,
            phone_number: this.userForm.get('phone_number')?.value,
            user_role: this.userForm.get('user_role')?.value,
          }
            // console.log(userObj);
          this.userService.addUser(userObj).subscribe((res) => {
            if(res.status){
              this.router.navigate(['user/user-management']);
              this.toastr.success(res.msg, 'RAMS', {
                timeOut: 3000,
                positionClass: 'toast-top-right'
              });
              this.userForm.reset();
            }
            else{
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
