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
  urlLive='https://logicalat.in/planeteye_admin/index.php';


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

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log(token)
    return new HttpHeaders().set('Authorization', `${token}`);
  }

  private loadMenuItems(): void {
    this.http.get<any>(this.urlLive + `/api/user/data/data_list`, {
      headers: this.getHeaders()
    })  // Replace with your API URL
      .subscribe(
        (response) => {
          console.log("data in nav service", response);
  
          // Assuming the API response format: { status: true, msg: "Data List details", data: [...] }
          const apiData = response.data;
  
          // Build MENUITEMS dynamically based on API response
          this.MENUITEMS = [
            { headTitle: 'MAIN' },
            {
              title: 'Dashboard',
              icon: 'bi-house',
              dirchange: false,
              type: 'sub',
              active: false,
              children: apiData.map((item: any) => ({
                title: item.title,  // Use 'title' from the API data
                dirchange: false,
                type: 'link',
                active: false,
                selected: false,
                path: `/dashboard/data/${item.list_id}`  // Generate path using list_id
              }))
            },
            { headTitle: 'Distress' },
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
            { headTitle: 'Road Furniture' },
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
            { headTitle: 'Road Management' },
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
            { headTitle: 'Section' },
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
            { headTitle: 'Contractor' },
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
            { headTitle: 'Bridge Manage' },
            {
              title: 'Bridge Manage',
              icon: 'bi-list-ul',
              active: false,
              selected: false,
              badgeClass: 'badge badge-sm bg-secondary badge-hide',
              badgeValue: 'new',
              path: '/bridge-manage',
              dirchange: false,
              type: 'link',
            },
            { headTitle: 'MASTERS' },
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
            
            // { headTitle: 'Slider' },
            // {
            //   title: 'Slider',
            //   icon: 'bi-sliders',
            //   active: false,
            //   selected: false,
            //   badgeClass: 'badge badge-sm bg-secondary badge-hide',
            //   badgeValue: 'new',
            //   path: '/dashboard/slider',
            //   dirchange: false,
            //   type: 'link',
            // },
                  
          ];
  
          // Emit new menu items through BehaviorSubject
          this.items.next(this.MENUITEMS);
        },
        (error) => {
          console.error('Failed to load menu items from API', error);
        }
      );
  }
  
  // MENUITEMS: Menu[] = [
  //   // Dashboard
  //   { headTitle: 'MAIN' },
  //   {
  //     title: 'Dashboard',
  //     icon: 'bi-house',
  //     dirchange: false,
  //     type: 'sub',
  //     active: false,
  //     children: [
  //       {
  //         title: 'Test 1',
  //         dirchange: false,
  //         type: 'link',
  //         active: false,
  //         selected: false,
  //         path: '/dashboard/data/1',
  //       },
  //       {
  //         title: 'Test 2',
  //         dirchange: false,
  //         type: 'link',
  //         active: false,
  //         selected: false,
  //         path: '/dashboard/data/2',
  //       },
  //       {
  //         title: 'Test 3',
  //         dirchange: false,
  //         type: 'link',
  //         active: false,
  //         selected: false,
  //         path: '/dashboard/data/3',
  //       },
  //       {
  //         title: 'add new',
  //         dirchange: false,
  //         type: 'link',
  //         active: false,
  //         selected: false,
  //         path: '/dashboard/data/23',
  //       }
  //     ],
  //   }
    
    
  // ];
  // Array
  items = new BehaviorSubject<Menu[]>(this.MENUITEMS);
}
