import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, Renderer2 } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../shared/services/auth.service';
import { AppStateService } from '../../../shared/services/app-state.service';

import { Observable } from 'rxjs';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { ApiUrl } from '../../../shared/const';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule,
    HttpClientModule,
  ],

  providers: [{ provide: ToastrService, useClass: ToastrService }],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  public showPassword: boolean = false;

  public dataList: any;
  // urlLive='https://logicalat.in/planeteye_admin/index.php';
  urlLive = ApiUrl.API_URL;
  toggleClass = 'las la-eye-slash';
  active = 'Angular';
  token: any;
  public togglePassword() {
    this.showPassword = !this.showPassword;
    if (this.toggleClass === 'las la-eye') {
      this.toggleClass = 'las la-eye-slash';
    } else {
      this.toggleClass = 'las la-eye';
    }
  }
  disabled = '';
  public localdata: any = this.appStateService;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private elementRef: ElementRef,
    private sanitizer: DomSanitizer,
    public authservice: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
    private renderer: Renderer2,
    private toastr: ToastrService,
    private appStateService: AppStateService,
    private http: HttpClient
  ) {
    // AngularFireModule.initializeApp(environment.firebase);

    document.body.classList.add('authentication-background');
    const htmlElement =
      this.elementRef.nativeElement.ownerDocument.documentElement;
    // htmlElement.removeAttribute('style');
  }
  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      // username: ['', [Validators.required]],
      // password: ['', Validators.required],
      email: ['user@gmail.com', [Validators.required, Validators.email]],
      password: ['admin', Validators.required],
    });
  }

  ngOnDestroy(): void {
    const htmlElement =
      this.elementRef.nativeElement.ownerDocument.documentElement;
    document.body.classList.remove('authentication-background');
  }

  // firebase
  email = '';
  password = '';
  errorMessage = ''; // validation _error handle
  _error: { name: string; message: string } = { name: '', message: '' }; // for firbase _error handle

  clearErrorMessage() {
    this.errorMessage = '';
    this._error = { name: '', message: '' };
  }

  validateForm(email: string, password: string) {
    if (email.length === 0) {
      this.errorMessage = 'please enter email id';
      return false;
    }

    if (password.length === 0) {
      this.errorMessage = 'please enter password';
      return false;
    }

    if (password.length < 6) {
      this.errorMessage = 'password should be at least 6 char';
      return false;
    }

    this.errorMessage = '';
    return true;
  }

  //angular
  public loginForm!: FormGroup;
  public error: any = '';

  get form() {
    return this.loginForm.controls;
  }

  Submit() {
    if (this.loginForm.invalid) {
      return;
    }

    const formData = this.loginForm.value;

    // --- Hardcoded login for development ---
    if (formData.email === 'user@gmail.com' && formData.password === 'admin') {
      localStorage.setItem('token', 'hardcoded-token-for-dev');
      localStorage.setItem('admin_id', '1');
      localStorage.setItem('uid', 'user@gmail.com');
      localStorage.setItem('role', 'admin');
      localStorage.setItem('name', 'Default Admin User');
      localStorage.setItem('access_type', 'default');
      this.toastr.success('Login successful (hardcoded)', 'NHAI RAMS', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
      this.router.navigate(['home-dashboard']);
      return; // Bypass backend call
    }
    // --- End of hardcoded login ---

    // Original backend login logic
    const loginData = {
      uid: formData.email,
      password: formData.password,
    };

    this.adminLogin(loginData).subscribe({
      next: (res) => {
        if (res.status === true) {
          // console.log(res);
          this.token = res.token;
          localStorage.setItem('token', res.token);
          localStorage.setItem('admin_id', res.data[0].admin_id);
          localStorage.setItem('uid', res.data[0].uid);
          localStorage.setItem('role', res.data[0].user_role);
          localStorage.setItem(
            'name',
            `${res.data[0].first_name} ${res.data[0].last_name}`
          );
          localStorage.setItem('access_type', res.data[0].access_type);
          this.toastr.success('Login successful', 'NHAI RAMS', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
          if (res.data[0].access_type === 'BIS') {
            this.router.navigate(['bis-home']);
          } else {
            this.router.navigate(['home-dashboard']);
          }
        } else {
          this.toastr.error('Invalid details', 'NHAI RAMS', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
        }
      },
      error: (_err) => {
        this.errorMessage = 'Login failed. Please try again.';
        this.toastr.error('Login failed', 'Error', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
      },
    });
  }

  adminLogin(data: any): Observable<any> {
    return this.http.post<any>(
      `${this.urlLive}/api/user/login/check_login`,
      data
    );
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `${token}`);
  }
}
