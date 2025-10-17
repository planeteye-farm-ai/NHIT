import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { ApiUrl } from '../../../../shared/const';

@Injectable({
  providedIn: 'root'
})
export class RoadService {

  urlLive = ApiUrl.API_URL;
  constructor( private http: HttpClient) { 
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `${token}`);
  }

  //state list for dropdown 
  getStateList():Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/road_inventory/road_inventory_data/state_dropdown`,{
      headers: this.getHeaders()
    });
  }

   //distrct list for dropdown 
  getDistrctList(stateId:any):Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/road_inventory/road_inventory_data/district_dropdown/${stateId}`,{
      headers: this.getHeaders()
    });
  }

  //city list for dropdown 
  getCitytList(distrctId:any):Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/road_inventory/road_inventory_data/city_dropdown/${distrctId}`,{
      headers: this.getHeaders()
    });
  }

  //get geometoary data dropdown
  getGeometryList():Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/road_inventory/flexible_distress/geometry_road_dropdown`,{
      headers: this.getHeaders()
    });
  }

   // get road data
  getRoadData():Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/road_inventory/geometry_data/geometry_data_list`,{
      headers: this.getHeaders()
    });
  }

  // get road  details by id
  getDetailsById(roadId:any):Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/road_inventory/geometry_data/get_geometry_data_by_id/${roadId}`,{
      headers: this.getHeaders()
    });
  }

  // add road
  addRoad(data:any):Observable<any>{
    return this.http.post<any[]>(this.urlLive+`/api/road_inventory/geometry_data/add_geometry_data`,data,{
      headers: this.getHeaders()
    });
  }

  // update road
  updateRoad(data:any,roadId:any):Observable<any>{
    return this.http.post<any[]>(this.urlLive+`/api/road_inventory/geometry_data/update_geometry_data_by_id/${roadId}`,data,{
      headers: this.getHeaders()
    });
  }


  // delete road
  deleteRoad(roadId:any):Observable<any>{
    return this.http.post<any>(this.urlLive+`/api/road_inventory/geometry_data/delete_geometry_data_by_id/${roadId}`,{},{
      headers: this.getHeaders()
    });
  }


   // get history of works data
   getHistoryOfWorksData(roadId:any):Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/road_inventory/history_of_works/history_of_works_list/${roadId}`,{
      headers: this.getHeaders()
    });
  }

  // get history of works data by id
  getHistoryDataById(historyId:any):Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/road_inventory/history_of_works/get_history_of_works_by_id/${historyId}`,{
      headers: this.getHeaders()
    });
  }

  // add history of works data
  addHistoryOfWorks(data:any):Observable<any>{
    return this.http.post<any[]>(this.urlLive+`/api/road_inventory/history_of_works/add_history_of_works`,data,{
      headers: this.getHeaders()
    });
  }

  // update history of works data
  updateHistoryOfWorks(data:any,roadId:any):Observable<any>{
    return this.http.post<any[]>(this.urlLive+`/api/road_inventory/history_of_works/update_history_of_works_by_id/${roadId}`,data,{
      headers: this.getHeaders()
    });
  }


  // delete history of works
  deleteHistoryOfWorks(roadId:any):Observable<any>{
    return this.http.post<any>(this.urlLive+`/api/road_inventory/history_of_works/delete_history_of_works_by_id/${roadId}`,{},{
      headers: this.getHeaders()
    });
  }

// 
 // get inventory
 getInventory(roadId:any):Observable<any>{
  return this.http.get<any>(this.urlLive+`/api/road_inventory/road_inventory_data/road_inventory_data_list/${roadId}`,{
    headers: this.getHeaders()
  });
}

// get inventory by id 
getInventoryById(inventoryId:any):Observable<any>{
  return this.http.get<any>(this.urlLive+`/api/road_inventory/road_inventory_data/get_road_inventory_data_by_id/${inventoryId}`,{
    headers: this.getHeaders()
  });
}

