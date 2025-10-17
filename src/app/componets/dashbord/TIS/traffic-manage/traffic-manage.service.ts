import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { ApiUrl } from '../../../../shared/const';

@Injectable({
  providedIn: 'root'
})
export class TrafficManageService {
  urlLive = ApiUrl.API_URL;
  constructor( private http: HttpClient) { 
  }
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `${token}`);
  }

  // get Traffic data
  getTrafficData():Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/traffic_info_system/traffic_info_system_data_list`,{
      headers: this.getHeaders()
    });
  }
  // get StateList
  getStateList():Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/traffic_info_system/state_dropdown`,{
      headers:this.getHeaders()
    })
  }

  // get RoadList
  getRoadList():Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/traffic_info_system/geometry_road_dropdown/`,{
      headers:this.getHeaders()
    })
  }
   // get DistrctList
  getDistrctList(id:any):Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/traffic_info_system/district_dropdown/${id}`,{
      headers:this.getHeaders()
    })
  }
   // get CitytList
  getCitytList(id:any):Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/traffic_info_system/city_dropdown/${id}`,{
      headers:this.getHeaders()
    })
  }
  
  // add Traffic
  addTraffic(data:any):Observable<any>{
    return this.http.post<any[]>(this.urlLive+`/api/traffic_info_system/add_traffic_information_system/`,data,{
      headers:this.getHeaders()
    })
  }

  // get Traffic details by id
  getDetailsById(id:any):Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/traffic_info_system/get_traffic_info_system_data_by_id/${id}`,{
      headers:this.getHeaders()})
  }

  // update Traffic
  updateTraffic(data:any,id:any):Observable<any>{
    return this.http.post<any>(this.urlLive+`/api/traffic_info_system/update_traffic_info_system_data_by_id/${id}`,data,{
      headers:this.getHeaders()
    })
  }

  // delete Taffic
  deleteTraffic(id:any):Observable<any>{
    return this.http.post<any>(this.urlLive+`/api/traffic_info_system/delete_traffic_info_system_by_id/${id}`,{},{
      headers: this.getHeaders()
    })
  }

  
}
