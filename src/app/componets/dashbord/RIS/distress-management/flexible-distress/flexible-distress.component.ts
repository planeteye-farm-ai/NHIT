import { Component, Renderer2 } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../shared/prismData/tables';
import { SharedModule } from '../../../../../shared/common/sharedmodule';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RoadService } from '../../manage-road/road.service';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-flexible-distress',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    NgSelectModule,
    NgbPopoverModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    ShowcodeCardComponent,
  ],
  templateUrl: './flexible-distress.component.html',
  styleUrl: './flexible-distress.component.scss',
})
export class FlexibleDistressComponent {
  filterForm!: FormGroup;
  prismCode = prismCodeData;
  content: any;
  tableData: any;
  selectedId: number | null = null;
  startDate: any;
  endDate: any;
  geometryList: any;

  constructor(
    config: NgbModalConfig,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private roadService: RoadService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      geometry_data_id: [null],
      start_date: [''],
      end_date: [''],
    });
    const currentDate = new Date();
    // Get the first day of the current month
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    // Format dates to 'YYYY-MM-DD'
    this.startDate = firstDayOfMonth.toISOString().split('T')[0];
    this.endDate = currentDate.toISOString().split('T')[0];
    this.getDistressData();
    this.getGeometryList();
  }

  getGeometryList() {
    // TESTING MODE: Load test roads from localStorage
    const testRoads = JSON.parse(localStorage.getItem('test_roads') || '[]');

    if (testRoads.length > 0) {
      // Format test roads for dropdown
      const formattedTestRoads = testRoads.map((road: any) => ({
        geometry_data_id: road.geometry_data_id,
        name_of_road: road.name_of_road + ' (Test)',
      }));

      // Try to get API data and merge
      this.roadService.getGeometryList().subscribe(
        (res) => {
          // Merge test roads with API roads (test roads first)
          this.geometryList = [...formattedTestRoads, ...(res.data || [])];
          console.log('Road dropdown (localStorage + API):', this.geometryList);
        },
        (err) => {
          // If API fails, just show test roads
          console.log('API failed, showing only localStorage roads');
          this.geometryList = formattedTestRoads;
        }
      );
    } else {
      // No test roads, load from API only
      this.roadService.getGeometryList().subscribe((res) => {
        this.geometryList = res.data;
        console.log(this.geometryList);
      });
    }
  }
  getDistressData() {
    // TESTING MODE: Load from localStorage first
    const testFlexibleDistress = JSON.parse(
      localStorage.getItem('test_flexible_distress') || '[]'
    );

    if (testFlexibleDistress.length > 0) {
      // Format test distress to match table structure
      const formattedTestDistress = testFlexibleDistress.map(
        (distress: any) => ({
          flexible_distress_id: distress.flexible_distress_id,
          geometry_data_id: distress.geometry_data_id,
          name_of_road:
            distress.road_name || 'Test Road ' + distress.geometry_data_id,
          chainage_start: distress.chainage_start,
          chainage_end: distress.chainage_end,
          direction: distress.direction,
          distress_type: distress.distress_type,
          carriage_way_lanes: distress.carriage_way_lanes,
          numbers_distress: distress.numbers_distress || 0,
          created_on: distress.created_on,
        })
      );

      // Try to get API data and merge
      let dataObj = {
        geometry_data_id: this.filterForm.get('geometry_data_id')?.value,
        start_date: this.filterForm.get('start_date')?.value,
        end_date: this.filterForm.get('end_date')?.value,
      };

      this.roadService.getFlexibleDistress(dataObj).subscribe(
        (res) => {
          console.log('Flexible Distress data from API', res);
          // Merge test distress with API distress (test first)
          this.tableData = [...formattedTestDistress, ...(res.data || [])];
          console.log(
            'Combined distress data (localStorage + API):',
            this.tableData
          );

          if (formattedTestDistress.length > 0) {
            this.toastr.info(
              `Showing ${formattedTestDistress.length} distress item(s) from Test Mode`,
              'NHAI RAMS',
              {
                timeOut: 2000,
                positionClass: 'toast-top-right',
              }
            );
          }
        },
        (err) => {
          // If API fails, just show test distress
          console.log('API failed, showing only localStorage distress');
          this.tableData = formattedTestDistress;
          this.toastr.info(
            `Showing ${formattedTestDistress.length} distress item(s) from Test Mode (API unavailable)`,
            'NHAI RAMS',
            {
              timeOut: 3000,
              positionClass: 'toast-top-right',
            }
          );
        }
      );
    } else {
      // No test distress, load from API only
      let dataObj = {
        geometry_data_id: this.filterForm.get('geometry_data_id')?.value,
        start_date: this.filterForm.get('start_date')?.value,
        end_date: this.filterForm.get('end_date')?.value,
      };
      this.roadService.getFlexibleDistress(dataObj).subscribe((res) => {
        console.log(' get Flexible Distress data list', res);
        this.tableData = res.data;
      });
    }
  }

  filterDistress() {
    let dataObj = {
      geometry_data_id: this.filterForm.get('geometry_data_id')?.value,
      start_date: this.filterForm.get('start_date')?.value,
      end_date: this.filterForm.get('end_date')?.value,
    };
    this.roadService.getFlexibleDistress(dataObj).subscribe((res) => {
      console.log(' get Flexible Distress data list', res);
      this.tableData = res.data;
    });
  }

  resetFilter() {
    this.filterForm.reset();
  }

  delete() {
    if (this.selectedId !== null) {
      // Check if distress exists in localStorage
      let testFlexibleDistress = JSON.parse(
        localStorage.getItem('test_flexible_distress') || '[]'
      );
      const testDistressIndex = testFlexibleDistress.findIndex(
        (d: any) => d.flexible_distress_id === this.selectedId
      );

      if (testDistressIndex !== -1) {
        // Delete from localStorage
        testFlexibleDistress.splice(testDistressIndex, 1);
        localStorage.setItem(
          'test_flexible_distress',
          JSON.stringify(testFlexibleDistress)
        );

        // Reload distress data
        this.getDistressData();

        this.toastr.success(
          'Flexible distress deleted successfully!',
          'Success',
          {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          }
        );

        console.log('Distress deleted from localStorage:', this.selectedId);
        this.modalService.dismissAll();
      } else {
        // Not in localStorage, delete from API
        this.roadService.deleteFlexibleDistress(this.selectedId).subscribe(
          (res) => {
            if (res.status) {
              this.getDistressData();
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
