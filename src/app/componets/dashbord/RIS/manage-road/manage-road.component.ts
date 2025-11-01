import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../shared/prismData/tables';
import { SharedModule } from '../../../../shared/common/sharedmodule';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RoadService } from './road.service';

@Component({
  selector: 'app-manage-road',
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
  templateUrl: './manage-road.component.html',
  styleUrl: './manage-road.component.scss',
})
export class ManageRoadComponent {
  prismCode = prismCodeData;
  content: any;
  tableData: any;
  selectedId: number | null = null;

  constructor(
    config: NgbModalConfig,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private roadService: RoadService
  ) {}

  ngOnInit(): void {
    this.getRoadData();
  }

  getRoadData() {
    // TESTING MODE: Load from localStorage first
    const testRoads = JSON.parse(localStorage.getItem('test_roads') || '[]');

    if (testRoads.length > 0) {
      // Format test roads to match the table structure
      const formattedTestRoads = testRoads.map((road: any) => ({
        geometry_data_id: road.geometry_data_id,
        name_of_road: road.name_of_road,
        road_section_no: 'TEST-' + road.geometry_data_id,
        type_of_road: road.type_of_road,
        length_of_road: road.length_of_road,
        road_location: 'Test Location',
        first_name: 'Test',
        last_name: 'User',
        created_on: new Date().toISOString(),
        carriage_way_lanes: road.carriage_way_lanes,
      }));

      // Try to get API data and merge
      this.roadService.getRoadData().subscribe(
        (res) => {
          console.log('road data list from API', res);
          // Merge test roads with API roads (test roads first)
          this.tableData = [...formattedTestRoads, ...(res.data || [])];
          console.log(
            'Combined road data (localStorage + API):',
            this.tableData
          );

          if (formattedTestRoads.length > 0) {
            this.toastr.info(
              `Showing ${formattedTestRoads.length} road(s) from Test Mode`,
              'NHAI RAMS',
              {
                timeOut: 2000,
                positionClass: 'toast-top-right',
              }
            );
          }
        },
        (err) => {
          // If API fails, just show test roads
          console.log('API failed, showing only localStorage roads');
          this.tableData = formattedTestRoads;
          this.toastr.info(
            `Showing ${formattedTestRoads.length} road(s) from Test Mode (API unavailable)`,
            'NHAI RAMS',
            {
              timeOut: 3000,
              positionClass: 'toast-top-right',
            }
          );
        }
      );
    } else {
      // No test roads, load from API only
      this.roadService.getRoadData().subscribe((res) => {
        console.log('road data list', res);
        this.tableData = res.data;
      });
    }
  }

  delete() {
    if (this.selectedId !== null) {
      // TESTING MODE: Check if road exists in localStorage
      let testRoads = JSON.parse(localStorage.getItem('test_roads') || '[]');
      const testRoadIndex = testRoads.findIndex(
        (r: any) => r.geometry_data_id === this.selectedId
      );

      if (testRoadIndex !== -1) {
        // Delete from localStorage
        testRoads.splice(testRoadIndex, 1);
        localStorage.setItem('test_roads', JSON.stringify(testRoads));

        this.getRoadData();
        this.toastr.success(
          'Road deleted successfully from Test Mode!',
          'NHAI RAMS',
          {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          }
        );

        console.log('Road deleted from localStorage:', this.selectedId);
        this.modalService.dismissAll();
      } else {
        // Not in localStorage, delete from API
        this.roadService.deleteRoad(this.selectedId).subscribe(
          (res) => {
            // console.log("edelete result",res);
            if (res.status) {
              this.getRoadData();
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
