import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
const routes: Routes = [
  {
    path: 'masters',
    children:[
      {
      path: 'road-type',
      loadComponent: () =>
       import('./road-type/road-type.component').then((m) => m.RoadTypeComponent),
      }, 
      {
      path: 'pavement-type',
      loadComponent: () =>
      import('./pavement-type/pavement-type.component').then((m) => m.PavementTypeComponent),
      }, 
      {
      path: 'pavement-width',
      loadComponent: () =>
      import('./pavement-width/pavement-width.component').then((m) => m.PavementWidthComponent),
      },
      {
      path: 'shoulder-type',
      loadComponent: () =>
        import('./shoulder-type/shoulder-type.component').then((m) => m.ShoulderTypeComponent),
      },
      {
        path: 'shoulder-width',
        loadComponent: () =>
          import('./shoulder-width/shoulder-width.component').then((m) => m.ShoulderWidthComponent),
      },
      {
        path: 'topography',
        loadComponent: () =>
          import('./topography/topography.component').then((m) => m.TopographyComponent),
      },
      {
        path: 'drain-type',
        loadComponent: () =>
          import('./drain-type/drain-type.component').then((m) => m.DrainTypeComponent),
      },
      {
        path: 'median-width',
        loadComponent: () =>
          import('./median-width/median-width.component').then((m) => m.MedianWidthComponent),
      },
      {
        path: 'carriageway-furniture',
        loadComponent: () =>
          import('./carriageway-furniture/carriageway-furniture.component').then((m) => m.CarriagewayFurnitureComponent),
      },
      {
        path: 'wayside-amenities',
        loadComponent: () =>
          import('./wayside-amenities/wayside-amenities.component').then((m) => m.WaysideAmenitiesComponent),
      },
      {
        path: 'land-use',
        loadComponent: () =>
          import('./land-use/land-use.component').then((m) => m.LandUseComponent),
      },
      {
        path: 'cross-section',
        loadComponent: () =>
          import('./cross-section/cross-section.component').then((m) => m.CrossSectionComponent),
      },

]},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MasterRoutingModule {
   static routes = routes;
}
