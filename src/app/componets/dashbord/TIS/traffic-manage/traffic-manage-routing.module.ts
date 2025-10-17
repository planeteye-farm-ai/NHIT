import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{
  path: 'tis', children:[
    {
      path: 'tis-dashboard',
      loadComponent: () =>
        import('../tis-dashboard/tis-dashboard.component').then((m) => m.TisDashboardComponent),
    },
    {
      path: 'traffic-manage',children:[
        {
          path:'',
          loadComponent: () =>
            import('../traffic-manage/traffic-manage.component').then((m) => m.TrafficManageComponent),
        },

        {
          path: 'add-traffic',
          loadComponent :()=>
            import('../traffic-manage/add-traffic/add-traffic.component').then((m) => m.AddTrafficComponent),
        },
        {
          path: 'edit-traffic/:id',
          loadComponent:() =>
            import('../traffic-manage/edit-traffic/edit-traffic.component').then((m) => m.EditTrafficComponent),
        },
        {
          path: 'view-traffic/:id',
          loadComponent:()=>
            import('../traffic-manage/view-traffic/view-traffic.component').then((m) => m.ViewTrafficComponent),
        },
        {
          path: 'tis-pdf/:id',
          loadComponent: () =>
            import('../traffic-manage/tis-pdf/tis-pdf.component').then((m) => m.TisPdfComponent)
        }, 
      ]
    },
     
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrafficManageRoutingModule { 
  static routes = routes;
 }