// add inventory
addInventory(data:any):Observable<any>{
  return this.http.post<any[]>(this.urlLive+`/api/road_inventory/road_inventory_data/add_road_inventory_data`,data,{
    headers: this.getHeaders()
  });
}

// update inventory
updateInventory(data:any,inventoryId:any):Observable<any>{
  return this.http.post<any[]>(this.urlLive+`/api/road_inventory/road_inventory_data/update_road_inventory_data_by_id/${inventoryId}`,data,{
    headers: this.getHeaders()
  });
}


// delete inventory
deleteInventory(inventoryId:any):Observable<any>{
  return this.http.post<any>(this.urlLive+`/api/road_inventory/road_inventory_data/delete_road_inventory_data_by_id/${inventoryId}`,{},{
    headers: this.getHeaders()
  });
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

// add distress video
addDistressVideo(data:FormData): Observable<any> {
  return this.http.post<any>(`${this.urlLive}/api/road_inventory/rigid_distress/add_video`,data,{
      headers: this.getHeaders(), 
    });
}

// delete distress video
deleteDistressVideo(data:FormData): Observable<any> {
  return this.http.post<any>(`${this.urlLive}/api/road_inventory/rigid_distress/delete_video`,data,{
      headers: this.getHeaders(), 
    });
}
// flexible distress

  // get flexible distress
 getFlexibleDistress(data:any):Observable<any>{
  return this.http.post<any>(this.urlLive+`/api/road_inventory/flexible_distress/flexible_distress_list`,data,{
    headers: this.getHeaders()
  });
}

// get flexible distress by id 
geFlexibleDistressById(flexibleDistressId:any):Observable<any>{
  return this.http.get<any>(this.urlLive+`/api/road_inventory/flexible_distress/get_flexible_distress_by_id/${flexibleDistressId}`,{
    headers: this.getHeaders()
  });
}

// add flexible distress
addFlexibleDistress(data:any):Observable<any>{
  return this.http.post<any[]>(this.urlLive+`/api/road_inventory/flexible_distress/add_flexible_distress`,data,{
    headers: this.getHeaders()
  });
}

// update flexible distress
updateFlexibleDistress(data:any,distressId:any):Observable<any>{
  return this.http.post<any[]>(this.urlLive+`/api/road_inventory/flexible_distress/update_flexible_distress_by_id/${distressId}`,data,{
    headers: this.getHeaders()
  });
}


// delete flexible distress
deleteFlexibleDistress(distressId:any):Observable<any>{
  return this.http.post<any>(this.urlLive+`/api/road_inventory/flexible_distress/delete_flexible_distress_by_id/${distressId}`,{},{
    headers: this.getHeaders()
  });
}


// rigid distress

// get rigid distress
getRigidDistress(data:any):Observable<any>{
  return this.http.post<any>(this.urlLive+`/api/road_inventory/rigid_distress/rigid_distress_list`,data,{
    headers: this.getHeaders()
  });
}

// get rigid distress by id 
geRigidDistressById(rigidDistressId:any):Observable<any>{
  return this.http.get<any>(this.urlLive+`/api/road_inventory/rigid_distress/get_rigid_distress_by_id/${rigidDistressId}`,{
    headers: this.getHeaders()
  });
}

// add rigid distress
addRigidDistress(data:any):Observable<any>{
  return this.http.post<any[]>(this.urlLive+`/api/road_inventory/rigid_distress/add_rigid_distress`,data,{
    headers: this.getHeaders()
  });
}

// update rigid distress
updateRigidDistress(data:any,distressId:any):Observable<any>{
  return this.http.post<any[]>(this.urlLive+`/api/road_inventory/rigid_distress/update_rigid_distress_by_id/${distressId}`,data,{
    headers: this.getHeaders()
  });
}

// delete rigid distress
deleteRigidDistress(distressId:any):Observable<any>{
  return this.http.post<any>(this.urlLive+`/api/road_inventory/rigid_distress/delete_rigid_distress_by_id/${distressId}`,{},{
    headers: this.getHeaders()
  });
}


}
