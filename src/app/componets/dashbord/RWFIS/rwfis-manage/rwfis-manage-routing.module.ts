import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{
  path:'rwfis', children:[
    {
      path:'rwfis-dashboard',
      loadComponent:() =>
        import('../rwfis-dashboard/rwfis-dashboard.component').then((m) => m.RwfisDashboardComponent),
    },
    {
      path:'rwfis-manage', children:[
        {
          path:'',
          loadComponent:()=>
            import('../rwfis-manage/rwfis-manage.component').then((m) =>m.RwfisManageComponent)
        },
        {
          path:'add-rwfis',
          loadComponent:() =>
            import('../rwfis-manage/add-rwfis/add-rwfis.component').then((m) => m.AddRwfisComponent)
        },
        {
          path:'edit-rwfis/:id',
          loadComponent:()=>
            import('../rwfis-manage/edit-rwfis/edit-rwfis.component').then((m) =>m.EditRwfisComponent)
        },
        {
          path:'view-rwfis/:id',
          loadComponent:() =>
            import('../rwfis-manage/view-rwfis/view-rwfis.component').then((m)=>m.ViewRwfisComponent)
        }

      ]
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RwfisManageRoutingModule {
  static routes =routes;
 }
