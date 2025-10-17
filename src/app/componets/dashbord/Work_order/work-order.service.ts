import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { ApiUrl } from '../../../shared/const';

@Injectable({
  providedIn: 'root'
})
export class WorkOrderService {
  
  urlLive = ApiUrl.API_URL;
  constructor( private http:HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `${token}`);
  }

  // add work order
  addWorkOrder(data:any):Observable<any>{
    return this.http.post<any[]>(this.urlLive+`/api/work_order/add_work_order`,data,{
      headers: this.getHeaders()
    })
  }

  // get all work order list
  getWorkOrderList():Observable<any>{
    return this.http.get<any[]>(this.urlLive+`/api/work_order/work_order_list`,{
      headers: this.getHeaders()
    })
  }

}
