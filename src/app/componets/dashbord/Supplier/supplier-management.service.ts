import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { ApiUrl } from '../../../shared/const';

@Injectable({
  providedIn: 'root'
})
export class SupplierManagementService {

  urlLive = ApiUrl.API_URL;
  constructor( private http: HttpClient) { 
  }
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `${token}`);
  }

  // get StateList
  getStateList():Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/traffic_info_system/state_dropdown`,{
      headers:this.getHeaders()
    })
  }

  getSupplierData():Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/suppliers/suppliers_list`,{
      headers:this.getHeaders()
    })
  }

  deleteSupplier(id:any):Observable<any>{
    return this.http.post<any>(this.urlLive+`/api/suppliers/delete_suppliers_by_id/${id}`,{},{
      headers:this.getHeaders()
    })
  }

  addSuppliers(data:any):Observable<any>{
    return this.http.post<any[]>(this.urlLive+`/api/suppliers/add_suppliers`,data,{
      headers:this.getHeaders()
    })
  }

  getDetailsById(id:any):Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/suppliers/get_supplier_by_id/${id}`,{
      headers:this.getHeaders()
    })
  }
  
  updateSupplier(data:any,id:any):Observable<any>{
    return this.http.post<any>(this.urlLive+`/api/suppliers/update_suppliers_by_id/${id}`,data,{
      headers:this.getHeaders()
    })
  }
 
}
