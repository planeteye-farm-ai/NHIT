import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { ApiUrl } from '../../../../shared/const';

@Injectable({
  providedIn: 'root'
})
export class PavementManageService {

  urlLive = ApiUrl.API_URL;
  constructor( private http: HttpClient) { 
  }
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `${token}`);
  }
  // Section api start 
  // get Section Data
  getSectionData():Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/section_file/section_file_data_list`,{
      headers:this.getHeaders()
    })
  }

  // delete Section
  deleteSection(id:any):Observable<any>{
      return this.http.post<any>(this.urlLive+`/api/section_file/delete_section_file_data_by_id/${id}`,{},{
        headers: this.getHeaders()
    })
  }

  // add section
  addSection(data:any):Observable<any>{
    return this.http.post<any[]>(this.urlLive+`/api/section_file/add_section_file`,data,{
      headers:this.getHeaders()
    })
  }

  // get section detail
  getSectionDetailsById(id:any):Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/section_file/get_section_file_data_by_id/${id}`,{
      headers:this.getHeaders()
    })
  }
  //updae section by id
  updateSection(data:any,id:any):Observable<any>{
    return this.http.post<any>(this.urlLive+`/api/section_file/update_section_file_data_by_id/${id}`,data,{
      headers:this.getHeaders()
    })
  }

  // File form Api Start
   // get Traffic Data
   getTrafficData():Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/traffic_file/traffic_file_data_list`,{
      headers:this.getHeaders()
    })
  }

   // delete Traffic
   deleteTraffic(id:any):Observable<any>{
    return this.http.post<any>(this.urlLive+`/api/traffic_file/delete_traffic_file_data_by_id/${id}`,{},{
      headers: this.getHeaders()
  })
}

// add Traffic
addTraffic(data:any):Observable<any>{
  return this.http.post<any[]>(this.urlLive+`/api/traffic_file/add_traffic_file`,data,{
    headers:this.getHeaders()
  })
}

// get TrafficDetailsById
getTrafficDetailsById(id:any):Observable<any>{
  return this.http.get<any>(this.urlLive+`/api/traffic_file/get_traffic_file_data_by_id/${id}`,{
    headers:this.getHeaders()
  })
}
// update Traffic
updateTraffic(data:any,id:any):Observable<any>{
  return this.http.post<any>(this.urlLive+`/api/traffic_file/update_traffic_file_data_by_id/${id}`,data,{
    headers:this.getHeaders()
  })
}

// Homogenous Sections form Api Start
// get Homogenous Data
getHomogenousData():Observable<any>{
  return this.http.get<any>(this.urlLive+`/api/pavement_management_system/pavement_management_system_data_list`,{
    headers:this.getHeaders()
  })
}

// delete Homogenous
deleteHomogenous(id:any):Observable<any>{
    return this.http.post<any>(this.urlLive+`/api/pavement_management_system/delete_pavement_management_system_data_by_id/${id}`,{},{
    headers:this.getHeaders()
})
}

// add Homogenous
addHomogenous(data:any):Observable<any>{
  return this.http.post<any[]>(this.urlLive+`/api/pavement_management_system/add_pavement_management_system`,data,{
    headers:this.getHeaders()
  })
}

// get Homogenous DetailsById
getHomogenousDetailsById(id:any):Observable<any>{
  return this.http.get<any>(this.urlLive+`/api/pavement_management_system/get_pavement_management_system_data_by_id/${id}`,{
    headers:this.getHeaders()
  })
}
 
// update Homogenous
updateHomogenous(data:any,id:any):Observable<any>{
  return this.http.post<any>(this.urlLive+`/api/pavement_management_system/update_pavement_management_system_data_by_id/${id}`,data,{
    headers:this.getHeaders()
  })
}

// getRoadList
getRoadList():Observable<any>{
  return this.http.get<any>(this.urlLive+`/api/pavement_management_system/geometry_road_dropdown`,{
    headers:this.getHeaders()
  })
}

// getRoadList
getStateList():Observable<any>{
  return this.http.get<any>(this.urlLive+`/api/pavement_management_system/state_dropdown`,{
    headers:this.getHeaders()
  })
}

//get DistrctList
getDistrctList(id:any):Observable<any>{
  return this.http.get<any>(this.urlLive+`/api/pavement_management_system/district_dropdown/${id}`,{
    headers:this.getHeaders()
  })
}

getCitytList(id:any):Observable<any>{
  return this.http.get<any>(this.urlLive+`/api/pavement_management_system/city_dropdown/${id}`,{
    headers:this.getHeaders()
  })

}


// particular image for all 
addParticularImage(fileData: FormData): Observable<any> {
  return this.http.post<any>(`${this.urlLive}/api/road_inventory/history_of_works/add_image`,fileData,{
      headers: this.getHeaders(), 
    });
}

// delete particular image for all 
 deleteInspectionImage(data:FormData): Observable<any> {
  return this.http.post<any>(`${this.urlLive}/api/road_inventory/history_of_works/delete_image`,data,{
      headers: this.getHeaders(), 
    });
}

}
