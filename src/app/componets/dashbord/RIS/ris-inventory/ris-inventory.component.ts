import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEchartsModule, provideEcharts } from 'ngx-echarts';

interface AssetData {
  name: string;
  count: number;
  unit?: string;
  color: string;
}

interface FilterData {
  date: string;
  projectName: string;
  direction: string;
  chainageRange: { min: number; max: number };
  assetType: string;
  subAssetType: string;
  pavementType: string;
  lane: string;
}

// Interface for the projects-dates API response
interface ProjectDatesResponse {
  [projectName: string]: string[];
}

// Interface for the JSON data structure
interface InfrastructureData {
  project_name: string;
  chainage_start: number;
  chainage_end: number;
  direction: string;
  asset_type: string;
  trees: number;
  culvert: number;
  street_lights: number;
  bridges: number;
  traffic_signals: number;
  bus_stop: number;
  truck_layby: number;
  toll_plaza: number;
  adjacent_road: number;
  toilet_blocks: number;
  rest_area: number;
  rcc_drain: number;
  fuel_station: number;
  emergency_call_box: number;
  tunnels: number;
  footpath: number;
  junction: number;
  sign_boards: number;
  solar_blinker: number;
  median_plants: number;
  service_road: number;
  km_stones: number;
  crash_barrier: number;
  median_opening: number;
  latitude: number;
  longitude: number;
  date: string;
  sub_asset_type: string | null;
  pavement_type?: string;
  lane?: string;
  carriage_type?: string;
}

