import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [

  {path:'ris',children:[
    {
    path: 'inventory-dashboard',
    loadComponent: () =>
     import('../ris-inventory/ris-inventory.component').then((m) => m.RisInventoryComponent),
    },
  
    {
      path: 'distress-prediction',
      loadComponent: () =>
       import('../distress-prediction-dashboard/distress-prediction-dashboard.component').then((m) => m.DistressPredictionDashboardComponent),
    },
  
    {
      path: 'reported',
      loadComponent: () =>
       import('../ris-reported-dashboard/ris-reported-dashboard.component').then((m) => m.RisReportedDashboardComponent),
    },

    {
      path: 'road-manage', children: [
        {
          path: '',
          loadComponent: () =>
            import('../manage-road/manage-road.component').then((m) => m.ManageRoadComponent),
        },

        {
          path: 'add-road',
          loadComponent: () =>
            import('../manage-road/add-road/add-road.component').then((m) => m.AddRoadComponent),
        },

        {
          path: 'edit-road/:id',
          loadComponent: () =>
            import('../manage-road/edit-road/edit-road.component').then((m) => m.EditRoadComponent),
        },

        {
          path: 'view-road/:id',
          loadComponent: () =>
            import('../manage-road/view-road/view-road.component').then((m) => m.ViewRoadComponent),
        },

        {
          path: 'history-of-work/:id',
          loadComponent: () =>
            import('../manage-road/history-of-works/history-of-works.component').then((m) => m.HistoryOfWorksComponent),
        },

        {
          path: 'add-history-of-work/:id',
          loadComponent: () =>
            import('../manage-road/history-of-works/add-history-of-works/add-history-of-works.component').then((m) => m.AddHistoryOfWorksComponent),
        },

        {
          path: 'edit-history-of-work/:id',
          loadComponent: () =>
            import('../manage-road/history-of-works/edit-history-of-works/edit-history-of-works.component').then((m) => m.EditHistoryOfWorksComponent),
        },

        {
          path: 'view-history-of-work/:id',
          loadComponent: () =>
            import('../manage-road/history-of-works/view-history-of-works/view-history-of-works.component').then((m) => m.ViewHistoryOfWorksComponent),
        },

        {
          path: 'history-of-work-pdf/:id',
          loadComponent: () =>
            import('../manage-road/history-of-works/history-of-works-pdf/history-of-works-pdf.component').then((m) => m.HistoryOfWorksPdfComponent),
        },
        
        {
          path: 'road-inventory/:id',
          loadComponent: () =>
            import('../manage-road/road-inventory/road-inventory.component').then((m) => m.RoadInventoryComponent),
        },

        {
          path: 'add-inventory/:id',
          loadComponent: () =>
            import('../manage-road/road-inventory/add-inventory/add-inventory.component').then((m) => m.AddInventoryComponent),
        },

        {
          path: 'edit-inventory/:id',
          loadComponent: () =>
            import('../manage-road/road-inventory/edit-inventory/edit-inventory.component').then((m) => m.EditInventoryComponent),
        },

        {
          path: 'view-inventory/:id',
          loadComponent: () =>
            import('../manage-road/road-inventory/view-inventory/view-inventory.component').then((m) => m.ViewInventoryComponent),
        },

        {
          path: 'road-inventory-pdf/:id',
          loadComponent: () =>
            import('../manage-road/road-inventory/road-inventory-pdf/road-inventory-pdf.component').then((m) => m.RoadInventoryPdfComponent),
        },
        
        
        {
          path: 'flexible-distress',
          loadComponent: () =>
            import('../distress-management/flexible-distress/flexible-distress.component').then((m) => m.FlexibleDistressComponent),
        },

        {
          path: 'add-flexible-distress',
          loadComponent: () =>
            import('../distress-management/flexible-distress/add-flexible-distress/add-flexible-distress.component').then((m) => m.AddFlexibleDistressComponent),
        },

        {
          path: 'edit-flexible-distress/:id',
          loadComponent: () =>
            import('../distress-management/flexible-distress/edit-flexible-distress/edit-flexible-distress.component').then((m) => m.EditFlexibleDistressComponent),
        },

        {
          path: 'view-flexible-distress/:id',
          loadComponent: () =>
            import('../distress-management/flexible-distress/view-flexible-distress/view-flexible-distress.component').then((m) => m.ViewFlexibleDistressComponent),
        },

        {
          path: 'rigid-distress',
          loadComponent: () =>
            import('../distress-management/rigid-distress/rigid-distress.component').then((m) => m.RigidDistressComponent),
        },


        {
          path: 'add-rigid-distress',
          loadComponent: () =>
            import('../distress-management/rigid-distress/add-rigid-distress/add-rigid-distress.component').then((m) => m.AddRigidDistressComponent),
        },

        {
          path: 'edit-rigid-distress/:id',
          loadComponent: () =>
            import('../distress-management/rigid-distress/edit-rigid-distress/edit-rigid-distress.component').then((m) => m.EditRigidDistressComponent),
        },

        {
          path: 'view-rigid-distress/:id',
          loadComponent: () =>
            import('../distress-management/rigid-distress/view-rigid-distress/view-rigid-distress.component').then((m) => m.ViewRigidDistressComponent),
        }, 

        {
          path: 'road-pdf/:id',
          loadComponent: () =>
            import('../manage-road/road-pdf/road-pdf.component').then((m) => m.RoadPdfComponent)
        },

      ]
    }
  
  ]},
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageRoadRoutingModule {

  static routes = routes;
  
 }
