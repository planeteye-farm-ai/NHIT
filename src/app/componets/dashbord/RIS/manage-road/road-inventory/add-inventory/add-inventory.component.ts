import { Component } from '@angular/core';
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
  selector: 'app-add-inventory',
  standalone: true,
  imports: [
    SharedModule,
    NgSelectModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './add-inventory.component.html',
  styleUrl: './add-inventory.component.scss',
})
export class AddInventoryComponent {
  inventoryForm!: FormGroup;
  roadId: any;
  roadName: any;
  roadList: any[] = [];

  // Wizard Steps
  currentStep: number = 1;
  totalSteps: number = 4;

  // Road Selection
  selectedRoad: any = null;
  chainageStart: number = 0;
  chainageEnd: number = 0;

  // Direction options
  directionOptions = ['Increasing (LHS)', 'Decreasing (RHS)', 'Median'];
  selectedDirection: string = '';

  // Asset Action
  selectedAssetAction: string = 'add';

  // Asset Types (Complete list from Inventory Report) with colors
  assetTypes = [
    { name: 'Trees', color: '#4CAF50' },
    { name: 'Adjacent Road', color: '#2196F3' },
    { name: 'Sign Boards', color: '#FF9800' },
    { name: 'Culvert', color: '#9C27B0' },
    { name: 'Toll Plaza', color: '#F44336' },
    { name: 'Bus Stop', color: '#00BCD4' },
    { name: 'Crash Barrier', color: '#FF9800' },
    { name: 'Emergency Call Box', color: '#E91E63' },
    { name: 'KM Stones', color: '#607D8B' },
    { name: 'Street Lights', color: '#FFC107' },
    { name: 'Truck LayBy', color: '#8BC34A' },
    { name: 'Service Road', color: '#FF5722' },
    { name: 'Junction', color: '#9E9E9E' },
    { name: 'Fuel Station', color: '#3F51B5' },
    { name: 'Toilet Blocks', color: '#009688' },
    { name: 'RCC Drain', color: '#673AB7' },
    { name: 'Solar Blinker', color: '#FFEB3B' },
    { name: 'Median Opening', color: '#CDDC39' },
    { name: 'Bridges', color: '#795548' },
    { name: 'Footpath', color: '#00BCD4' },
    { name: 'Median Plants', color: '#4CAF50' },
    { name: 'Rest Area', color: '#FF5722' },
    { name: 'Traffic Signals', color: '#F44336' },
    { name: 'Tunnels', color: '#607D8B' },
  ];

  selectedAsset: string = '';
  selectedSubAsset: string = '';

  // Modal state
  isModalOpen: boolean = false;

  // Sub Asset Types (will be populated based on selected Asset Type)
  subAssetTypes: string[] = [];

