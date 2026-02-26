import { Component, Renderer2, OnDestroy } from '@angular/core';
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
import { HttpClient } from '@angular/common/http';
import { ProjectSelectionService } from '../../../../shared/services/project-selection.service';
import { Subject, takeUntil } from 'rxjs';

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
export class ManageRoadComponent implements OnDestroy {
  prismCode = prismCodeData;
  content: any;
  tableData: any;
  /** Filtered table rows - only selected project when set from Information System */
  displayedTableData: any[] = [];
  selectedId: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    config: NgbModalConfig,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private roadService: RoadService,
    private http: HttpClient,
    private projectSelection: ProjectSelectionService
  ) {}

  ngOnInit(): void {
    this.projectSelection.selectedProject$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyProjectFilter());
    this.getRoadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Filter table to show only the project selected in Information System */
  private applyProjectFilter(): void {
    if (!this.tableData) {
      this.displayedTableData = [];
      return;
    }
    const selected = this.projectSelection.selectedProject;
    if (!selected?.trim()) {
      this.displayedTableData = [...this.tableData];
      return;
    }
    const normalized = (selected || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
    this.displayedTableData = this.tableData.filter((row: any) => {
      const name = (row.name_of_road || '')
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');
      return name === normalized;
    });
  }

  getRoadData() {
    // Load roads from dynamic API
    const apiUrl =
      'https://fantastic-reportapi-production.up.railway.app/projects-dates/inventory';

    this.http.get<{ [key: string]: string[] }>(apiUrl).subscribe(
      (response) => {
        console.log('Loaded roads from API:', response);

        // Transform API response to table format
        const apiRoads = Object.keys(response).map((roadName, index) => ({
          geometry_data_id: index + 1000, // Generate unique IDs starting from 1000
          name_of_road: roadName,
          road_section_no: 'SEC-' + (index + 1),
          type_of_road: 'National Highway',
          length_of_road: '0.000', // Will be calculated from chainage
          road_location: 'India',
          first_name: 'API',
          last_name: 'Data',
          created_on: new Date().toISOString(),
          carriage_way_lanes: 4,
          chainage_start: 0,
          chainage_end: 0,
        }));

        // TESTING MODE: Load from localStorage and merge
        const testRoads = JSON.parse(
          localStorage.getItem('test_roads') || '[]'
        );

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

          // Merge: localStorage test roads + API roads
          this.tableData = [...formattedTestRoads, ...apiRoads];

          this.toastr.success(
            `Loaded ${apiRoads.length} roads from API + ${formattedTestRoads.length} from Test Mode`,
            'Roads Loaded',
            {
              timeOut: 3000,
              positionClass: 'toast-top-right',
            }
          );
        } else {
          // No test roads, just show API roads
          this.tableData = apiRoads;
        }

        this.applyProjectFilter();

        if (!testRoads?.length) {
          this.toastr.success(
            `Loaded ${apiRoads.length} roads from API`,
            'Roads Loaded',
            {
              timeOut: 2000,
              positionClass: 'toast-top-right',
            }
          );
        }

        console.log('All roads in table:', this.tableData);
      },
      (error) => {
        console.error('Failed to load roads from API:', error);

        // Fallback to localStorage only
        const testRoads = JSON.parse(
          localStorage.getItem('test_roads') || '[]'
        );

        if (testRoads.length > 0) {
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

          this.tableData = formattedTestRoads;
          this.applyProjectFilter();

          this.toastr.warning(
            'Failed to load API roads. Showing localStorage roads only.',
            'API Error',
            {
              timeOut: 3000,
              positionClass: 'toast-top-right',
            }
          );
        } else {
          // Try original API call as final fallback
          this.roadService.getRoadData().subscribe((res) => {
            console.log('road data list from original API', res);
            this.tableData = res.data;
            this.applyProjectFilter();
          });
        }
      }
    );
  }

  delete() {
    if (this.selectedId !== null) {
      // Check if this is an API road (ID >= 1000)
      if (this.selectedId >= 1000) {
        this.toastr.error(
          'Cannot delete roads loaded from API. Only test roads can be deleted.',
          'Cannot Delete',
          {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          }
        );
        this.modalService.dismissAll();
        return;
      }

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
