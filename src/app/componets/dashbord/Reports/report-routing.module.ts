import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
const routes: Routes = [
   {path:'reports',children:[
  {
    path: 'inventory-report',
    loadComponent: () =>
      import('./inventory-report/inventory-report.component').then((m) => m.InventoryReportComponent),
  },
  {
    path: 'distress-reported-report',
    loadComponent: () => 
      import('./distress-reported-report/distress-reported-report.component').then((m) => m.DistressReportedReportComponent)
  },
  {
    path: 'distress-prediction-report',
    loadComponent: () =>
      import('./distress-prediction-report/distress-prediction-report.component').then((m) => m.DistressPredictionReportComponent)
  }
]},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule {
  static routes = routes;

 }
