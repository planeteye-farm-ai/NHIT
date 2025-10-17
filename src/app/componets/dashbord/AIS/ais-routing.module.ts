import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{
  path: 'ais', children:[
    {
    path:'ais-dashboard',
    loadComponent:() =>
      import('./ais-dashboard/ais-dashboard.component').then((m) =>m.AisDashboardComponent),
    },
    {
      path: 'accident-manage', children:[
        {
          path :'',
          loadComponent:() =>
            import('./manage-accident/manage-accident.component').then((m) =>m.ManageAccidentComponent)
        },
        {
          path:'add-accident',
          loadComponent:() =>
            import('./manage-accident/add-accident/add-accident.component').then((m) => m.AddAccidentComponent)
        },
        {
          path:'edit-accident/:id',
          loadComponent:() =>
            import('./manage-accident/edit-accident/edit-accident.component').then((m) =>m.EditAccidentComponent)
        },
        {
          path:'view-accident/:id',
          loadComponent:() =>
            import('./manage-accident/view-accident/view-accident.component').then((m) => m.ViewAccidentComponent)
          
        }
      ]
    }
]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AisRoutingModule {
  static routes = routes;
 }
