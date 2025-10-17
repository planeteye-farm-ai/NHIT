import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'bis-home',
    loadComponent: () =>
      import('../bis-home/bis-home.component').then((m) => m.BisHomeComponent),
  },
  { path: 'bis', children: [

    {
      path: 'bis-dashboard',
      loadComponent: () =>
        import('../bis-dashboard/bis-dashboard.component').then((m) => m.BisDashboardComponent),
    },

    {
      path: 'project-manage', children: [
        {
          path: '',
          loadComponent: () =>
            import('../project-manage/project-manage.component').then((m) => m.ProjectManageComponent),
        },

        {
          path: 'add-project',
          loadComponent: () =>
            import('../project-manage/add-project/add-project.component').then((m) => m.AddProjectComponent),
        },

        {
          path: 'edit-project',
          loadComponent: () =>
            import('../project-manage/edit-project/edit-project.component').then((m) => m.EditProjectComponent),
        },

        {
          path: 'view-project',
          loadComponent: () =>
            import('../project-manage/view-project/view-project.component').then((m) => m.ViewProjectComponent),
        },


      ]
    },

    {
      path: 'testing',
      loadComponent: () =>
        import('../bis-testing/bis-testing.component').then((m) => m.BisTestingComponent),
    },

    {
      path: 'repair',
      loadComponent: () =>
        import('../bis-repair/bis-repair.component').then((m) => m.BisRepairComponent),
    },

    {
      path: 'bridge-manage', children: [
        {
          path: '',
          loadComponent: () =>
            import('../bridge-manage/bridge-manage.component').then((m) => m.BridgeManageComponent),
        },
  
        {
          path: 'add-bridge',
          loadComponent: () =>
          import('../bridge-manage/add-bridge/add-bridge.component').then((m) => m.AddBridgeComponent),
        },
  
        {
          path: 'edit-bridge/:id',
          loadComponent: () =>
          import('../bridge-manage/edit-bridge/edit-bridge.component').then((m) => m.EditBridgeComponent),
        },
  
        
        {
          path: 'view-bridge/:id',
          loadComponent: () =>
          import('../bridge-manage/view-bridge/view-bridge.component').then((m) => m.ViewBridgeComponent),
        },
  
        {
          path: 'inspection/:id',
          loadComponent: () =>
          import('../bridge-manage/inspection/inspection.component').then((m) => m.InspectionComponent),
        },
  
        {
          path: 'add-inspection/:id',
          loadComponent: () =>
          import('../bridge-manage/inspection/add-inspection/add-inspection.component').then((m) => m.AddInspectionComponent),
        },
  
        {
          path: 'edit-inspection/:id',
          loadComponent: () =>
          import('../bridge-manage/inspection/edit-inspection/edit-inspection.component').then((m) => m.EditInspectionComponent),
        },
  
        {
          path: 'inspection-pdf/:id',
          loadComponent: () =>
            import('./inspection/inspection-pdf/inspection-pdf/inspection-pdf.component').then((m) => m.InspectionPdfComponent)
        },
        {
          path: 'view-inspection/:id',
          loadComponent: () =>
          import('../bridge-manage/inspection/view-inspection/view-inspection.component').then((m) => m.ViewInspectionComponent),
        },
  
        {
          path: 'inspection-images/:id',
          loadComponent: () =>
          import('../bridge-manage/inspection/upload-images/upload-images.component').then((m) => m.UploadImagesComponent),
        },
  
        {
          path: 'bridge-rating/:id',
          loadComponent: () =>
          import('../bridge-manage/bridge-rating/bridge-rating.component').then((m) => m.BridgeRatingComponent),
        },
      
        {
          path: 'add-rating/:id',
          loadComponent: () =>
          import('../bridge-manage/bridge-rating/add-rating/add-rating.component').then((m) => m.AddRatingComponent),
        },
      
        {
          path: 'edit-rating/:id',
          loadComponent: () =>
          import('../bridge-manage/bridge-rating/edit-rating/edit-rating.component').then((m) => m.EditRatingComponent),
        },

        {
          path: 'view-rating/:id',
          loadComponent: () =>
          import('../bridge-manage/bridge-rating/view-rating/view-rating.component').then((m) => m.ViewRatingComponent),
        },
        {
          path: 'all-inspection',
          loadComponent: () =>
            import('../bridge-manage/inspection/all-inspection/all-inspection.component').then((m) => m.AllInspectionComponent)
        }
      ]
    }
  ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BridgeManageRoutingModule { 
  static routes = routes;
  
}
