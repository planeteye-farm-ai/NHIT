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

@Component({
  selector: 'app-edit-history-of-works',
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
  templateUrl: './edit-history-of-works.component.html',
  styleUrl: './edit-history-of-works.component.scss',
})
export class EditHistoryOfWorksComponent {
  historyDataForm!: FormGroup;
  prismCode = prismCodeData;
  historyId: any;
  historyData: any;
  roadName: any;
  currentDate: any;
  roadList: any[] = [];

  // Direction options
  directionOptions = ['Increasing (LHS)', 'Decreasing (RHS)', 'Median'];

  // Asset Types (Complete list from Inventory Report)
  assetTypes = [
    'Adjacent Road',
    'Bridges',
    'Bus Stop',
    'Crash Barrier',
    'Culvert',
    'Emergency Call Box',
    'Footpath',
    'Fuel Station',
    'Junction',
    'KM Stones',
    'Median Opening',
    'Median Plants',
    'RCC Drain',
    'Rest Area',
    'Service Road',
    'Sign Boards',
    'Solar Blinker',
    'Street Lights',
    'Toilet Blocks',
    'Toll Plaza',
    'Traffic Signals',
    'Trees',
    'Truck LayBy',
    'Tunnels',
  ];

  // Sub Asset Types (will be populated based on selected Asset Type)
  subAssetTypes: string[] = [];

  // Asset Type to Sub Asset Type mapping (Comprehensive)
  assetSubTypeMap: { [key: string]: string[] } = {
    'Adjacent Road': [
      'Parallel Road',
      'Cross Road',
      'Access Road',
      'Connecting Road',
    ],
    Bridges: [
      'RCC Bridge',
      'Steel Bridge',
      'Cable Stayed',
      'Suspension Bridge',
      'Arch Bridge',
      'Beam Bridge',
    ],
    'Bus Stop': [
      'Covered Shelter',
      'Open Shelter',
      'With Seating',
      'Basic Stand',
    ],
    'Crash Barrier': [
      'Metal Beam Barrier',
      'Concrete Barrier',
      'Cable Barrier',
      'Water Filled Barrier',
    ],
    Culvert: ['Box Culvert', 'Pipe Culvert', 'Slab Culvert', 'Arch Culvert'],
    'Emergency Call Box': [
      'SOS Box',
      'Call Pillar',
      'Digital Panel',
      'Emergency Telephone',
    ],
    Footpath: [
      'Paved Footpath',
      'Unpaved Footpath',
      'Elevated Walkway',
      'Pedestrian Crossing',
    ],
    'Fuel Station': [
      'Petrol Pump',
      'Diesel Pump',
      'CNG Station',
      'EV Charging Station',
      'Multi-Fuel',
    ],
    Junction: [
      'T-Junction',
      'Y-Junction',
      'Roundabout',
      'Intersection',
      'Interchange',
    ],
    'KM Stones': [
      'Concrete Post',
      'Metal Post',
      'Reflective Marker',
      'Mile Stone',
    ],
    'Median Opening': [
      'Emergency Opening',
      'U-Turn Opening',
      'Service Vehicle Access',
      'Crossover',
    ],
    'Median Plants': [
      'Shrubs',
      'Flowering Plants',
      'Grass',
      'Ornamental Plants',
      'Trees',
    ],
    'RCC Drain': ['Covered Drain', 'Open Drain', 'Grated Drain', 'Side Drain'],
    'Rest Area': [
      'Parking Bay',
      'Picnic Spot',
      'Food Court',
      'Tourist Rest Area',
    ],
    'Service Road': [
      'Left Side Service Road',
      'Right Side Service Road',
      'Both Sides',
      'Frontage Road',
    ],
    'Sign Boards': [
      'Informatory Signs',
      'Regulatory Signs',
      'Warning Signs',
      'Direction Signs',
      'Tourist Signs',
    ],
    'Solar Blinker': [
      'Red Blinker',
      'Yellow Blinker',
      'White Blinker',
      'Amber Blinker',
    ],
    'Street Lights': [
      'LED Lights',
      'Sodium Vapor Lights',
      'Halogen Lights',
      'Solar Lights',
      'High Mast',
    ],
    'Toilet Blocks': [
      'Public Toilet',
      'Staff Toilet',
      'Disabled Access',
      'Male Toilet',
      'Female Toilet',
      'Unisex',
    ],
    'Toll Plaza': [
      'Manual Toll',
      'FASTag Toll',
      'Hybrid Toll',
      'Automated Toll',
    ],
    'Traffic Signals': [
      '3-Light Signal',
      '4-Light Signal',
      'Pedestrian Signal',
      'Countdown Timer',
    ],
    Trees: [
      'Roadside Trees',
      'Median Trees',
      'Avenue Trees',
      'Landscaping Trees',
    ],
    'Truck LayBy': [
      'Single Lane Bay',
      'Double Lane Bay',
      'Truck Parking Area',
      'Rest Bay',
    ],
    Tunnels: [
      'Road Tunnel',
      'Underpass',
      'Flyover Underpass',
      'Pedestrian Tunnel',
    ],
  };

