import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { image } from 'html2canvas/dist/types/css/types/image';

const routes: Routes = [{
  path:'stock',children:[
    {
      path:'bulk-inward',
      loadComponent:() =>
        import('./bulk-inward/bulk-inward.component').then((m) => m.BulkInwardComponent)
    },
    {
      path:'bulk-outward',
      loadComponent:() =>
        import('./bulk-outward/bulk-outward.component').then((m) => m.BulkOutwardComponent)
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BulkStockUpdateRoutingModule {
  static routes = routes;
 }
