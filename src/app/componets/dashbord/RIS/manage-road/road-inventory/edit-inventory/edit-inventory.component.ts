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
  selector: 'app-edit-inventory',
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
  templateUrl: './edit-inventory.component.html',
  styleUrl: './edit-inventory.component.scss',
})
export class EditInventoryComponent {
  inventoryForm!: FormGroup;
  prismCode = prismCodeData;
  roadId: any;
  inventoryId: any;
  inventoryData: any;

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

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private roadService: RoadService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.roadId = Number(params.get('id'));
      this.inventoryId = Number(params.get('id'));
      if (this.inventoryId) {
        this.loadInventoryDetails(this.inventoryId);
      }
    });

    this.inventoryForm = this.fb.group({
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
  }

  // Update sub asset types when asset type changes
  onAssetTypeChange(assetType: string): void {
    this.subAssetTypes = this.assetSubTypeMap[assetType] || [];
    this.inventoryForm.patchValue({ sub_asset_type: '' });
  }

  loadInventoryDetails(id: number): void {
    // TESTING MODE: Load from localStorage first
    const testInventory = JSON.parse(
      localStorage.getItem('test_inventory') || '[]'
    );
    const foundInventory = testInventory.find(
      (inv: any) => inv.road_inventory_id === id
    );

    if (foundInventory) {
      console.log('Inventory loaded from localStorage:', foundInventory);
      this.inventoryData = foundInventory;
      this.patchValue({ data: [foundInventory] });
      this.toastr.info('Loaded from Test Mode (localStorage)', 'NHAI RAMS', {
        timeOut: 2000,
        positionClass: 'toast-top-right',
      });
    } else {
      // Fallback to API if not found in localStorage
      this.toastr.warning(
        'Inventory not found in localStorage. Using API...',
        'NHAI RAMS',
        {
          timeOut: 2000,
          positionClass: 'toast-top-right',
        }
      );

      this.roadService.getInventoryById(id).subscribe(
        (inventory: any) => {
          console.log('get inventory details', inventory);
          if (inventory && inventory.data && inventory.data.length > 0) {
            this.inventoryData = inventory.data[0];
            this.patchValue(inventory);
          }
        },
        (err) => {
          this.toastr.error(
            err.msg || 'Failed to load inventory',
            'NHAI RAMS',
            {
              timeOut: 3000,
              positionClass: 'toast-top-right',
            }
          );
        }
      );
    }
  }

  patchValue(inventory: any): void {
    const data = inventory.data[0];

    // Set sub asset types based on asset type
    if (data.asset_type) {
      this.subAssetTypes = this.assetSubTypeMap[data.asset_type] || [];
    }

    this.inventoryForm.patchValue({
      chainage_start: data.chainage_start,
      chainage_end: data.chainage_end,
      direction: data.direction,
      asset_action: data.asset_action || 'add',
      asset_type: data.asset_type,
      sub_asset_type: data.sub_asset_type,
      latitude: data.latitude,
      longitude: data.longitude,
      numbers_inventory: data.numbers_inventory,
      inventory_image: data.inventory_image,
      inventory_video: data.inventory_video,
    });
  }

  // Handle image file selection
  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        this.toastr.error(
          'Only JPG and PNG images are allowed',
          'Invalid File'
        );
        event.target.value = '';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error('Image size should not exceed 5MB', 'File Too Large');
        event.target.value = '';
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
  }

  // Handle video file selection
  onVideoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'];
      if (!validTypes.includes(file.type)) {
        this.toastr.error(
          'Only MP4, AVI, MOV, and WMV videos are allowed',
          'Invalid File'
        );
        event.target.value = '';
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        this.toastr.error(
          'Video size should not exceed 50MB',
          'File Too Large'
        );
        event.target.value = '';
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

  onSubmit(): void {
    if (this.inventoryForm.invalid) {
      this.inventoryForm.markAllAsTouched();
      this.toastr.error('Please fill all required fields', 'Validation Error');
      return;
    }

    // TESTING MODE: Update in localStorage
    let testInventory = JSON.parse(
      localStorage.getItem('test_inventory') || '[]'
    );
    const inventoryIndex = testInventory.findIndex(
      (inv: any) => inv.road_inventory_id === this.inventoryId
    );

    if (inventoryIndex !== -1) {
      // Update the inventory in localStorage
      testInventory[inventoryIndex] = {
        road_inventory_id: this.inventoryId,
        geometry_data_id: testInventory[inventoryIndex].geometry_data_id,
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
        inventory_image:
          this.inventoryForm.get('image_file')?.value?.name ||
          testInventory[inventoryIndex].inventory_image,
        inventory_video:
          this.inventoryForm.get('video_file')?.value?.name ||
          testInventory[inventoryIndex].inventory_video,
        created_on: testInventory[inventoryIndex].created_on,
      };

      // Save back to localStorage
      localStorage.setItem('test_inventory', JSON.stringify(testInventory));

      // Reload the inventory details
      this.loadInventoryDetails(this.inventoryId);

      this.toastr.success(
        'Inventory updated successfully!',
        'NHAI RAMS (Test Mode)',
        {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        }
      );

      console.log(
        'Inventory updated in localStorage:',
        testInventory[inventoryIndex]
      );
    } else {
      // Not found in localStorage, use API
      this.toastr.warning(
        'Inventory not found in localStorage. Using API...',
        'NHAI RAMS',
        {
          timeOut: 2000,
          positionClass: 'toast-top-right',
        }
      );

      const formData = new FormData();

      // Add all form fields
      formData.append(
        'chainage_start',
        this.inventoryForm.get('chainage_start')?.value
      );
      formData.append(
        'chainage_end',
        this.inventoryForm.get('chainage_end')?.value
      );
      formData.append('direction', this.inventoryForm.get('direction')?.value);
      formData.append(
        'asset_action',
        this.inventoryForm.get('asset_action')?.value
      );
      formData.append(
        'asset_type',
        this.inventoryForm.get('asset_type')?.value
      );
      formData.append(
        'sub_asset_type',
        this.inventoryForm.get('sub_asset_type')?.value
      );
      formData.append('latitude', this.inventoryForm.get('latitude')?.value);
      formData.append('longitude', this.inventoryForm.get('longitude')?.value);
      formData.append(
        'numbers_inventory',
        this.inventoryForm.get('numbers_inventory')?.value || ''
      );

      // Add image file if selected
      const imageFile = this.inventoryForm.get('image_file')?.value;
      if (imageFile) {
        formData.append('inventory_image', imageFile, imageFile.name);
      }

      // Add video file if selected
      const videoFile = this.inventoryForm.get('video_file')?.value;
      if (videoFile) {
        formData.append('inventory_video', videoFile, videoFile.name);
      }

      console.log('Submitting inventory update...');

      this.roadService.updateInventory(formData, this.inventoryId).subscribe(
        (res) => {
          console.log(res);
          if (res.status) {
            this.loadInventoryDetails(this.inventoryId);
            this.toastr.success(
              res.msg || 'Inventory updated successfully',
              'NHAI RAMS',
              {
                timeOut: 3000,
                positionClass: 'toast-top-right',
              }
            );
          } else {
            this.toastr.error(
              res.msg || 'Failed to update inventory',
              'NHAI RAMS',
              {
                timeOut: 3000,
                positionClass: 'toast-top-right',
              }
            );
          }
        },
        (err) => {
          this.toastr.error(err.msg || 'An error occurred', 'NHAI RAMS', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
        }
      );
    }
  }
}