  // Work Status options
  workStatusOptions = [
    'Not Started',
    'In Progress',
    'Completed',
    'On Hold',
    'Cancelled',
  ];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private roadService: RoadService,
    private router: Router
  ) {
    this.currentDate = new Date().toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.historyDataForm = this.fb.group({
      geometry_data_id: ['', Validators.required],
      chainage_start: [
        '',
        [Validators.required, CustomValidators.numberValidator()],
      ],
      chainage_end: [
        '',
        [Validators.required, CustomValidators.numberValidator()],
      ],
      direction: ['', Validators.required],
      type_of_work: [
        '',
        [Validators.required, CustomValidators.noWhitespaceValidator()],
      ],
      name_of_contractor: [
        '',
        [Validators.required, CustomValidators.noWhitespaceValidator()],
      ],
      asset_type: ['', Validators.required],
      sub_asset_type: ['', Validators.required],
      latitude: ['', [Validators.required, CustomValidators.numberValidator()]],
      longitude: [
        '',
        [Validators.required, CustomValidators.numberValidator()],
      ],
      numbers_lengths: ['', CustomValidators.numberValidator()],
      work_status: ['', Validators.required],
      work_start_date: ['', Validators.required],
      work_end_date: ['', Validators.required],
      comments: [
        '',
        [Validators.required, CustomValidators.noWhitespaceValidator()],
      ],
      work_image: [''],
      work_video: [''],
      image_file: [null],
      video_file: [null],
      image_preview: [null],
      video_preview: [null],
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

      // Load sub asset types for the selected asset type
      if (testHistory.asset_type) {
        this.subAssetTypes = this.assetSubTypeMap[testHistory.asset_type] || [];
      }
    } else {
      // Fallback to API
      this.roadService.getHistoryDataById(id).subscribe(
        (history: any) => {
          console.log('get history details', history);
          if (history && history.data && history.data.length > 0) {
            this.historyData = history.data[0];
            this.roadName = this.historyData.name_of_road;
            this.patchValueFromAPI(history);

            // Load sub asset types
            if (this.historyData.asset_type) {
              this.subAssetTypes =
                this.assetSubTypeMap[this.historyData.asset_type] || [];
            }
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

  // Update sub asset types when asset type changes
  onAssetTypeChange(assetType: string): void {
    this.subAssetTypes = this.assetSubTypeMap[assetType] || [];
    this.historyDataForm.patchValue({ sub_asset_type: '' });
  }

  // Handle image file selection
  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        this.toastr.error(
          'Only JPG and PNG images are allowed',
          'Invalid File Type'
        );
        return;
      }

      if (file.size > maxSize) {
        this.toastr.error('Image size should not exceed 5MB', 'File Too Large');
        return;
      }

      this.historyDataForm.patchValue({
        work_image: file.name,
        image_file: file,
      });

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.historyDataForm.patchValue({ image_preview: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  // Handle video file selection
  onVideoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'];
      const maxSize = 50 * 1024 * 1024; // 50MB

      if (!validTypes.includes(file.type)) {
        this.toastr.error(
          'Only MP4, AVI, MOV, and WMV videos are allowed',
          'Invalid File Type'
        );
        return;
      }

      if (file.size > maxSize) {
        this.toastr.error(
          'Video size should not exceed 50MB',
          'File Too Large'
        );
        return;
      }

      this.historyDataForm.patchValue({
        work_video: file.name,
        video_file: file,
      });

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.historyDataForm.patchValue({ video_preview: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  // Remove image
  removeImage(): void {
    this.historyDataForm.patchValue({
      work_image: '',
      image_file: null,
      image_preview: null,
    });
  }

  // Remove video
  removeVideo(): void {
    this.historyDataForm.patchValue({
      work_video: '',
      video_file: null,
      video_preview: null,
    });
  }

  onSubmit(): void {
    if (this.historyDataForm.invalid) {
      this.historyDataForm.markAllAsTouched();
      this.toastr.error('Please fill all required fields', 'Validation Error');
      return;
    }

    // TESTING MODE: Update in localStorage
    let testHistoryWorks = JSON.parse(
      localStorage.getItem('test_history_of_works') || '[]'
    );
    const testIndex = testHistoryWorks.findIndex(
      (h: any) => h.history_of_work_id === this.historyId
    );

    if (testIndex !== -1) {
      // Update in localStorage
      const updatedHistoryWork = {
        ...testHistoryWorks[testIndex],
        geometry_data_id: this.historyDataForm.get('geometry_data_id')?.value,
        chainage_start: this.historyDataForm.get('chainage_start')?.value,
        chainage_end: this.historyDataForm.get('chainage_end')?.value,
        direction: this.historyDataForm.get('direction')?.value,
        type_of_work: this.historyDataForm.get('type_of_work')?.value,
        name_of_contractor:
          this.historyDataForm.get('name_of_contractor')?.value,
        asset_type: this.historyDataForm.get('asset_type')?.value,
        sub_asset_type: this.historyDataForm.get('sub_asset_type')?.value,
        latitude: this.historyDataForm.get('latitude')?.value,
        longitude: this.historyDataForm.get('longitude')?.value,
        numbers_lengths:
          this.historyDataForm.get('numbers_lengths')?.value || '',
        work_status: this.historyDataForm.get('work_status')?.value,
        work_start_date: this.historyDataForm.get('work_start_date')?.value,
        work_end_date: this.historyDataForm.get('work_end_date')?.value,
        comments: this.historyDataForm.get('comments')?.value,
        work_image:
          this.historyDataForm.get('image_file')?.value?.name ||
          testHistoryWorks[testIndex].work_image,
        work_video:
          this.historyDataForm.get('video_file')?.value?.name ||
          testHistoryWorks[testIndex].work_video,
      };

      testHistoryWorks[testIndex] = updatedHistoryWork;
      localStorage.setItem(
        'test_history_of_works',
        JSON.stringify(testHistoryWorks)
      );

      this.toastr.success(
        'History of work updated successfully!',
        'NHAI RAMS (Test Mode)',
        {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        }
      );

      this.router.navigate([
        '/ris/road-manage/history-of-work',
        this.historyDataForm.get('geometry_data_id')?.value,
      ]);

      console.log('=== UPDATED HISTORY OF WORK ===');
      console.log(JSON.stringify(updatedHistoryWork, null, 2));
    } else {
      // Fallback to API
      // (API logic would go here if needed)
      this.toastr.warning(
        'Record not found in test mode. API update not implemented.',
        'NHAI RAMS'
      );
    }
  }
}
