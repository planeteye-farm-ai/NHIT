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
import { ActivatedRoute } from '@angular/router';
import { RoadService } from '../../road.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-add-inventory',
  standalone: true,
  imports: [
    SharedModule,
    NgSelectModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './add-inventory.component.html',
  styleUrl: './add-inventory.component.scss',
})
export class AddInventoryComponent {
  inventoryForm!: FormGroup;
  roadId: any;
  roadName: any;
  roadList: any[] = [];

  // Dynamic Roads from API
  availableRoads: string[] = [];
  selectedRoadName: string = '';
  projectDatesMap: { [key: string]: string[] } = {};
  isLoadingChainage: boolean = false;

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
  selectedSubAssets: string[] = []; // Changed to array for multi-selection

  // Individual details for each selected sub-asset
  subAssetDetails: {
    [subAsset: string]: {
      latitude: number | null;
      longitude: number | null;
      quantity: number;
      image?: File;
      video?: File;
      imagePreview?: string;
      videoPreview?: string;
    };
  } = {};

  // Modal state
  isModalOpen: boolean = false;

  // Sub Asset Types (will be populated based on selected Asset Type)
  subAssetTypes: string[] = [];

  // Drag and drop states
  isDraggingImage: boolean = false;
  isDraggingVideo: boolean = false;

  // Asset Type to Sub Asset Type mapping (Updated based on requirements)
  assetSubTypeMap: { [key: string]: string[] } = {
    'Sign Boards': [
      'Informatory sign boards',
      'Mandatory sign boards',
      'Cautionary sign boards',
    ],
    'Street Lights': [
      'Single arm street light',
      'Double arm street light',
      'High mast street light',
    ],
    'Truck LayBy': ['Truck LayBy', 'Bus Layby'],
    Junction: [
      'Simple/Cross Junction',
      'T-Junction',
      'Skew or Y-Junction',
      'Ghost Island Junction',
    ],
    'Crash Barrier': ['W Beam Crash Barrier', 'Concrete Beam Crash Barrier'],
    Trees: ['1m and above', '1-3m', 'above 3m'],
    // Assets without subtypes (empty arrays)
    'Adjacent Road': [],
    Bridges: [],
    'Bus Stop': [],
    Culvert: [],
    'Emergency Call Box': [],
    Footpath: [],
    'Fuel Station': [],
    'KM Stones': [],
    'Median Opening': [],
    'Median Plants': [],
    'RCC Drain': [],
    'Rest Area': [],
    'Service Road': [],
    'Solar Blinker': [],
    'Toilet Blocks': [],
    'Toll Plaza': [],
    'Traffic Signals': [],
    Tunnels: [],
  };

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private roadService: RoadService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.inventoryForm = this.fb.group({
      geometry_data_id: ['', Validators.required],
      chainage_start: [0, Validators.required], // Allow 0 as default value
      chainage_end: [0, Validators.required], // Allow 0 as default value
      direction: ['', Validators.required],
      asset_action: ['add', Validators.required], // 'add' or 'report_missing'
      asset_type: ['', Validators.required],
      sub_asset_type: [''], // Not required by default, will be set based on asset type
      latitude: ['', [Validators.required, CustomValidators.numberValidator()]],
      longitude: [
        '',
        [Validators.required, CustomValidators.numberValidator()],
      ],
      numbers_inventory: [0], // No validator, allow any number including 0
      inventory_image: [''],
      inventory_video: [''],
      image_file: [null],
      video_file: [null],
      image_preview: [null],
      video_preview: [null],
    });

    // Load dynamic roads from API
    this.loadDynamicRoads();

