import { Component } from '@angular/core';
import { ShowcodeCardComponent } from '../../../../../../shared/common/includes/showcode-card/showcode-card.component';
import * as prismCodeData from '../../../../../../shared/prismData/forms/form_layouts';
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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RoadService } from '../../road.service';
import { HttpClient } from '@angular/common/http';

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
  inventoryId: any;
  inventoryData: any;

  // Direction options
  directionOptions = ['Increasing (LHS)', 'Decreasing (RHS)', 'Median'];

  // Asset Types
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

  // Sub Asset Types mapping
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
    // Assets without subtypes
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

  subAssetTypes: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private roadService: RoadService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.inventoryForm = this.fb.group({
      road_name: ['', Validators.required],
      chainage_start: [0, Validators.required],
      chainage_end: [0, Validators.required],
      direction: ['', Validators.required],
      asset_action: ['add', Validators.required],
      asset_type: ['', Validators.required],
      sub_asset_type: [''],
      latitude: ['', [Validators.required, CustomValidators.numberValidator()]],
      longitude: [
        '',
        [Validators.required, CustomValidators.numberValidator()],
      ],
      numbers_inventory: [0],
      inventory_image: [''],
      inventory_video: [''],
    });

    this.route.paramMap.subscribe((params) => {
      this.inventoryId = Number(params.get('id'));
      if (this.inventoryId) {
        this.loadInventoryDetails(this.inventoryId);
      }
    });
  }

  loadInventoryDetails(id: number): void {
    // Try to load from localStorage first
    const testInventory = JSON.parse(
      localStorage.getItem('test_inventory') || '[]'
    );
    const found = testInventory.find(
      (inv: any) => inv.road_inventory_id === id
    );

    if (found) {
      this.inventoryData = found;
      console.log('Loaded inventory from localStorage:', this.inventoryData);

      // Update sub-asset types based on selected asset
      this.updateSubAssetTypes(found.asset_type);

      // Patch form with existing data
      this.inventoryForm.patchValue({
        road_name: found.road_name,
        chainage_start: found.chainage_start,
        chainage_end: found.chainage_end,
        direction: found.direction,
        asset_action: found.asset_action,
        asset_type: found.asset_type,
        sub_asset_type: found.sub_asset_type,
        latitude: found.latitude,
        longitude: found.longitude,
        numbers_inventory: found.numbers_inventory,
        inventory_image: found.inventory_image,
        inventory_video: found.inventory_video,
      });

      this.toastr.success('Inventory details loaded', 'Success', {
        timeOut: 2000,
        positionClass: 'toast-top-right',
      });
    } else {
      // Fallback to API if not found in localStorage
      this.roadService.getInventoryById(id).subscribe(
        (inventory: any) => {
          console.log('get inventory details from API', inventory);
          if (inventory && inventory.data && inventory.data.length > 0) {
            this.inventoryData = inventory.data[0];
            // Patch form with API data
            this.inventoryForm.patchValue(this.inventoryData);
          }
        },
        (err) => {
          this.toastr.error('Failed to load inventory details', 'Error', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
        }
      );
    }
  }

  updateSubAssetTypes(assetType: string): void {
    this.subAssetTypes = this.assetSubTypeMap[assetType] || [];
  }

  onAssetTypeChange(assetType: string): void {
    this.updateSubAssetTypes(assetType);
    // Reset sub-asset type when asset type changes
    this.inventoryForm.patchValue({ sub_asset_type: '' });
  }

  // Get shortened direction label for display
  getDirectionLabel(direction: string): string {
    if (direction.includes('Increasing')) return 'Inc';
    if (direction.includes('Decreasing')) return 'Dec';
    if (direction.includes('Median')) return 'Med';
    return direction;
  }

  // Get direction name for API
  getDirectionForAPI(direction: string): string {
    if (direction.includes('Increasing')) return 'Increasing';
    if (direction.includes('Decreasing')) return 'Decreasing';
    if (direction.includes('Median')) return 'Median';
    return direction;
  }

  // Get current date in DD-MM-YYYY format
  getCurrentDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  }

  // Submit updated inventory to API
  async submitToAPI(inventoryData: any): Promise<any> {
    const apiUrl =
      'https://fantastic-reportapi-production.up.railway.app/append_inventory_excel/';

    const apiBody = {
      Project_Name: inventoryData.road_name,
      Chainage_start: inventoryData.chainage_start,
      Chainage_end: inventoryData.chainage_end,
      Direction: this.getDirectionForAPI(inventoryData.direction),
      Asset_type: inventoryData.asset_type,
      Latitude: inventoryData.latitude,
      Longitude: inventoryData.longitude,
      Date: this.getCurrentDate(),
      Sub_Asset_Type: inventoryData.sub_asset_type || '',
      Carriage_Type: 'Flexible',
      Lane: 'L2',
      No_of_inventories: inventoryData.numbers_inventory || 0,
    };

    console.log('Updating inventory via API:', apiBody);
    console.log('API URL:', apiUrl);

    try {
      const response = await this.http.post(apiUrl, apiBody).toPromise();
      return response;
    } catch (error: any) {
      console.error('❌ API Failed - Full Error Details:', {
        status: error?.status,
        statusText: error?.statusText,
        message: error?.message,
        url: apiUrl,
        body: apiBody,
        error: error?.error,
      });

      // Re-throw with more context
      throw {
        ...error,
        apiUrl,
        apiBody,
        errorMessage: `API call failed: ${error?.status} ${
          error?.statusText || error?.message || 'Unknown error'
        }`,
      };
    }
  }

  async onSubmit(): Promise<void> {
    if (this.inventoryForm.invalid) {
      this.inventoryForm.markAllAsTouched();
      this.toastr.error('Please fill all required fields', 'Validation Error');
      return;
    }

    // Show loading toast
    this.toastr.info('Updating inventory...', 'Please wait', {
      timeOut: 0,
      positionClass: 'toast-top-right',
    });

    const formValue = this.inventoryForm.value;

    // Submit to API
    let apiSuccess = false;
    try {
      await this.submitToAPI(formValue);
      apiSuccess = true;
      console.log('✅ API Update Success');
    } catch (error) {
      console.error('❌ API Update Failed:', error);
    }

    // Update in localStorage
    let testInventory = JSON.parse(
      localStorage.getItem('test_inventory') || '[]'
    );
    const index = testInventory.findIndex(
      (inv: any) => inv.road_inventory_id === this.inventoryId
    );

    if (index !== -1) {
      // Update existing item
      testInventory[index] = {
        ...testInventory[index],
        ...formValue,
        road_inventory_id: this.inventoryId,
        geometry_data_id: this.inventoryData.geometry_data_id,
        created_on: this.inventoryData.created_on,
      };
      localStorage.setItem('test_inventory', JSON.stringify(testInventory));
      console.log('✅ Updated in localStorage');
    }

    // Clear loading toast
    this.toastr.clear();

    // Show success/error message
    if (apiSuccess) {
      this.toastr.success('Inventory updated successfully!', 'Success', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });

      // Navigate back to inventory list
      setTimeout(() => {
        this.router.navigate([
          '/ris/road-manage/road-inventory',
          this.inventoryData.geometry_data_id,
        ]);
      }, 500);
    } else {
      this.toastr.error(
        'Failed to update via API. Please try again.',
        'Error',
        {
          timeOut: 4000,
          positionClass: 'toast-top-right',
        }
      );
    }
  }
}
