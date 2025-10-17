import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{
    path:'work-order', children:[
      {
        path:'',
        loadComponent:() => 
          import('./work-order/work-order.component').then((m) => m.WorkOrderComponent)
      },
      {
        path:'add-work-order',
        loadComponent:() => 
          import('./add-workorder/add-workorder.component').then((m) => m.AddWorkorderComponent)
      },
      {
        path:'edit-work-order/:id',
        loadComponent:() =>
          import('./edit-workorder/edit-workorder.component').then((m) => m.EditWorkorderComponent)
      },
      {
        path:'view-work-order/:id',
        loadComponent:() =>
          import('./view-workorder/view-workorder.component').then((m) => m.ViewWorkorderComponent)
      },
      {
        path:'daily-update/:id',
        loadComponent:() =>
          import('./Daily-update/daily-update/daily-update.component').then((m) => m.DailyUpdateComponent)
      },
      {
        path:'add-daily-update/:id',
        loadComponent:() =>
          import('./Daily-update/add-daily-update/add-daily-update.component').then((m) => m.AddDailyUpdateComponent)
      }
      ,
      {
        path:'view-daily-update/:id/:work_order_id',
        loadComponent:() =>
          import('./Daily-update/view-daily-update/view-daily-update.component').then((m) => m.ViewDailyUpdateComponent)
      }

    ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkOrderRoutingModule { 
  static routes = routes;
}
