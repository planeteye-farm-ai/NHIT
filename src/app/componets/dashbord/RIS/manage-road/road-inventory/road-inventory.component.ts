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
    private roadService: RoadService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.roadId = Number(params.get('id'));
    });

    this.getRoadDetailsById();
    this.getInventoryData();
  }

  getInventoryData() {
    // TESTING MODE: Load from localStorage first
    const testInventory = JSON.parse(
      localStorage.getItem('test_inventory') || '[]'
    );
    const testInventoryForThisRoad = testInventory.filter(
      (inv: any) => inv.geometry_data_id === this.roadId
    );

    if (testInventoryForThisRoad.length > 0) {
      // Try to get API data and merge
      this.roadService.getInventory(this.roadId).subscribe(
        (res) => {
          console.log('Inventory data from API', res);
          // Merge test inventory with API inventory (test inventory first)
          this.tableData = [...testInventoryForThisRoad, ...(res.data || [])];
          console.log(
            'Combined inventory data (localStorage + API):',
            this.tableData
          );

          if (testInventoryForThisRoad.length > 0) {
            this.toastr.info(
              `Showing ${testInventoryForThisRoad.length} inventory item(s) from Test Mode`,
              'NHAI RAMS',
              {
                timeOut: 2000,
                positionClass: 'toast-top-right',
              }
            );
          }
        },
        (err) => {
          // If API fails, just show test inventory
          console.log('API failed, showing only localStorage inventory');
          this.tableData = testInventoryForThisRoad;
          this.toastr.info(
            `Showing ${testInventoryForThisRoad.length} inventory item(s) from Test Mode (API unavailable)`,
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
    // TESTING MODE: Try to load from localStorage first
    const testRoads = JSON.parse(localStorage.getItem('test_roads') || '[]');
    const foundRoad = testRoads.find(
      (r: any) => r.geometry_data_id === this.roadId
    );

    if (foundRoad) {
      this.roadData = foundRoad;
      this.roadName = foundRoad.name_of_road;
      console.log('Road details from localStorage:', foundRoad);
    } else {
      // Fallback to API
      this.roadService.getDetailsById(this.roadId).subscribe((res) => {
        this.roadData = res.data[0];
        console.log('road details', this.roadData);
        this.roadName = this.roadData.name_of_road;
      });
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

        this.getInventoryData();
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
              this.getInventoryData();
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
