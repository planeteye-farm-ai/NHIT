import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { ApiUrl } from '../../../shared/const';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {

  urlLive = ApiUrl.API_URL;
  constructor( private http: HttpClient) { 
  }
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `${token}`);
  }

  // Add user
  addUser(data:any):Observable<any>{
    return this.http.post<any[]>(this.urlLive+`/api/user/user/add_user`,data,{
      headers:this.getHeaders()
    })
  }

  // get User Data
  getUserData():Observable<any>{
    return this.http.get<any>(this.urlLive+'/api/user/user/user_list',{
      headers:this.getHeaders()
    })
  }

  // delete Taffic
  deleteUser(id:any):Observable<any>{
    return this.http.post<any>(this.urlLive+`/api/user/user/delete_user_by_id/${id}`,{},{
      headers: this.getHeaders()
    })
  }

  //get user details by id
  getDetailsById(id:any):Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/user/user/get_user_by_id/${id}`,{
      headers:this.getHeaders()
    })
  }
  // update User
  updateUser(data:any,id:any):Observable<any>{
    return this.http.post<any>(this.urlLive+`/api/user/user/update_user_by_id/${id}`,data,{
      headers:this.getHeaders()
    })
  }

}
