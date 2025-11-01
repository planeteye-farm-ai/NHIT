import { Component } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../shared/prismData/tables';
import { SharedModule } from '../../../../../shared/common/sharedmodule';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RoadService } from '../road.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-history-of-works',
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
  templateUrl: './history-of-works.component.html',
  styleUrl: './history-of-works.component.scss',
})
export class HistoryOfWorksComponent {
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
    this.getHistoryData();
  }

  getHistoryData() {
    // TESTING MODE: Load from localStorage first
    const testHistoryWorks = JSON.parse(
      localStorage.getItem('test_history_of_works') || '[]'
    );

    // Filter by roadId
    const filteredTestHistory = testHistoryWorks.filter(
      (h: any) => h.geometry_data_id === this.roadId
    );

    if (filteredTestHistory.length > 0) {
      // Try to get API data and merge
      this.roadService.getHistoryOfWorksData(this.roadId).subscribe(
        (res) => {
          // Merge test history with API history (test first)
          this.tableData = [...filteredTestHistory, ...(res.data || [])];
          console.log(
            'Combined history data (localStorage + API):',
            this.tableData
          );

          if (filteredTestHistory.length > 0) {
            this.toastr.info(
              `Showing ${filteredTestHistory.length} history item(s) from Test Mode`,
              'NHAI RAMS',
              {
                timeOut: 2000,
                positionClass: 'toast-top-right',
              }
            );
          }
        },
        (err) => {
          // If API fails, just show test history
          console.log('API failed, showing only localStorage history');
          this.tableData = filteredTestHistory;
        }
      );
    } else {
      // No test history, load from API only
      this.roadService.getHistoryOfWorksData(this.roadId).subscribe((res) => {
        this.tableData = res.data;
        console.log(res.data);
      });
    }
  }

  getRoadDetailsById() {
    // Check localStorage first
    const testRoads = JSON.parse(localStorage.getItem('test_roads') || '[]');
    const testRoad = testRoads.find(
      (r: any) => r.geometry_data_id === this.roadId
    );

    if (testRoad) {
      this.roadName = testRoad.name_of_road;
      this.roadData = testRoad;
    } else {
      this.roadService.getDetailsById(this.roadId).subscribe((res) => {
        this.roadData = res.data[0];
        console.log('road details', this.roadData);
        this.roadName = this.roadData.name_of_road;
      });
    }
  }

  delete() {
    if (this.selectedId !== null) {
      // Check if it's a test record first
      let testHistoryWorks = JSON.parse(
        localStorage.getItem('test_history_of_works') || '[]'
      );
      const testIndex = testHistoryWorks.findIndex(
        (h: any) => h.history_of_work_id === this.selectedId
      );

      if (testIndex !== -1) {
        // Delete from localStorage
        testHistoryWorks.splice(testIndex, 1);
        localStorage.setItem(
          'test_history_of_works',
          JSON.stringify(testHistoryWorks)
        );

        this.getHistoryData();
        this.toastr.success(
          'History of work deleted successfully',
          'NHAI RAMS (Test Mode)',
          {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          }
        );
      } else {
        // Delete from API
        this.roadService.deleteHistoryOfWorks(this.selectedId).subscribe(
          (res) => {
            console.log(res);
            if (res.status) {
              this.getHistoryData();
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
