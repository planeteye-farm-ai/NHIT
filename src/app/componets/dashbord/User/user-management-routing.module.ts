import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [{
  path:'user' , children:[
    {
      path:'user-management',
      loadComponent:()=>
        import('./user-management/user-management.component').then((m) => m.UserManagementComponent)
      },
    {
      path:'add-user',
      loadComponent:() =>
        import('./add-user/add-user.component').then((m) => m.AddUserComponent)
    },
    {
      path:'edit-user/:id',
      loadComponent:() =>
        import('./edit-user/edit-user.component').then((m) => m.EditUserComponent)
    },
    {
      path:'view-user/:id',
      loadComponent:() =>
        import('./view-user/view-user.component').then((m) => m.ViewUserComponent)
    }
  ]
}];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserManagementRoutingModule {
  static routes = routes;
 }