  // Drag and drop states
  isDraggingImage: boolean = false;
  isDraggingVideo: boolean = false;

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

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private roadService: RoadService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.inventoryForm = this.fb.group({
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
      asset_action: ['add', Validators.required], // 'add' or 'report_missing'
      asset_type: ['', Validators.required],
      sub_asset_type: ['', Validators.required],
      latitude: ['', [Validators.required, CustomValidators.numberValidator()]],
      longitude: [
        '',
        [Validators.required, CustomValidators.numberValidator()],
      ],
      numbers_inventory: ['', CustomValidators.numberValidator()],
      inventory_image: [''],
      inventory_video: [''],
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
          this.roadList = [...formattedTestRoads, ...(res.data || [])];

          // Pre-fill the road dropdown with the roadId from route
          this.inventoryForm.patchValue({
            geometry_data_id: this.roadId,
          });

          // Load road name for display
          this.loadRoadName();
        },
        (err) => {
          // If API fails, just show test roads
          console.log('API failed, showing only localStorage roads');
          this.roadList = formattedTestRoads;

          // Pre-fill the road dropdown
          this.inventoryForm.patchValue({
            geometry_data_id: this.roadId,
          });

          // Load road name for display
          this.loadRoadName();
        }
      );
    } else {
      // No test roads, load from API only
      this.roadService.getGeometryList().subscribe((res) => {
        this.roadList = res.data;

        // Pre-fill the road dropdown
        this.inventoryForm.patchValue({
          geometry_data_id: this.roadId,
        });

        // Load road name for display
        this.loadRoadName();
      });
    }
  }

  // Load road name for display
  loadRoadName(): void {
    // Check localStorage first
    const testRoads = JSON.parse(localStorage.getItem('test_roads') || '[]');
    const testRoad = testRoads.find(
      (r: any) => r.geometry_data_id === this.roadId
    );

    if (testRoad) {
      this.roadName = testRoad.name_of_road;
      this.selectedRoad = testRoad;
      // Auto-populate chainage from road data
      this.chainageStart = testRoad.chainage_start || 0;
      this.chainageEnd = testRoad.chainage_end || 0;
      console.log('Road name loaded from localStorage:', this.roadName);
    } else {
      // Fallback to API
      this.roadService.getDetailsById(this.roadId).subscribe(
        (res) => {
          if (res && res.data && res.data.length > 0) {
            this.roadName = res.data[0].name_of_road;
            this.selectedRoad = res.data[0];
            this.chainageStart = res.data[0].chainage_start || 0;
            this.chainageEnd = res.data[0].chainage_end || 0;
          }
        },
        (err) => {
          console.log('Failed to load road name', err);
        }
      );
    }
  }

  // Wizard Navigation Methods
  goToNextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  goToPreviousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step;
    }
  }

  // Step validation methods
  canProceedFromStep1(): boolean {
    return (
      !!this.selectedRoad &&
      this.chainageStart !== null &&
      this.chainageEnd !== null
    );
  }

  canProceedFromStep2(): boolean {
    return !!this.selectedDirection;
  }

  canProceedFromStep3(): boolean {
    return !!this.selectedAssetAction;
  }

  // Direction Selection
  selectDirection(direction: string): void {
    this.selectedDirection = direction;
    this.inventoryForm.patchValue({ direction: direction });
  }

  // Asset Action Selection
  selectAssetAction(action: string): void {
    this.selectedAssetAction = action;
    this.inventoryForm.patchValue({ asset_action: action });
  }

  // Asset Card Click Handler
  onAssetCardClick(assetName: string): void {
    this.selectedAsset = assetName;
    this.subAssetTypes = this.assetSubTypeMap[assetName] || [];
    this.inventoryForm.patchValue({
      asset_type: assetName,
      sub_asset_type: '',
    });
    this.isModalOpen = true;
  }

  // Close Modal
  closeModal(): void {
    this.isModalOpen = false;
    this.selectedAsset = '';
    this.selectedSubAsset = '';
  }

  // Select Sub Asset
  selectSubAsset(subAsset: string): void {
    this.selectedSubAsset = subAsset;
    this.inventoryForm.patchValue({ sub_asset_type: subAsset });
  }

  // Increment/Decrement Quantity
  incrementQuantity(): void {
    const currentValue =
      this.inventoryForm.get('numbers_inventory')?.value || 0;
    this.inventoryForm.patchValue({
      numbers_inventory: Number(currentValue) + 1,
    });
  }

  decrementQuantity(): void {
    const currentValue =
      this.inventoryForm.get('numbers_inventory')?.value || 0;
    if (currentValue > 0) {
      this.inventoryForm.patchValue({
        numbers_inventory: Number(currentValue) - 1,
      });
    }
  }

  // Drag and Drop Handlers for Image
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

  // Drag and Drop Handlers for Video
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

    this.inventoryForm.patchValue({
      inventory_image: file.name,
      image_file: file,
    });

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.inventoryForm.patchValue({ image_preview: e.target.result });
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

    this.inventoryForm.patchValue({
      inventory_video: file.name,
      video_file: file,
    });

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.inventoryForm.patchValue({ video_preview: e.target.result });
    };
    reader.readAsDataURL(file);
  }

  // Update sub asset types when asset type changes
  onAssetTypeChange(assetType: string): void {
    this.subAssetTypes = this.assetSubTypeMap[assetType] || [];
    this.inventoryForm.patchValue({ sub_asset_type: '' });
  }

  // Handle image file selection
  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.processImageFile(file);
    }
  }

  // Handle video file selection
  onVideoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.processVideoFile(file);
    }
  }

  // Remove image
  removeImage(): void {
    this.inventoryForm.patchValue({
      inventory_image: '',
      image_file: null,
      image_preview: null,
    });
  }

  // Remove video
  removeVideo(): void {
    this.inventoryForm.patchValue({
      inventory_video: '',
      video_file: null,
      video_preview: null,
    });
  }

  // Submit from modal
  onSubmitFromModal(): void {
    if (this.inventoryForm.invalid) {
      this.inventoryForm.markAllAsTouched();
      this.toastr.error('Please fill all required fields', 'Validation Error');
      return;
    }

    // Update form with selected values
    this.inventoryForm.patchValue({
      geometry_data_id: this.roadId,
      chainage_start: this.chainageStart,
      chainage_end: this.chainageEnd,
      direction: this.selectedDirection,
      asset_action: this.selectedAssetAction,
    });

    this.onSubmit();
  }

  onSubmit(): void {
    if (this.inventoryForm.invalid) {
      this.inventoryForm.markAllAsTouched();
      this.toastr.error('Please fill all required fields', 'Validation Error');
      return;
    }

    // TESTING MODE: Store in localStorage
    // Get existing inventory items from localStorage
    let existingInventory = JSON.parse(
      localStorage.getItem('test_inventory') || '[]'
    );

    // Generate a mock ID
    const mockId =
      existingInventory.length > 0
        ? Math.max(
            ...existingInventory.map((inv: any) => inv.road_inventory_id)
          ) + 1
        : 1;

    // Create inventory object (without files for localStorage)
    const inventoryObj = {
      road_inventory_id: mockId,
      geometry_data_id: this.inventoryForm.get('geometry_data_id')?.value,
      road_name: this.roadName,
      chainage_start: this.inventoryForm.get('chainage_start')?.value,
      chainage_end: this.inventoryForm.get('chainage_end')?.value,
      direction: this.inventoryForm.get('direction')?.value,
      asset_action: this.inventoryForm.get('asset_action')?.value,
      asset_type: this.inventoryForm.get('asset_type')?.value,
      sub_asset_type: this.inventoryForm.get('sub_asset_type')?.value,
      latitude: this.inventoryForm.get('latitude')?.value,
      longitude: this.inventoryForm.get('longitude')?.value,
      numbers_inventory:
        this.inventoryForm.get('numbers_inventory')?.value || '',
      inventory_image: this.inventoryForm.get('image_file')?.value?.name || '',
      inventory_video: this.inventoryForm.get('video_file')?.value?.name || '',
      created_on: new Date().toISOString(),
    };

    // Add to existing inventory
    existingInventory.push(inventoryObj);

    // Save back to localStorage
    localStorage.setItem('test_inventory', JSON.stringify(existingInventory));

    // Show success message
    this.toastr.success(
      `Road Inventory added successfully! ID: ${mockId}`,
      'NHAI RAMS (Test Mode)',
      {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      }
    );

    // Navigate to road inventory list
    this.router.navigate(['/ris/road-manage/road-inventory', this.roadId]);

    // Log JSON response
    console.log('=== ROAD INVENTORY JSON RESPONSE ===');
    console.log(JSON.stringify(inventoryObj, null, 2));
    console.log('All road inventory items:', existingInventory);

    // PRODUCTION MODE: Uncomment below to use API
    // const formData = new FormData();
    //
    // // Add road ID
    // formData.append('geometry_data_id', this.inventoryForm.get('geometry_data_id')?.value.toString());
    //
    // // Add all form fields
    // formData.append(
    //   'chainage_start',
    //   this.inventoryForm.get('chainage_start')?.value
    // );
    // formData.append(
    //   'chainage_end',
    //   this.inventoryForm.get('chainage_end')?.value
    // );
    // formData.append('direction', this.inventoryForm.get('direction')?.value);
    // formData.append(
    //   'asset_action',
    //   this.inventoryForm.get('asset_action')?.value
    // );
    // formData.append('asset_type', this.inventoryForm.get('asset_type')?.value);
    // formData.append(
    //   'sub_asset_type',
    //   this.inventoryForm.get('sub_asset_type')?.value
    // );
    // formData.append('latitude', this.inventoryForm.get('latitude')?.value);
    // formData.append('longitude', this.inventoryForm.get('longitude')?.value);
    // formData.append(
    //   'numbers_inventory',
    //   this.inventoryForm.get('numbers_inventory')?.value || ''
    // );
    //
    // // Add image file if selected
    // const imageFile = this.inventoryForm.get('image_file')?.value;
    // if (imageFile) {
    //   formData.append('inventory_image', imageFile, imageFile.name);
    // }
    //
    // // Add video file if selected
    // const videoFile = this.inventoryForm.get('video_file')?.value;
    // if (videoFile) {
    //   formData.append('inventory_video', videoFile, videoFile.name);
    // }
    //
    // console.log('Submitting inventory...');
    //
    // this.roadService.addInventory(formData).subscribe(
    //   (res) => {
    //     console.log(res);
    //     if (res.status) {
    //       this.router.navigate([
    //         '/ris/road-manage/edit-inventory',
    //         res.road_inventory_id,
    //       ]);
    //       this.toastr.success(
    //         res.msg || 'Inventory added successfully',
    //         'NHAI RAMS',
    //         {
    //           timeOut: 3000,
    //           positionClass: 'toast-top-right',
    //         }
    //       );
    //     } else {
    //       this.toastr.error(res.msg || 'Failed to add inventory', 'NHAI RAMS', {
    //         timeOut: 3000,
    //         positionClass: 'toast-top-right',
    //       });
    //     }
    //   },
    //   (err) => {
    //     this.toastr.error(err.msg || 'An error occurred', 'NHAI RAMS', {
    //       timeOut: 3000,
    //       positionClass: 'toast-top-right',
    //     });
    //   }
    // );
  }
}
