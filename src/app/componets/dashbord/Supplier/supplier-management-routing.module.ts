import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{
  path:'supplier', children:[
    {
      path:'supplier-management',
      loadComponent:() =>
        import('./supplier-management/supplier-management.component').then((m) => m.SupplierManagementComponent)
    },
    {
      path:'add-supplier',
      loadComponent:() =>
        import('./add-supplier/add-supplier.component').then((m) => m.AddSupplierComponent)
    },
    {
      path:'edit-supplier/:id',
      loadComponent:() =>
        import('./edit-supplier/edit-supplier.component').then((m) => m.EditSupplierComponent)
    },
    {
      path:'view-supplier/:id',
      loadComponent:() =>
        import('./view-supplier/view-supplier.component').then((m) => m.ViewSupplierComponent)
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SupplierManagementRoutingModule {
  static routes = routes;
 }
