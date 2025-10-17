import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{
  path:'pms',children:[
    {
    path: 'pms-dashboard',
    loadComponent: () =>
    import('../../PMS/pms-dashboard/pms-dashboard.component').then((m) => m.PmsDashboardComponent)
    },
    {
      path: 'section-file',children:[
        {
          path:'',
          loadComponent: () =>
            import('../pavement-manage/section-file/section-file.component').then((m) => m.SectionFileComponent)
        },
        {
          path:'add-section',
          loadComponent:() =>
            import('../pavement-manage/section-file/add-section-file/add-section-file.component').then((m) =>m.AddSectionFileComponent)
        },
        {
          path: 'edit-section/:id',
          loadComponent:() =>
            import('../pavement-manage/section-file/edit-section-file/edit-section-file.component').then((m) => m.EditSectionFileComponent)
        },
        {
          path: 'view-section/:id',
          loadComponent:() =>
            import('../pavement-manage/section-file/view-section-file/view-section-file.component').then((m) => m.ViewSectionFileComponent)
        },

        {
          path: 'section-pdf/:id',
          loadComponent:() => 
            import('../pavement-manage/section-file/section-file-pdf/section-file-pdf.component').then((m) => m.SectionFilePdfComponent)
        }
      ]
    },
    {
      path: 'traffic-file',children:[
        {
          path:'',
          loadComponent: () =>
           import('../pavement-manage/traffic-file/traffic-file.component').then((m) => m.TrafficFileComponent)
        },
        {
          path:'add-traffic-file',
          loadComponent:() =>
            import('../pavement-manage/traffic-file/add-traffic-file/add-traffic-file.component').then((m) => m.AddTrafficFileComponent)
        },
        {
          path: 'edit-traffic-file/:id',
          loadComponent:() =>
            import('../pavement-manage/traffic-file/edit-traffic-file/edit-traffic-file.component').then
            ((m) => m.EditTrafficFileComponent)
           
        },
        {
          path: 'view-traffic-file/:id',
          loadComponent:() =>
            import('../pavement-manage/traffic-file/view-traffic-file/view-traffic-file.component').then((m) => m.ViewTrafficFileComponent)
        },
        {
          path : 'traffic-file-pdf/:id',
          loadComponent:() =>
            import('../pavement-manage/traffic-file/traffic-file-pdf/traffic-file-pdf.component').then((m) => m.TrafficFilePdfComponent)
        }
      ]
    },
    {
      path: 'homogenous-section',children:[
        {
          path:'',
          loadComponent:() =>
            import('../pavement-manage/homogenous-section/homogenous-section.component').then((m) => m.HomogenousSectionComponent)
        },
        {
          path:'add-homogenous-section',
          loadComponent:() =>
            import('../pavement-manage/homogenous-section/add-homogenous-section/add-homogenous-section.component').then((m) => m.AddHomogenousSectionComponent)
        },
        {
          path:'edit-homogenous-section/:id',
          loadComponent:() =>
            import('../pavement-manage/homogenous-section/edit-homogenous-section/edit-homogenous-section.component').then((m) => m.EditHomogenousSectionComponent)
        },
        {
          path:'view-homogenous-section/:id',
          loadComponent:() =>
            import('../pavement-manage/homogenous-section/view-homogenous-section/view-homogenous-section.component').then((m) => m.ViewHomogenousSectionComponent)
        }
      ]
    }
  
  ],
}
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PavementManageRoutingModule { 
  static routes = routes;
 }
