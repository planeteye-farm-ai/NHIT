import { Injectable, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders} from '@angular/common/http';

// Menu
export interface Menu {
  headTitle?: string;
  headTitle2?: string;
  path?: string;
  dirchange?: boolean;
  title?: string;
  icon?: string;
  type?: string;
  badgeValue?: string;
  badgeClass?: string;
  active?: boolean;
  selected?: boolean;
  bookmark?: boolean;
  children?: Menu[];
  Menusub?: boolean;
  target?: boolean;
  menutype?: string;
}

@Injectable({
  providedIn: 'root',
  
})
export class NavService implements OnDestroy {

  private unsubscriber: Subject<any> = new Subject();
  public screenWidth: BehaviorSubject<number> = new BehaviorSubject(
    window.innerWidth
  );

  // Search Box
  public search = false;

  // Language
  public language = false;

  // Mega Menu
  public megaMenu = false;
  public levelMenu = false;
  public megaMenuColapse: boolean = window.innerWidth < 1199 ? true : false;

  // Collapse Sidebar
  public collapseSidebar: boolean = window.innerWidth < 991 ? true : false;

  // For Horizontal Layout Mobile
  public horizontal: boolean = window.innerWidth < 991 ? false : true;

  // Full screen
  public fullScreen = false;
  active: any;

  public MENUITEMS: Menu[] = [];
  public MENUITEMS1: Menu[] = [];

  constructor(private router: Router,private http: HttpClient) {
    this.setScreenWidth(window.innerWidth);
    fromEvent(window, 'resize')
      .pipe(debounceTime(1000), takeUntil(this.unsubscriber))
      .subscribe((evt: any) => {
        this.setScreenWidth(evt.target.innerWidth);
        if (evt.target.innerWidth < 991) {
          this.collapseSidebar = true;
          this.megaMenu = false;
          this.levelMenu = false;
        }
        if (evt.target.innerWidth < 1199) {
          this.megaMenuColapse = true;
        }
      });
    if (window.innerWidth < 991) {
      // Detect Route change sidebar close
      this.router.events.subscribe((event) => {
        this.collapseSidebar = true;
        this.megaMenu = false;
        this.levelMenu = false;
      });
    }

    this.loadMenuItems();
    
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.unsubscriber.next;
    this.unsubscriber.complete();
  }

  private setScreenWidth(width: number): void {
    this.screenWidth.next(width);
  }


