import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { ApiUrl } from '../../../shared/const';

@Injectable({
  providedIn: 'root'
})
export class MaterialManagementService {

  urlLive = ApiUrl.API_URL;
  constructor( private http: HttpClient) { 
  }
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `${token}`);
  }

  getMaterialData():Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/material/material_list`,{
      headers:this.getHeaders()
    })
  }

  deleteMaterial(id:any):Observable<any>{
    return this.http.post<any>(this.urlLive+`/api/material/delete_material_by_id/${id}`,{},{
      headers:this.getHeaders()
    })
  }

  addMaterials(data:any):Observable<any>{
    return this.http.post<any[]>(this.urlLive+`/api/material/add_material`,data,{
      headers:this.getHeaders()
    })
  }

  getDetailsById(id:any):Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/material/get_material_by_id/${id}`,{
      headers:this.getHeaders()
    })
  }
  
  updateMaterial(data:any,id:any):Observable<any>{
    return this.http.post<any>(this.urlLive+`/api/material/update_material_by_id/${id}`,data,{
      headers:this.getHeaders()
    })
  }

  getMaterialStock(id:any):Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/material/material_stock/${id}`,{
      headers:this.getHeaders()
    })
  }

// Stock Api

getProductList():Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/purchase_invoice/product_dropdown`,{
      headers:this.getHeaders()
    })
  }

  getClientList():Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/material/client_dropdown`,{
      headers:this.getHeaders()
    })
  }
  addStockTransfer(data:any):Observable<any>{
    return this.http.post<any[]>(this.urlLive+`/api/material/add_transfer_stock`,data,{
      headers:this.getHeaders()
    })
  }

  getStockTransferData():Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/material/transfer_stock_list`,{
      headers:this.getHeaders()
    })
  }

  getBatchDropdwon(id:any):Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/material/get_product_batches/${id}`,{
      headers:this.getHeaders()
    })
  }

  getStockDetailsById(id:any):Observable<any>{
    return this.http.get<any>(this.urlLive+`/api/material/get_transfer_stock/${id}`,{
      headers:this.getHeaders()
    })
  }
  updateStock(data:any,id:any):Observable<any>{
    return this.http.post<any>(this.urlLive+`/api/material/update_transfer_stock/${id}`,data,{
      headers:this.getHeaders()
    })
  }
  confirmStock(id:any):Observable<any>{
    return this.http.post<any>(this.urlLive+`/api/material/confirm_stock_transfer/${id}`,{},{
      headers:this.getHeaders()
    })
  }
  deleteStockTransfer(id:any):Observable<any>{
    return this.http.post<any>(this.urlLive+`/api/material/delete_transfer_stock/${id}`,{},{
      headers:this.getHeaders()
    })
  }
}
