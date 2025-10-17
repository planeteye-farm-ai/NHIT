import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const admin: Routes = [
 {path:'advanced-ui',children:[
  // {
  //   path: 'accordions-collapse',
  //   loadComponent: () =>
  //     import('./accordions-collapse/accordions-collapse.component').then((m) => m.AccordionsCollapseComponent),
  // },
  {
    path: 'carousel',
    loadComponent: () =>
      import('./carousel/carousel.component').then((m) => m.CarouselComponent),
  }
  
 ]}
];
@NgModule({
  imports: [RouterModule.forChild(admin)],
  exports: [RouterModule],
})
export class advanceduiRoutingModule {
  static routes = admin;
}