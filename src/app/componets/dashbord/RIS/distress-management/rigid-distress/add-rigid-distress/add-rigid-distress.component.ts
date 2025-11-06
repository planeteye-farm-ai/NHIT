import { Component } from '@angular/core';
import { SharedModule } from '../../../../../../shared/common/sharedmodule';
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
import { ActivatedRoute } from '@angular/router';
import { RoadService } from '../../../manage-road/road.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-add-rigid-distress',
  standalone: true,
  imports: [
    SharedModule,
    NgSelectModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './add-rigid-distress.component.html',
  styleUrl: './add-rigid-distress.component.scss',
})
export class AddRigidDistressComponent {
  distressForm!: FormGroup;
  roadId: any;
  roadName: any;
  selectedRoadName: string = '';

  // Dynamic Roads from API
  availableRoads: string[] = [];
  projectDatesMap: { [key: string]: string[] } = {};
  isLoadingChainage: boolean = false;

  chainageStart: number = 0;
  chainageEnd: number = 0;

  // Direction options
  directionOptions = ['Increasing (LHS)', 'Decreasing (RHS)', 'Median'];
  selectedDirection: string = '';

  // Distress Types with colors for cards
  distressTypes = [
    { name: 'Bleeding or Fatty Surface', color: '#E91E63' },
    { name: 'Smooth Surface', color: '#9C27B0' },
    { name: 'Streaking', color: '#673AB7' },
    { name: 'Hungry Surface', color: '#3F51B5' },
    { name: 'Hairline Cracks', color: '#2196F3' },
    { name: 'Alligator & Map Cracking', color: '#00BCD4' },
    { name: 'Longitudinal Cracking', color: '#009688' },
    { name: 'Transverse Cracks', color: '#4CAF50' },
    { name: 'Edge Cracking', color: '#8BC34A' },
    { name: 'Reflection Cracking', color: '#CDDC39' },
    { name: 'Slippage', color: '#FFEB3B' },
    { name: 'Rutting', color: '#FFC107' },
    { name: 'Corrugation', color: '#FF9800' },
    { name: 'Shoving', color: '#FF5722' },
    { name: 'Shallow Depression', color: '#795548' },
    { name: 'Settlements and Upheaval', color: '#9E9E9E' },
    { name: 'Stripping', color: '#607D8B' },
    { name: 'Ravelling', color: '#F44336' },
    { name: 'Potholes', color: '#E91E63' },
    { name: 'Edge Breaking', color: '#9C27B0' },
  ];

  selectedDistressType: string = '';

  // Lane options for rigid pavement
  laneOptions = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6'];

  // Modal state
  isModalOpen: boolean = false;

  // Drag and drop states
  isDraggingImage: boolean = false;
  isDraggingVideo: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private roadService: RoadService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.distressForm = this.fb.group({
      geometry_data_id: ['', Validators.required],
      chainage_start: [0, Validators.required],
      chainage_end: [0, Validators.required],
      direction: ['', Validators.required],
      carriage_way_lanes: ['', Validators.required],
      distress_type: ['', Validators.required],
      latitude: ['', Validators.required], // Removed custom validator to allow 0
      longitude: ['', Validators.required], // Removed custom validator to allow 0
      numbers_distress: [0],
      dimension_length: [0],
      dimension_width: [0],
      dimension_depth: [0],
      distress_image: [''],
      distress_video: [''],
      image_file: [null],
      video_file: [null],
      image_preview: [null],
      video_preview: [null],
    });

    // Load dynamic roads from API
    this.loadDynamicRoads();

