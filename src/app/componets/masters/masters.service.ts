import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiUrl } from '../../shared/const';

@Injectable({
  providedIn: 'root'
})
export class MastersService {

  urlLive = ApiUrl.API_URL;
  constructor(
    private http: HttpClient) {}

    private getHeaders(): HttpHeaders {
      const token = localStorage.getItem('token');
      console.log(token)
      return new HttpHeaders().set('Authorization', `${token}`);
    }

   
  // get road type
  getRoadType():Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/master/road_type/road_type_list`,{
      headers: this.getHeaders()
    });
  }

  // add road type
  addRoadType(data:any):Observable<any>{
    return this.http.post<any>(this.urlLive+`/api/master/road_type/add_road_type`,data,{
      headers: this.getHeaders()
    });
  }

  // get road type by id
  getRoadTypeById(id:any){
    return this.http.get<any>(this.urlLive+`/api/master/road_type/get_road_type_by_id/${id}`,{
      headers: this.getHeaders()
    });
  }

  // delete road type
  deleteRoadType(id:any):Observable<any>{
    return this.http.post<any>(this.urlLive+`/api/master/road_type/delete_road_type_by_id/${id}`,{},{
      headers: this.getHeaders()
    });
  }

}
