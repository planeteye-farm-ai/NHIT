import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{
  path:'labour-management' , children:[
    {
      path:'',
      loadComponent:()=>
        import('./labour-management/labour-management.component').then((m) => m.LabourManagementComponent)
      },
    {
      path:'add-labour',
      loadComponent:() =>
        import('./add-labour/add-labour.component').then((m) => m.AddLabourComponent)
      },
    {
      path:'edit-labour/:id',
      loadComponent:() =>
        import('./edit-labour/edit-labour.component').then((m) => m.EditLabourComponent)
      },
    {
      path:'view-labour/:id',
      loadComponent:() =>
        import('./view-labour/view-labour.component').then((m) => m.ViewLabourComponent)
      }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LabourManagementRoutingModule {
  static routes = routes;
 }
