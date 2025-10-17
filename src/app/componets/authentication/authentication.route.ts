import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
export const admin: Routes = [
  {
    path: 'authentication',
    children: [
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./reset-password/basic/basic.component').then(
            (m) => m.BasicComponent
          ),
      },
      
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(admin)],
  exports: [RouterModule],
})
export class authenticationRoutingModule {
  static routes = admin;
}