    this.route.paramMap.subscribe((params) => {
      this.roadId = Number(params.get('id'));
      this.loadRoadName();
    });
  }

  // Load roads dynamically from API
  loadDynamicRoads(): void {
    const apiUrl =
      'https://fantastic-reportapi-production.up.railway.app/projects-dates/inventory';

    this.http.get<{ [key: string]: string[] }>(apiUrl).subscribe(
      (response) => {
        console.log('Loaded roads from API:', response);
        this.availableRoads = Object.keys(response);
        this.projectDatesMap = response;

        if (this.roadId && this.roadId >= 1000) {
          const roadIndex = this.roadId - 1000;
          if (roadIndex >= 0 && roadIndex < this.availableRoads.length) {
            this.selectedRoadName = this.availableRoads[roadIndex];
            this.roadName = this.selectedRoadName;
            this.loadChainageRange(this.selectedRoadName);
          }
        } else if (this.availableRoads.length > 0 && !this.selectedRoadName) {
          this.selectedRoadName = this.availableRoads[0];
          this.roadName = this.selectedRoadName;
          this.loadChainageRange(this.selectedRoadName);
        }

        this.toastr.success(
          `Loaded ${this.availableRoads.length} roads from API`,
          'Roads Loaded',
          {
            timeOut: 2000,
            positionClass: 'toast-top-right',
          }
        );
      },
      (error) => {
        console.error('Failed to load roads from API:', error);
        this.toastr.error('Failed to load roads from API', 'Error', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
      }
    );
  }

  // Load chainage range from API
  loadChainageRange(projectName: string): void {
    if (!projectName) return;

    this.isLoadingChainage = true;
    const apiUrl =
      'https://fantastic-reportapi-production.up.railway.app/inventory_filter';

    const availableDates = this.projectDatesMap[projectName] || [];
    const selectedDate =
      availableDates.length > 0 ? availableDates[0] : '2025-06-20';

    const requestBody = {
      chainage_start: 0,
      chainage_end: 10000,
      date: selectedDate,
      direction: ['All'],
      project_name: [projectName],
      asset_type: ['All'],
    };

    this.http.post<any[]>(apiUrl, requestBody).subscribe(
      (response) => {
        if (response && response.length > 0) {
          const allData = response.flat();

          if (allData.length > 0) {
            const minChainage = Math.min(
              ...allData.map((item: any) => item.chainage_start)
            );
            const maxChainage = Math.max(
              ...allData.map((item: any) => item.chainage_end)
            );

            this.chainageStart = minChainage;
            this.chainageEnd = maxChainage;

            this.distressForm.patchValue({
              chainage_start: minChainage,
              chainage_end: maxChainage,
            });

            this.toastr.success(
              `Chainage range loaded: ${minChainage.toFixed(
                3
              )} - ${maxChainage.toFixed(3)} KM`,
              'Chainage Loaded',
              {
                timeOut: 2000,
                positionClass: 'toast-top-right',
              }
            );
          }
        }
        this.isLoadingChainage = false;
      },
      (error) => {
        this.toastr.error('Failed to load chainage range from API', 'Error', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
        this.isLoadingChainage = false;
      }
    );
  }

  // Handle road selection from dropdown
  onRoadSelect(roadName: string): void {
    if (!roadName) return;

    this.selectedRoadName = roadName;
    this.roadName = roadName;
    this.loadChainageRange(roadName);

    this.toastr.info(`Selected: ${roadName}`, 'Road Selected', {
      timeOut: 2000,
      positionClass: 'toast-top-right',
    });
  }

  // Load road name for display
  loadRoadName(): void {
    if (this.roadId >= 1000) {
      const apiUrl =
        'https://fantastic-reportapi-production.up.railway.app/projects-dates/inventory';

      this.http.get<{ [key: string]: string[] }>(apiUrl).subscribe(
        (response) => {
          const roadNames = Object.keys(response);
          const roadIndex = this.roadId - 1000;

          if (roadIndex >= 0 && roadIndex < roadNames.length) {
            this.roadName = roadNames[roadIndex];
            this.selectedRoadName = this.roadName;
            this.loadChainageRange(this.roadName);
          }
        },
        (error) => {
          this.toastr.error('Failed to load road name', 'Error');
        }
      );
    } else {
      const testRoads = JSON.parse(localStorage.getItem('test_roads') || '[]');
      const testRoad = testRoads.find(
        (r: any) => r.geometry_data_id === this.roadId
      );

      if (testRoad) {
        this.roadName = testRoad.name_of_road;
        this.selectedRoadName = this.roadName;
      }
    }
  }

  // Update chainage values
  updateChainageStart(value: number): void {
    this.chainageStart = value;
    this.distressForm.patchValue({ chainage_start: value });
  }

  updateChainageEnd(value: number): void {
    this.chainageEnd = value;
    this.distressForm.patchValue({ chainage_end: value });
  }

  // Direction Selection
  selectDirection(direction: string): void {
    this.selectedDirection = direction;
    this.distressForm.patchValue({ direction: direction });
  }

  // Get shortened direction label for display
  getDirectionLabel(direction: string): string {
    if (direction.includes('Increasing')) return 'Inc';
    if (direction.includes('Decreasing')) return 'Dec';
    if (direction.includes('Median')) return 'Med';
    return direction;
  }

  // Get direction name for API (without LHS/RHS)
  getDirectionForAPI(direction: string): string {
    if (direction.includes('Increasing')) return 'Increasing';
    if (direction.includes('Decreasing')) return 'Decreasing';
    if (direction.includes('Median')) return 'Median';
    return direction;
  }

  // Get current date in MM/DD/YYYY format
  getCurrentDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${month}/${day}/${year}`;
  }

  // Submit distress to API
  async submitToAPI(): Promise<any> {
    const apiUrl = '/api/append_distressReported_excel/';

    const apiBody = {
      Latitude: this.distressForm.get('latitude')?.value,
      Longitude: this.distressForm.get('longitude')?.value,
      Chainage_Start: this.chainageStart,
      Chainage_End: this.chainageEnd,
      Project_Name: this.selectedRoadName || this.roadName,
      Distress_Type: this.distressForm.get('distress_type')?.value,
      Direction: this.getDirectionForAPI(this.selectedDirection),
      Date: this.getCurrentDate(),
      Length: this.distressForm.get('dimension_length')?.value || 0,
      Carriage_Type: 'Rigid',
      Width: this.distressForm.get('dimension_width')?.value || 0,
      Depth: this.distressForm.get('dimension_depth')?.value || 0,
      Lane: this.distressForm.get('carriage_way_lanes')?.value,
      No_of_Distress: this.distressForm.get('numbers_distress')?.value || 0,
    };

    console.log('Submitting distress to API:', apiBody);

    return this.http.post(apiUrl, apiBody).toPromise();
  }

  // Distress Type Card Click Handler
  onDistressCardClick(distressName: string): void {
    if (!this.selectedDirection) {
      this.toastr.warning('Please select a direction first', 'Warning', {
        timeOut: 2000,
        positionClass: 'toast-top-right',
      });
      return;
    }

    this.selectedDistressType = distressName;
    this.distressForm.patchValue({ distress_type: distressName });
    this.isModalOpen = true;
    console.log('Selected distress type:', distressName);
  }

  // Close Modal
  closeModal(): void {
    this.isModalOpen = false;
    this.selectedDistressType = '';

    // Reset modal-specific fields
    this.distressForm.patchValue({
      carriage_way_lanes: '',
      distress_type: '',
      latitude: '',
      longitude: '',
      numbers_distress: 0,
      dimension_length: '',
      dimension_width: '',
      dimension_depth: '',
      distress_image: '',
      distress_video: '',
      image_file: null,
      video_file: null,
      image_preview: null,
      video_preview: null,
    });
  }

  // Check if form can be submitted
  canSubmit(): boolean {
    // Quick check: direction must be selected
    if (!this.selectedDirection) {
      return false;
    }

    // Check required fields
    const lane = this.distressForm.get('carriage_way_lanes')?.value;
    const lat = this.distressForm.get('latitude')?.value;
    const lng = this.distressForm.get('longitude')?.value;

    // Check not null/undefined and not empty
    if (!lane || lat == null || lng == null) {
      return false;
    }

    const latStr = String(lat);
    const lngStr = String(lng);
    return (
      latStr.trim() !== '' &&
      lngStr.trim() !== '' &&
      latStr !== 'null' &&
      lngStr !== 'null'
    );
  }

  // Get submit button title
  getSubmitButtonTitle(): string {
    if (!this.selectedDirection) return 'Please select a direction first';

    const lane = this.distressForm.get('carriage_way_lanes')?.value;
    const lat = this.distressForm.get('latitude')?.value;
    const lng = this.distressForm.get('longitude')?.value;

    if (!lane) return 'Please select a carriage way lane';
    if (lat == null || lng == null) return 'Please fill latitude and longitude';

    return '';
  }

  // Debug method
  debugCanSubmit(): void {
    console.log('\n=== 🔍 DEBUG CAN SUBMIT ===');
    console.log('📍 Selected Direction:', this.selectedDirection);
    console.log('📍 Selected Distress Type:', this.selectedDistressType);
    console.log(
      '🚗 Carriage Way Lane:',
      this.distressForm.get('carriage_way_lanes')?.value
    );
    console.log(
      '📍 Latitude:',
      this.distressForm.get('latitude')?.value,
      '| Type:',
      typeof this.distressForm.get('latitude')?.value
    );
    console.log(
      '📍 Longitude:',
      this.distressForm.get('longitude')?.value,
      '| Type:',
      typeof this.distressForm.get('longitude')?.value
    );
    console.log(
      '🔢 Numbers Distress:',
      this.distressForm.get('numbers_distress')?.value
    );
    console.log('📏 Length:', this.distressForm.get('dimension_length')?.value);
    console.log('📏 Width:', this.distressForm.get('dimension_width')?.value);
    console.log('📏 Depth:', this.distressForm.get('dimension_depth')?.value);
    console.log('\n🎯 FINAL RESULT - Can Submit?', this.canSubmit());
    console.log('=========================\n');
  }

  // Handle image file selection
  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.processImageFile(file);
    }
    event.target.value = '';
  }

  // Handle video file selection
  onVideoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.processVideoFile(file);
    }
    event.target.value = '';
  }

  // Process Image File
  processImageFile(file: File): void {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      this.toastr.error('Only JPG and PNG images are allowed', 'Invalid File');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.toastr.error('Image size should not exceed 5MB', 'File Too Large');
      return;
    }

    this.distressForm.patchValue({
      distress_image: file.name,
      image_file: file,
    });

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.distressForm.patchValue({ image_preview: e.target.result });
    };
    reader.readAsDataURL(file);
  }

  // Process Video File
  processVideoFile(file: File): void {
    const validTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'];
    if (!validTypes.includes(file.type)) {
      this.toastr.error(
        'Only MP4, AVI, MOV, and WMV videos are allowed',
        'Invalid File'
      );
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      this.toastr.error('Video size should not exceed 50MB', 'File Too Large');
      return;
    }

    this.distressForm.patchValue({
      distress_video: file.name,
      video_file: file,
    });

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.distressForm.patchValue({ video_preview: e.target.result });
    };
    reader.readAsDataURL(file);
  }

  // Remove image
  removeImage(): void {
    this.distressForm.patchValue({
      distress_image: '',
      image_file: null,
      image_preview: null,
    });
  }

  // Remove video
  removeVideo(): void {
    this.distressForm.patchValue({
      distress_video: '',
      video_file: null,
      video_preview: null,
    });
  }

  // Drag and drop handlers for images
  onImageDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingImage = true;
  }

  onImageDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingImage = false;
  }

  onImageDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingImage = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processImageFile(files[0]);
    }
  }

  // Drag and drop handlers for videos
  onVideoDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingVideo = true;
  }

  onVideoDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingVideo = false;
  }

  onVideoDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingVideo = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processVideoFile(files[0]);
    }
  }

  async onSubmit(): Promise<void> {
    // Patch common fields before validation
    this.distressForm.patchValue({
      geometry_data_id: this.roadId,
      chainage_start: this.chainageStart,
      chainage_end: this.chainageEnd,
      direction: this.selectedDirection,
    });

    console.log('=== SUBMIT CALLED ===');
    console.log('Form values:', this.distressForm.value);
    console.log('Can submit?', this.canSubmit());

    // Use custom validation instead of distressForm.invalid
    if (!this.canSubmit()) {
      this.toastr.error('Please fill all required fields', 'Validation Error');
      return;
    }

    // Show loading toast
    this.toastr.info('Submitting distress...', 'Please wait', {
      timeOut: 0,
      positionClass: 'toast-top-right',
    });

    // Submit to API
    let apiSuccess = false;
    let apiResponse: any = null;
    try {
      apiResponse = await this.submitToAPI();
      apiSuccess = true;
      console.log('✅ API Success:', apiResponse);
    } catch (error) {
      console.error('❌ API Failed:', error);
    }

    // Save to localStorage after successful API submission (for viewing in table)
    if (apiSuccess) {
      let existingRigidDistress = JSON.parse(
        localStorage.getItem('test_rigid_distress') || '[]'
      );

      // Generate a mock ID
      const mockId =
        existingRigidDistress.length > 0
          ? Math.max(
              ...existingRigidDistress.map((d: any) => d.rigid_distress_id)
            ) + 1
          : 1;

      // Create the rigid distress object
      const rigidDistressObj = {
        rigid_distress_id: mockId,
        carriage_type: 'Rigid',
        geometry_data_id: this.roadId,
        road_name: this.selectedRoadName || this.roadName,
        chainage_start: this.chainageStart,
        chainage_end: this.chainageEnd,
        direction: this.selectedDirection,
        carriage_way_lanes: this.distressForm.get('carriage_way_lanes')?.value,
        distress_type: this.distressForm.get('distress_type')?.value,
        latitude: this.distressForm.get('latitude')?.value,
        longitude: this.distressForm.get('longitude')?.value,
        numbers_distress: this.distressForm.get('numbers_distress')?.value || 0,
        dimension_length: this.distressForm.get('dimension_length')?.value || 0,
        dimension_width: this.distressForm.get('dimension_width')?.value || 0,
        dimension_depth: this.distressForm.get('dimension_depth')?.value || 0,
        distress_image: this.distressForm.get('image_file')?.value?.name || '',
        distress_video: this.distressForm.get('video_file')?.value?.name || '',
        created_on: new Date().toISOString(),
        api_row_inserted_at: apiResponse?.row_inserted_at || null,
      };

      // Add to existing distress records
      existingRigidDistress.push(rigidDistressObj);

      // Save back to localStorage
      localStorage.setItem(
        'test_rigid_distress',
        JSON.stringify(existingRigidDistress)
      );

      console.log('✅ Saved to localStorage for table view');
    }

    // Clear loading toast
    this.toastr.clear();

    // Close modal
    this.isModalOpen = false;

    // Reset form fields
    this.selectedDistressType = '';
    this.distressForm.patchValue({
      carriage_way_lanes: '',
      distress_type: '',
      latitude: '',
      longitude: '',
      numbers_distress: 0,
      dimension_length: 0,
      dimension_width: 0,
      dimension_depth: 0,
      distress_image: '',
      distress_video: '',
      image_file: null,
      video_file: null,
      image_preview: null,
      video_preview: null,
    });

    // Show success/error message
    if (apiSuccess) {
      this.toastr.success(
        `Rigid distress submitted successfully! Row inserted at: ${
          apiResponse?.row_inserted_at || 'N/A'
        }`,
        'Success',
        {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        }
      );

      // Navigate to rigid distress list
      setTimeout(() => {
        this.router.navigate(['/ris/road-manage/rigid-distress']);
      }, 500);
    } else {
      this.toastr.error('Failed to submit to API. Please try again.', 'Error', {
        timeOut: 4000,
        positionClass: 'toast-top-right',
      });
    }
  }
}
