import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{
  path:'purchase-invoice', children:[
    {
      path:'',
      loadComponent:()=>
        import('./purchase-invoice/purchase-invoice.component').then((m) => m.PurchaseInvoiceComponent)
    },
    {
      path:'add-invoice',
      loadComponent:()=>
        import('./add-invoice/add-invoice.component').then((m) => m.AddInvoiceComponent)
    },
    {
      path:'edit-invoice/:id',
      loadComponent:()=>
        import('./edit-invoice/edit-invoice.component').then((m) => m.EditInvoiceComponent)
    },
    {
      path:'view-invoice/:id',
      loadComponent:()=>
        import('./view-invoice/view-invoice.component').then((m) => m.ViewInvoiceComponent)
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PurchaseInvoiceRoutingModule {
  static routes = routes;
 }
