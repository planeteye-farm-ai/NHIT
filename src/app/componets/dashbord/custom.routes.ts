import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const admin: Routes = [
//  {path:'dashboard',children:[
//    {
//   path: 'customer',
//   loadComponent: () =>
//     import('./customer/customer.component').then((m) => m.CustomerComponent),
// },
//  ]}
]
@NgModule({
    imports: [RouterModule.forChild(admin)],
    exports: [RouterModule],
  })
  export class customRoutingModule {
    static routes = admin;
  }