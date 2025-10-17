import { Injectable,NgZone } from '@angular/core';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { ApiUrl } from '../const';
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  authState: any;
  afAuth: any;
  afs: any;
  public showLoader:boolean=false;

  urlLive = ApiUrl.API_URL;
  userId:any;

  constructor(private afu: AngularFireAuth,
     private router: Router,
     public ngZone: NgZone, 
     private http: HttpClient
     ) {
   this.userId = localStorage.getItem('uid');

  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `${token}`);
  }

adminLogin(data: any): Observable<any> {
  return this.http.post<any>(`${this.urlLive}/api/user/login/check_login`, data);
}

logout(): Observable<any> {
  return this.http.post<any>(`${this.urlLive}/api/user/login/logout`,{uid:this.userId}, {
    headers: this.getHeaders()
  });
}
}
