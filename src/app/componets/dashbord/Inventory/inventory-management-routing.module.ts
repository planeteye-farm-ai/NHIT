import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{
  path:'inventory' , children:[
    {
      path:'inventory-management',
      loadComponent:()=>
        import('./inventory-management/inventory-management.component').then((m) => m.InventoryManagementComponent)
      },
    {
      path:'add-inventory',
      loadComponent:() =>
       import('./add-inventory/add-inventory.component').then((m)=> m.AddInventoryComponent)
    },
    {
      path:'edit-inventory/:id',
      loadComponent:() =>
        import('./edit-inventory/edit-inventory.component').then((m) => m.EditInventoryComponent)
    },
    {
      path:'view-inventory/:id',
      loadComponent:() =>
        import('./view-inventory/view-inventory.component').then((m) => m.ViewInventoryComponent)
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryManagementRoutingModule { 
  static routes = routes;
}