@Component({
  selector: 'app-ris-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEchartsModule],
  providers: [provideEcharts()],
  templateUrl: './ris-inventory.component.html',
  styleUrl: './ris-inventory.component.scss',
})
export class RisInventoryComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainerRef!: ElementRef;

  // Raw data from JSON
  rawData: InfrastructureData[] = [];

  // Filter data
  filters: FilterData = {
    date: '',
    projectName: '',
    direction: '', // Will be set when directions are loaded
    chainageRange: { min: 0, max: 100 },
    assetType: 'All',
    subAssetType: 'All',
    pavementType: 'All',
    lane: 'All',
  };

  // Available filter options
  availableProjects: string[] = [];
  availableDirections: string[] = [];
  availableDates: string[] = [];
  availablePavementTypes: string[] = [];
  availableLanes: string[] = [];

  // Project dates mapping from API
  projectDatesMap: ProjectDatesResponse = {};

  // Selected asset for map filtering
  selectedAssetType: string | null = null;

  // Loading state
  isLoading: boolean = false;

  // Flag to prevent duplicate data loads when project changes
  private isProjectChanging: boolean = false;

  // Map initialization retry counter
  private mapInitRetries: number = 0;
  private maxMapInitRetries: number = 5;

  // Zoom level management
  private currentZoomLevel: number = 5;
  private zoomThreshold: number = 16; // Show points when zoom < 16, icons when zoom >= 16 (increased for better performance)
  private projectPolyline: any = null; // Store the project route polyline
  private iconMarkers: any[] = []; // Store icon markers
  private showInitialIcons: boolean = true; // Show icons on initial load
  private iconCache: Map<string, any> = new Map(); // Cache for Leaflet icons (PERFORMANCE BOOST!)

  // Asset summary data - calculated from raw data
  assetSummary: AssetData[] = [];

  // Chart data for chainage - ECharts format
  chainageData: any[] = [];

  // ECharts options for bar chart
  chartOptions: any = {};

  // Date-wise comparison chart data and options
  dateComparisonData: any[] = [];
  dateComparisonChartOptions: any = {};
  isLoadingComparisonChart: boolean = false;

  // Sub-asset modal properties
  isSubAssetModalOpen: boolean = false;
  selectedAssetForSubAssets: string = '';
  subAssetsList: { name: string; count: number }[] = [];

  // Chainage comparison chart modal properties
  isChainageComparisonModalOpen: boolean = false;
  selectedAssetsForComparison: string[] = [];
  chainageComparisonChartOptions: any = {};
  availableAssetsForComparison: string[] = [];

  // Month-wise comparison chart modal properties
  isMonthComparisonModalOpen: boolean = false;
  selectedAssetsForMonthComparison: string[] = [];
  monthComparisonChartOptions: any = {};
  availableMonthsForComparison: string[] = [];
  isLoadingMonthChart: boolean = false;
  monthDataCache: { [month: string]: InfrastructureData[] } = {};
  showAssetSelectionInModal: boolean = true; // Flag to show/hide asset selection chips
  
  // Toggle for month comparison mode
  isMonthComparisonMode: boolean = false; // When true, clicking asset opens modal; when false, only filters map
  isPreloadingMonthData: boolean = false; // Track if data is being pre-loaded

  private map: any;
  public isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      // Load projects and dates first
      this.loadProjectsAndDates();
      // Add window resize listener for responsive chart updates
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', () => {
          this.onWindowResize();
        });

        // Add orientation change listener for mobile devices
        window.addEventListener('orientationchange', () => {
          setTimeout(() => {
            if (this.map) {
              this.map.invalidateSize();
              console.log('Map resized after orientation change');
            }
          }, 200);
        });
      }
    }
  }

  async ngAfterViewInit() {
    if (this.isBrowser) {
      console.log(
        'ngAfterViewInit called, mapContainerRef:',
        this.mapContainerRef
      );
      // Don't initialize map here - wait for data to load first
      // The map container is inside *ngIf="rawData.length > 0" so it won't exist yet
      console.log('Map container will be initialized after data loads');
    }
  }

  private async initializeMapAfterViewInit() {
    setTimeout(async () => {
      await this.initMap();
      // Ensure chart renders properly on mobile devices
      this.ensureChartRenders();
      // Add markers after map is initialized and data is loaded
      setTimeout(async () => {
        if (this.rawData.length > 0) {
          await this.addInfrastructureMarkers();
        }
      }, 500);
    }, 100);
  }

  private async initializeMapAfterDataLoad() {
    // Wait for the ViewChild to be available after DOM update
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max wait

    const waitForContainer = () => {
      if (this.mapContainerRef && this.mapContainerRef.nativeElement) {
        this.initializeMapAfterViewInit();
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(waitForContainer, 100);
      } else {
        // Try to find the map container manually
        const mapDiv =
          document.querySelector('#mapContainer') ||
          document.querySelector('.map');
        if (mapDiv) {
          this.mapContainerRef = { nativeElement: mapDiv as HTMLDivElement };
          this.initializeMapAfterViewInit();
        }
      }
    };

    waitForContainer();
  }

  private createMapContainerManually() {
    console.log('Creating map container manually...');

    // Try to find a suitable parent container
    const dashboardContent =
      document.querySelector('.dashboard-content') ||
      document.querySelector('.main-dashboard-container') ||
      document.querySelector('.left-panel') ||
      document.body;

    if (dashboardContent) {
      // Create a simple map container
      const mapContainer = document.createElement('div');
      mapContainer.id = 'mapContainer';
      mapContainer.className = 'map';
      mapContainer.style.width = '100%';
      mapContainer.style.height = '400px';
      mapContainer.style.backgroundColor = '#1a1a1a';
      mapContainer.style.border = '1px solid #333';
      mapContainer.style.borderRadius = '8px';

      // Add it to the dashboard
      dashboardContent.appendChild(mapContainer);

      console.log('Created map container manually:', mapContainer);

      // Create reference and initialize map
      this.mapContainerRef = { nativeElement: mapContainer };
      this.initializeMapAfterViewInit();
    } else {
      console.error('Could not find suitable parent for map container');
    }
  }

  private async loadProjectsAndDates() {
    try {
      const response = await fetch(
        'https://fantastic-reportapi-production.up.railway.app/projects-dates/inventory',
        {
          method: 'GET',
          headers: {
            accept: 'application/json',
          },
        }
      );

      const projectDates: ProjectDatesResponse = await response.json();
      console.log('Projects and Dates loaded:', projectDates);

      // Store the mapping
      this.projectDatesMap = projectDates;

      // Extract project names
      this.availableProjects = Object.keys(projectDates);

      // Set first project as default
      if (this.availableProjects.length > 0) {
        this.filters.projectName = this.availableProjects[0];

        // Set available dates for first project
        this.availableDates =
          this.projectDatesMap[this.filters.projectName] || [];

        // Set first date as default
        if (this.availableDates.length > 0) {
          this.filters.date = this.availableDates[0];
        }
      }

      // Now load the actual data
      if (this.filters.date && this.filters.projectName) {
        await this.loadData();
      }
    } catch (error) {
      console.error('Error loading projects and dates:', error);
      // Fallback to empty arrays
      this.availableProjects = [];
      this.availableDates = [];
    }
  }

  private async loadData() {
    if (!this.filters.date || !this.filters.projectName) {
      return;
    }

    this.isLoading = true;

    try {
      // Prepare API request body
      const requestBody = {
        chainage_start: 0,
        chainage_end: 1381,
        date: this.filters.date,
        direction: ['All'],
        project_name: [this.filters.projectName.trim()],
        asset_type: ['All'],
      };

      // Load data from API
      const response = await fetch(
        'https://fantastic-reportapi-production.up.railway.app/inventory_filter',
        {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );
      const apiResponse = await response.json();

      // Handle API errors
      if (apiResponse?.detail === 'Not Found') {
        console.error('API returned Not Found error');
        this.rawData = [];
        return;
      }

      // Flatten nested array structure
      this.rawData = Array.isArray(apiResponse) ? apiResponse.flat() : [];
      console.log(
        `✅ Loaded ${this.rawData.length} records for ${this.filters.projectName} - ${this.filters.date}`
      );
      
      // Debug: Check if pavement_type and lane exist in the data
      if (this.rawData.length > 0) {
        const firstItem = this.rawData[0];
        console.log('First data item fields:', Object.keys(firstItem));
        console.log('First data item:', firstItem);
        console.log('Pavement type in data:', firstItem.pavement_type);
        console.log('Lane in data:', firstItem.lane);
        console.log('Carriage type in data:', firstItem.carriage_type);
      }

      // Process data (fast operations)
      this.extractFilterOptions();
      this.calculateAssetSummary();
      this.generateChainageData();
      this.initChartOptions();

      // Handle map: If map exists, just update markers; otherwise initialize
      if (this.isBrowser) {
        if (this.map) {
          // Map already exists, just update markers
          await this.addInfrastructureMarkers();
        } else {
          // Map doesn't exist yet, initialize it
          this.initializeMapAfterDataLoad();
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Handle error gracefully
      this.rawData = [];
    } finally {
      this.isLoading = false;
    }
  }

  private extractFilterOptions() {
    // Check if rawData is valid array
    if (!Array.isArray(this.rawData) || this.rawData.length === 0) {
      // Don't reset availableProjects - they come from the API
      this.availableDirections = ['Increasing', 'Decreasing', 'Median'];
      // Set first direction as default if not already set
      if (!this.filters.direction && this.availableDirections.length > 0) {
        this.filters.direction = this.availableDirections[0];
      }
      return;
    }

    // Extract unique directions from data
    const uniqueDirections = [
      ...new Set(this.rawData.map((item) => item.direction)),
    ];
    // Add "Decreasing" and "Median" if they don't exist in the data
    if (!uniqueDirections.includes('Decreasing')) {
      uniqueDirections.push('Decreasing');
    }
    if (!uniqueDirections.includes('Median')) {
      uniqueDirections.push('Median');
    }
    this.availableDirections = uniqueDirections;

    // Set first direction as default if not already set
    if (!this.filters.direction && this.availableDirections.length > 0) {
      this.filters.direction = this.availableDirections[0];
    }

    // Extract unique pavement types from data
    // Try to get pavement_type, fallback to carriage_type if not available
    const uniquePavementTypes = [
      ...new Set(
        this.rawData.map((item) => item.pavement_type || item.carriage_type).filter((p): p is string => !!p)
      ),
    ];
    console.log('Extracted pavement types:', uniquePavementTypes);
    if (uniquePavementTypes.length > 0) {
      this.availablePavementTypes = ['All', ...uniquePavementTypes];
    } else {
      this.availablePavementTypes = ['All'];
    }
    console.log('Available pavement types:', this.availablePavementTypes);

    // Extract unique lanes from data
    const uniqueLanes = [
      ...new Set(this.rawData.map((item) => item.lane).filter((l): l is string => !!l)),
    ];
    console.log('Extracted lanes:', uniqueLanes);
    if (uniqueLanes.length > 0) {
      this.availableLanes = ['All', ...uniqueLanes];
    } else {
      this.availableLanes = ['All'];
    }
    console.log('Available lanes:', this.availableLanes);

    // Update filter ranges based on current data
    const chainages = Array.isArray(this.rawData)
      ? this.rawData.flatMap((item) => [item.chainage_start, item.chainage_end])
      : [];
    if (chainages.length > 0) {
      this.filters.chainageRange.min = Math.min(...chainages);
      this.filters.chainageRange.max = Math.max(...chainages);
    }
  }

  // Filter methods
  async onDateChange(event: any) {
    this.filters.date = event.target.value;
    console.log('onDateChange triggered - new date:', this.filters.date);

    // Don't reload if we're in the middle of a project change
    if (this.isProjectChanging) {
      console.log('Skipping date change - project is changing');
      return;
    }

    // Reset flag to show icons on initial view of new date
    this.showInitialIcons = true;

    if (this.filters.date) {
      await this.loadData();
    }
  }

  async onProjectChange(event: any) {
    console.log('onProjectChange triggered - new project:', event.target.value);
    this.isProjectChanging = true;

    this.filters.projectName = event.target.value;

    // Reset flag to show icons on initial view of new project
    this.showInitialIcons = true;

    // Clear month data cache when project changes
    this.monthDataCache = {};
    console.log('🗑️ Cleared month data cache');

    // Update available dates for the selected project
    this.availableDates = this.projectDatesMap[this.filters.projectName] || [];
    console.log('Available dates for project:', this.availableDates);

    // Set first date as default or clear if no dates available
    if (this.availableDates.length > 0) {
      this.filters.date = this.availableDates[0];
    } else {
      this.filters.date = '';
    }

    // Small delay to ensure Angular has updated the select binding
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Load data with new project and date
    if (this.filters.date) {
      await this.loadData();
    }

    this.isProjectChanging = false;

    // Load comparison chart in background (non-blocking for better UX)
    if (this.isBrowser) {
      this.prepareDateComparisonData(); // Remove await - loads in background
    }
  }

  async onDirectionChange(event: any) {
    this.filters.direction = event.target.value;
    await this.updateDashboard(true); // Skip comparison chart for faster response
  }

  async onPavementTypeChange(event: any) {
    this.filters.pavementType = event.target.value;
    await this.updateDashboard(true); // Skip comparison chart for faster response
  }

  async onLaneChange(event: any) {
    this.filters.lane = event.target.value;
    await this.updateDashboard(true); // Skip comparison chart for faster response
  }

  async onChainageMinChange(event: any) {
    const newMin = parseFloat(event.target.value);
    if (newMin < this.filters.chainageRange.max) {
      this.filters.chainageRange.min = newMin;
      // Clear month data cache since chainage range changed
      this.monthDataCache = {};
      await this.updateDashboard(true); // Skip comparison chart for faster response
      // Reload month data if in month comparison mode
      if (this.isMonthComparisonMode && this.filters.projectName) {
        this.preloadMonthData();
      }
    }
  }

  async onChainageMaxChange(event: any) {
    const newMax = parseFloat(event.target.value);
    if (newMax > this.filters.chainageRange.min) {
      this.filters.chainageRange.max = newMax;
      // Clear month data cache since chainage range changed
      this.monthDataCache = {};
      await this.updateDashboard(true); // Skip comparison chart for faster response
      // Reload month data if in month comparison mode
      if (this.isMonthComparisonMode && this.filters.projectName) {
        this.preloadMonthData();
      }
    }
  }

  async onChainageMinSliderChange(event: any) {
    const newMin = parseFloat(event.target.value);
    if (newMin < this.filters.chainageRange.max) {
      this.filters.chainageRange.min = newMin;
      // Clear month data cache since chainage range changed
      this.monthDataCache = {};
      await this.updateDashboard(true); // Skip comparison chart for faster response
      // Reload month data if in month comparison mode
      if (this.isMonthComparisonMode && this.filters.projectName) {
        this.preloadMonthData();
      }
    }
  }

  async onChainageMaxSliderChange(event: any) {
    const newMax = parseFloat(event.target.value);
    if (newMax > this.filters.chainageRange.min) {
      this.filters.chainageRange.max = newMax;
      // Clear month data cache since chainage range changed
      this.monthDataCache = {};
      await this.updateDashboard(true); // Skip comparison chart for faster response
      // Reload month data if in month comparison mode
      if (this.isMonthComparisonMode && this.filters.projectName) {
        this.preloadMonthData();
      }
    }
  }

  async onAssetTypeChange(event: any) {
    this.filters.assetType = event.target.value;
    await this.updateDashboard(true); // Skip comparison chart for faster response
  }

  // Handle asset card click for map filtering
  async onAssetCardClick(assetType: string) {
    // Check if month comparison mode is enabled
    if (this.isMonthComparisonMode) {
      // Open month comparison modal with only the clicked asset
      this.openMonthComparisonModalForAsset(assetType);
      return; // Exit early, don't update map
    }

    // Default behavior: Filter map only
    if (this.selectedAssetType === assetType) {
      // If clicking the same asset, deselect it (show all assets)
      this.selectedAssetType = null;
    } else {
      // Select the new asset (show only this asset)
      this.selectedAssetType = assetType;
    }

    // Update the map and chart WITHOUT refitting bounds
    // Update asset summary based on current filters
    this.calculateAssetSummary();

    // Update chainage chart data based on current filters
    this.generateChainageData();

    // Reinitialize chart options with new data
    this.initChartOptions();

    // Force chart refresh to ensure tooltip works properly
    this.refreshChart();

    // Update map markers WITHOUT changing zoom/position
    if (this.map) {
      await this.updateMapMarkersOnly();
    }
  }

  // Toggle month comparison mode
  toggleMonthComparisonMode() {
    this.isMonthComparisonMode = !this.isMonthComparisonMode;
    console.log('Month Comparison Mode:', this.isMonthComparisonMode ? 'ON' : 'OFF');
    
    // Pre-load month data when toggle is turned ON for faster subsequent access
    if (this.isMonthComparisonMode && this.filters.projectName) {
      this.preloadMonthData();
    }
  }

  // Pre-load month data in background for faster chart loading
  async preloadMonthData() {
    const availableMonths = this.projectDatesMap[this.filters.projectName] || [];
    const cacheKey = `${this.filters.projectName}_${this.filters.chainageRange.min}_${this.filters.chainageRange.max}`;
    
    console.log(`🚀 Pre-loading data for ${availableMonths.length} months in background (chainage: ${this.filters.chainageRange.min} - ${this.filters.chainageRange.max})...`);
    
    // Only fetch months that are not already cached
    const monthsToFetch = availableMonths.filter(month => {
      const monthCacheKey = `${cacheKey}_${month}`;
      return !this.monthDataCache[monthCacheKey];
    });
    
    if (monthsToFetch.length === 0) {
      console.log('✅ All month data already cached');
      return;
    }
    
    this.isPreloadingMonthData = true;
    console.log(`🔄 Fetching ${monthsToFetch.length} uncached months...`);
    
    try {
      // Fetch all uncached months in parallel
      const fetchPromises = monthsToFetch.map(async (month) => {
        const monthCacheKey = `${cacheKey}_${month}`;
        
        const requestBody = {
          chainage_start: this.filters.chainageRange.min,
          chainage_end: this.filters.chainageRange.max,
          date: month,
          direction: ['All'],
          project_name: [this.filters.projectName.trim()],
          asset_type: ['All'],
        };

        try {
          const response = await fetch(
            'https://fantastic-reportapi-production.up.railway.app/inventory_filter',
            {
              method: 'POST',
              headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
            }
          );

          const apiResponse = await response.json();
          const monthData = Array.isArray(apiResponse) ? apiResponse.flat() : [];
          
          // Cache the data
          this.monthDataCache[monthCacheKey] = monthData;
          
          console.log(`✅ Pre-loaded data for ${month}: ${monthData.length} records`);
        } catch (error) {
          console.error(`❌ Error pre-loading data for ${month}:`, error);
        }
      });

      await Promise.all(fetchPromises);
      console.log('✅ All month data pre-loaded successfully');
    } finally {
      this.isPreloadingMonthData = false;
    }
  }

  async onSubAssetTypeChange(event: any) {
    this.filters.subAssetType = event.target.value;
    await this.updateDashboard(true); // Skip comparison chart for faster response
  }

  // Method to update chainage range based on selected project
  private updateChainageRangeForProject() {
    if (this.filters.projectName === 'All') {
      // If "All" is selected, use the full range
      const allChainages = this.rawData.flatMap((item) => [
        item.chainage_start,
        item.chainage_end,
      ]);
      if (allChainages.length > 0) {
        this.filters.chainageRange.min = Math.min(...allChainages);
        this.filters.chainageRange.max = Math.max(...allChainages);
      }
    } else {
      // Filter data for the selected project
      const projectData = this.rawData.filter(
        (item) => item.project_name === this.filters.projectName
      );

      if (projectData.length > 0) {
        // Get chainage range for this specific project
        const projectChainages = projectData.flatMap((item) => [
          item.chainage_start,
          item.chainage_end,
        ]);
        this.filters.chainageRange.min = Math.min(...projectChainages);
        this.filters.chainageRange.max = Math.max(...projectChainages);
      } else {
        // If no data found for the project, reset to default
        this.filters.chainageRange.min = 0;
        this.filters.chainageRange.max = 100;
      }
    }
  }

  // Helper methods for chainage range
  getChainageMin(): number {
    if (this.filters.projectName === 'All') {
      return 0; // Always start from 0 for "All"
    } else {
      // Get minimum chainage for the selected project
      const projectData = this.rawData.filter(
        (item) => item.project_name === this.filters.projectName
      );
      if (projectData.length > 0) {
        return Math.floor(
          Math.min(...projectData.map((item) => item.chainage_start))
        );
      }
      return 0;
    }
  }

  getChainageMax(): number {
    if (this.filters.projectName === 'All') {
      // Get the maximum chainage from all data
      if (this.rawData.length > 0) {
        const maxChainage = Math.max(
          ...this.rawData.map((item) => item.chainage_end)
        );
        return Math.ceil(maxChainage); // Round up to next integer
      }
      return 1000; // Default fallback
    } else {
      // Get maximum chainage for the selected project
      const projectData = this.rawData.filter(
        (item) => item.project_name === this.filters.projectName
      );
      if (projectData.length > 0) {
        return Math.ceil(
          Math.max(...projectData.map((item) => item.chainage_end))
        );
      }
      return 100;
    }
  }

  // Format asset count for display
  formatAssetCount(asset: AssetData): string {
    // Ensure count is a number
    const count =
      typeof asset.count === 'number'
        ? asset.count
        : parseFloat(asset.count) || 0;

    if (asset.unit === 'KM') {
      return count.toFixed(2);
    }
    return count.toLocaleString();
  }

  private async updateDashboard(skipComparisonChart: boolean = false) {
    // Update asset summary based on current filters
    this.calculateAssetSummary();

    // Update chainage chart data based on current filters
    this.generateChainageData();

    // Reinitialize chart options with new data
    this.initChartOptions();

    // Force chart refresh to ensure tooltip works properly
    this.refreshChart();

    // Update map markers based on filtered data
    if (this.map) {
      await this.addInfrastructureMarkers();
    }

    // Update date comparison chart ONLY if needed (not during asset selection)
    if (this.isBrowser && !skipComparisonChart) {
      await this.prepareDateComparisonData();
    }
  }

  private refreshChart() {
    if (this.isBrowser && typeof window !== 'undefined') {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        const chartElements = document.querySelectorAll('.echarts-chart');
        chartElements.forEach((element) => {
          const echartsInstance = (element as any).__echarts_instance__;
          if (echartsInstance) {
            echartsInstance.setOption(this.chartOptions, true);
          }
        });
      }, 100);
    }
  }

  private calculateAssetSummary() {
    // Get filtered data based on current filter selections
    const filteredData = this.getFilteredData();

    // Calculate totals for each asset type from the filtered data
    const assetTotals: { [key: string]: number } = {};

    // Initialize only the 18 specific assets from the image
    const allAssetTypes = [
      'Trees',
      'Adjacent Road',
      'Sign Boards',
      'Culvert',
      'Toll Plaza',
      'Bus Stop',
      'Crash Barrier',
      'Emergency Call',
      'KM Stones',
      'Street Lights',
      'Truck Layby',
      'Service Road',
      'Junction',
      'Fuel Station',
      'Toilet Block',
      'RCC Drain',
      'Solar Blinker',
      'Median Opening',
    ];

    // Initialize all assets with 0 count
    allAssetTypes.forEach((assetType) => {
      assetTotals[assetType] = 0;
    });

    // Calculate actual totals from the filtered data for only the 18 specific assets
    filteredData.forEach((item) => {
      assetTotals['Trees'] += item.trees || 0;
      assetTotals['Adjacent Road'] += item.adjacent_road || 0;
      assetTotals['Sign Boards'] += item.sign_boards || 0;
      assetTotals['Culvert'] += item.culvert || 0;
      assetTotals['Toll Plaza'] += item.toll_plaza || 0;
      assetTotals['Bus Stop'] += item.bus_stop || 0;
      assetTotals['Crash Barrier'] += item.crash_barrier || 0;
      assetTotals['Emergency Call'] += item.emergency_call_box || 0;
      assetTotals['KM Stones'] += item.km_stones || 0;
      assetTotals['Street Lights'] += item.street_lights || 0;
      assetTotals['Truck Layby'] += item.truck_layby || 0;
      assetTotals['Service Road'] += item.service_road || 0;
      assetTotals['Junction'] += item.junction || 0;
      assetTotals['Fuel Station'] += item.fuel_station || 0;
      assetTotals['Toilet Block'] += item.toilet_blocks || 0;
      assetTotals['RCC Drain'] += item.rcc_drain || 0;
      assetTotals['Solar Blinker'] += item.solar_blinker || 0;
      // Special handling for median_opening to fix the string issue
      const medianOpeningValue =
        typeof item.median_opening === 'string'
          ? parseFloat(item.median_opening) || 0
          : item.median_opening || 0;
      assetTotals['Median Opening'] += medianOpeningValue;
    });

    // Define colors for each asset type (only the 18 specific assets)
    const assetColors = {
      Trees: '#4CAF50',
      'Adjacent Road': '#2196F3',
      'Sign Boards': '#FF9800',
      Culvert: '#9C27B0',
      'Toll Plaza': '#F44336',
      'Bus Stop': '#00BCD4',
      'Crash Barrier': '#FF9800',
      'Emergency Call': '#E91E63',
      'KM Stones': '#607D8B',
      'Street Lights': '#FFC107',
      'Truck Layby': '#8BC34A',
      'Service Road': '#FF5722',
      Junction: '#9E9E9E',
      'Fuel Station': '#3F51B5',
      'Toilet Block': '#009688',
      'RCC Drain': '#673AB7',
      'Solar Blinker': '#FFEB3B',
      'Median Opening': '#CDDC39',
    };

    // Convert to AssetData array - show ALL assets including those with 0 count
    this.assetSummary = allAssetTypes
      .map((assetType) => ({
        name: assetType,
        count: assetTotals[assetType] || 0,
        color: assetColors[assetType as keyof typeof assetColors] || '#9E9E9E',
        unit:
          assetType.includes('Road') || assetType.includes('Barrier')
            ? 'KM'
            : undefined,
      }))
      .sort((a, b) => b.count - a.count); // Sort by count descending (0 counts will appear at the end)
  }

  private getFilteredData(): InfrastructureData[] {
    let filteredData = [...this.rawData];

    // Note: Project and Date filtering is now done by the API
    // We only filter by the UI-level filters below

    // Filter by Direction
    if (this.filters.direction) {
      filteredData = filteredData.filter(
        (item) => item.direction === this.filters.direction
      );
    }

    // Filter by Asset Type
    if (this.filters.assetType && this.filters.assetType !== 'All') {
      filteredData = filteredData.filter(
        (item) => item.asset_type === this.filters.assetType
      );
    }

    // Filter by Chainage Range
    if (
      this.filters.chainageRange.min !== undefined &&
      this.filters.chainageRange.max !== undefined
    ) {
      filteredData = filteredData.filter(
        (item) =>
          item.chainage_start >= this.filters.chainageRange.min &&
          item.chainage_end <= this.filters.chainageRange.max
      );
    }

    // Filter by Sub Asset Type (if applicable)
    if (this.filters.subAssetType && this.filters.subAssetType !== 'All') {
      filteredData = filteredData.filter(
        (item) => item.sub_asset_type === this.filters.subAssetType
      );
    }

    // Filter by Pavement Type
    if (this.filters.pavementType && this.filters.pavementType !== 'All') {
      filteredData = filteredData.filter(
        (item) => (item.pavement_type || item.carriage_type) === this.filters.pavementType
      );
    }

    // Filter by Lane
    if (this.filters.lane && this.filters.lane !== 'All') {
      filteredData = filteredData.filter(
        (item) => item.lane === this.filters.lane
      );
    }

    return filteredData;
  }

  private generateChainageData() {
    // Get filtered data for chainage chart
    let filteredData = this.getFilteredData();

    // If a specific asset type is selected, filter data to only include items with that asset
    if (this.selectedAssetType) {
      const selectedAssetKey = this.selectedAssetType
        .toLowerCase()
        .replace(' ', '_');
      filteredData = filteredData.filter((item) => {
        const count = item[
          selectedAssetKey as keyof InfrastructureData
        ] as number;
        return count > 0;
      });
    }

    // Create segments for the entire selected chainage range
    const segmentSize = 10; // Group every 10 KM
    const minChainage = this.filters.chainageRange.min;
    const maxChainage = this.filters.chainageRange.max;
    
    // Calculate segment boundaries aligned to 10 KM intervals
    const startSegment = Math.floor(minChainage / segmentSize) * segmentSize;
    const endSegment = Math.ceil(maxChainage / segmentSize) * segmentSize;
    
    // Create all segments in the range, even if empty
    const groupedData: { [key: string]: any } = {};
    
    for (let segStart = startSegment; segStart < endSegment; segStart += segmentSize) {
      const segEnd = Math.min(segStart + segmentSize, endSegment);
      const segmentKey = `${segStart}-${segEnd}`;
      
      groupedData[segmentKey] = {
        name: `${segStart}-${segEnd}`,
        xAxisPosition: segStart / segmentSize,
        chainage_start: segStart,
        chainage_end: segEnd,
        Trees: 0,
        Culvert: 0,
        StreetLights: 0,
        Bridges: 0,
        TrafficSignals: 0,
        BusStop: 0,
        TruckLayby: 0,
        TollPlaza: 0,
        AdjacentRoad: 0,
        ToiletBlocks: 0,
        RestArea: 0,
        RCCDrain: 0,
        FuelStation: 0,
        EmergencyCall: 0,
        Tunnels: 0,
        Footpath: 0,
        Junction: 0,
        SignBoards: 0,
        SolarBlinker: 0,
        MedianPlants: 0,
        ServiceRoad: 0,
        KMStones: 0,
        CrashBarrier: 0,
        MedianOpening: 0,
        project_name: '',
        direction: '',
        asset_type: '',
      };
    }

    // Now aggregate asset counts in each segment
    filteredData.forEach((item) => {
      const segmentStart = Math.floor(item.chainage_start / segmentSize) * segmentSize;
      const segEnd = segmentStart + segmentSize;
      const segmentKey = `${segmentStart}-${segEnd}`;
      
      const segment = groupedData[segmentKey];
      if (segment) {
        segment.Trees += item.trees > 0 ? 1 : 0;
        segment.Culvert += item.culvert > 0 ? 1 : 0;
        segment.StreetLights += item.street_lights > 0 ? 1 : 0;
        segment.Bridges += item.bridges > 0 ? 1 : 0;
        segment.TrafficSignals += item.traffic_signals > 0 ? 1 : 0;
        segment.BusStop += item.bus_stop > 0 ? 1 : 0;
        segment.TruckLayby += item.truck_layby > 0 ? 1 : 0;
        segment.TollPlaza += item.toll_plaza > 0 ? 1 : 0;
        segment.AdjacentRoad += item.adjacent_road > 0 ? 1 : 0;
        segment.ToiletBlocks += item.toilet_blocks > 0 ? 1 : 0;
        segment.RestArea += item.rest_area > 0 ? 1 : 0;
        segment.RCCDrain += item.rcc_drain > 0 ? 1 : 0;
        segment.FuelStation += item.fuel_station > 0 ? 1 : 0;
        segment.EmergencyCall += item.emergency_call_box > 0 ? 1 : 0;
        segment.Tunnels += item.tunnels > 0 ? 1 : 0;
        segment.Footpath += item.footpath > 0 ? 1 : 0;
        segment.Junction += item.junction > 0 ? 1 : 0;
        segment.SignBoards += item.sign_boards > 0 ? 1 : 0;
        segment.SolarBlinker += item.solar_blinker > 0 ? 1 : 0;
        segment.MedianPlants += item.median_plants > 0 ? 1 : 0;
        segment.ServiceRoad += item.service_road > 0 ? 1 : 0;
        segment.KMStones += item.km_stones > 0 ? 1 : 0;
        segment.CrashBarrier += item.crash_barrier > 0 ? 1 : 0;
        segment.MedianOpening += item.median_opening > 0 ? 1 : 0;
      }
    });

    // Convert grouped data to array and sort by xAxisPosition
    this.chainageData = Object.values(groupedData).sort(
      (a, b) => a.xAxisPosition - b.xAxisPosition
    );
  }

  public initChartOptions() {
    if (this.isBrowser) {
      // Check if mobile device
      const isMobile =
        this.isBrowser &&
        typeof window !== 'undefined' &&
        window.innerWidth <= 768;
      const isSmallMobile =
        this.isBrowser &&
        typeof window !== 'undefined' &&
        window.innerWidth <= 480;

      this.chartOptions = {
        title: {
          // text: 'Chainage Wise Assets Distribution',
          left: 'center',
          textStyle: {
            color: '#ffffff',
            fontSize: isSmallMobile ? 12 : isMobile ? 14 : 16,
            fontWeight: 'bold',
          },
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
            shadowStyle: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
          },
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          borderColor: 'rgba(255, 255, 255, 0.3)',
          borderWidth: 2,
          textStyle: {
            color: '#ffffff',
            fontSize: isSmallMobile ? 10 : isMobile ? 11 : 12,
            fontWeight: '500',
          },
          padding: [12, 16],
          extraCssText:
            'border-radius: 8px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5); z-index: 99999 !important; max-width: 300px;',
          transitionDuration: 0,
          hideDelay: 0,
          showDelay: 0,
          formatter: (params: any) => {
            if (Array.isArray(params) && params.length > 0) {
              // Get the correct data index from the first parameter
              const dataIndex = params[0].dataIndex;
              const chainageItem = this.chainageData[dataIndex];
              let chainageRange = 'Unknown Range';

              if (chainageItem) {
                chainageRange = `${chainageItem.chainage_start.toFixed(
                  0
                )} - ${chainageItem.chainage_end.toFixed(0)} KM`;
              } else {
                // Fallback: calculate range from dataIndex
                const segmentSize = 10;
                const startRange = dataIndex * segmentSize;
                const endRange = startRange + segmentSize;
                chainageRange = `${startRange} - ${endRange} KM`;
              }

              let result = `<div style="margin-bottom: 10px; font-weight: 600; color: #ffffff; font-size: 15px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 8px;">Chainage: ${chainageRange}</div>`;
              result += `<div style="margin-bottom: 8px; font-weight: 500; color: #cccccc; font-size: 13px;">Asset Distribution:</div>`;

              // Count total assets for this segment
              let totalAssets = 0;
              const presentAssets: any[] = [];

              // Only show assets that are actually present (count > 0)
              params.forEach((param: any) => {
                if (param.data && param.data[1] > 0) {
                  totalAssets += param.data[1];
                  presentAssets.push(param);
                }
              });

              result += `<div style="margin-bottom: 8px; font-weight: 500; color: #4CAF50; font-size: 13px;">Total Assets: ${totalAssets}</div>`;

              // Show only the assets that are present in this segment
              if (presentAssets.length > 0) {
                presentAssets.forEach((param: any) => {
                  result += `<div style="display: flex; align-items: center; margin: 4px 0; padding: 2px 0;">
                    <span style="display: inline-block; width: 14px; height: 14px; background-color: ${param.color}; border-radius: 3px; margin-right: 12px; border: 1px solid rgba(255,255,255,0.3);"></span>
                    <span style="color: #ffffff; font-size: 13px; flex: 1;">${param.seriesName}:</span>
                    <span style="color: #4CAF50; font-size: 14px; font-weight: 600; margin-left: 8px;">${param.data[1]}</span>
                  </div>`;
                });
              } else {
                result += `<div style="color: #666666; font-size: 13px; text-align: center; padding: 10px;">No assets in this segment</div>`;
              }

              return result;
            }
            return `${params.seriesName}: ${
              params.data ? params.data[1] : params.value
            }`;
          },
        },
        legend: {
          data: [],
          top: isSmallMobile ? 20 : isMobile ? 25 : 30,
          right: '10%', // Move legend to the right to avoid tooltip overlap
          textStyle: {
            color: '#ffffff',
            fontSize: isSmallMobile ? 7 : isMobile ? 8 : 10,
          },
          itemGap: isSmallMobile ? 8 : isMobile ? 10 : 12,
          itemWidth: isSmallMobile ? 8 : isMobile ? 10 : 12,
          itemHeight: isSmallMobile ? 6 : isMobile ? 8 : 10,
          type: 'scroll',
          orient: 'horizontal',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: 6,
          padding: [8, 12],
        },
        grid: {
          top: isSmallMobile ? '25%' : isMobile ? '20%' : '15%',
          left: isSmallMobile ? '12%' : isMobile ? '10%' : '8%',
          right: isSmallMobile ? '12%' : isMobile ? '10%' : '8%',
          bottom: isSmallMobile ? '15%' : isMobile ? '12%' : '8%',
          containLabel: true,
        },
        xAxis: {
          type: 'value',
          min: this.getXAxisMin(),
          max: this.getXAxisMax(),
          axisLabel: {
            color: '#ffffff',
            fontSize: isSmallMobile ? 7 : isMobile ? 8 : 10,
            interval: 1, // Show every label
            rotate: 0, // No rotation for cleaner look
            formatter: (value: number) => {
              // Find the corresponding chainage data for this xAxis position
              const chainageItem = this.chainageData.find(
                (item) => Math.abs(item.xAxisPosition - value) < 0.1
              );
              if (chainageItem) {
                return `${chainageItem.chainage_start}-${chainageItem.chainage_end}`;
              }
              // Fallback: calculate range from normalized position
              const segmentSize = 10;
              const startRange = Math.round(value * segmentSize);
              const endRange = startRange + segmentSize;
              return `${startRange}-${endRange}`;
            },
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)',
            },
          },
          boundaryGap: [0.1, 0.1], // Add boundary gap for better spacing
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 1,
          interval: 0.5,
          axisLabel: {
            color: '#ffffff',
            fontSize: isSmallMobile ? 7 : isMobile ? 8 : 10,
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)',
            },
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)',
              type: 'dashed',
            },
          },
        },
        series: this.generateChartSeries(isSmallMobile, isMobile),
      };
    }
  }

  // Helper method to get maximum chainage value
  private getMaxChainageValue(): number {
    if (this.chainageData.length === 0) return 10;

    let maxChainage = 0;
    this.chainageData.forEach((item) => {
      maxChainage = Math.max(maxChainage, item.chainage_end);
    });

    // Round up to nearest 5 for cleaner display
    return Math.ceil(maxChainage / 5) * 5;
  }

  // Helper method to get xAxis minimum value
  private getXAxisMin(): number {
    if (this.chainageData.length === 0) return 0;

    const minPosition = Math.min(
      ...this.chainageData.map((item) => item.xAxisPosition)
    );
    // Add minimal padding to the left to ensure bars stay within bounds
    return Math.max(0, minPosition - 0.1);
  }

  // Helper method to get xAxis maximum value
  private getXAxisMax(): number {
    if (this.chainageData.length === 0) return 10;

    const maxPosition = Math.max(
      ...this.chainageData.map((item) => item.xAxisPosition)
    );
    // Add minimal padding to the right to ensure bars stay within bounds
    return maxPosition + 0.1;
  }

  private generateChartSeries(isSmallMobile: boolean, isMobile: boolean) {
    const allSeries = [
      {
        name: 'Trees',
        type: 'bar',
        data: this.chainageData.map((item, index) => [
          item.xAxisPosition,
          item.Trees > 0 ? 1 : 0,
        ]),
        itemStyle: { color: '#4CAF50' },
        barWidth: '8%', // Increased bar width for better visibility
        barGap: '10%', // Add gap between different series
      },
      {
        name: 'Culvert',
        type: 'bar',
        data: this.chainageData.map((item, index) => [
          item.xAxisPosition,
          item.Culvert > 0 ? 1 : 0,
        ]),
        itemStyle: { color: '#9C27B0' },
        barWidth: '8%',
        barGap: '10%',
      },
      {
        name: 'Street Lights',
        type: 'bar',
        data: this.chainageData.map((item, index) => [
          item.xAxisPosition,
          item.StreetLights > 0 ? 1 : 0,
        ]),
        itemStyle: { color: '#FFC107' },
        barWidth: '8%',
        barGap: '10%',
      },
      {
        name: 'Bridges',
        type: 'bar',
        data: this.chainageData.map((item, index) => [
          item.xAxisPosition,
          item.Bridges > 0 ? 1 : 0,
        ]),
        itemStyle: { color: '#2196F3' },
        barWidth: '8%',
        barGap: '10%',
      },
      {
        name: 'Traffic Signals',
        type: 'bar',
        data: this.chainageData.map((item, index) => [
          item.xAxisPosition,
          item.TrafficSignals > 0 ? 1 : 0,
        ]),
        itemStyle: { color: '#F44336' },
        barWidth: '8%',
        barGap: '10%',
      },
      {
        name: 'Bus Stop',
        type: 'bar',
        data: this.chainageData.map((item, index) => [
          item.xAxisPosition,
          item.BusStop > 0 ? 1 : 0,
        ]),
        itemStyle: { color: '#00BCD4' },
        barWidth: '8%',
        barGap: '10%',
      },
      {
        name: 'Crash Barrier',
        type: 'bar',
        data: this.chainageData.map((item, index) => [
          item.xAxisPosition,
          item.CrashBarrier > 0 ? 1 : 0,
        ]),
        itemStyle: { color: '#FF9800' },
        barWidth: '8%',
        barGap: '10%',
      },
      {
        name: 'Emergency Call',
        type: 'bar',
        data: this.chainageData.map((item, index) => [
          item.xAxisPosition,
          item.EmergencyCall > 0 ? 1 : 0,
        ]),
        itemStyle: { color: '#E91E63' },
        barWidth: '8%',
        barGap: '10%',
      },
      {
        name: 'Sign Boards',
        type: 'bar',
        data: this.chainageData.map((item, index) => [
          item.xAxisPosition,
          item.SignBoards > 0 ? 1 : 0,
        ]),
        itemStyle: { color: '#FF9800' },
        barWidth: '8%',
        barGap: '10%',
      },
      {
        name: 'KM Stones',
        type: 'bar',
        data: this.chainageData.map((item, index) => [
          item.xAxisPosition,
          item.KMStones > 0 ? 1 : 0,
        ]),
        itemStyle: { color: '#607D8B' },
        barWidth: '8%',
        barGap: '10%',
      },
    ];

    // If a specific asset type is selected, only show that series
    if (this.selectedAssetType) {
      return allSeries.filter(
        (series) => series.name === this.selectedAssetType
      );
    }

    // Otherwise, show all series
    return allSeries;
  }

  private async initMap() {
    if (!this.isBrowser) {
      return;
    }

    // If map already exists, don't reinitialize
    if (this.map) {
      return;
    }

    if (!this.mapContainerRef) {
      // Try to find the map container manually
      const mapDiv =
        document.querySelector('#mapContainer') ||
        document.querySelector('.map');
      if (mapDiv) {
        this.mapContainerRef = { nativeElement: mapDiv as HTMLDivElement };
      } else {
        if (this.mapInitRetries < this.maxMapInitRetries) {
          this.mapInitRetries++;
          setTimeout(() => this.initMap(), 500);
        }
        return;
      }
    }

    // Check if container has proper dimensions
    const container = this.mapContainerRef.nativeElement;
    const rect = container.getBoundingClientRect();

    if (
      (rect.width === 0 || rect.height === 0) &&
      this.mapInitRetries < this.maxMapInitRetries
    ) {
      this.mapInitRetries++;
      setTimeout(() => this.initMap(), 500);
      return;
    }

    // Reset retry counter
    this.mapInitRetries = 0;

    try {
      // Dynamically import Leaflet only on browser side
      const L = await import('leaflet');

      // Initialize Leaflet map
      this.map = L.map(this.mapContainerRef.nativeElement).setView(
        [23.5937, 78.9629],
        5
      );

      // Add Google satellite tile layer
      const satelliteLayer = L.tileLayer(
        'http://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
        {
          maxZoom: 20,
          attribution: '© Google',
        }
      );

      satelliteLayer.addTo(this.map);

      // Add zoom event listener for dynamic switching between colorful points and icons
      this.map.on('zoomend', () => {
        if (this.map) {
          this.currentZoomLevel = this.map.getZoom();
          // Use updateMapMarkersOnly to preserve selected asset filter and not refit bounds
          this.updateMapMarkersOnly();
        }
      });

      // Initial visualization
      await this.addInfrastructureMarkers();

      // Force map to resize after initialization
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 100);

      // Additional resize for mobile devices
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 500);
    } catch (error) {
      console.error('Error initializing map:', error);
      console.error('Error details:', error);

      // Fallback: try to create a simple map with Google satellite view
      try {
        console.log('Attempting fallback map initialization...');
        const L = await import('leaflet');
        this.map = L.map(this.mapContainerRef.nativeElement).setView(
          [23.5937, 78.9629],
          5
        );

        const satelliteLayer = L.tileLayer(
          'http://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
          {
            maxZoom: 20,
            attribution: '© Google',
          }
        );
        satelliteLayer.addTo(this.map);
      } catch (fallbackError) {
        console.error('Fallback map also failed:', fallbackError);
      }
    }
  }

  // Method to add infrastructure markers from actual data
  private async addInfrastructureMarkers() {
    if (!this.map || !this.rawData || this.rawData.length === 0) {
      return;
    }

    try {
      // Dynamically import Leaflet only on browser side
      const L = await import('leaflet');

      // Get filtered data based on current filters
      const filteredData = this.getFilteredData();

      // Check current zoom level and decide what to show
      this.currentZoomLevel = this.map.getZoom();

      if (this.currentZoomLevel >= this.zoomThreshold) {
        // Zoomed in - show Font Awesome icons
        await this.showIconMarkers(filteredData, L);
      } else {
        // Zoomed out - show colorful circle markers
        await this.showColorfulPoints(filteredData, L);
      }

      // Fit map to show all data for the selected project
      if (filteredData.length > 0) {
        const bounds = L.latLngBounds([]);
        filteredData.forEach((item) => {
          if (item.latitude && item.longitude) {
            bounds.extend([item.latitude, item.longitude]);
          }
        });
        if (bounds.isValid()) {
          this.map.fitBounds(bounds.pad(0.1));
        }
      }
    } catch (error) {
      console.error('Error adding infrastructure markers:', error);
    }
  }

  // Method to update map markers WITHOUT refitting bounds (for asset selection)
  private async updateMapMarkersOnly() {
    if (!this.map || !this.rawData || this.rawData.length === 0) {
      console.log('Map or data not available');
      return;
    }

    try {
      // Dynamically import Leaflet only on browser side
      const L = await import('leaflet');

      // Get filtered data based on current filters
      const filteredData = this.getFilteredData();

      // Clear existing markers
      await this.clearMapMarkers();

      // Check current zoom level and decide what to show
      this.currentZoomLevel = this.map.getZoom();

      if (this.currentZoomLevel >= this.zoomThreshold) {
        // Zoomed in - show Font Awesome icons
        await this.showIconMarkers(filteredData, L);
      } else {
        // Zoomed out - show colorful circle markers
        await this.showColorfulPoints(filteredData, L);
      }

      // DON'T FIT BOUNDS - Keep current zoom and position
      console.log(`✅ Updated map markers for ${this.selectedAssetType || 'All Assets'} without refitting bounds`);
    } catch (error) {
      console.error('Error updating map markers:', error);
    }
  }

  // Method to show icon markers (zoomed in view)
  private async showIconMarkers(filteredData: InfrastructureData[], L: any) {
    // Clear polyline if exists
    if (this.projectPolyline) {
      this.map.removeLayer(this.projectPolyline);
      this.projectPolyline = null;
    }

    // Clear existing icon markers
    this.iconMarkers.forEach((marker) => this.map.removeLayer(marker));
    this.iconMarkers = [];

    // Create icon markers for each chainage point
    filteredData.forEach((item) => {
      if (item.latitude && item.longitude) {
        // Get all assets at this chainage point
        const assets = this.getMultipleAssetsAtChainage(item);

        if (assets.length === 0) return;

        // Calculate offset positions for multiple assets at same location
        assets.forEach((asset, index) => {
          let lat = item.latitude;
          let lng = item.longitude;

          // Apply small offset if multiple assets at same chainage
          if (assets.length > 1) {
            const offsetAmount = 0.0002; // Small offset
            const angle = index * (360 / assets.length) * (Math.PI / 180);
            lat += offsetAmount * Math.cos(angle);
            lng += offsetAmount * Math.sin(angle);
          }

          // Use cached icon or create new one
          let customIcon = this.iconCache.get(asset.type);

          if (!customIcon) {
            const iconHtml = this.getAssetIcon(asset.type);
            customIcon = L.divIcon({
              html: iconHtml,
              className: 'custom-asset-icon',
              iconSize: [28, 28],
              iconAnchor: [14, 14],
              popupAnchor: [0, -14],
            });
            // Cache the icon for reuse
            this.iconCache.set(asset.type, customIcon);
          }

          // Create marker with custom icon
          const marker = L.marker([lat, lng], {
            icon: customIcon,
          });

          // Create popup content
          const popupContent = this.createMultiAssetPopupContent(
            item,
            assets,
            asset.type
          );
          marker.bindPopup(popupContent);

          // Add tooltip on hover
          marker.bindTooltip(`${asset.type}: ${asset.count}`, {
            permanent: false,
            direction: 'top',
            offset: [0, -15],
            opacity: 0.9,
          });

          marker.addTo(this.map);
          this.iconMarkers.push(marker);
        });
      }
    });
  }

  // Method to show colorful circle markers (zoomed out view)
  private async showColorfulPoints(filteredData: InfrastructureData[], L: any) {
    // Clear existing icon markers if any
    this.iconMarkers.forEach((marker: any) => this.map?.removeLayer(marker));
    this.iconMarkers = [];

    // Clear polyline if exists
    if (this.projectPolyline) {
      this.map?.removeLayer(this.projectPolyline);
      this.projectPolyline = null;
    }

    // Map asset display names to field names (used for filtering and popup)
    const assetFieldMap: { [key: string]: string } = {
      'Trees': 'trees',
      'Culvert': 'culvert',
      'Street Lights': 'street_lights',
      'Bridges': 'bridges',
      'Traffic Signals': 'traffic_signals',
      'Bus Stop': 'bus_stop',
      'Truck Layby': 'truck_layby',
      'Toll Plaza': 'toll_plaza',
      'Adjacent Road': 'adjacent_road',
      'Toilet Block': 'toilet_blocks',
      'Rest Area': 'rest_area',
      'RCC Drain': 'rcc_drain',
      'Fuel Station': 'fuel_station',
      'Emergency Call': 'emergency_call_box',
      'Tunnels': 'tunnels',
      'Footpath': 'footpath',
      'Junction': 'junction',
      'Sign Boards': 'sign_boards',
      'Solar Blinker': 'solar_blinker',
      'Median Plants': 'median_plants',
      'Service Road': 'service_road',
      'KM Stones': 'km_stones',
      'Crash Barrier': 'crash_barrier',
      'Median Opening': 'median_opening',
    };

    // If a specific asset is selected, filter to only show points with that asset
    let pointsToShow: InfrastructureData[] = filteredData;
    
    if (this.selectedAssetType) {
      const fieldName = assetFieldMap[this.selectedAssetType];
      
      // Filter to only include points that have this asset
      if (fieldName) {
        pointsToShow = filteredData.filter((item) => {
          const count = item[fieldName as keyof InfrastructureData] as number;
          return count && count > 0;
        });
      }
    }

    // Get the color for the selected asset (or use default for multiple assets)
    const selectedColor = this.selectedAssetType 
      ? (this.assetSummary.find(a => a.name === this.selectedAssetType)?.color || '#4CAF50')
      : null;

    // Create colorful circle markers for each point
    pointsToShow.forEach((item) => {
      if (item.latitude && item.longitude) {
        // Use selected asset color if filtering, otherwise use road type color
        const color = selectedColor || this.getDistressColor(item.asset_type || 'General');

        const circleMarker = L.circleMarker([item.latitude, item.longitude], {
          radius: this.selectedAssetType ? 8 : 6, // Larger radius when filtering specific asset
          fillColor: color,
          color: color,
          weight: 0,
          opacity: 1,
          fillOpacity: this.selectedAssetType ? 0.9 : 0.8, // More opaque when filtering
        });

        // Add popup with asset information
        const popupContent = `
          <div style="font-family: Arial, sans-serif; min-width: 200px;">
            <h4 style="margin: 0 0 10px 0; color: ${color}; font-size: 14px;">
              ${this.selectedAssetType || item.asset_type}
            </h4>
            <p style="margin: 5px 0; font-size: 12px;">
              <strong>Chainage:</strong> ${item.chainage_start?.toFixed(
                2
              )} - ${item.chainage_end?.toFixed(2)} km
            </p>
            <p style="margin: 5px 0; font-size: 12px;">
              <strong>Direction:</strong> ${item.direction || 'N/A'}
            </p>
            ${
              this.selectedAssetType
                ? `<p style="margin: 5px 0; font-size: 12px;">
                <strong>Count:</strong> ${item[assetFieldMap[this.selectedAssetType] as keyof InfrastructureData] || 0}
              </p>`
                : ''
            }
            ${
              item.sub_asset_type && item.sub_asset_type !== 'Not Specified'
                ? `<p style="margin: 5px 0; font-size: 12px;">
                <strong>Sub-Asset:</strong> ${item.sub_asset_type}
              </p>`
                : ''
            }
          </div>
        `;

        circleMarker.bindPopup(popupContent);
        circleMarker.addTo(this.map!);
        this.iconMarkers.push(circleMarker);
      }
    });

    console.log(`✅ Showing ${pointsToShow.length} colorful points for ${this.selectedAssetType || 'All Assets'}`);
  }

  // Method to show project polyline (zoomed out view)
  private async showProjectPolyline(
    filteredData: InfrastructureData[],
    L: any
  ) {
    // Clear icon markers if exist
    this.iconMarkers.forEach((marker) => this.map.removeLayer(marker));
    this.iconMarkers = [];

    // Clear existing polyline
    if (this.projectPolyline) {
      this.map.removeLayer(this.projectPolyline);
      this.projectPolyline = null;
    }

    // Sort data by chainage to ensure proper line connection
    const sortedData = [...filteredData].sort(
      (a, b) => a.chainage_start - b.chainage_start
    );

    // Create polyline coordinates
    const coordinates: [number, number][] = [];
    sortedData.forEach((item) => {
      if (item.latitude && item.longitude) {
        coordinates.push([item.latitude, item.longitude]);
      }
    });

    if (coordinates.length > 1) {
      // Create polyline with project color
      this.projectPolyline = L.polyline(coordinates, {
        color: '#2196F3', // Blue color for project route
        weight: 8,
        opacity: 0.9,
        smoothFactor: 1,
      });

      // Add popup to show project info
      this.projectPolyline.bindPopup(`
        <div style="font-family: 'Segoe UI', sans-serif; min-width: 200px;">
          <h4 style="margin: 0 0 8px 0; color: white; font-size: 14px; font-weight: bold;">${this.filters.projectName}</h4>
          <p style="margin: 4px 0; font-size: 12px;"><strong>Direction:</strong> ${this.filters.direction}</p>
          <p style="margin: 4px 0; font-size: 12px;"><strong>Total Points:</strong> ${sortedData.length}</p>
          <p style="margin: 6px 0 0 0; font-size: 11px; color: #666;">Zoom in to see individual assets</p>
        </div>
      `);

      this.projectPolyline.addTo(this.map);
    }
  }

  // Method to update visualization based on zoom level (without re-fitting bounds)
  private async updateMapVisualization() {
    if (!this.map || !this.rawData || this.rawData.length === 0) {
      return;
    }

    try {
      const L = await import('leaflet');
      const filteredData = this.getFilteredData();

      if (this.currentZoomLevel >= this.zoomThreshold) {
        // Switched to zoomed in - show Font Awesome icons
        await this.showIconMarkers(filteredData, L);
      } else {
        // Switched to zoomed out - show colorful circle markers
        await this.showColorfulPoints(filteredData, L);
      }

      // Note: Don't fit bounds here - user is manually zooming
    } catch (error) {
      console.error('Error updating map visualization:', error);
    }
  }

  // Helper method to get icon for asset type
  // Get color for asset type
  private getDistressColor(assetType: string): string {
    const colorMap: { [key: string]: string } = {
      Trees: '#4CAF50',
      'Adjacent Road': '#2196F3',
      'Sign Boards': '#FF9800',
      Culvert: '#9C27B0',
      'Toll Plaza': '#F44336',
      'Bus Stop': '#00BCD4',
      'Crash Barrier': '#FF9800',
      'Emergency Call': '#E91E63',
      'KM Stones': '#607D8B',
      'Street Lights': '#FFC107',
      'Truck Layby': '#8BC34A',
      'Service Road': '#FF5722',
      Junction: '#9E9E9E',
      'Fuel Station': '#3F51B5',
      'Toilet Block': '#009688',
      'RCC Drain': '#673AB7',
      'Solar Blinker': '#FFEB3B',
      'Median Opening': '#CDDC39',
      Bridges: '#795548',
      'Traffic Signals': '#FF5722',
      'Rest Area': '#9C27B0',
      Tunnels: '#546E7A',
      Footpath: '#8BC34A',
      'Median Plants': '#4CAF50',
    };

    return colorMap[assetType] || '#666666';
  }

  private getAssetIcon(assetType: string): string {
    const iconMap: { [key: string]: { icon: string; color: string } } = {
      Trees: { icon: 'fa-solid fa-tree', color: '#4CAF50' },
      'Adjacent Road': { icon: 'fa-solid fa-road', color: '#2196F3' },
      'Sign Boards': { icon: 'fa-solid fa-sign-hanging', color: '#FF9800' },
      Culvert: { icon: 'fa-solid fa-bridge-water', color: '#9C27B0' },
      'Toll Plaza': { icon: 'fa-solid fa-building', color: '#F44336' },
      'Bus Stop': { icon: 'fa-solid fa-bus', color: '#00BCD4' },
      'Crash Barrier': {
        icon: 'fa-solid fa-triangle-exclamation',
        color: '#FF9800',
      },
      'Emergency Call': { icon: 'fa-solid fa-phone', color: '#E91E63' },
      'KM Stones': { icon: 'fa-solid fa-map-pin', color: '#607D8B' },
      'Street Lights': { icon: 'fa-solid fa-lightbulb', color: '#FFC107' },
      'Truck Layby': { icon: 'fa-solid fa-truck', color: '#8BC34A' },
      'Service Road': { icon: 'fa-solid fa-route', color: '#FF5722' },
      Junction: {
        icon: 'fa-solid fa-arrows-split-up-and-left',
        color: '#9E9E9E',
      },
      'Fuel Station': { icon: 'fa-solid fa-gas-pump', color: '#3F51B5' },
      'Toilet Block': { icon: 'fa-solid fa-restroom', color: '#009688' },
      'RCC Drain': { icon: 'fa-solid fa-water', color: '#673AB7' },
      'Solar Blinker': { icon: 'fa-solid fa-sun', color: '#FFEB3B' },
      'Median Opening': {
        icon: 'fa-solid fa-arrows-left-right',
        color: '#CDDC39',
      },
      Bridges: { icon: 'fa-solid fa-bridge', color: '#795548' },
      'Traffic Signals': {
        icon: 'fa-solid fa-traffic-light',
        color: '#FF5722',
      },
      'Rest Area': { icon: 'fa-solid fa-bed', color: '#9C27B0' },
      Tunnels: { icon: 'fa-solid fa-mountain', color: '#546E7A' },
      Footpath: { icon: 'fa-solid fa-person-walking', color: '#8BC34A' },
      'Median Plants': { icon: 'fa-solid fa-seedling', color: '#4CAF50' },
    };

    const iconData = iconMap[assetType] || {
      icon: 'fa-solid fa-location-dot',
      color: '#666666',
    };

    return `
      <div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;background:${iconData.color};border-radius:50%;">
        <i class="${iconData.icon}" style="color:#fff;font-size:14px;"></i>
      </div>
    `;
  }

  // Helper method to create popup content
  private createPopupContent(item: InfrastructureData): string {
    // Find the primary asset type for this location
    const assetTypes = [
      'trees',
      'culvert',
      'street_lights',
      'bridges',
      'traffic_signals',
      'bus_stop',
      'truck_layby',
      'toll_plaza',
      'adjacent_road',
      'toilet_blocks',
      'rest_area',
      'rcc_drain',
      'fuel_station',
      'emergency_call_box',
      'tunnels',
      'footpath',
      'junction',
      'sign_boards',
      'solar_blinker',
      'median_plants',
      'service_road',
      'km_stones',
      'crash_barrier',
      'median_opening',
    ];

    let primaryAsset = 'General';
    let maxCount = 0;

    assetTypes.forEach((assetType) => {
      const count = item[assetType as keyof InfrastructureData] as number;
      if (count > maxCount) {
        maxCount = count;
        primaryAsset = assetType
          .replace('_', ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());
      }
    });

    return `
      <div style="font-family: 'Segoe UI', sans-serif; min-width: 200px;">
        <h4 style="margin: 0 0 8px 0; color: #333; font-size: 14px;">${item.project_name}</h4>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Chainage:</strong> ${item.chainage_start} - ${item.chainage_end} KM</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Direction:</strong> ${item.direction}</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Asset Type:</strong> ${item.asset_type}</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Primary Asset:</strong> ${primaryAsset} (${maxCount})</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Date:</strong> ${item.date}</p>
      </div>
    `;
  }

  // Helper method to get all assets at a chainage point
  private getMultipleAssetsAtChainage(
    item: InfrastructureData
  ): { type: string; count: number; color: string }[] {
    const assetTypes = [
      { key: 'trees', label: 'Trees' },
      { key: 'culvert', label: 'Culvert' },
      { key: 'street_lights', label: 'Street Lights' },
      { key: 'bridges', label: 'Bridges' },
      { key: 'traffic_signals', label: 'Traffic Signals' },
      { key: 'bus_stop', label: 'Bus Stop' },
      { key: 'truck_layby', label: 'Truck Layby' },
      { key: 'toll_plaza', label: 'Toll Plaza' },
      { key: 'adjacent_road', label: 'Adjacent Road' },
      { key: 'toilet_blocks', label: 'Toilet Block' },
      { key: 'rest_area', label: 'Rest Area' },
      { key: 'rcc_drain', label: 'RCC Drain' },
      { key: 'fuel_station', label: 'Fuel Station' },
      { key: 'emergency_call_box', label: 'Emergency Call' },
      { key: 'tunnels', label: 'Tunnels' },
      { key: 'footpath', label: 'Footpath' },
      { key: 'junction', label: 'Junction' },
      { key: 'sign_boards', label: 'Sign Boards' },
      { key: 'solar_blinker', label: 'Solar Blinker' },
      { key: 'median_plants', label: 'Median Plants' },
      { key: 'service_road', label: 'Service Road' },
      { key: 'km_stones', label: 'KM Stones' },
      { key: 'crash_barrier', label: 'Crash Barrier' },
      { key: 'median_opening', label: 'Median Opening' },
    ];

    const assets: { type: string; count: number; color: string }[] = [];

    assetTypes.forEach((assetType) => {
      const count = item[assetType.key as keyof InfrastructureData] as number;

      // If a specific asset type is selected, only include that asset
      if (this.selectedAssetType) {
        if (assetType.label === this.selectedAssetType && count > 0) {
          // Get color from asset summary
          const assetSummaryItem = this.assetSummary.find((a) =>
            a.name
              .toLowerCase()
              .includes(assetType.label.toLowerCase().split(' ')[0])
          );
          const color = assetSummaryItem ? assetSummaryItem.color : '#4CAF50';

          assets.push({
            type: assetType.label,
            count: count,
            color: color,
          });
        }
      } else {
        // No filter - show all assets with non-zero counts
        if (count > 0) {
          // Get color from asset summary
          const assetSummaryItem = this.assetSummary.find((a) =>
            a.name
              .toLowerCase()
              .includes(assetType.label.toLowerCase().split(' ')[0])
          );
          const color = assetSummaryItem ? assetSummaryItem.color : '#4CAF50';

          assets.push({
            type: assetType.label,
            count: count,
            color: color,
          });
        }
      }
    });

    // Sort by count (descending) so most prominent assets are shown first
    return assets.sort((a, b) => b.count - a.count);
  }

  // Helper method to create parallel offset line
  private offsetLineSegment(
    start: [number, number],
    end: [number, number],
    offset: number
  ): [[number, number], [number, number]] {
    // Calculate perpendicular offset
    const dx = end[1] - start[1];
    const dy = end[0] - start[0];
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) return [start, end];

    // Perpendicular unit vector
    const perpX = -dy / length;
    const perpY = dx / length;

    // Apply offset
    const startOffset: [number, number] = [
      start[0] + perpY * offset,
      start[1] + perpX * offset,
    ];
    const endOffset: [number, number] = [
      end[0] + perpY * offset,
      end[1] + perpX * offset,
    ];

    return [startOffset, endOffset];
  }

  // Helper method to create multi-asset popup content
  private createMultiAssetPopupContent(
    item: InfrastructureData,
    assets: { type: string; count: number; color: string }[],
    highlightedAsset: string
  ): string {
    const assetsList = assets
      .map((asset) => {
        const isHighlighted = asset.type === highlightedAsset;
        return `
        <div style="display: flex; align-items: center; margin: 4px 0; padding: 4px; background: ${
          isHighlighted ? 'rgba(255, 255, 255, 0.2)' : 'transparent'
        }; border-radius: 4px;">
          <div style="width: 12px; height: 12px; background: ${
            asset.color
          }; border-radius: 50%; margin-right: 8px; border: 2px solid white;"></div>
          <span style="font-size: 11px; ${
            isHighlighted ? 'font-weight: bold;' : ''
          }">${asset.type}: ${asset.count}</span>
        </div>
      `;
      })
      .join('');

    return `
      <div style="font-family: 'Segoe UI', sans-serif; min-width: 220px; max-width: 280px;">
        <h4 style="margin: 0 0 8px 0; color: #333; font-size: 14px; font-weight: bold;">${item.project_name}</h4>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Chainage:</strong> ${item.chainage_start} - ${item.chainage_end} KM</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Direction:</strong> ${item.direction}</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Date:</strong> ${item.date}</p>
        <hr style="margin: 8px 0; border: none; border-top: 1px solid #ddd;">
        <p style="margin: 4px 0 6px 0; font-size: 11px; font-weight: bold; color: #666;">Assets at this chainage:</p>
        ${assetsList}
      </div>
    `;
  }

  // Helper method to get color for chainage segment based on primary asset
  private getChainageColor(item: InfrastructureData): string {
    const assetTypes = [
      'trees',
      'culvert',
      'street_lights',
      'bridges',
      'traffic_signals',
      'bus_stop',
      'truck_layby',
      'toll_plaza',
      'adjacent_road',
      'toilet_blocks',
      'rest_area',
      'rcc_drain',
      'fuel_station',
      'emergency_call_box',
      'tunnels',
      'footpath',
      'junction',
      'sign_boards',
      'solar_blinker',
      'median_plants',
      'service_road',
      'km_stones',
      'crash_barrier',
      'median_opening',
    ];

    // Find the asset with the highest count for this location
    let primaryAsset = 'General';
    let maxCount = 0;

    assetTypes.forEach((assetType) => {
      const count = item[assetType as keyof InfrastructureData] as number;
      if (count > maxCount) {
        maxCount = count;
        primaryAsset = assetType
          .replace('_', ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());
      }
    });

    // If a specific asset type is selected, use that
    if (this.selectedAssetType) {
      primaryAsset = this.selectedAssetType;
    }

    // Get color from asset summary
    const assetSummaryItem = this.assetSummary.find((a) =>
      a.name.toLowerCase().includes(primaryAsset.toLowerCase().split(' ')[0])
    );

    return assetSummaryItem ? assetSummaryItem.color : '#4CAF50';
  }

  // Method to clear existing markers
  private async clearMapMarkers() {
    if (!this.map) return;

    try {
      // Clear icon markers
      this.iconMarkers.forEach((marker) => {
        if (this.map) {
          this.map.removeLayer(marker);
        }
      });
      this.iconMarkers = [];

      // Clear polyline
      if (this.projectPolyline) {
        this.map.removeLayer(this.projectPolyline);
        this.projectPolyline = null;
      }

      // Dynamically import Leaflet only on browser side
      const L = await import('leaflet');

      // Remove all remaining markers, polylines, and circle markers from the map
      this.map.eachLayer((layer: any) => {
        if (
          layer instanceof L.Marker ||
          layer instanceof L.CircleMarker ||
          layer instanceof L.Polyline
        ) {
          this.map.removeLayer(layer);
        }
      });
    } catch (error) {
      console.error('Error clearing map markers:', error);
    }
  }

  // Method to toggle labels on/off
  // toggleLabels() {
  //   if (!this.labelsLayer) return;

  //   if (this.labelsLayer.options.opacity > 0) {
  //     this.labelsLayer.setOpacity(0); // Hide labels
  //   } else {
  //     this.labelsLayer.setOpacity(0.6); // Show labels
  //     // Ensure labels layer is added to map if it was removed
  //     if (!this.map.hasLayer(this.labelsLayer)) {
  //       this.labelsLayer.addTo(this.map);
  //     }
  //   }
  // }

  // Helper method to detect mobile devices
  private isMobile(): boolean {
    if (this.isBrowser && typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  }

  private isSmallMobile(): boolean {
    if (this.isBrowser && typeof window !== 'undefined') {
      return window.innerWidth <= 480;
    }
    return false;
  }

  // Handle window resize for responsive chart updates
  private onWindowResize() {
    // Debounce resize events to avoid excessive chart updates
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      if (this.isBrowser && this.chartOptions) {
        // Force chart to resize and re-render with new responsive settings
        this.initChartOptions();
        // Trigger chart refresh to ensure tooltip works properly
        this.refreshChart();
        // Trigger chart resize if echarts instance exists
        if (
          this.isBrowser &&
          typeof window !== 'undefined' &&
          (window as any).echarts
        ) {
          // Small delay to ensure DOM has updated
          setTimeout(() => {
            const chartElements = document.querySelectorAll('.echarts-chart');
            chartElements.forEach((element) => {
              const echartsInstance = (element as any).__echarts_instance__;
              if (echartsInstance) {
                echartsInstance.resize();
              }
            });
          }, 100);
        }
      }

      // Also resize map on window resize
      if (this.map) {
        this.map.invalidateSize();
        console.log('Map resized on window resize');
      }
    }, 250);
  }

  private resizeTimeout: any;

  // Ensure chart renders properly on mobile devices
  private ensureChartRenders() {
    if (this.isBrowser && this.isMobile()) {
      // Additional delay for mobile devices to ensure proper rendering
      setTimeout(() => {
        if (this.chartOptions) {
          this.initChartOptions();
        }
      }, 500);
    }
  }

  // Prepare date-wise comparison data for all available dates of selected project
  async prepareDateComparisonData() {
    if (
      !this.filters.projectName ||
      !this.projectDatesMap[this.filters.projectName]
    ) {
      console.log('No project or dates available');
      this.dateComparisonData = [];
      this.isLoadingComparisonChart = false;
      this.initDateComparisonChartOptions();
      return;
    }

    const projectDates = this.projectDatesMap[this.filters.projectName];
    console.log('Project dates:', projectDates);

    this.isLoadingComparisonChart = true;
    const dateWiseData: { [date: string]: { [asset: string]: number } } = {};

    // Asset field mapping (used in all date fetches)
    const assetFieldMap: { [key: string]: string } = {
      trees: 'Trees',
      culvert: 'Culvert',
      street_lights: 'Street Lights',
      bridges: 'Bridges',
      traffic_signals: 'Traffic Signals',
      bus_stop: 'Bus Stop',
      truck_layby: 'Truck Layby',
      toll_plaza: 'Toll Plaza',
      adjacent_road: 'Adjacent Road',
      toilet_blocks: 'Toilet Blocks',
      rest_area: 'Rest Area',
      rcc_drain: 'RCC Drain',
      fuel_station: 'Fuel Station',
      emergency_call_box: 'Emergency Call Box',
      tunnels: 'Tunnels',
      footpath: 'Footpath',
      junction: 'Junction',
      sign_boards: 'Sign Boards',
      solar_blinker: 'Solar Blinker',
      median_plants: 'Median Plants',
      service_road: 'Service Road',
      km_stones: 'KM Stones',
      crash_barrier: 'Crash Barrier',
      median_opening: 'Median Opening',
    };

    // Fetch data for all dates IN PARALLEL (much faster!)
    console.log(
      `🚀 Fetching data for ${projectDates.length} dates in parallel...`
    );

    const fetchPromises = projectDates.map(async (date) => {
      try {
        const requestBody = {
          chainage_start: 0,
          chainage_end: 1381,
          date: date,
          direction: ['All'],
          project_name: [this.filters.projectName.trim()],
          asset_type: ['All'],
        };

        const response = await fetch(
          'https://fantastic-reportapi-production.up.railway.app/inventory_filter',
          {
            method: 'POST',
            headers: {
              accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          }
        );

        if (response.ok) {
          let data = await response.json();

          // Flatten nested array structure if needed
          if (data.length > 0 && Array.isArray(data[0])) {
            data = data.flat();
          }

          // Calculate asset totals
          const assetTotals: { [key: string]: number } = {};
          Object.values(assetFieldMap).forEach((displayName) => {
            assetTotals[displayName] = 0;
          });

          data.forEach((item: any) => {
            Object.entries(assetFieldMap).forEach(
              ([fieldName, displayName]) => {
                assetTotals[displayName] += item[fieldName] || 0;
              }
            );
          });

          return { date, assetTotals };
        } else {
          console.warn(`⚠️ Failed to fetch ${date}: ${response.status}`);
          return { date, assetTotals: {} };
        }
      } catch (error) {
        console.error(`❌ Error fetching ${date}:`, error);
        return { date, assetTotals: {} };
      }
    });

    // Wait for all fetches to complete in parallel
    const results = await Promise.all(fetchPromises);

    // Store results in dateWiseData
    results.forEach(({ date, assetTotals }) => {
      dateWiseData[date] = assetTotals;
    });

    console.log(`✅ Fetched all ${projectDates.length} dates in parallel!`);

    this.dateComparisonData = projectDates.map((date) => ({
      date: date,
      assets: dateWiseData[date] || {},
    }));

    console.log('📊 Final dateComparisonData:', this.dateComparisonData);

    // Verify data is not empty
    const hasData = this.dateComparisonData.some((item) => {
      const values = Object.values(item.assets) as number[];
      return values.some((count) => count > 0);
    });

    if (!hasData) {
      console.error('❌ ERROR: All date comparison data is empty!');
      console.error('Real data:', this.dateComparisonData);
      console.log('Check the logs above for:');
      console.log('  - 🔍 First item structure');
      console.log('  - ✅ Asset totals');
      console.log('  - Item 0, 1, 2 values');
    } else {
      console.log('✅ Date comparison data has values');
      console.log('✅ Real data will be displayed!');
    }

    this.isLoadingComparisonChart = false;
    this.initDateComparisonChartOptions();
  }

  // Initialize date comparison chart options
  private initDateComparisonChartOptions() {
    console.log('initDateComparisonChartOptions called');
    console.log('dateComparisonData:', this.dateComparisonData);

    if (!this.dateComparisonData || this.dateComparisonData.length === 0) {
      console.log('No data available for chart');
      this.dateComparisonChartOptions = {};
      return;
    }

    const isMobile = this.isMobile();
    const isSmallMobile = this.isSmallMobile();

    // Get all unique asset types from data (these will be on X-axis)
    const assetTypesSet = new Set<string>();
    this.dateComparisonData.forEach((dateItem) => {
      Object.keys(dateItem.assets).forEach((assetType) => {
        assetTypesSet.add(assetType);
      });
    });
    const assetTypes = Array.from(assetTypesSet).sort();

    console.log(
      `📊 Found ${assetTypes.length} unique asset types:`,
      assetTypes
    );

    // Generate distinct colors for each date
    const dateColors = [
      '#4CAF50',
      '#2196F3',
      '#FF9800',
      '#E91E63',
      '#9C27B0',
      '#00BCD4',
      '#FFC107',
      '#FF5722',
      '#8BC34A',
      '#3F51B5',
      '#CDDC39',
      '#009688',
    ];

    // Prepare series data - each date as a bar series (like the reference image)
    const series = this.dateComparisonData.map((dateItem, index) => {
      const assetData = assetTypes.map(
        (assetType) => dateItem.assets[assetType] || 0
      );
      console.log(`📊 Series data for ${dateItem.date}:`, assetData);
      console.log(
        `   Total for ${dateItem.date}:`,
        assetData.reduce((sum, val) => sum + val, 0)
      );

      return {
        name: dateItem.date,
        type: 'bar',
        data: assetData,
        barGap: '10%',
        barCategoryGap: '20%',
        itemStyle: {
          color: dateColors[index % dateColors.length],
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      };
    });

    this.dateComparisonChartOptions = {
      title: {
        text: 'Date-wise Asset Comparison',
        left: 'center',
        textStyle: {
          color: '#ffffff',
          fontSize: isSmallMobile ? 14 : isMobile ? 16 : 18,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
          shadowStyle: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
        },
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 2,
        textStyle: {
          color: '#ffffff',
          fontSize: isSmallMobile ? 11 : isMobile ? 12 : 13,
        },
        formatter: (params: any) => {
          if (Array.isArray(params) && params.length > 0) {
            const assetName = assetTypes[params[0].dataIndex];
            let result = `<div style="font-weight: 600; margin-bottom: 8px; color: #ffffff; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 6px;">Asset: ${assetName}</div>`;

            let totalCount = 0;
            params.forEach((param: any) => {
              totalCount += param.value || 0;
              result += `<div style="display: flex; align-items: center; margin: 4px 0;">
                <span style="display: inline-block; width: 12px; height: 12px; background-color: ${param.color}; border-radius: 2px; margin-right: 8px;"></span>
                <span style="color: #ffffff; flex: 1;">${param.seriesName}:</span>
                <span style="color: #4CAF50; font-weight: 600; margin-left: 8px;">${param.value}</span>
              </div>`;
            });

            if (params.length > 1) {
              result += `<div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.2); font-weight: 600; color: #4CAF50;">Total: ${totalCount}</div>`;
            }

            return result;
          }
          return '';
        },
      },
      legend: {
        data: this.dateComparisonData.map((item) => item.date),
        top: isSmallMobile ? 30 : isMobile ? 35 : 40,
        textStyle: {
          color: '#ffffff',
          fontSize: isSmallMobile ? 9 : isMobile ? 10 : 11,
        },
        itemWidth: isSmallMobile ? 18 : isMobile ? 20 : 25,
        itemHeight: isSmallMobile ? 10 : isMobile ? 12 : 14,
        type: 'scroll',
      },
      grid: {
        top: isSmallMobile ? '25%' : isMobile ? '22%' : '18%',
        left: isSmallMobile ? '12%' : isMobile ? '10%' : '8%',
        right: isSmallMobile ? '8%' : isMobile ? '6%' : '5%',
        bottom:
          assetTypes.length > 15
            ? '18%'
            : isSmallMobile
            ? '15%'
            : isMobile
            ? '12%'
            : '10%', // Extra space for zoom slider
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: assetTypes,
        name: 'Asset Types',
        nameLocation: 'middle',
        nameGap: isSmallMobile ? 35 : isMobile ? 40 : 45,
        nameTextStyle: {
          color: '#ffffff',
          fontSize: isSmallMobile ? 10 : isMobile ? 11 : 12,
          fontWeight: 'bold',
        },
        axisLabel: {
          color: '#ffffff',
          fontSize: isSmallMobile ? 8 : isMobile ? 9 : 10,
          rotate: assetTypes.length > 10 ? 45 : isMobile ? 25 : 0, // Rotate if many assets
          interval: 0,
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.3)',
          },
        },
      },
      dataZoom:
        assetTypes.length > 15
          ? [
              {
                type: 'slider',
                show: true,
                xAxisIndex: 0,
                start: 0,
                end: (15 / assetTypes.length) * 100, // Show first 15 assets initially
                bottom: 0,
                height: 20,
                handleSize: '80%',
                textStyle: {
                  color: '#ffffff',
                  fontSize: 10,
                },
                borderColor: 'rgba(255, 255, 255, 0.3)',
                fillerColor: 'rgba(76, 175, 80, 0.3)',
                handleStyle: {
                  color: '#4CAF50',
                  borderColor: '#4CAF50',
                },
                moveHandleStyle: {
                  color: '#4CAF50',
                },
              },
            ]
          : undefined,
      yAxis: {
        type: 'value',
        name: 'Count',
        nameTextStyle: {
          color: '#ffffff',
          fontSize: isSmallMobile ? 10 : isMobile ? 11 : 12,
          fontWeight: 'bold',
        },
        axisLabel: {
          color: '#ffffff',
          fontSize: isSmallMobile ? 8 : isMobile ? 9 : 10,
          formatter: (value: number) => {
            if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'k';
            }
            return value.toString();
          },
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.3)',
          },
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
        },
        minInterval: 1,
      },
      series: series,
    };

    console.log(
      'Date comparison chart options initialized:',
      this.dateComparisonChartOptions
    );
    console.log('Series data:', series);
  }

  // Open sub-asset modal when an asset is clicked
  openSubAssetModal(assetName: string) {
    this.selectedAssetForSubAssets = assetName;

    // Map display name back to API field name
    const assetFieldMap: { [key: string]: string } = {
      Trees: 'trees',
      Culvert: 'culvert',
      'Street Lights': 'street_lights',
      Bridges: 'bridges',
      'Traffic Signals': 'traffic_signals',
      'Bus Stop': 'bus_stop',
      'Truck Layby': 'truck_layby',
      'Toll Plaza': 'toll_plaza',
      'Adjacent Road': 'adjacent_road',
      'Toilet Blocks': 'toilet_blocks',
      'Rest Area': 'rest_area',
      'RCC Drain': 'rcc_drain',
      'Fuel Station': 'fuel_station',
      'Emergency Call Box': 'emergency_call_box',
      Tunnels: 'tunnels',
      Footpath: 'footpath',
      Junction: 'junction',
      'Sign Boards': 'sign_boards',
      'Solar Blinker': 'solar_blinker',
      'Median Plants': 'median_plants',
      'Service Road': 'service_road',
      'KM Stones': 'km_stones',
      'Crash Barrier': 'crash_barrier',
      'Median Opening': 'median_opening',
    };

    const apiFieldName = assetFieldMap[assetName];

    // Get filtered data based on current filters
    const filteredData = this.getFilteredData();

    // Extract sub-assets for the selected asset
    const subAssetMap: { [key: string]: number } = {};

    filteredData.forEach((item: any) => {
      // Check if this item has the selected asset
      if (item[apiFieldName] && item[apiFieldName] > 0) {
        const subAssetType = item.sub_asset_type?.trim();
        const count = item[apiFieldName] || 0;

        // Skip if sub_asset_type is null, undefined, empty, or "Not Specified"
        if (
          !subAssetType ||
          subAssetType === '' ||
          subAssetType === 'Not Specified'
        ) {
          return; // Skip this item
        }

        if (subAssetMap[subAssetType]) {
          subAssetMap[subAssetType] += count;
        } else {
          subAssetMap[subAssetType] = count;
        }
      }
    });

    // Convert to array and sort by count (descending)
    this.subAssetsList = Object.entries(subAssetMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    console.log('Sub-assets for', assetName, ':', this.subAssetsList);

    // Only open modal if there are valid sub-assets
    if (this.subAssetsList.length > 0) {
      this.isSubAssetModalOpen = true;
    } else {
      console.log(
        'No valid sub-assets found for',
        assetName,
        '- modal will not open'
      );
    }
  }

  // Close sub-asset modal
  closeSubAssetModal() {
    this.isSubAssetModalOpen = false;
    this.selectedAssetForSubAssets = '';
    this.subAssetsList = [];
  }

  // Open chainage comparison chart modal
  openChainageComparisonModal() {
    // Initialize available assets for comparison
    this.availableAssetsForComparison = this.assetSummary
      .filter(asset => asset.count > 0)
      .map(asset => asset.name);
    
    // Start with first 3 assets selected by default
    this.selectedAssetsForComparison = this.availableAssetsForComparison.slice(0, 3);
    
    // Open modal first
    this.isChainageComparisonModalOpen = true;
    
    // Generate chart after a short delay to ensure DOM is ready
    setTimeout(() => {
      this.generateChainageComparisonChart();
      console.log('✅ Generated chainage comparison chart');
    }, 100);
    
    console.log('✅ Opened chainage comparison chart modal with assets:', this.selectedAssetsForComparison);
  }

  // Close chainage comparison chart modal
  closeChainageComparisonModal() {
    this.isChainageComparisonModalOpen = false;
    this.selectedAssetsForComparison = [];
    console.log('✅ Closed chainage comparison chart modal');
  }

  // Toggle asset selection for comparison chart
  toggleAssetForComparison(assetName: string) {
    const index = this.selectedAssetsForComparison.indexOf(assetName);
    
    if (index > -1) {
      // Asset already selected, remove it
      this.selectedAssetsForComparison.splice(index, 1);
    } else {
      // Asset not selected, add it (limit to 5 assets for readability)
      if (this.selectedAssetsForComparison.length < 5) {
        this.selectedAssetsForComparison.push(assetName);
      } else {
        console.warn('⚠️ Maximum 5 assets can be compared at once');
        return;
      }
    }
    
    console.log('✅ Selected assets for comparison:', this.selectedAssetsForComparison);
    
    // Regenerate chart with new selection (with small delay for smooth update)
    setTimeout(() => {
      this.generateChainageComparisonChart();
    }, 50);
  }

  // Check if asset is selected for comparison
  isAssetSelectedForComparison(assetName: string): boolean {
    return this.selectedAssetsForComparison.includes(assetName);
  }

  // Get asset color for template (helper method to avoid arrow functions in template)
  getAssetColor(assetName: string): string {
    return this.assetSummary.find(a => a.name === assetName)?.color || '#4CAF50';
  }

  // Get asset background color for chip (selected or transparent)
  getAssetChipBackgroundColor(assetName: string): string {
    return this.isAssetSelectedForComparison(assetName) 
      ? this.getAssetColor(assetName)
      : 'transparent';
  }

  // Generate chainage comparison chart
  generateChainageComparisonChart() {
    if (!this.rawData || this.rawData.length === 0) {
      console.log('No data available for chainage comparison chart');
      return;
    }

    // Get filtered data based on current filters
    const filteredData = this.getFilteredData();

    if (filteredData.length === 0) {
      console.log('No filtered data for chainage comparison chart');
      return;
    }

    // Detect mobile view for responsive chart layout
    const isMobileView = window.innerWidth <= 768;

    // Create chainage bins (divide chainage range into segments)
    const chainageMin = this.filters.chainageRange.min;
    const chainageMax = this.filters.chainageRange.max;
    const binCount = 20; // Number of segments along the chainage
    const binSize = (chainageMax - chainageMin) / binCount;

    // Initialize bins
    const chainageBins: number[] = [];
    for (let i = 0; i <= binCount; i++) {
      chainageBins.push(chainageMin + (i * binSize));
    }

    // Map asset display names to field names
    const assetFieldMap: { [key: string]: string } = {
      'Trees': 'trees',
      'Culvert': 'culvert',
      'Street Lights': 'street_lights',
      'Bridges': 'bridges',
      'Traffic Signals': 'traffic_signals',
      'Bus Stop': 'bus_stop',
      'Truck Layby': 'truck_layby',
      'Toll Plaza': 'toll_plaza',
      'Adjacent Road': 'adjacent_road',
      'Toilet Block': 'toilet_blocks',
      'Rest Area': 'rest_area',
      'RCC Drain': 'rcc_drain',
      'Fuel Station': 'fuel_station',
      'Emergency Call': 'emergency_call_box',
      'Tunnels': 'tunnels',
      'Footpath': 'footpath',
      'Junction': 'junction',
      'Sign Boards': 'sign_boards',
      'Solar Blinker': 'solar_blinker',
      'Median Plants': 'median_plants',
      'Service Road': 'service_road',
      'KM Stones': 'km_stones',
      'Crash Barrier': 'crash_barrier',
      'Median Opening': 'median_opening',
    };

    // Generate series data for each selected asset
    const series: any[] = [];

    console.log('🔍 Generating chart for assets:', this.selectedAssetsForComparison);
    console.log('🔍 Chainage range:', chainageMin, 'to', chainageMax);
    console.log('🔍 Bin size:', binSize, 'Bin count:', binCount);
    console.log('🔍 Filtered data items:', filteredData.length);

    this.selectedAssetsForComparison.forEach(assetName => {
      const fieldName = assetFieldMap[assetName];
      const assetColor = this.assetSummary.find(a => a.name === assetName)?.color || '#4CAF50';
      
      if (!fieldName) {
        console.warn('⚠️ No field name found for asset:', assetName);
        return;
      }

      // Calculate asset count for each chainage bin
      const binData: number[] = new Array(binCount).fill(0);

      filteredData.forEach(item => {
        const itemChainage = (item.chainage_start + item.chainage_end) / 2;
        
        // Find which bin this item belongs to
        const binIndex = Math.floor((itemChainage - chainageMin) / binSize);
        
        if (binIndex >= 0 && binIndex < binCount) {
          const assetCount = item[fieldName as keyof InfrastructureData] as number;
          binData[binIndex] += assetCount || 0;
        }
      });

      const totalCount = binData.reduce((sum, val) => sum + val, 0);
      console.log(`📊 ${assetName}: Total count = ${totalCount}, Color = ${assetColor}`);

      series.push({
        name: assetName,
        type: 'bar',
        data: binData,
        itemStyle: { 
          color: assetColor,
          borderRadius: [4, 4, 0, 0], // Rounded top corners
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.3)',
          shadowOffsetY: 3
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            color: assetColor,
            shadowBlur: 20,
            shadowColor: assetColor,
            borderWidth: 2,
            borderColor: '#fff'
          }
        },
        barGap: '10%', // Gap between bars in same category
        barCategoryGap: '20%' // Gap between categories
      });
    });

    console.log('📈 Generated series count:', series.length);

    // Generate X-axis labels (chainage values)
    const xAxisLabels = chainageBins.slice(0, binCount).map(chainage => 
      chainage.toFixed(2) 
    );

    // Configure chart options (create new object to trigger change detection)
    this.chainageComparisonChartOptions = Object.assign({}, {
      title: {
        // text: 'Asset Distribution Along Chainage (Bar Chart)',
        left: 'center',
        textStyle: {
          color: '#fff',
          fontSize: 18,
          fontWeight: 'bold'
        },
        // subtext: 'Interactive comparison of assets across road sections',
        subtextStyle: {
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: 12
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
          shadowStyle: {
            color: 'rgba(102, 126, 234, 0.2)'
          }
        },
        backgroundColor: 'rgba(30, 30, 46, 0.95)',
        borderColor: '#667eea',
        borderWidth: 2,
        textStyle: {
          color: '#fff',
          fontSize: 13
        },
        formatter: (params: any) => {
          if (!params || params.length === 0) return '';
          
          let tooltip = `<div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #667eea;">
            📍 ${params[0].axisValue}
          </div>`;
          
          // Sort by value descending
          const sortedParams = params.sort((a: any, b: any) => b.value - a.value);
          
          sortedParams.forEach((param: any) => {
            if (param.value > 0) {
              tooltip += `<div style="display: flex; align-items: center; gap: 8px; margin: 4px 0;">
                <span style="display: inline-block; width: 12px; height: 12px; background: ${param.color}; border-radius: 3px;"></span>
                <span style="font-weight: 600;">${param.seriesName}:</span>
                <span style="color: ${param.color}; font-weight: bold;">${param.value}</span>
              </div>`;
            }
          });
          
          return tooltip;
        }
      },
      legend: {
        data: this.selectedAssetsForComparison,
        top: isMobileView ? '15%' : '10%',
        textStyle: {
          color: '#fff',
          fontSize: isMobileView ? 10 : 12,
          fontWeight: '500'
        },
        itemGap: isMobileView ? 10 : 20,
        itemWidth: isMobileView ? 20 : 25,
        itemHeight: isMobileView ? 12 : 14,
        icon: 'roundRect',
        selectedMode: true, // Allow clicking legend to show/hide series
        inactiveColor: 'rgba(255, 255, 255, 0.3)'
      },
      grid: {
        left: isMobileView ? '15%' : '3%',
        right: '4%',
        bottom: isMobileView ? '20%' : '15%',
        top: isMobileView ? '25%' : '20%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: true, // Changed to true for bar charts
        data: xAxisLabels,
        name: 'Chainage',
        nameLocation: 'middle',
        nameGap: isMobileView ? 20 : 40,
        nameTextStyle: {
          color: '#fff',
          fontSize: isMobileView ? 11 : 13,
          fontWeight: 'bold'
        },
        axisLabel: {
          color: '#fff',
          rotate: isMobileView ? 90 : 45,
          fontSize: isMobileView ? 8 : 10,
          interval: isMobileView ? 'auto' : 0, // Auto interval on mobile to reduce congestion
          margin: isMobileView ? 5 : 10,
          width: isMobileView ? 35 : undefined,
          overflow: isMobileView ? 'truncate' : 'none'
        },
        axisLine: {
          lineStyle: { 
            color: 'rgba(255, 255, 255, 0.3)',
            width: 2
          }
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.2)'
          }
        }
      },
      yAxis: {
        type: 'value',
        name: 'Asset Count',
        nameTextStyle: {
          color: '#fff',
          fontSize: isMobileView ? 11 : 13,
          fontWeight: 'bold'
        },
        axisLabel: {
          color: '#fff',
          fontSize: isMobileView ? 9 : 11,
          formatter: '{value}'
        },
        axisLine: {
          show: true,
          lineStyle: { 
            color: 'rgba(255, 255, 255, 0.3)',
            width: 2
          }
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.2)'
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)',
            type: 'dashed'
          }
        },
        min: 0 // Start from 0 for better bar visualization
      },
      series: series,
      backgroundColor: 'transparent',
      animationDuration: 1000,
      animationEasing: 'cubicOut',
      animationDelay: (idx: number) => idx * 50, // Stagger animation for each bar
      dataZoom: [
        {
          type: 'inside', // Allow zooming with mouse wheel
          start: 0,
          end: 100
        },
        {
          type: 'slider', // Show zoom slider at bottom
          start: 0,
          end: 100,
          height: 20,
          bottom: 5,
          borderColor: '#667eea',
          fillerColor: 'rgba(102, 126, 234, 0.3)',
          handleStyle: {
            color: '#667eea'
          },
          textStyle: {
            color: '#fff'
          }
        }
      ],
      toolbox: {
        feature: {
          dataZoom: {
            yAxisIndex: 'none',
            title: {
              zoom: 'Zoom',
              back: 'Reset'
            }
          },
          restore: { title: 'Restore' },
          saveAsImage: { 
            title: 'Save as Image',
            backgroundColor: '#1e1e2e',
            pixelRatio: 2
          }
        },
        iconStyle: {
          borderColor: '#fff'
        },
        emphasis: {
          iconStyle: {
            borderColor: '#667eea'
          }
        },
        top: '3%',
        right: '5%'
      }
    });

    console.log('✅ Generated chainage comparison chart with', series.length, 'assets');
    console.log('📊 Chart options:', this.chainageComparisonChartOptions);
    console.log('📊 Series data sample:', series.length > 0 ? series[0] : 'No series');
    
    // Force chart refresh
    if (this.isBrowser && typeof window !== 'undefined') {
      setTimeout(() => {
        const chartElements = document.querySelectorAll('.comparison-echarts-chart');
        chartElements.forEach((element) => {
          const echartsInstance = (element as any).__echarts_instance__;
          if (echartsInstance) {
            echartsInstance.setOption(this.chainageComparisonChartOptions, true);
            console.log('✅ Force refreshed ECharts instance');
          } else {
            console.warn('⚠️ ECharts instance not found on element');
          }
        });
      }, 100);
    }
  }

  // ============= Month-wise Comparison Chart Methods =============
  
  openMonthComparisonModalForAsset(assetType: string) {
    // Get all available dates/months from the project
    this.availableMonthsForComparison = this.projectDatesMap[this.filters.projectName] || [];
    
    // Initialize available assets for comparison (but only select the clicked asset)
    this.availableAssetsForComparison = this.assetSummary
      .filter(asset => asset.count > 0)
      .map(asset => asset.name);
    
    // Only select the clicked asset
    this.selectedAssetsForMonthComparison = [assetType];
    
    // Hide asset selection chips when opened from asset card click
    this.showAssetSelectionInModal = false;
    
    this.isMonthComparisonModalOpen = true;
    this.isLoadingMonthChart = true;
    
    // Generate chart after DOM is ready
    setTimeout(() => {
      this.generateMonthComparisonChart();
    }, 100);
    
    console.log('✅ Opened month-wise comparison chart modal for asset:', assetType);
    console.log('✅ Available months:', this.availableMonthsForComparison);
  }

  openMonthComparisonModal() {
    // Get all available dates/months from the project
    this.availableMonthsForComparison = this.projectDatesMap[this.filters.projectName] || [];
    
    // Initialize available assets for comparison (same as chainage modal)
    this.availableAssetsForComparison = this.assetSummary
      .filter(asset => asset.count > 0)
      .map(asset => asset.name);
    
    // Pre-select up to 5 assets
    this.selectedAssetsForMonthComparison = this.assetSummary
      .filter(asset => asset.count > 0)
      .slice(0, 5)
      .map(asset => asset.name);
    
    // Show asset selection chips when opened manually
    this.showAssetSelectionInModal = true;
    
    this.isMonthComparisonModalOpen = true;
    this.isLoadingMonthChart = true;
    
    // Generate chart after DOM is ready
    setTimeout(() => {
      this.generateMonthComparisonChart();
    }, 100);
    
    console.log('✅ Opened month-wise comparison chart modal with assets:', this.selectedAssetsForMonthComparison);
    console.log('✅ Available months:', this.availableMonthsForComparison);
  }

  closeMonthComparisonModal() {
    this.isMonthComparisonModalOpen = false;
    this.selectedAssetsForMonthComparison = [];
    this.isLoadingMonthChart = false;
    this.showAssetSelectionInModal = true; // Reset flag
    console.log('✅ Closed month-wise comparison chart modal');
  }

  // Toggle asset selection for month comparison chart
  toggleAssetForMonthComparison(assetName: string) {
    const index = this.selectedAssetsForMonthComparison.indexOf(assetName);
    
    if (index > -1) {
      // Asset already selected, remove it
      this.selectedAssetsForMonthComparison.splice(index, 1);
    } else {
      // Asset not selected, add it (max 5 assets)
      if (this.selectedAssetsForMonthComparison.length < 5) {
        this.selectedAssetsForMonthComparison.push(assetName);
      } else {
        console.warn('Maximum 5 assets can be selected for comparison');
        return;
      }
    }
    
    // Regenerate chart with new selection
    setTimeout(() => {
      this.generateMonthComparisonChart();
    }, 50);
  }

  // Check if asset is selected for month comparison
  isAssetSelectedForMonthComparison(assetName: string): boolean {
    return this.selectedAssetsForMonthComparison.includes(assetName);
  }

  // Get asset background color for month comparison chip
  getAssetChipBackgroundColorForMonth(assetName: string): string {
    return this.isAssetSelectedForMonthComparison(assetName) 
      ? this.getAssetColor(assetName)
      : 'transparent';
  }

  // Generate month-wise comparison chart
  async generateMonthComparisonChart() {
    if (!this.filters.projectName) {
      console.log('No project selected for month comparison chart');
      this.isLoadingMonthChart = false;
      return;
    }

    if (this.selectedAssetsForMonthComparison.length === 0) {
      console.log('No assets selected for month comparison');
      this.monthComparisonChartOptions = {};
      this.isLoadingMonthChart = false;
      return;
    }

    this.isLoadingMonthChart = true;

    try {
      // Fetch data for all available months (with caching) - PARALLEL REQUESTS
      const monthDataMap: { [month: string]: InfrastructureData[] } = {};
      const cacheKey = `${this.filters.projectName}_${this.filters.chainageRange.min}_${this.filters.chainageRange.max}`;
      
      console.log(`🔄 Fetching data for ${this.availableMonthsForComparison.length} months in parallel (chainage: ${this.filters.chainageRange.min} - ${this.filters.chainageRange.max})...`);
      
      // Prepare all fetch promises in parallel
      const fetchPromises = this.availableMonthsForComparison.map(async (month) => {
        const monthCacheKey = `${cacheKey}_${month}`;
        
        // Check cache first
        if (this.monthDataCache[monthCacheKey]) {
          console.log(`✅ Using cached data for ${month}`);
          return { month, data: this.monthDataCache[monthCacheKey] };
        }

        const requestBody = {
          chainage_start: this.filters.chainageRange.min,
          chainage_end: this.filters.chainageRange.max,
          date: month,
          direction: ['All'],
          project_name: [this.filters.projectName.trim()],
          asset_type: ['All'],
        };

        try {
          const response = await fetch(
            'https://fantastic-reportapi-production.up.railway.app/inventory_filter',
            {
              method: 'POST',
              headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
            }
          );

          const apiResponse = await response.json();
          const monthData = Array.isArray(apiResponse) ? apiResponse.flat() : [];
          
          // Cache the data
          this.monthDataCache[monthCacheKey] = monthData;
          
          console.log(`✅ Fetched data for ${month}: ${monthData.length} records`);
          return { month, data: monthData };
        } catch (error) {
          console.error(`❌ Error fetching data for ${month}:`, error);
          return { month, data: [] };
        }
      });

      // Wait for all requests to complete
      const results = await Promise.all(fetchPromises);
      
      // Map results back to monthDataMap
      results.forEach(({ month, data }) => {
        monthDataMap[month] = data;
      });
      
      console.log(`✅ All month data fetched successfully`);

      // Asset field mapping
      const assetFieldMap: { [key: string]: string } = {
        'Trees': 'trees',
        'Culvert': 'culvert',
        'Street Lights': 'street_lights',
        'Bridges': 'bridges',
        'Traffic Signals': 'traffic_signals',
        'Bus Stop': 'bus_stop',
        'Truck Layby': 'truck_layby',
        'Toll Plaza': 'toll_plaza',
        'Adjacent Road': 'adjacent_road',
        'Toilet Block': 'toilet_blocks',
        'Rest Area': 'rest_area',
        'RCC Drain': 'rcc_drain',
        'Fuel Station': 'fuel_station',
        'Emergency Call': 'emergency_call_box',
        'Tunnels': 'tunnels',
        'Footpath': 'footpath',
        'Junction': 'junction',
        'Sign Boards': 'sign_boards',
        'Solar Blinker': 'solar_blinker',
        'Median Plants': 'median_plants',
        'Service Road': 'service_road',
        'KM Stones': 'km_stones',
        'Crash Barrier': 'crash_barrier',
        'Median Opening': 'median_opening',
      };

      // Generate series data for each selected asset
      const series: any[] = [];

      this.selectedAssetsForMonthComparison.forEach(assetName => {
        const fieldName = assetFieldMap[assetName];
        const assetColor = this.assetSummary.find(a => a.name === assetName)?.color || '#4CAF50';
        
        if (!fieldName) {
          console.warn('⚠️ No field name found for asset:', assetName);
          return;
        }

        // Calculate total count for each month
        const monthData: number[] = [];
        
        this.availableMonthsForComparison.forEach(month => {
          const data = monthDataMap[month] || [];
          
          // Sum actual asset counts across ALL directions within the chainage range
          const totalCount = data.reduce((sum, item) => {
            const assetCount = item[fieldName as keyof InfrastructureData];
            const numericCount = typeof assetCount === 'number' ? assetCount : parseFloat(assetCount as string) || 0;
            
            // Add the actual count (not just 1 if exists)
            return sum + numericCount;
          }, 0);
          
          monthData.push(totalCount);
        });

        console.log(`📊 Month comparison - ${assetName}: Total counts = ${monthData}`);

        series.push({
          name: assetName,
          type: 'bar',
          data: monthData,
          itemStyle: { 
            color: assetColor,
            borderRadius: [4, 4, 0, 0],
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowOffsetY: 3
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              color: assetColor,
              shadowBlur: 20,
              shadowColor: assetColor,
              borderWidth: 2,
              borderColor: '#fff'
            }
          },
          barGap: '10%',
          barCategoryGap: '20%'
        });
      });

      const isMobileView = window.innerWidth <= 768;

      // Configure chart options
      this.monthComparisonChartOptions = {
        title: {
          left: 'center',
          textStyle: {
            color: '#fff',
            fontSize: 18,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
            shadowStyle: {
              color: 'rgba(102, 126, 234, 0.2)'
            }
          },
          backgroundColor: 'rgba(30, 30, 46, 0.95)',
          borderColor: 'rgba(102, 126, 234, 0.5)',
          borderWidth: 2,
          textStyle: {
            color: '#fff',
            fontSize: 13
          },
          padding: [12, 16],
          formatter: (params: any) => {
            if (!Array.isArray(params)) return '';
            
            const month = params[0].axisValue;
            let result = `<div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #667eea;">${month}</div>`;
            
            params.forEach((param: any) => {
              result += `
                <div style="display: flex; align-items: center; margin: 5px 0;">
                  <span style="display: inline-block; width: 12px; height: 12px; background-color: ${param.color}; border-radius: 3px; margin-right: 8px;"></span>
                  <span style="flex: 1;">${param.seriesName}:</span>
                  <strong style="color: #fff; margin-left: 10px;">${param.value}</strong>
                </div>
              `;
            });
            
            return result;
          }
        },
        legend: {
          data: this.selectedAssetsForMonthComparison,
          top: isMobileView ? 30 : 40,
          textStyle: {
            color: '#fff',
            fontSize: isMobileView ? 11 : 13
          },
          itemGap: isMobileView ? 8 : 15,
          itemWidth: isMobileView ? 20 : 25,
          itemHeight: isMobileView ? 12 : 14
        },
        grid: {
          left: isMobileView ? '15%' : '10%',
          right: isMobileView ? '8%' : '5%',
          bottom: isMobileView ? '25%' : '20%',
          top: isMobileView ? '25%' : '20%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: this.availableMonthsForComparison,
          name: 'Month',
          nameLocation: 'middle',
          nameGap: isMobileView ? 40 : 35,
          nameTextStyle: {
            color: '#fff',
            fontSize: isMobileView ? 11 : 13,
            fontWeight: 'bold'
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)',
              width: 2
            }
          },
          axisLabel: {
            color: '#fff',
            fontSize: isMobileView ? 9 : 11,
            rotate: isMobileView ? 90 : 30,
            interval: isMobileView ? 'auto' : 0,
            margin: isMobileView ? 12 : 10,
            width: isMobileView ? 60 : 80,
            overflow: 'truncate'
          },
          axisTick: {
            show: true,
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.2)'
            }
          }
        },
        yAxis: {
          type: 'value',
          name: 'Asset Count',
          nameLocation: 'end',
          nameGap: 15,
          nameTextStyle: {
            color: '#fff',
            fontSize: isMobileView ? 11 : 13,
            fontWeight: 'bold'
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)',
              width: 2
            }
          },
          axisLabel: {
            color: '#fff',
            fontSize: isMobileView ? 10 : 12,
            formatter: (value: number) => {
              if (value >= 1000000) {
                return (value / 1000000).toFixed(1) + 'M';
              } else if (value >= 1000) {
                return (value / 1000).toFixed(1) + 'K';
              }
              return Math.round(value).toString();
            }
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)',
              type: 'dashed'
            }
          }
        },
        series: series,
        animationDuration: 1000,
        animationEasing: 'cubicOut'
      };

      console.log('📈 Generated month comparison chart with', series.length, 'assets');
    } catch (error) {
      console.error('Error generating month comparison chart:', error);
      this.monthComparisonChartOptions = {};
    } finally {
      this.isLoadingMonthChart = false;
    }
  }

  ngOnDestroy() {
    // Clean up event listeners
    if (this.isBrowser && typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onWindowResize);
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }
    }
  }
}
