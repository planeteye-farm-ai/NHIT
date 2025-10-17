import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { ApiUrl } from '../../../shared/const';

@Injectable({
  providedIn: 'root'
})
export class InventoryManagementService {

  urlLive = ApiUrl.API_URL;
  constructor( private http: HttpClient) { 
  }
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `${token}`);
  }

  getEquipmentData():Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/equipment/equipment_list`,{
      headers:this.getHeaders()
    })
  }

  deleteEquipment(id:any):Observable<any>{
    return this.http.post<any>(this.urlLive+`/api/equipment/delete_equipment_by_id/${id}`,{},{
      headers:this.getHeaders()
    })
  }

  addEquipments(data:any):Observable<any>{
    return this.http.post<any[]>(this.urlLive+`/api/equipment/add_equipment`,data,{
      headers:this.getHeaders()
    })
  }

  getDetailsById(id:any):Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/equipment/get_equipment_by_id/${id}`,{
      headers:this.getHeaders()
    })
  }
  
  updateEquipment(data:any,id:any):Observable<any>{
    return this.http.post<any>(this.urlLive+`/api/equipment/update_equipment_by_id/${id}`,data,{
      headers:this.getHeaders()
    })
  }
}
