import { Component } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../shared/prismData/tables';
import { SharedModule } from '../../../../../shared/common/sharedmodule';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RoadService } from '.././road.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-road-inventory',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    NgSelectModule,
    NgbPopoverModule,
    FormsModule,
    RouterLink,
    ShowcodeCardComponent,
  ],
  templateUrl: './road-inventory.component.html',
  styleUrl: './road-inventory.component.scss',
})
export class RoadInventoryComponent {
  prismCode = prismCodeData;
  content: any;
  tableData: any;
  selectedId: number | null = null;
  roadId: any;
  roadData: any;
  roadName: any;

  constructor(
    private route: ActivatedRoute,
    config: NgbModalConfig,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private roadService: RoadService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.roadId = Number(params.get('id'));
      // Load road details which will also filter inventory
      this.getRoadDetailsById();
    });
  }

  getInventoryData() {
    // TESTING MODE: Load ALL inventory from localStorage (not filtered by roadId)
    const testInventory = JSON.parse(
      localStorage.getItem('test_inventory') || '[]'
    );

    if (testInventory.length > 0) {
      // Try to get API data and merge
      this.roadService.getInventory(this.roadId).subscribe(
        (res) => {
          console.log('Inventory data from API', res);
          // Merge ALL test inventory with API inventory (test inventory first)
          this.tableData = [...testInventory, ...(res.data || [])];
          console.log(
            'Combined inventory data (localStorage + API):',
            this.tableData
          );

          if (testInventory.length > 0) {
            this.toastr.info(
              `Showing ${testInventory.length} inventory item(s) from Test Mode`,
              'NHAI RAMS',
              {
                timeOut: 2000,
                positionClass: 'toast-top-right',
              }
            );
          }
        },
        (err) => {
          // If API fails, just show ALL test inventory
          console.log('API failed, showing only localStorage inventory');
          this.tableData = testInventory;
          this.toastr.info(
            `Showing ${testInventory.length} inventory item(s) from Test Mode (API unavailable)`,
            'NHAI RAMS',
            {
              timeOut: 3000,
              positionClass: 'toast-top-right',
            }
          );
        }
      );
    } else {
      // No test inventory, load from API only
      this.roadService.getInventory(this.roadId).subscribe((res) => {
        console.log('road data list', res);
        this.tableData = res.data;
      });
    }
  }

  getRoadDetailsById() {
    // Check if this is an API road (ID >= 1000)
    if (this.roadId >= 1000) {
      // Load from dynamic API
      const apiUrl =
        'https://fantastic-reportapi-production.up.railway.app/projects-dates/inventory';

      this.http.get<{ [key: string]: string[] }>(apiUrl).subscribe(
        (response) => {
          const roadNames = Object.keys(response);
          const roadIndex = this.roadId - 1000; // Get the index

          if (roadIndex >= 0 && roadIndex < roadNames.length) {
            this.roadName = roadNames[roadIndex];
            this.roadData = {
              geometry_data_id: this.roadId,
              name_of_road: this.roadName,
            };

            console.log('Road details from API:', this.roadData);

            // Filter inventory by this road name
            this.filterInventoryByRoad();
          } else {
            this.toastr.error('Road not found in API', 'Error');
          }
        },
        (error) => {
          console.error('Failed to load road from API:', error);
          this.toastr.error('Failed to load road details', 'Error');
        }
      );
    } else {
      // TESTING MODE: Try to load from localStorage first
      const testRoads = JSON.parse(localStorage.getItem('test_roads') || '[]');
      const foundRoad = testRoads.find(
        (r: any) => r.geometry_data_id === this.roadId
      );

      if (foundRoad) {
        this.roadData = foundRoad;
        this.roadName = foundRoad.name_of_road;
        console.log('Road details from localStorage:', foundRoad);

        // Filter inventory by this road name
        this.filterInventoryByRoad();
      } else {
        // Fallback to API
        this.roadService.getDetailsById(this.roadId).subscribe((res) => {
          this.roadData = res.data[0];
          console.log('road details', this.roadData);
          this.roadName = this.roadData.name_of_road;

          // Filter inventory by this road name
          this.filterInventoryByRoad();
        });
      }
    }
  }

  filterInventoryByRoad() {
    if (this.roadName) {
      const allInventory = JSON.parse(
        localStorage.getItem('test_inventory') || '[]'
      );
      const filteredInventory = allInventory.filter(
        (inv: any) => inv.road_name === this.roadName
      );

      this.tableData = filteredInventory;

      console.log(
        `Filtered inventory for road "${this.roadName}":`,
        filteredInventory
      );

      if (filteredInventory.length > 0) {
        this.toastr.info(
          `Showing ${filteredInventory.length} inventory item(s) for ${this.roadName}`,
          'Filtered Inventory',
          {
            timeOut: 2000,
            positionClass: 'toast-top-right',
          }
        );
      }
    }
  }

  delete() {
    if (this.selectedId !== null) {
      // TESTING MODE: Check if inventory exists in localStorage
      let testInventory = JSON.parse(
        localStorage.getItem('test_inventory') || '[]'
      );
      const testInventoryIndex = testInventory.findIndex(
        (inv: any) => inv.road_inventory_id === this.selectedId
      );

      if (testInventoryIndex !== -1) {
        // Delete from localStorage
        testInventory.splice(testInventoryIndex, 1);
        localStorage.setItem('test_inventory', JSON.stringify(testInventory));

        // Reload filtered inventory
        this.filterInventoryByRoad();

        this.toastr.success(
          'Inventory deleted successfully from Test Mode!',
          'NHAI RAMS',
          {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          }
        );

        console.log('Inventory deleted from localStorage:', this.selectedId);
        this.modalService.dismissAll();
      } else {
        // Not in localStorage, delete from API
        this.roadService.deleteInventory(this.selectedId).subscribe(
          (res) => {
            // console.log("edelete result",res);
            if (res.status) {
              this.filterInventoryByRoad();
              this.toastr.success(res.msg, 'NHAI RAMS', {
                timeOut: 3000,
                positionClass: 'toast-top-right',
              });
            } else {
              this.toastr.error(res.msg, 'NHAI RAMS', {
                timeOut: 3000,
                positionClass: 'toast-top-right',
              });
            }
          },
          (err) => {
            this.toastr.error(err.msg, 'NHAI RAMS', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
            });
          }
        );
      }
    }
  }

  open(content: any, id: any) {
    this.selectedId = id;
    this.modalService.open(content);
  }
}
