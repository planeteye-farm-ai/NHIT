import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { ApiUrl } from '../../../shared/const';


@Injectable({
  providedIn: 'root'
})
export class LabourManagementService {

  urlLive = ApiUrl.API_URL;
  constructor( private http: HttpClient) { 
  }
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `${token}`);
  }

  getLabourData():Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/labour/labour_list`,{
      headers:this.getHeaders()
    })
  }

  deleteLabourData(id:any):Observable<any>{
    return this.http.post<any>(this.urlLive+`/api/labour/delete_labour/${id}`,{},{
      headers:this.getHeaders()
    })
  }

  addLabourData(data:any):Observable<any>{
    return this.http.post<any[]>(this.urlLive+`/api/labour/add_labour`,data,{
      headers:this.getHeaders()
    })
  }

  getDetailsById(id:any):Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/labour/get_labour/${id}`,{
      headers:this.getHeaders()
    })
  }
 
  updateLabourData(data:any,id:any):Observable<any>{
    return this.http.post<any>(this.urlLive+`/api/labour/update_labour/${id}`,data,{
      headers:this.getHeaders()
    })
  }
  
}