  private loadMenuItems(): void {
          this.MENUITEMS1 = [
            { headTitle: 'Bridge' },
            {
              title: 'Bridge',
              icon: 'bi-house',
              active: false,
              selected: false,
              badgeClass: 'badge badge-sm bg-secondary badge-hide',
              badgeValue: 'new',
              path: '/bis-home',
              dirchange: false,
              type: 'link',
            },

            { headTitle: 'BMS' },
            {
              
              title: 'BMS',
              icon: 'bi-list-ul',
              active: false,
              selected: false,
              badgeClass: 'badge badge-sm bg-secondary badge-hide',
              badgeValue: 'new',
              path: '/bis/bis-dashboard',
              dirchange: false,
              type: 'link',
            
            },
            
            
            { headTitle: 'Project Management' },
            {
              
              title: 'Project Management',
              icon: 'bi-list-ul',
              active: false,
              selected: false,
              badgeClass: 'badge badge-sm bg-secondary badge-hide',
              badgeValue: 'new',
              path: '/bis/project-manage',
              dirchange: false,
              type: 'link',
            
            },

            { headTitle: 'Inventory' },
            {
              
              title: 'Inventory',
              icon: 'bi-list-ul',
              active: false,
              selected: false,
              badgeClass: 'badge badge-sm bg-secondary badge-hide',
              badgeValue: 'new',
              path: '/bis/bridge-manage',
              dirchange: false,
              type: 'link',
            
            },

            {
              title: 'Testing',
              icon: 'bi-list-ul',
              active: false,
              selected: false,
              badgeClass: 'badge badge-sm bg-secondary badge-hide',
              badgeValue: 'new',
              path: '/bis/testing',
              dirchange: false,
              type: 'link',
            
            },

            {
              title: 'Repair',
              icon: 'bi-list-ul',
              active: false,
              selected: false,
              badgeClass: 'badge badge-sm bg-secondary badge-hide',
              badgeValue: 'new',
              path: '/bis/repair',
              dirchange: false,
              type: 'link',
            
            },
            
            { headTitle: 'Reports' },
            {
              title: 'Reports',
              icon: 'bi-file-earmark-text',
              dirchange: false,
              type: 'sub',
              active: false, 
            },  
                  
          ];

          this.MENUITEMS = [
            { headTitle: 'Information System' },
            {
              title: 'Information System',
              icon: 'bi-house',
              active: false,
              selected: false,
              badgeClass: 'badge badge-sm bg-secondary badge-hide',
              badgeValue: 'new',
              path: '/home-dashboard',
              dirchange: false,
              type: 'link',
            },
            
            { headTitle: 'Project' },
            {
              title: 'Project',
              icon: 'bi-list-ul',
              dirchange: false,
              type: 'sub',
              active: false,
              children: [
                {
                  title: 'PIS',
                  dirchange: false,
                  type: 'link',
                  active: false,
                  selected: false,
                  path: '/pis',
                },

              ]
            },

            { headTitle: 'Road' },
            {
              title: 'Road',
              icon: 'bi-list-ul',
              dirchange: false,
              type: 'sub',
              active: false,
              children: [
                {
                  title: 'Inventory',
                  dirchange: false,
                  type: 'link',
                  active: false,
                  selected: false,
                  path: '/ris/inventory-dashboard',
                },
                {
                  title: 'Distress',
                  dirchange: false,
                  type: 'sub',
                  active: false,
                  selected: false,
                  children: [
                  {
                    title: 'Reported',
                    dirchange: false,
                    type: 'link',
                    active: false,
                    selected: false,
                    path: '/ris/reported',
                  },
                  {
                    title: 'Predicted',
                    dirchange: false,
                    type: 'link',
                    active: false,
                    selected: false,
                    path: '/ris/distress-prediction',
                  },
                ]
                },

                {
                  title: 'Road Management',
                  dirchange: false,
                  type: 'link',
                  active: false,
                  selected: false,
                  path: '/ris/road-manage',
                },

                {
                  title: 'Distress Management',
                  dirchange: false,
                  type: 'sub',
                  active: false,
                  selected: false,
                  children: [
                  {
                    title: 'Rigid',
                    dirchange: false,
                    type: 'link',
                    active: false,
                    selected: false,
                    path: '/ris/road-manage/rigid-distress',
                  },
                  {
                    title: 'Flexible',
                    dirchange: false,
                    type: 'link',
                    active: false,
                    selected: false,
                    path: '/ris/road-manage/flexible-distress',
                  },
                ]
                },
              ]
            },

            { headTitle: 'Bridge' },
            {
              title: 'Bridge',
              icon: 'bi-list-ul',
              dirchange: false,
              type: 'sub',
              active: false,
              children: [
                {
                  title: 'BMS',
                  dirchange: false,
                  type: 'link',
                  active: false,
                  selected: false,
                  path: '/bis/bis-dashboard',
                },
                {
                  title: 'Bridge Management',
                  dirchange: false,
                  type: 'link',
                  active: false,
                  selected: false,
                  path: '/bis/bridge-manage',
                },
                {
                  title: 'All Inspection',
                  dirchange: false,
                  type: 'link',
                  active: false,
                  selected: false,
                  path: '/bis/bridge-manage/all-inspection/',
                },
              ]
            },

            { headTitle: 'Traffic' },
            {
              title: 'Traffic',
              icon: 'bi-list-ul',
              dirchange: false,
              type: 'sub',
              active: false,
              children: [
                {
                  title: 'TIS',
                  dirchange: false,
                  type: 'link',
                  active: false,
                  selected: false,
                  path: '/tis/tis-dashboard',
                },
                {
                  title: 'Traffic Data Management',
                  dirchange: false,
                  type: 'link',
                  active: false,
                  selected: false,
                  path: '/tis/traffic-manage',
                },
                
              ]
            }, 

            { headTitle: 'Accident' },
            {
              title: 'Accident',
              icon: 'bi-list-ul',
              dirchange: false,
              type: 'sub',
              active: false,
              children: [
                {
                  title: 'AIS',
                  dirchange: false,
                  type: 'link',
                  active: false,
                  selected: false,
                  path: '/ais/ais-dashboard',
                },
                // {
                //   title: 'Accident Management',
                //   dirchange: false,
                //   type: 'link',
                //   active: false,
                //   selected: false,
                //   path: '/ais/accident-manage',
                // },
                                
              ]
            },

            { headTitle: 'Pavement' },
            {
              title: 'Pavement',
              icon: 'bi-list-ul',
              dirchange: false,
              type: 'sub',
              active: false,
              children: [
                {
                  title: 'PMS',
                  dirchange: false,
                  type: 'link',
                  active: false,
                  selected: false,
                  path: '/pms/pms-dashboard',
                },
                {
                  title: 'Section File',
                  dirchange: false,
                  type: 'link',
                  active: false,
                  selected: false,
                  path: '/pms/section-file',
                },
                {
                  title: 'Traffic File',
                  dirchange: false,
                  type: 'link',
                  active : false,
                  selected: false,
                  path: 'pms/traffic-file'
                },
                {
                  title: 'Homogenous Section',
                  dirchange: false,
                  type: 'link',
                  active : false,
                  selected: false,
                  path: 'pms/homogenous-section'
                }
              ]
            },


            { headTitle: 'Road Way Features' },
            {
              title: 'Road Way Features',
              icon: 'bi-list-ul',
              dirchange: false,
              type: 'sub',
              active: false,
              children: [
                {
                  title: 'RWFIS',
                  dirchange: false,
                  type: 'link',
                  active: false,
                  selected: false,
                  path: '/rwfis/rwfis-dashboard',
                },
                {
                  title: 'RWFIS Management',
                  dirchange: false,
                  type: 'link',
                  active: false,
                  selected: false,
                  path: '/rwfis/rwfis-manage',
                }
                
              ]
            },

            { headTitle: 'Labour Management' },
            {
              title: 'Labour Management',
              icon: 'bi-list-ul',
              dirchange: false,
              type: 'sub',
              active: false,
              children: [
                {
                  title: 'Labour List',
                  dirchange: false,
                  type: 'link',
                  active: false,
                  selected: false,
                  path: '/labour-management',
                },
                {
                  title: 'Add Labour',
                  dirchange: false,
                  type: 'link',
                  active: false,
                  selected: false,
                  path: '/labour-management/add-labour',
                },
                                
              ]
            },
            { headTitle: 'Stock Management' },
            {
              title: 'Stock Management',
              icon: 'bi-collection',
              dirchange: false,
              type: 'sub',
              active: false,
              children: [
                {
                  title: 'Supplier Management',
                  icon: 'bi-collection',
                  dirchange: false,
                  type: 'sub',
                  active: false,
                  children: [
                    {
                      title: 'Supplier List',
                      dirchange: false,
                      type: 'link',
                      active: false,
                      selected: false,
                      path: '/supplier/supplier-management',
                    },
                    {
                      title: 'Add Supplier',
                      dirchange: false,
                      type: 'link',
                      active: false,
                      selected: false,
                      path: '/supplier/add-supplier',
                    }
                  ]
                },
                {
                  title: 'Material Management',
                  icon: 'bi-collection',
                  dirchange: false,
                  type: 'sub',
                  active: false,
                  children: [
                    {
                      title: 'Material List',
                      dirchange: false,
                      type: 'link',
                      active: false,
                      selected: false,
                      path: '/material/material-management',
                    },
                    {
                      title: 'Add Material',
                      dirchange: false,
                      type: 'link',
                      active: false,
                      selected: false,
                      path: '/material/add-material',
                    }
                  ]
                },
                {
                  title: 'Transfer Stock',
                  icon: 'bi-collection',
                  dirchange: false,
                  type: 'sub',
                  active: false,
                  children: [
                    {
                      title: 'Transfer Stock List',
                      dirchange: false,
                      type: 'link',
                      active: false,
                      selected: false,
                      path: '/material/transfer-stock',
                    },
                    {
                      title: 'Add Transfer Stock',
                      dirchange: false,
                      type: 'link',
                      active: false,
                      selected: false,
                      path: '/material/add-transfer-stock',
                    }
                  ]
                },
                {
                  title: 'Equipment Management',
                  icon: 'bi-collection',
                  dirchange: false,
                  type: 'sub',
                  active: false,
                  children: [
                    {
                      title: 'Equipment List',
                      dirchange: false,
                      type: 'link',
                      active: false,
                      selected: false,
                      path: '/inventory/inventory-management',
                    },
                    {
                      title: 'Add Equipment',
                      dirchange: false,
                      type: 'link',
                      active: false,
                      selected: false,
                      path: '/inventory/add-inventory',
                    }
                  ]
                },
                {
                  title: 'Purchase Invoice',
                  icon: 'bi-collection',
                  dirchange: false,
                  type: 'sub',
                  active: false,
                  children: [
                    {
                      title: 'Invoice List',
                      dirchange: false,
                      type: 'link',
                      active: false,
                      selected: false,
                      path: '/purchase-invoice',
                    },
                    {
                      title: 'Add Invoice',
                      dirchange: false,
                      type: 'link',
                      active: false,
                      selected: false,
                      path: '/purchase-invoice/add-invoice',
                    }
                  ]
                },
                {
                  title: 'Bulk Stock Update',
                  icon: 'bi-collection',
                  dirchange: false,
                  type: 'sub',
                  active: false,
                  children: [
                    {
                      title: 'Bulk Inward',
                      dirchange: false,
                      type: 'link',
                      active: false,
                      selected: false,
                      path: 'stock/bulk-inward',
                    },
                    {
                      title: 'Bulk Outward',
                      dirchange: false,
                      type: 'link',
                      active: false,
                      selected: false,
                      path: '/stock/bulk-outward',
                    }
                  ]
                },
            ]},

            { headTitle: 'Work Order' },
            {
              title: 'Work Order',
              icon: 'bi-list-ul',
              dirchange: false,
              type: 'sub',
              active: false,
              children: [
                {
                  title: 'Work Order List',
                  dirchange: false,
                  type: 'link',
                  active: false,
                  selected: false,
                  path: '/work-order',
                },
                {
                  title: 'Add Work Order',
                  dirchange: false,
                  type: 'link',
                  active: false,
                  selected: false,
                  path: '/work-order/add-work-order',
                },
                                
              ]
            },

            { headTitle: 'User Management' },
            {
              title: 'User Management',
              icon: 'bi-list-ul',
              dirchange: false,
              type: 'sub',
              active: false,
              children: [
                {
                  title: 'User List',
                  dirchange: false,
                  type: 'link',
                  active: false,
                  selected: false,
                  path: '/user/user-management',
                },
                {
                  title: 'Add User',
                  dirchange: false,
                  type: 'link',
                  active: false,
                  selected: false,
                  path: '/user/add-user',
                }
                
              ]
            },

            { headTitle: 'Reports' },
            {
              title: 'Reports',
              icon: 'bi-file-earmark-text',
              dirchange: false,
              type: 'sub',
              active: false,
              
            },
            
            { headTitle: 'Others' },
            {
              title: 'Others',
              icon: 'bi-collection',
              dirchange: false,
              type: 'sub',
              active: false,
              children: [
                // {
                //   title: 'Dashboard',
                //   icon: 'bi-house',
                //   dirchange: false,
                //   type: 'sub',
                //   active: false,
                //   children: apiData.map((item: any) => ({
                //     title: item.title,  
                //     dirchange: false,
                //     type: 'link',
                //     active: false,
                //     selected: false,
                //     path: `/dashboard/data/${item.list_id}`  
                //   }))
                // },
                {
                  title: 'Distress',
                  icon: 'bi-list-ul',
                  active: false,
                  selected: false,
                  badgeClass: 'badge badge-sm bg-secondary badge-hide',
                  badgeValue: 'new',
                  path: '/distress',
                  dirchange: false,
                  type: 'link',
                },
                {
                  title: 'Road Furniture',
                  icon: 'bi-list-ul',
                  active: false,
                  selected: false,
                  badgeClass: 'badge badge-sm bg-secondary badge-hide',
                  badgeValue: 'new',
                  path: '/road-furnitures',
                  dirchange: false,
                  type: 'link',
                },
                {
                  title: 'Road Management',
                  icon: 'bi-list-ul',
                  active: false,
                  selected: false,
                  badgeClass: 'badge badge-sm bg-secondary badge-hide',
                  badgeValue: 'new',
                  path: '/road/roadmanage',
                  dirchange: false,
                  type: 'link',
                },
                {
                  title: 'Section',
                  icon: 'bi-list-ul',
                  active: false,
                  selected: false,
                  badgeClass: 'badge badge-sm bg-secondary badge-hide',
                  badgeValue: 'new',
                  path: '/section',
                  dirchange: false,
                  type: 'link',
                },
                {
                  title: 'Contractor Management',
                  icon: 'bi-list-ul',
                  active: false,
                  selected: false,
                  badgeClass: 'badge badge-sm bg-secondary badge-hide',
                  badgeValue: 'new',
                  path: '/contractor',
                  dirchange: false,
                  type: 'link',
                },
                {
                  title: 'Masters',
                  icon: 'bi-collection',
                  dirchange: false,
                  type: 'sub',
                  active: false,
                  children: [
                    {
                      title: 'Road Type',
                      dirchange: false,
                      type: 'link',
                      active: false,
                      selected: false,
                      path: '/masters/road-type',
                    },
                    {
                      title: 'Pavement Type',
                      dirchange: false,
                      type: 'link',
                      active: false,
                      selected: false,
                      path: '/masters/pavement-type',
                    },
                    {
                      title: 'Pavement Width',
                      dirchange: false,
                      type: 'link',
                      active: false,
                      selected: false,
                      path: '/masters/pavement-width',
                    },
                    {
                      title: 'Shoulder Type',
                      dirchange: false,
                      type: 'link',
                      active: false,
                      selected: false,
                      path: '/masters/shoulder-type',
                    },
                    {
                      title: 'Shoulder Width',
                      dirchange: false,
                      type: 'link',
                      active: false,
                      selected: false,
                      path: '/masters/shoulder-width',
                    },
                    {
                      title: 'Topography',
                      dirchange: false,
                      type: 'link',
                      active: false,
                      selected: false,
                      path: '/masters/topography',
                    },
                    {
                      title: 'Drain Type',
                      dirchange: false,
                      type: 'link',
                      active: false,
                      selected: false,
                      path: '/masters/drain-type',
                    },
                    {
                      title: 'Median Width',
                      dirchange: false,
                      type: 'link',
                      active: false,
                      selected: false,
                      path: '/masters/median-width',
                    },
                    {
                      title: 'Carriageway Furniture',
                      dirchange: false,
                      type: 'link',
                      active: false,
                      selected: false,
                      path: '/masters/carriageway-furniture',
                    },
                    {
                      title: 'Wayside Amenities',
                      dirchange: false,
                      type: 'link',
                      active: false,
                      selected: false,
                      path: '/masters/wayside-amenities',
                    },
                    {
                      title: 'Land Use',
                      dirchange: false,
                      type: 'link',
                      active: false,
                      selected: false,
                      path: '/masters/land-use',
                    },
                    {
                      title: 'Cross Section',
                      dirchange: false,
                      type: 'link',
                      active: false,
                      selected: false,
                      path: '/masters/cross-section',
                    },
    
                  ]
                },
                {
                  title: 'Slider',
                  icon: 'bi-sliders',
                  active: false,
                  selected: false,
                  badgeClass: 'badge badge-sm bg-secondary badge-hide',
                  badgeValue: 'new',
                  path: '/dashboard/slider',
                  dirchange: false,
                  type: 'link',
                },
              ]
            },



            
            // { headTitle: 'Bridge Manage' },
            // {
            //   title: 'Bridge Manage',
            //   icon: 'bi-list-ul',
            //   active: false,
            //   selected: false,
            //   badgeClass: 'badge badge-sm bg-secondary badge-hide',
            //   badgeValue: 'new',
            //   path: '/bridge-manage',
            //   dirchange: false,
            //   type: 'link',
            // },
            
                  
          ];
       
          this.items.next(this.MENUITEMS);
          this.items1.next(this.MENUITEMS1);
          

  }
  
  items = new BehaviorSubject<Menu[]>(this.MENUITEMS);
  items1 = new BehaviorSubject<Menu[]>(this.MENUITEMS1);
}