    this.route.paramMap.subscribe((params) => {
      this.roadId = Number(params.get('id'));
      this.loadRoadList();
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

        // If roadId is provided (coming from specific road's inventory page)
        if (this.roadId && this.roadId >= 1000) {
          const roadIndex = this.roadId - 1000;
          if (roadIndex >= 0 && roadIndex < this.availableRoads.length) {
            this.selectedRoadName = this.availableRoads[roadIndex];
            this.roadName = this.selectedRoadName;
            console.log('Pre-selected road from route:', this.selectedRoadName);

            // Load chainage for this road
            this.loadChainageRange(this.selectedRoadName);
          }
        } else if (this.availableRoads.length > 0 && !this.selectedRoadName) {
          // Otherwise, select the first one
          this.selectedRoadName = this.availableRoads[0];
          this.roadName = this.selectedRoadName;

          // Load chainage for this road
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

  // Load chainage range from inventory filter API
  loadChainageRange(projectName: string): void {
    if (!projectName) return;

    this.isLoadingChainage = true;
    const apiUrl =
      'https://fantastic-reportapi-production.up.railway.app/inventory_filter';

    // Get the first available date for this project
    const availableDates = this.projectDatesMap[projectName] || [];
    const selectedDate =
      availableDates.length > 0 ? availableDates[0] : '2025-06-20';

    const requestBody = {
      chainage_start: 0,
      chainage_end: 10000, // Large number to get all data
      date: selectedDate,
      direction: ['All'],
      project_name: [projectName],
      asset_type: ['All'],
    };

    console.log('Fetching chainage range for:', projectName);
    console.log('Request body:', requestBody);

    this.http.post<any[]>(apiUrl, requestBody).subscribe(
      (response) => {
        console.log('Chainage data response:', response);

        if (response && response.length > 0) {
          // Flatten the nested arrays
          const allData = response.flat();

          if (allData.length > 0) {
            // Find minimum chainage_start and maximum chainage_end
            const minChainage = Math.min(
              ...allData.map((item: any) => item.chainage_start)
            );
            const maxChainage = Math.max(
              ...allData.map((item: any) => item.chainage_end)
            );

            this.chainageStart = minChainage;
            this.chainageEnd = maxChainage;

            // Update form
            this.inventoryForm.patchValue({
              chainage_start: minChainage,
              chainage_end: maxChainage,
            });

            console.log('Chainage range calculated:');
            console.log('Min (Start):', minChainage);
            console.log('Max (End):', maxChainage);

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
        console.error('Failed to load chainage range:', error);
        this.toastr.error('Failed to load chainage range from API', 'Error', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
        this.isLoadingChainage = false;
      }
    );
  }

  // Handle road selection
  onRoadSelect(roadName: string): void {
    this.selectedRoadName = roadName;
    this.roadName = roadName;
    console.log('Road selected:', roadName);
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
    // Check if this is an API road (ID >= 1000)
    if (this.roadId >= 1000) {
      // Load from dynamic API
      const apiUrl =
        'https://fantastic-reportapi-production.up.railway.app/projects-dates/inventory';

      this.http.get<{ [key: string]: string[] }>(apiUrl).subscribe(
        (response) => {
          const roadNames = Object.keys(response);
          this.projectDatesMap = response;
          const roadIndex = this.roadId - 1000;

          if (roadIndex >= 0 && roadIndex < roadNames.length) {
            this.roadName = roadNames[roadIndex];
            this.selectedRoadName = this.roadName;
            this.selectedRoad = {
              geometry_data_id: this.roadId,
              name_of_road: this.roadName,
            };

            // Patch road ID to form
            this.inventoryForm.patchValue({
              geometry_data_id: this.roadId,
            });

            console.log('Road name loaded from API:', this.roadName);
            console.log('Road ID:', this.roadId);

            // Load chainage range for this road
            this.loadChainageRange(this.roadName);
          }
        },
        (error) => {
          console.error('Failed to load road name from API:', error);
        }
      );
    } else {
      // Check localStorage first
      const testRoads = JSON.parse(localStorage.getItem('test_roads') || '[]');
      const testRoad = testRoads.find(
        (r: any) => r.geometry_data_id === this.roadId
      );

      if (testRoad) {
        this.roadName = testRoad.name_of_road;
        this.selectedRoadName = this.roadName;
        this.selectedRoad = testRoad;
        // Auto-populate chainage from road data
        this.chainageStart = Number(testRoad.chainage_start) || 0;
        this.chainageEnd = Number(testRoad.chainage_end) || 0;

        // Patch chainage values to form
        this.inventoryForm.patchValue({
          chainage_start: this.chainageStart,
          chainage_end: this.chainageEnd,
        });

        console.log('Road name loaded from localStorage:', this.roadName);
        console.log(
          'Chainage Start:',
          this.chainageStart,
          'Chainage End:',
          this.chainageEnd
        );
      } else {
        // Fallback to API
        this.roadService.getDetailsById(this.roadId).subscribe(
          (res) => {
            if (res && res.data && res.data.length > 0) {
              this.roadName = res.data[0].name_of_road;
              this.selectedRoadName = this.roadName;
              this.selectedRoad = res.data[0];
              this.chainageStart = Number(res.data[0].chainage_start) || 0;
              this.chainageEnd = Number(res.data[0].chainage_end) || 0;

              // Patch chainage values to form
              this.inventoryForm.patchValue({
                chainage_start: this.chainageStart,
                chainage_end: this.chainageEnd,
              });

              console.log('Road name loaded from API:', this.roadName);
              console.log(
                'Chainage Start:',
                this.chainageStart,
                'Chainage End:',
                this.chainageEnd
              );
            }
          },
          (err) => {
            console.log('Failed to load road name', err);
          }
        );
      }
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

  // Submit inventory to API
  submitToAPI(inventoryData: any): Promise<any> {
    // Use proxy path for development to avoid CORS issues
    // In production, this should be the full API URL
    const apiUrl = '/api/append_inventory_excel/';

    const apiBody = {
      Project_Name: this.selectedRoadName || this.roadName,
      Chainage_start: this.chainageStart,
      Chainage_end: this.chainageEnd,
      Direction: this.getDirectionForAPI(this.selectedDirection),
      Asset_type: inventoryData.asset_type,
      Latitude: inventoryData.latitude,
      Longitude: inventoryData.longitude,
      Date: this.getCurrentDate(),
      Sub_Asset_Type: inventoryData.sub_asset_type || '',
      Carriage_Type: 'Flexible',
      Lane: 'L2',
      No_of_inventories: inventoryData.quantity || 0,
    };

    console.log('Submitting to API:', apiBody);

    return this.http.post(apiUrl, apiBody).toPromise();
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

    // If no subtypes, auto-fill with asset name or "N/A"
    if (this.subAssetTypes.length === 0) {
      this.selectedSubAssets = [];
      this.inventoryForm.patchValue({
        asset_type: assetName,
        sub_asset_type: 'N/A',
      });
    } else {
      this.selectedSubAssets = [];
      this.subAssetDetails = {};
      this.inventoryForm.patchValue({
        asset_type: assetName,
        sub_asset_type: '',
      });
    }

    this.isModalOpen = true;
  }

  // Close Modal
  closeModal(): void {
    this.isModalOpen = false;
    this.selectedAsset = '';
    this.selectedSubAssets = [];
    this.subAssetDetails = {};
  }

  // Update Chainage Start
  updateChainageStart(value: number): void {
    this.chainageStart = value;
    this.inventoryForm.patchValue({ chainage_start: value });
  }

  // Update Chainage End
  updateChainageEnd(value: number): void {
    this.chainageEnd = value;
    this.inventoryForm.patchValue({ chainage_end: value });
  }

  // Select/Deselect Sub Asset (Multi-selection)
  toggleSubAsset(subAsset: string): void {
    const index = this.selectedSubAssets.indexOf(subAsset);

    if (index > -1) {
      // Already selected, remove it
      this.selectedSubAssets.splice(index, 1);
      delete this.subAssetDetails[subAsset];
    } else {
      // Not selected, add it
      this.selectedSubAssets.push(subAsset);
      // Initialize details for this sub-asset
      this.subAssetDetails[subAsset] = {
        latitude: null,
        longitude: null,
        quantity: 0,
      };
    }

    console.log('Selected sub-assets:', this.selectedSubAssets);
    console.log('Sub-asset details:', this.subAssetDetails);
  }

  // Check if sub-asset is selected
  isSubAssetSelected(subAsset: string): boolean {
    return this.selectedSubAssets.includes(subAsset);
  }

  // Update lat/long for specific sub-asset
  updateSubAssetLatitude(subAsset: string, value: number): void {
    if (this.subAssetDetails[subAsset]) {
      this.subAssetDetails[subAsset].latitude = value;
      console.log(`📍 Updated latitude for ${subAsset}:`, value);
      console.log('Current details:', this.subAssetDetails[subAsset]);
    }
  }

  updateSubAssetLongitude(subAsset: string, value: number): void {
    if (this.subAssetDetails[subAsset]) {
      this.subAssetDetails[subAsset].longitude = value;
      console.log(`📍 Updated longitude for ${subAsset}:`, value);
      console.log('Current details:', this.subAssetDetails[subAsset]);
    }
  }

  updateSubAssetQuantity(subAsset: string, value: number): void {
    if (this.subAssetDetails[subAsset]) {
      this.subAssetDetails[subAsset].quantity = value;
      console.log(`🔢 Updated quantity for ${subAsset}:`, value);
      console.log('Current details:', this.subAssetDetails[subAsset]);
    }
  }

  incrementSubAssetQuantity(subAsset: string): void {
    if (this.subAssetDetails[subAsset]) {
      this.subAssetDetails[subAsset].quantity =
        (this.subAssetDetails[subAsset].quantity || 0) + 1;
    }
  }

  decrementSubAssetQuantity(subAsset: string): void {
    if (this.subAssetDetails[subAsset]) {
      const currentQty = this.subAssetDetails[subAsset].quantity || 0;
      if (currentQty > 0) {
        this.subAssetDetails[subAsset].quantity = currentQty - 1;
      }
    }
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

  // Check if form can be submitted
  canSubmit(): boolean {
    // Quick check: direction must be selected
    if (!this.selectedDirection) {
      return false;
    }

    // For assets with subtypes
    if (this.subAssetTypes.length > 0) {
      // Must have at least one sub-asset selected
      if (this.selectedSubAssets.length === 0) {
        return false;
      }

      // Check if all selected sub-assets have valid lat/long
      for (const subAsset of this.selectedSubAssets) {
        const details = this.subAssetDetails[subAsset];

        // Check for null or undefined, not just falsy (0 is a valid value)
        if (!details) {
          return false;
        }

        // Both latitude and longitude must be filled (not null/undefined/empty string)
        // Convert to string to check for empty string case
        const latStr = String(details.latitude);
        const lngStr = String(details.longitude);
        if (
          details.latitude == null ||
          details.longitude == null ||
          latStr === 'null' ||
          lngStr === 'null' ||
          latStr.trim() === '' ||
          lngStr.trim() === ''
        ) {
          return false;
        }
      }

      return true;
    }

    // For assets without subtypes
    const lat = this.inventoryForm.get('latitude')?.value;
    const lng = this.inventoryForm.get('longitude')?.value;

    // Check not null/undefined and not empty
    if (lat == null || lng == null) {
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

  // Debug method - call this from console to see validation status
  // Usage: Open console and type: window['ngComponent'].debugCanSubmit()
  debugCanSubmit(): void {
    console.log('\n=== 🔍 DEBUG CAN SUBMIT ===');
    console.log('📍 Selected Direction:', this.selectedDirection);
    console.log('📋 Sub Asset Types:', this.subAssetTypes);
    console.log('✅ Selected Sub-Assets:', this.selectedSubAssets);
    console.log(
      '📊 Sub-Asset Details:',
      JSON.stringify(this.subAssetDetails, null, 2)
    );

    if (this.subAssetTypes.length > 0) {
      console.log('\n--- Checking Each Sub-Asset ---');
      for (const subAsset of this.selectedSubAssets) {
        const details = this.subAssetDetails[subAsset];
        console.log(`\n${subAsset}:`);
        console.log('  ✓ Details exists:', !!details);
        if (details) {
          console.log(
            '  📍 Latitude:',
            details.latitude,
            '| Type:',
            typeof details.latitude
          );
          console.log(
            '  📍 Longitude:',
            details.longitude,
            '| Type:',
            typeof details.longitude
          );
          console.log('  🔢 Quantity:', details.quantity);
          console.log('  ❓ Lat == null:', details.latitude == null);
          console.log('  ❓ Lng == null:', details.longitude == null);
          const latStr = String(details.latitude);
          const lngStr = String(details.longitude);
          console.log('  ❓ Lat as string:', latStr);
          console.log('  ❓ Lng as string:', lngStr);

          const isValid =
            details.latitude != null &&
            details.longitude != null &&
            latStr !== 'null' &&
            lngStr !== 'null' &&
            latStr.trim() !== '' &&
            lngStr.trim() !== '';
          console.log('  ✅ Is Valid:', isValid);
        }
      }
    } else {
      const lat = this.inventoryForm.get('latitude')?.value;
      const lng = this.inventoryForm.get('longitude')?.value;
      console.log('\n--- Asset Without Subtypes ---');
      console.log('  📍 Latitude:', lat, '| Type:', typeof lat);
      console.log('  📍 Longitude:', lng, '| Type:', typeof lng);
    }

    const result = this.canSubmit();
    console.log('\n🎯 FINAL RESULT - Can Submit?', result);
    console.log('=========================\n');
  }

  // Get submit button title
  getSubmitButtonTitle(): string {
    if (!this.selectedDirection) return 'Please select a direction first';

    if (this.subAssetTypes.length > 0) {
      if (this.selectedSubAssets.length === 0)
        return 'Please select at least one sub-asset type';

      for (const subAsset of this.selectedSubAssets) {
        const details = this.subAssetDetails[subAsset];
        // Check for null or undefined, not just falsy (0 is a valid value)
        if (!details || details.latitude == null || details.longitude == null) {
          return `Please fill latitude and longitude for ${subAsset}`;
        }
      }
    } else {
      const lat = this.inventoryForm.get('latitude')?.value;
      const lng = this.inventoryForm.get('longitude')?.value;
      if (lat == null || lng == null) {
        return 'Please fill latitude and longitude';
      }
    }

    return '';
  }

  // Submit from modal
  onSubmitFromModal(): void {
    console.log('=== SUBMIT FROM MODAL CALLED ===');
    console.log('Selected Direction:', this.selectedDirection);
    console.log('Selected Asset:', this.selectedAsset);
    console.log('Selected SubAssets:', this.selectedSubAssets);
    console.log('Sub-Asset Details:', this.subAssetDetails);
    console.log('Has Subtypes:', this.subAssetTypes.length > 0);

    // Check if direction is selected
    if (!this.selectedDirection) {
      this.toastr.error('Please select a direction first', 'Validation Error');
      return;
    }

    // For assets with subtypes - create multiple inventory items
    if (this.subAssetTypes.length > 0 && this.selectedSubAssets.length > 0) {
      this.submitMultipleInventories();
    } else {
      // For assets without subtypes - single inventory
      this.submitSingleInventory();
    }
  }

  // Submit multiple inventories (one for each selected sub-asset)
  async submitMultipleInventories(): Promise<void> {
    let apiSuccessCount = 0;
    let apiFailCount = 0;
    let existingInventory = JSON.parse(
      localStorage.getItem('test_inventory') || '[]'
    );

    // Show loading toast
    this.toastr.info('Submitting inventories...', 'Please wait', {
      timeOut: 0,
      positionClass: 'toast-top-right',
    });

    for (const subAsset of this.selectedSubAssets) {
      const details = this.subAssetDetails[subAsset];

      // Check for null or undefined, not just falsy (0 is a valid value)
      if (!details || details.latitude == null || details.longitude == null) {
        this.toastr.error(`Missing data for ${subAsset}`, 'Validation Error');
        continue;
      }

      // Submit to API
      try {
        const apiData = {
          asset_type: this.selectedAsset,
          sub_asset_type: subAsset,
          latitude: details.latitude,
          longitude: details.longitude,
          quantity: details.quantity || 0,
        };

        await this.submitToAPI(apiData);
        apiSuccessCount++;
        console.log(`✅ API Success for ${subAsset}`);

        // Save to localStorage after successful API submission (for viewing in table)
        const mockId =
          existingInventory.length > 0
            ? Math.max(
                ...existingInventory.map((inv: any) => inv.road_inventory_id)
              ) + 1
            : apiSuccessCount;

        const inventoryObj = {
          road_inventory_id: mockId,
          geometry_data_id: this.roadId,
          road_name: this.selectedRoadName || this.roadName,
          chainage_start: this.chainageStart,
          chainage_end: this.chainageEnd,
          direction: this.selectedDirection,
          asset_action: this.selectedAssetAction,
          asset_type: this.selectedAsset,
          sub_asset_type: subAsset,
          latitude: details.latitude,
          longitude: details.longitude,
          numbers_inventory: details.quantity || 0,
          inventory_image:
            this.inventoryForm.get('image_file')?.value?.name || '',
          inventory_video:
            this.inventoryForm.get('video_file')?.value?.name || '',
          created_on: new Date().toISOString(),
        };

        existingInventory.push(inventoryObj);
      } catch (error) {
        console.error(`❌ API Failed for ${subAsset}:`, error);
        apiFailCount++;
      }
    }

    // Save to localStorage for viewing in table
    if (apiSuccessCount > 0) {
      localStorage.setItem('test_inventory', JSON.stringify(existingInventory));
      console.log('✅ Saved to localStorage for table view');
    }

    // Clear loading toast
    this.toastr.clear();

    // Close modal and reset
    this.isModalOpen = false;
    this.selectedAsset = '';
    this.selectedSubAssets = [];
    this.subAssetDetails = {};

    // Show success/error message
    if (apiSuccessCount > 0 && apiFailCount === 0) {
      this.toastr.success(
        `${apiSuccessCount} inventory item(s) submitted successfully!`,
        'Success',
        {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        }
      );
    } else if (apiSuccessCount > 0 && apiFailCount > 0) {
      this.toastr.warning(
        `${apiSuccessCount} item(s) submitted, ${apiFailCount} item(s) failed`,
        'Partial Success',
        {
          timeOut: 4000,
          positionClass: 'toast-top-right',
        }
      );
    } else {
      this.toastr.error(
        `Failed to submit ${apiFailCount} item(s) to API`,
        'Error',
        {
          timeOut: 4000,
          positionClass: 'toast-top-right',
        }
      );
    }

    // Navigate to road inventory list only if at least one succeeded
    if (apiSuccessCount > 0) {
      setTimeout(() => {
        this.router.navigate(['/ris/road-manage/road-inventory', this.roadId]);
      }, 500);
    }
  }

  // Submit single inventory (for assets without subtypes)
  async submitSingleInventory(): Promise<void> {
    // Update form with selected values BEFORE validation
    this.inventoryForm.patchValue({
      geometry_data_id: this.roadId,
      chainage_start: this.chainageStart,
      chainage_end: this.chainageEnd,
      direction: this.selectedDirection,
      asset_action: this.selectedAssetAction,
    });

    console.log('Form Values After Patch:', this.inventoryForm.value);
    console.log('Form Valid:', this.inventoryForm.valid);
    console.log('Form Errors:', this.getFormErrors());

    if (this.inventoryForm.invalid) {
      this.inventoryForm.markAllAsTouched();
      this.toastr.error('Please fill all required fields', 'Validation Error');
      console.log('Form is invalid, not submitting');
      return;
    }

    console.log('Calling onSubmit()...');
    await this.onSubmit();
  }

  // Helper method to get form errors
  getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.inventoryForm.controls).forEach((key) => {
      const control = this.inventoryForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  async onSubmit(): Promise<void> {
    console.log('=== ON SUBMIT CALLED ===');
    console.log('Form Valid:', this.inventoryForm.valid);

    if (this.inventoryForm.invalid) {
      this.inventoryForm.markAllAsTouched();
      this.toastr.error('Please fill all required fields', 'Validation Error');
      console.log('Form is invalid in onSubmit');
      return;
    }

    console.log('Proceeding with submission...');

    // Show loading toast
    this.toastr.info('Submitting inventory...', 'Please wait', {
      timeOut: 0,
      positionClass: 'toast-top-right',
    });

    // Submit to API
    let apiSuccess = false;
    try {
      const apiData = {
        asset_type: this.inventoryForm.get('asset_type')?.value,
        sub_asset_type: this.inventoryForm.get('sub_asset_type')?.value || '',
        latitude: this.inventoryForm.get('latitude')?.value,
        longitude: this.inventoryForm.get('longitude')?.value,
        quantity: this.inventoryForm.get('numbers_inventory')?.value || 0,
      };

      await this.submitToAPI(apiData);
      apiSuccess = true;
      console.log('✅ API Success');

      // Save to localStorage after successful API submission (for viewing in table)
      let existingInventory = JSON.parse(
        localStorage.getItem('test_inventory') || '[]'
      );

      const mockId =
        existingInventory.length > 0
          ? Math.max(
              ...existingInventory.map((inv: any) => inv.road_inventory_id)
            ) + 1
          : 1;

      const inventoryObj = {
        road_inventory_id: mockId,
        geometry_data_id: this.inventoryForm.get('geometry_data_id')?.value,
        road_name: this.selectedRoadName || this.roadName,
        chainage_start: this.inventoryForm.get('chainage_start')?.value,
        chainage_end: this.inventoryForm.get('chainage_end')?.value,
        direction: this.inventoryForm.get('direction')?.value,
        asset_action: this.inventoryForm.get('asset_action')?.value,
        asset_type: this.inventoryForm.get('asset_type')?.value,
        sub_asset_type: this.inventoryForm.get('sub_asset_type')?.value,
        latitude: this.inventoryForm.get('latitude')?.value,
        longitude: this.inventoryForm.get('longitude')?.value,
        numbers_inventory:
          this.inventoryForm.get('numbers_inventory')?.value || 0,
        inventory_image:
          this.inventoryForm.get('image_file')?.value?.name || '',
        inventory_video:
          this.inventoryForm.get('video_file')?.value?.name || '',
        created_on: new Date().toISOString(),
      };

      existingInventory.push(inventoryObj);
      localStorage.setItem('test_inventory', JSON.stringify(existingInventory));
      console.log('✅ Saved to localStorage for table view');
    } catch (error) {
      console.error('❌ API Failed:', error);
    }

    // Clear loading toast
    this.toastr.clear();

    // Close the modal
    this.isModalOpen = false;

    // Reset form and selections
    this.selectedAsset = '';
    this.selectedSubAssets = [];
    this.subAssetDetails = {};
    this.inventoryForm.reset({
      geometry_data_id: this.roadId,
      chainage_start: this.chainageStart,
      chainage_end: this.chainageEnd,
      direction: this.selectedDirection,
      asset_action: this.selectedAssetAction,
    });

    // Show success/error message
    if (apiSuccess) {
      this.toastr.success(
        'Inventory submitted to API successfully!',
        'Success',
        {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        }
      );

      // Navigate to road inventory list after a short delay
      setTimeout(() => {
        this.router.navigate(['/ris/road-manage/road-inventory', this.roadId]);
      }, 500);
    } else {
      this.toastr.error('Failed to submit to API. Please try again.', 'Error', {
        timeOut: 4000,
        positionClass: 'toast-top-right',
      });
    }

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
