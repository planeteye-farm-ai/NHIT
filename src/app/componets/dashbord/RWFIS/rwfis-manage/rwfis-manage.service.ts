import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { ApiUrl } from '../../../../shared/const';


@Injectable({
  providedIn: 'root'
})
export class RwfisManageService {

  urlLive = ApiUrl.API_URL;
  constructor( private http: HttpClient) { 
  }
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `${token}`);
  }
   // get RoadList
   getRoadList():Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/traffic_info_system/geometry_road_dropdown/`,{
      headers:this.getHeaders()
    })
  }
   // get StateList
   getStateList():Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/traffic_info_system/state_dropdown`,{
      headers:this.getHeaders()
    })
  }
  // get Distrct List
  getDistrctList(id:any){
    return this.http.get<any>(this.urlLive+`/api/traffic_info_system/district_dropdown/${id}`,{
      headers:this.getHeaders()
    })
  }
  // get Cityt List
  getCitytList(id:any){
    return this.http.get<any>(this.urlLive+`/api/traffic_info_system/city_dropdown/${id}`,{
      headers:this.getHeaders()
    })
  }

   // get rwfis data
   getRwfisData():Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/rwfis/rwfis_list`, {
      headers:this.getHeaders()
    });
  }

  addRwfis(data:any):Observable<any>{
    return this.http.post<any[]>(this.urlLive+`/api/rwfis/add_rwfis/`,data,{
      headers:this.getHeaders()
    });
  }
  
  deleteRwfisData(rwfis_id:any):Observable<any>{
    return this.http.post<any>(this.urlLive+`/api/rwfis/delete_rwfis_by_id/${rwfis_id}`,{},{
      headers:this.getHeaders()
    });
  }

  getRwfisDetailsByID(rwfis_id:any):Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/rwfis/get_rwfis_by_id/${rwfis_id}`,{
      headers:this.getHeaders()
    })
  }

  updateRwfis(data:any,rwfis_id:any):Observable<any>{
    return this.http.post<any[]>(this.urlLive+`/rwfis/update_rwfis_by_id/${rwfis_id}`,data,{
      headers: this.getHeaders()
    });
  }

 
  
}
