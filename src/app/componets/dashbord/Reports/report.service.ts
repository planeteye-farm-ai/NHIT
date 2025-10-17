import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor( private http: HttpClient) { 
  }

 // InventoryReport apit
  getInventoryReportData(filterdata:any):Observable<any>{
    // return this.http.post<any>('https://biapis-production.up.railway.app/inventory_filter',filterdata);
    return this.http.post<any>('https://fantastic-reportapi-production.up.railway.app/inventory_filter',filterdata);
  }

  // distress-reported-report
  getDistressReportedData(filterdata:any):Observable<any>{
    // return this.http.post<any>('https://biapis-production.up.railway.app/distress_report_filter',filterdata);
    return this.http.post<any>('https://fantastic-reportapi-production.up.railway.app/distress_report_filter',filterdata);
  }

  // distress-predicted-report
  getDistressPredictedData(filterdata:any):Observable<any>{
    // return this.http.post<any>('https://biapis-production.up.railway.app/distress_predic_filter',filterdata);
    return this.http.post<any>('https://fantastic-reportapi-production.up.railway.app/distress_predic_filter',filterdata);
  }

  getProjectRange(project_name:any,type:any):Observable<any>{
    return this.http.get<any>(`https://fantastic-reportapi-production.up.railway.app/chainage-summary?project=${project_name}&type=${type}`);
  }
}
