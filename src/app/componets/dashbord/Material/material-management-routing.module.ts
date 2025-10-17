import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{
  path:'material' , children:[
    {
      path:'material-management',
      loadComponent:()=>
        import('./material-management/material-management.component').then((m) => m.MaterialManagementComponent)
    },
    {
      path:'add-material',
      loadComponent:() =>
        import('./add-material/add-material.component').then((m) => m.AddMaterialComponent)
    },
    {
      path:'edit-material/:id',
      loadComponent:() =>
        import('./edit-material/edit-material.component').then((m) => m.EditMaterialComponent)
    },
    {
      path:'view-material/:id',
      loadComponent:() =>
        import('./view-material/view-material.component').then((m) => m.ViewMaterialComponent)
    },
    {
      path:'material-stock/:id',
      loadComponent:() =>
        import('./material-stock/material-stock/material-stock.component').then((m) => m.MaterialStockComponent)
    },
    {
      path:'transfer-stock',
      loadComponent:() =>
        import('./material-stock/material-stock/transfer-stock/transfer-stock.component').then((m) => m.TransferStockComponent)
    }, 
    {
      path:'add-transfer-stock',
      loadComponent:() =>
        import('./material-stock/material-stock/transfer-stock/add-transfer-stock/add-transfer-stock.component').then((m) => m.AddTransferStockComponent)
    }, 
    {
      path:'edit-transfer-stock/:id',
      loadComponent:() =>
        import('./material-stock/material-stock/transfer-stock/edit-transfer-stock/edit-transfer-stock.component').then((m) => m.EditTransferStockComponent)
    }
    , 
    {
      path:'view-transfer-stock/:id',
      loadComponent:() =>
        import('./material-stock/material-stock/transfer-stock/view-transfer-stock/view-transfer-stock.component').then((m) => m.ViewTransferStockComponent)
    }

  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MaterialManagementRoutingModule { 
  static routes = routes;
}
