import { Component } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../../shared/prismData/forms/form_layouts';
import { SharedModule } from '../../../../../../shared/common/sharedmodule';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../../../../shared/common/custom-validators';
import { Router } from '@angular/router';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RoadService } from '../../road.service';
import { ApiUrl } from '../../../../../../shared/const';

@Component({
  selector: 'app-view-history-of-works',
  standalone: true,
  imports: [
    SharedModule,
    NgSelectModule,
    FormsModule,
    CommonModule,
    ShowcodeCardComponent,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './view-history-of-works.component.html',
  styleUrl: './view-history-of-works.component.scss',
})
export class ViewHistoryOfWorksComponent {
  historyDataForm!: FormGroup;
  prismCode = prismCodeData;
  historyId: any;
  historyData: any;
  roadName: any;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private roadService: RoadService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.historyDataForm = this.fb.group({
      road_name: [{ value: '', disabled: true }],
      geometry_data_id: [{ value: '', disabled: true }],
      chainage_start: [{ value: '', disabled: true }],
      chainage_end: [{ value: '', disabled: true }],
      direction: [{ value: '', disabled: true }],
      type_of_work: [{ value: '', disabled: true }],
      name_of_contractor: [{ value: '', disabled: true }],
      asset_type: [{ value: '', disabled: true }],
      sub_asset_type: [{ value: '', disabled: true }],
      latitude: [{ value: '', disabled: true }],
      longitude: [{ value: '', disabled: true }],
      numbers_lengths: [{ value: '', disabled: true }],
      work_status: [{ value: '', disabled: true }],
      work_start_date: [{ value: '', disabled: true }],
      work_end_date: [{ value: '', disabled: true }],
      comments: [{ value: '', disabled: true }],
      work_image: [{ value: '', disabled: true }],
      work_video: [{ value: '', disabled: true }],
    });

    this.route.paramMap.subscribe((params) => {
      this.historyId = Number(params.get('id'));
      if (this.historyId) {
        this.loadHistoryDetails(this.historyId);
      }
    });
  }

  loadHistoryDetails(id: number): void {
    // TESTING MODE: Check localStorage first
    const testHistoryWorks = JSON.parse(
      localStorage.getItem('test_history_of_works') || '[]'
    );
    const testHistory = testHistoryWorks.find(
      (h: any) => h.history_of_work_id === id
    );

    if (testHistory) {
      // Load from localStorage
      this.historyData = testHistory;
      this.roadName = testHistory.road_name;
      this.patchValue(testHistory);
      console.log('History loaded from localStorage:', testHistory);
    } else {
      // Fallback to API
      this.roadService.getHistoryDataById(id).subscribe(
        (history: any) => {
          console.log('get history details', history);
          if (history && history.data && history.data.length > 0) {
            this.historyData = history.data[0];
            this.roadName = this.historyData.name_of_road;
            this.patchValueFromAPI(history);
          }
        },
        (err) => {
          this.toastr.error('Failed to load history details', 'NHAI RAMS', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
        }
      );
    }
  }

  patchValue(history: any): void {
    this.historyDataForm.patchValue({
      road_name: history.road_name || '',
      geometry_data_id: history.geometry_data_id || '',
      chainage_start: history.chainage_start || '',
      chainage_end: history.chainage_end || '',
      direction: history.direction || '',
      type_of_work: history.type_of_work || '',
      name_of_contractor: history.name_of_contractor || '',
      asset_type: history.asset_type || '',
      sub_asset_type: history.sub_asset_type || '',
      latitude: history.latitude || '',
      longitude: history.longitude || '',
      numbers_lengths: history.numbers_lengths || '',
      work_status: history.work_status || '',
      work_start_date: history.work_start_date || '',
      work_end_date: history.work_end_date || '',
      comments: history.comments || '',
      work_image: history.work_image || '',
      work_video: history.work_video || '',
    });
  }

  patchValueFromAPI(history: any): void {
    const data = history.data[0];
    this.historyDataForm.patchValue({
      road_name:
        data.name_of_road !== ''
          ? data.name_of_road
          : data.geometry_name_of_road,
      geometry_data_id: data.geometry_data_id || '',
      chainage_start: data.chainage_start || '',
      chainage_end: data.chainage_end || '',
      direction: data.direction || '',
      type_of_work: data.type_of_work || '',
      name_of_contractor: data.name_of_contractor || '',
      asset_type: data.asset_type || '',
      sub_asset_type: data.sub_asset_type || '',
      latitude: data.latitude || '',
      longitude: data.longitude || '',
      numbers_lengths: data.numbers_lengths || '',
      work_status: data.work_status || '',
      work_start_date: data.work_start_date || '',
      work_end_date: data.work_end_date || '',
      comments: data.comments || data.comments_observations || '',
      work_image: data.work_image || data.comments_observations_image || '',
      work_video: data.work_video || '',
    });
  }
}
