import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BridgeManageRoutingModule } from './BIS/bridge-manage/bridge-manage-routing.module';
import { ManageRoadRoutingModule } from './RIS/manage-road/manage-road-routing.module';
import { TrafficManageRoutingModule } from './TIS/traffic-manage/traffic-manage-routing.module';
import { PavementManageRoutingModule } from './PMS/pavement-manage/pavement-manage-routing.module';
import { AisRoutingModule } from './AIS/ais-routing.module';
import { RwfisManageRoutingModule } from './RWFIS/rwfis-manage/rwfis-manage-routing.module';
import { MaterialManagementRoutingModule } from './Material/material-management-routing.module';
import { UserManagementRoutingModule } from './User/user-management-routing.module';
import { InventoryManagementRoutingModule } from './Inventory/inventory-management-routing.module';
import { SupplierManagementRoutingModule } from './Supplier/supplier-management-routing.module';
import { PurchaseInvoiceRoutingModule } from './Purchase-invoice/purchase-invoice-routing.module';
import { BulkStockUpdateRoutingModule } from './Bulk-stock-update/bulk-stock-update-routing.module';
import { LabourManagementRoutingModule } from './Labour_management/labour-management-routing.module';
import { WorkOrderRoutingModule } from './Work_order/work-order-routing.module';
import { ReportRoutingModule } from './Reports/report-routing.module';
export const admin: Routes = [

{path:'home-dashboard',children:[
  {
    path: '',
    loadComponent: () =>
      import('./Home/home-dashboard/home-dashboard.component').then((m) => m.HomeDashboardComponent),
  },
]},


// for add road
...ManageRoadRoutingModule.routes,

// for ais
...AisRoutingModule.routes,

//  for bridge routes
...BridgeManageRoutingModule.routes,
//  for Traffic routes
...TrafficManageRoutingModule.routes,

//  for Pavement routes
...PavementManageRoutingModule.routes,

// for RWFIS routes
...RwfisManageRoutingModule.routes,

// material
...MaterialManagementRoutingModule.routes, 

// user
...UserManagementRoutingModule.routes,

// inventory
...InventoryManagementRoutingModule.routes,

// Supplier
...SupplierManagementRoutingModule.routes,

// Purchase invoice
...PurchaseInvoiceRoutingModule.routes,

// Stock inward, outward
...BulkStockUpdateRoutingModule.routes,

// Labour Management
...LabourManagementRoutingModule.routes,

// Work Order
...WorkOrderRoutingModule.routes,

// Reports
...ReportRoutingModule.routes,

{path:'pis',children:[
  {
  path: '',
  loadComponent: () =>
   import('./PIS/pis-dashboard/pis-dashboard.component').then((m) => m.PisDashboardComponent),
  },

]},


{path:'rwfis',children:[
  {
  path: '',
  loadComponent: () =>
   import('./RWFIS/rwfis-dashboard/rwfis-dashboard.component').then((m) => m.RwfisDashboardComponent),
  },

]},

{path:'dashboard',children:[
  {
  path: 'data/:id',
  loadComponent: () =>
    import('./Others/sales/sales.component').then((m) => m.SalesComponent),
},
{
  path: 'slider',
  loadComponent: () =>
  import('../advanced-ui/carousel/carousel.component').then((m) => m.CarouselComponent),
}
]},


{path:'road',children:[
  {
 path: 'roadmanage',
 loadComponent: () =>
   import('./Others/road-management/road-management.component').then((m) => m.RoadManagementComponent),
},
]},

{path:'road-section',
 loadComponent: () =>
   import('./Others/road-section/road-section.component').then((m) => m.RoadSectionComponent),
},

{path:'section',
 loadComponent: () =>
   import('./Others/sections/sections.component').then((m) => m.SectionsComponent),
},

{path:'contractor',
 loadComponent: () =>
   import('./Others/contractor/contractor.component').then((m) => m.ContractorComponent),
},

{path:'distress',children:[
  {
  path: '',
  loadComponent: () =>
  import('./Others/distress/distress.component').then((m) => m.DistressComponent),
  },
  {
    path: 'add-distress',
    loadComponent: () =>
    import('./Others/distress/add-distress/add-distress.component').then((m) => m.AddDistressComponent),
    },
]},

{path:'road-furnitures',children:[
  {
  path: '',
  loadComponent: () =>
  import('./Others/road-furnitures/road-furnitures.component').then((m) => m.RoadFurnituresComponent),
  },
  {
    path: 'add-road-furnitures',
    loadComponent: () =>
    import('./Others/road-furnitures/add-road-furnitures/add-road-furnitures.component').then((m) => m.AddRoadFurnituresComponent),
    },
]},

// {path:'bridge-manage',children:[
//   {
//   path: '',
//   loadComponent: () =>
//   import('./BIS/bridge-manage/bridge-manage.component').then((m) => m.BridgeManageComponent),
//   },
//   {
//     path: 'add-bridge',
//     loadComponent: () =>
//     import('./BIS/bridge-manage/add-bridge/add-bridge.component').then((m) => m.AddBridgeComponent),
//   },
//   {
//       path: 'edit-bridge/:id',
//       loadComponent: () =>
//       import('./BIS/bridge-manage/edit-bridge/edit-bridge.component').then((m) => m.EditBridgeComponent),
//   },
//   {
//     path: 'inspection/:id',
//     loadComponent: () =>
//     import('./BIS/bridge-manage/inspection/inspection.component').then((m) => m.InspectionComponent),
//   },
//   {
//     path: 'add-inspection/:id',
//     loadComponent: () =>
//     import('./BIS/bridge-manage/inspection/add-inspection/add-inspection.component').then((m) => m.AddInspectionComponent),
//   },
// ]},
];
@NgModule({
  imports: [RouterModule.forChild(admin)],
  exports: [RouterModule],
})
export class dashboardRoutingModule {
  static routes = admin;
}
