import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { ApiUrl } from '../../../shared/const';

@Injectable({
  providedIn: 'root'
})
export class PurchaseInvoiceService {
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

  getSupplierList():Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/purchase_invoice/supplier_dropdown`,{
      headers:this.getHeaders()
    })
  }

  getProductList():Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/purchase_invoice/product_dropdown`,{
      headers:this.getHeaders()
    })
  }

  addPurchaseInvoice(data:any):Observable<any>{
    return this.http.post<any[]>(this.urlLive+`/api/purchase_invoice/add_purchase_invoice`,data,{
      headers:this.getHeaders()
    })
  }

  getPurcaseInvoiceData():Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/purchase_invoice/purchase_invoice_list`,{
      headers:this.getHeaders()
    })
  }

  deletePurchaseInvoice(id:any):Observable<any>{
    return this.http.post<any>(this.urlLive+`/api/purchase_invoice/delete_purchase_invoice/${id}`,{},{
      headers:this.getHeaders()
    })
  }
  updatePurchaseInvoice(data:any,id:any):Observable<any>{
    return this.http.post<any>(this.urlLive+`/api/purchase_invoice/update_purchase_invoice/${id}`,data,{
      headers:this.getHeaders()
    })
  }

  getDetailsById(id:any):Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/purchase_invoice/get_purchase_invoice/${id}`,{
      headers:this.getHeaders()
    })
  }

  confirmPurchaseInvoice(id:any):Observable<any>{
    return this.http.post<any>(this.urlLive+`/api/purchase_invoice/confirm_purchase_invoice/${id}`,{},{
      headers:this.getHeaders()
    })
  }
  
}
