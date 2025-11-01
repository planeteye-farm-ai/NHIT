import { Component } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../../shared/prismData/forms/form_layouts';
import { SharedModule } from '../../../../../../shared/common/sharedmodule';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  FormControl,
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
  selector: 'app-add-history-of-works',
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
  templateUrl: './add-history-of-works.component.html',
  styleUrl: './add-history-of-works.component.scss',
})
export class AddHistoryOfWorksComponent {
  historyDataForm!: FormGroup;
  prismCode = prismCodeData;
  roadId: any;
  roadData: any;
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
      this.roadId = Number(params.get('id'));
      this.loadRoadList();
      this.loadRoadName();
    });
  }

  // Load road list for dropdown
  loadRoadList(): void {
    const testRoads = JSON.parse(localStorage.getItem('test_roads') || '[]');

    if (testRoads.length > 0) {
      const formattedTestRoads = testRoads.map((road: any) => ({
        geometry_data_id: road.geometry_data_id,
        name_of_road: road.name_of_road + ' (Test)',
      }));

      this.roadService.getGeometryList().subscribe(
        (res) => {
          this.roadList = [...formattedTestRoads, ...(res.data || [])];
          this.historyDataForm.patchValue({ geometry_data_id: this.roadId });
        },
        (err) => {
          this.roadList = formattedTestRoads;
          this.historyDataForm.patchValue({ geometry_data_id: this.roadId });
        }
      );
    } else {
      this.roadService.getGeometryList().subscribe((res) => {
        this.roadList = res.data;
        this.historyDataForm.patchValue({ geometry_data_id: this.roadId });
      });
    }
  }

  // Load road name for display
  loadRoadName(): void {
    const testRoads = JSON.parse(localStorage.getItem('test_roads') || '[]');
    const testRoad = testRoads.find(
      (r: any) => r.geometry_data_id === this.roadId
    );

    if (testRoad) {
      this.roadName = testRoad.name_of_road;
    } else {
      this.roadService.getDetailsById(this.roadId).subscribe((res) => {
        if (res && res.data && res.data.length > 0) {
          this.roadName = res.data[0].name_of_road;
        }
      });
    }
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

    // TESTING MODE: Store in localStorage
    let existingHistoryWorks = JSON.parse(
      localStorage.getItem('test_history_of_works') || '[]'
    );

    const mockId =
      existingHistoryWorks.length > 0
        ? Math.max(
            ...existingHistoryWorks.map((h: any) => h.history_of_work_id)
          ) + 1
        : 1;

    const historyWorkObj = {
      history_of_work_id: mockId,
      geometry_data_id: this.historyDataForm.get('geometry_data_id')?.value,
      road_name: this.roadName,
      chainage_start: this.historyDataForm.get('chainage_start')?.value,
      chainage_end: this.historyDataForm.get('chainage_end')?.value,
      direction: this.historyDataForm.get('direction')?.value,
      type_of_work: this.historyDataForm.get('type_of_work')?.value,
      name_of_contractor: this.historyDataForm.get('name_of_contractor')?.value,
      asset_type: this.historyDataForm.get('asset_type')?.value,
      sub_asset_type: this.historyDataForm.get('sub_asset_type')?.value,
      latitude: this.historyDataForm.get('latitude')?.value,
      longitude: this.historyDataForm.get('longitude')?.value,
      numbers_lengths: this.historyDataForm.get('numbers_lengths')?.value || '',
      work_status: this.historyDataForm.get('work_status')?.value,
      work_start_date: this.historyDataForm.get('work_start_date')?.value,
      work_end_date: this.historyDataForm.get('work_end_date')?.value,
      comments: this.historyDataForm.get('comments')?.value,
      work_image: this.historyDataForm.get('image_file')?.value?.name || '',
      work_video: this.historyDataForm.get('video_file')?.value?.name || '',
      created_on: new Date().toISOString(),
    };

    existingHistoryWorks.push(historyWorkObj);
    localStorage.setItem(
      'test_history_of_works',
      JSON.stringify(existingHistoryWorks)
    );

    this.toastr.success(
      `History of Work added successfully! ID: ${mockId}`,
      'NHAI RAMS (Test Mode)',
      {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      }
    );

    this.router.navigate(['/ris/road-manage/history-of-work', this.roadId]);

    console.log('=== HISTORY OF WORK JSON RESPONSE ===');
    console.log(JSON.stringify(historyWorkObj, null, 2));
    console.log('All history of works:', existingHistoryWorks);

    // PRODUCTION MODE: Uncomment below to use API
    // const formData = new FormData();
    // formData.append('geometry_data_id', this.historyDataForm.get('geometry_data_id')?.value.toString());
    // formData.append('chainage_start', this.historyDataForm.get('chainage_start')?.value);
    // formData.append('chainage_end', this.historyDataForm.get('chainage_end')?.value);
    // formData.append('direction', this.historyDataForm.get('direction')?.value);
    // formData.append('type_of_work', this.historyDataForm.get('type_of_work')?.value);
    // formData.append('name_of_contractor', this.historyDataForm.get('name_of_contractor')?.value);
    // formData.append('asset_type', this.historyDataForm.get('asset_type')?.value);
    // formData.append('sub_asset_type', this.historyDataForm.get('sub_asset_type')?.value);
    // formData.append('latitude', this.historyDataForm.get('latitude')?.value);
    // formData.append('longitude', this.historyDataForm.get('longitude')?.value);
    // formData.append('numbers_lengths', this.historyDataForm.get('numbers_lengths')?.value || '');
    // formData.append('work_status', this.historyDataForm.get('work_status')?.value);
    // formData.append('work_start_date', this.historyDataForm.get('work_start_date')?.value);
    // formData.append('work_end_date', this.historyDataForm.get('work_end_date')?.value);
    // formData.append('comments', this.historyDataForm.get('comments')?.value);
    //
    // const imageFile = this.historyDataForm.get('image_file')?.value;
    // if (imageFile) {
    //   formData.append('work_image', imageFile, imageFile.name);
    // }
    // const videoFile = this.historyDataForm.get('video_file')?.value;
    // if (videoFile) {
    //   formData.append('work_video', videoFile, videoFile.name);
    // }
    //
    // this.roadService.addHistoryOfWorks(formData).subscribe((res)=>{
    //   if(res.status){
    //     this.router.navigate(['/ris/road-manage/history-of-work',this.roadId]);
    //     this.toastr.success(res.msg, 'NHAI RAMS', {
    //       timeOut: 3000,
    //       positionClass: 'toast-top-right',
    //     });
    //   }
    //   else {
    //     this.toastr.error(res.msg, 'NHAI RAMS', {
    //       timeOut: 3000,
    //       positionClass: 'toast-top-right',
    //     });
    //   }
    // }, (err)=>{
    //   this.toastr.error(err.msg, 'NHAI RAMS', {
    //     timeOut: 3000,
    //     positionClass: 'toast-top-right',
    //   });
    // });
  }
}
