import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { ApiUrl } from '../../../../shared/const';

@Injectable({
  providedIn: 'root'
})
export class BridgeService {

  urlLive = ApiUrl.API_URL;
  constructor( private http: HttpClient) { 
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `${token}`);
  }

  getStateList():Observable<any>{
    return this.http.get<any[]>(this.urlLive+`/api/user/user/state_dropdown`, {
      headers: this.getHeaders()
    });
  }

  // get bridge data
  getBridgeData():Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/master/bridge/bridge_list`,{
      headers: this.getHeaders()
    });
  }

  // get Bridge  details by id
  getDetailsById(bridgeId:any):Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/master/bridge/get_bridge_by_id/${bridgeId}`,{
      headers: this.getHeaders()
    });
  }

  // add bridge
  addBridge(data:any):Observable<any>{
    return this.http.post<any[]>(this.urlLive+`/api/master/bridge/add_bridge`,data,{
      headers: this.getHeaders()
    });
  }

  // update bridge
  updateBridge(data:any,bridgeId:any):Observable<any>{
    return this.http.post<any[]>(this.urlLive+`/api/master/bridge/update_bridge_by_id/${bridgeId}`,data,{
      headers: this.getHeaders()
    });
  }

  // delete bridge
  deleteBridge(bridgeId:any):Observable<any>{
    return this.http.post<any>(this.urlLive+`/api/master/bridge/delete_bridge_by_id/${bridgeId}`,{},{
      headers: this.getHeaders()
    });
  }

  //inspection dropdown start

  // get social importance dropdown
  getSocialImportance():Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/master/social_importance_rating/social_importance_rating_list`,{
      headers: this.getHeaders()
    });
  }

  // get economic growth dropdown
  getEconomicGrowth():Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/master/economic_growth_rating/economic_growth_rating_list`,{
      headers: this.getHeaders()
    });
  }

  // get alternate route
  getAlternateRoute():Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/master/alternate_route_rating/alternate_route_rating_list`,{
      headers: this.getHeaders()
    });
  }

  // get environmental impact
  getEnvironmentalImpact():Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/master/environmental_impact_rating/environmental_impact_rating_list`,{
      headers: this.getHeaders()
    });
  }
   //inspection dropdown end

  // get Inspection By Bridge Id
  getInspectionByBridgeId(bridgeId:any):Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/inspection/inspection_list/${bridgeId}`,{
      headers: this.getHeaders()
    });
  }
  

  // get Inspection details by id
  getInspectionById(inspectionId:any):Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/inspection/get_inspection_by_id/${inspectionId}`,{
      headers: this.getHeaders()
    });
  }

  // add Inspection of Bridge
  addInspection(data:FormData):Observable<any>{
    return this.http.post<any[]>(this.urlLive+`/api/inspection/add_inspection`,data,{
      headers: this.getHeaders()
    });
  }

  // update Inspection of Bridge
    updateInspection(data:any,inspectionId:any):Observable<any>{
      return this.http.post<any[]>(this.urlLive+`/api/inspection/update_inspection_by_id/${inspectionId}`,data,{
        headers: this.getHeaders()
      });
    }

  // delete Inspection of Bridge
  deleteInspection(inspectionId:any):Observable<any>{
    return this.http.post<any>(this.urlLive+`/api/inspection/delete_inspection_by_id/${inspectionId}`,{},{
      headers: this.getHeaders()
    });
  }
  
  // get inspection images by id
  getInspectionImage(inspectionId:any):Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/inspection/extra_image_list/${inspectionId}`,{
      headers: this.getHeaders()
    });
  }

  // add inspection images
  addInspectionImage(fileData: FormData): Observable<any> {
    return this.http.post<any>(`${this.urlLive}/api/inspection/add_inspection_extra_image`,fileData,{
        headers: this.getHeaders(), 
      });
  }

  // delete image
  deleteImage(imageId:any): Observable<any> {
    return this.http.post<any>(`${this.urlLive}/api/inspection/delete_extra_image/${imageId}`,{},{
        headers: this.getHeaders(), 
      });
  }

  // particular image add inspetion
  addParticularImage(fileData: FormData): Observable<any> {
    return this.http.post<any>(`${this.urlLive}/api/inspection/add_inspection_image`,fileData,{
        headers: this.getHeaders(), 
      });
  }

  // delete particular image inspetion
   deleteInspectionImage(data:FormData): Observable<any> {
    return this.http.post<any>(`${this.urlLive}/api/inspection/delete_inspection_image`,data,{
        headers: this.getHeaders(), 
      });
  }
 
  // get rating By Bridge Id
  getRatingByBridgeId(bridgeId:any):Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/bridge_rating/bridge_rating_list/${bridgeId}`,{
      headers: this.getHeaders()
    });
  }

 // add rating of Bridge
 addRating(data:any):Observable<any>{
  return this.http.post<any[]>(this.urlLive+`/api/bridge_rating/add_bridge_rating`,data,{
    headers: this.getHeaders()
  });
}

// update rating of Bridge
updateRating(data:any,ratingId:any):Observable<any>{
  return this.http.post<any[]>(this.urlLive+`/api/bridge_rating/update_bridge_rating_by_id/${ratingId}`,data,{
    headers: this.getHeaders()
  });
}


// get rating details by id
getRatingById(ratingId:any):Observable<any>{
  return this.http.get<any>(this.urlLive+`/api/bridge_rating/get_bridge_rating_by_id/${ratingId}`,{
    headers: this.getHeaders()
  });
}

// delete rating  of Bridge
deleteRating(ratingId:any):Observable<any>{
  return this.http.post<any>(this.urlLive+`/api/bridge_rating/delete_bridge_rating_by_id/${ratingId}`,{},{
    headers: this.getHeaders()
  });
}

getAllInspectionDetails():Observable<any>{
  return this.http.get<any>(this.urlLive+`/api/inspection/getAllInspection`,{
    headers :this.getHeaders()
  })
}

}
