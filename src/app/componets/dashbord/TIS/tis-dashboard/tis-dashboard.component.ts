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
import {
  GoogleMapsTrafficService,
  RouteData,
} from '../../../../shared/services/google-maps-traffic.service';

interface TrafficInfoData {
  title: string;
  value: string | number;
  unit?: string;
}

interface FilterData {
  date: string;
  projectName: string;
  direction: string;
  chainageRange: { min: number; max: number };
  pavementType: string;
  lane: string;
  distressType: string;
}

// Interface for the projects-dates API response
interface ProjectDatesResponse {
  [projectName: string]: string[];
}

// Interface for the distress data structure
interface DistressReportData {
  project_name: string;
  chainage_start: number;
  chainage_end: number;
  direction: string;
  pavement_type: string;
  lane: string;
  distress_type: string;
  latitude: number;
  longitude: number;
  date: string;
  severity: string;
  _rawItem?: any;
}

@Component({
  selector: 'app-tis-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEchartsModule],
  providers: [provideEcharts()],
  templateUrl: './tis-dashboard.component.html',
  styleUrl: './tis-dashboard.component.scss',
})
export class TisDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainerRef!: ElementRef;

  // Raw data from JSON
  rawData: DistressReportData[] = [];

  // Filter data
  filters: FilterData = {
    date: '',
    projectName: '',
    direction: 'Increasing',
    chainageRange: { min: 0, max: 1380.387 },
    pavementType: 'All',
    lane: 'All',
    distressType: 'All', // Not used in TIS API
  };

  // Available filter options
  availableProjects: string[] = [];
  availableDirections: string[] = [];
  availablePavementTypes: string[] = [];
  availableLanes: string[] = [];
  availableDates: string[] = [];
  availableDistressTypes: string[] = []; // Empty - TIS API doesn't have distress types

  // Project dates mapping from API
  projectDatesMap: ProjectDatesResponse = {};

  // Traffic information data
  trafficInfoData: TrafficInfoData[] = [];

  private map: any;
  public isBrowser: boolean;
  public isLoading: boolean = false;
  public isSidebarOpen: boolean = false; // Required by template (sidebar commented out)

  // Flag to prevent duplicate data loads when project changes
  private isProjectChanging: boolean = false;

  // Zoom-based visualization properties
  private currentZoomLevel: number = 10;
  private zoomThreshold: number = 16;
  private distressMarkers: any[] = [];
  private iconCache: Map<string, any> = new Map();

  // Unused but kept for compatibility with methods
  private chainageData: any[] = [];
  private chartOptions: any = {};
  private selectedDistressType: string | null = null;

  // Selected info card for interactive filtering
  public selectedInfoCard: string | null = null;

  // Month-wise comparison chart modal properties
  isMonthComparisonModalOpen: boolean = false;
  selectedMetricsForMonthComparison: string[] = [];
  monthComparisonChartOptions: any = {};
  availableMonthsForComparison: string[] = [];
  isLoadingMonthChart: boolean = false;
  monthDataCache: { [month: string]: any } = {};
  showMetricSelectionInModal: boolean = true;

  // Toggle for month comparison mode
  isMonthComparisonMode: boolean = false;
  isPreloadingMonthData: boolean = false;

  // Traffic analysis properties
  showTrafficAnalysis: boolean = false;
  routeData: RouteData | null = null;
  isFetchingTraffic: boolean = false;
  trafficError: string | null = null;
  routeHistory: RouteData[] = [];
  googleMap: any = null;
  directionsRenderer: any = null;
  trafficLayer: any = null;
  segmentPolylines: any[] = [];

  // Leaflet map traffic route polylines and markers
  trafficRoutePolylines: any[] = [];
  trafficMarkers: any[] = [];

  // Traffic density statistics
  trafficDensity: {
    freeFlow: number;
    light: number;
    moderate: number;
    heavy: number;
    severe: number;
  } = {
    freeFlow: 0,
    light: 0,
    moderate: 0,
    heavy: 0,
    severe: 0,
  };

  // Traffic Analysis Modal properties
  isTrafficAnalysisModalOpen: boolean = false;
  trafficModalTime: string = '';
  trafficModalMap: any = null;
  trafficModalSegmentPolylines: any[] = [];
  trafficModalMarkers: any[] = [];
  trafficModalTrafficLayer: any = null;
  
  // 24hr Traffic Trend Chart
  traffic24hrTrendChartOptions: any = {};
  isLoading24hrTrafficTrend: boolean = false;
  has24hrTrafficData: boolean = false;
  traffic24hrData: RouteData[] = [];
  trafficTrendProgress: number = 0; // Progress percentage for loading
  
  // 24hr Future + 1 Week Past + 1 Month Past Traffic Chart
  trafficForecastChartOptions: any = {};
  isLoadingForecastTraffic: boolean = false;
  hasForecastTrafficData: boolean = false;
  forecastTrafficData: RouteData[] = [];
  forecastProgress: number = 0;
  forecastBestTime: { time: string; minutes: number; is24hr?: boolean } | null = null;
  forecast24hrData: any[] = [];
  forecastWeekData: any[] = [];
  forecastMonthData: any[] = [];
  isLoadingMonthData: boolean = false;
  showMonthData: boolean = false;
  
  // Traffic data cache for historical data
  trafficDataCache: Map<string, RouteData> = new Map();
  bestTravelTime: { time: string; minutes: number; date?: string } | null = null;
  totalTravelTime: { average: number; min: number; max: number } | null = null;
  
  // Date selection for traffic analysis
  trafficAnalysisDate: string = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private trafficService: GoogleMapsTrafficService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      // Load projects and dates first
      this.loadProjectsAndDates();
    }
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      // Wait for data to load before initializing map
      setTimeout(() => {
        if (this.rawData.length > 0) {
          this.initMap();
        }
      }, 1000);
    }
  }

  ngOnDestroy() {
    if (this.isBrowser && this.map) {
      this.map.remove();
    }
  }

  private async loadProjectsAndDates() {
    try {
      const response = await fetch(
        'https://fantastic-reportapi-production.up.railway.app/projects-dates/tis',
        {
          method: 'GET',
          headers: {
            accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const projectDates: ProjectDatesResponse = await response.json();
      console.log('Projects and Dates loaded from TIS API:', projectDates);

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
        await this.loadDistressData();
      }
    } catch (error) {
      console.error('Error loading projects and dates:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      // Fallback to empty arrays
      this.availableProjects = [];
      this.availableDates = [];
    }
  }

  async loadDistressData() {
    // Only load data in browser environment
    if (!this.isBrowser) return;

    if (!this.filters.date) {
      console.log('No date selected, skipping data load');
      return;
    }

    if (!this.filters.projectName) {
      console.log('No project selected, skipping data load');
      return;
    }

    this.isLoading = true;

    try {
      // Prepare API request body with selected filters for TIS API
      const requestBody = {
        chainage_start: 0,
        chainage_end: 1381,
        date: this.filters.date,
        direction: ['All'],
        project_name: [this.filters.projectName.trim()],
      };

      console.log('TIS API Request Body:', requestBody);

      const response = await fetch(
        'https://fantastic-reportapi-production.up.railway.app/tis_filter',
        {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse = await response.json();
      console.log('TIS API Response:', apiResponse);

      // Handle API response - check if it's an error or valid data
      if (apiResponse && apiResponse.detail) {
        console.error('API returned error:', apiResponse.detail);
        this.rawData = [];
        return;
      }

      // Process the response data - flatten nested arrays
      const flatData: any[] = [];
      if (Array.isArray(apiResponse)) {
        apiResponse.forEach((group) => {
          if (Array.isArray(group)) {
            flatData.push(...group);
          } else {
            flatData.push(group);
          }
        });
      }

      // Transform the data - TIS API structure
      this.rawData = flatData.map((item: any) => ({
        project_name: item.project_name || 'Unknown Project',
        chainage_start: item.chainage_start || 0,
        chainage_end: item.chainage_end || 0,
        direction: item.direction || 'Unknown',
        pavement_type: 'N/A', // TIS API doesn't have pavement_type/carriage_type
        lane: 'N/A', // TIS API doesn't have lane
        distress_type: 'N/A', // TIS API doesn't have distress_type
        latitude: item.latitude || 0,
        longitude: item.longitude || 0,
        date: item.date || this.filters.date || '2025-01-01',
        severity: 'Low', // Default severity for TIS data
        // Store raw item for TIS API data access
        _rawItem: item,
      }));

      this.extractFilterOptions();
      this.updateTrafficInformation();

      // Initialize map after data is loaded
      setTimeout(() => {
        this.initMap();
        this.addDistressMarkers();
      }, 500);
    } catch (error) {
      console.error('Error loading distress data:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      this.rawData = [];
    } finally {
      this.isLoading = false;
    }
  }

  extractFilterOptions() {
    // Check if rawData is valid array
    if (!Array.isArray(this.rawData) || this.rawData.length === 0) {
      // Don't reset availableProjects - they come from the API
      this.availableDirections = ['Increasing', 'Decreasing'];
      this.availablePavementTypes = [];
      this.availableLanes = [];
      return;
    }

    // Extract filter options from data (projects come from API)
    // TIS API only has direction field
    this.availableDirections = [
      ...new Set(this.rawData.map((item) => item.direction)),
    ];

    // TIS API doesn't have pavement types or lanes
    this.availablePavementTypes = [];
    this.availableLanes = [];

    // Update chainage range based on current data
    const chainages = this.rawData.flatMap((item) => [
      item.chainage_start,
      item.chainage_end,
    ]);
    if (chainages.length > 0) {
      this.filters.chainageRange.min = Math.min(...chainages);
      this.filters.chainageRange.max = Math.max(...chainages);
      console.log('Updated chainage range:', this.filters.chainageRange);
    }
  }

  getFilteredData(): DistressReportData[] {
    return this.rawData.filter((item) => {
      // Note: Project and Date filtering is done by the API
      // TIS API doesn't have pavement_type or lane, so these filters don't apply
      const matchesDirection =
        this.filters.direction === 'All' ||
        item.direction === this.filters.direction;
      const matchesChainage =
        item.chainage_start <= this.filters.chainageRange.max &&
        item.chainage_end >= this.filters.chainageRange.min;

      return matchesDirection && matchesChainage;
    });
  }

  updateTrafficInformation() {
    if (!this.rawData || this.rawData.length === 0) {
      this.trafficInfoData = [];
      return;
    }

    // Use getFilteredData() which applies ALL filters (direction, pavement type, lane, chainage)
    const fullyFilteredData = this.getFilteredData();

    // Use filtered data if available, otherwise use all data
    const dataToUse =
      fullyFilteredData.length > 0 ? fullyFilteredData : this.rawData;

    if (dataToUse.length === 0) {
      this.trafficInfoData = [];
      return;
    }

    // Get the first data entry to extract traffic information
    // Values are displayed once (not summed) based on the filtered chainage range
    const firstItem = dataToUse[0];
    const rawData = firstItem._rawItem || {};

    // Extract traffic data from a single item (values shown once, not summed)
    const aadtInVehicles = rawData.aadt_in_vehicles || 0;
    const cvdInVehicles = rawData.cvd_in_vehicles || 0;
    const aadtInPCU = rawData.aadt_in_pcu || 0;
    const carJeepVanTaxi = rawData['car/_jeep/_van/_taxi'] || 0;
    const threeAxleTrucks = rawData['3-axle_trucks'] || 0;
    const twoAxleTrucks = rawData['2-axle_trucks'] || 0;
    const mav = rawData.mav || 0;
    const osv = rawData.osv || 0;
    const lcv = rawData.lcv || 0;
    const standardBus = rawData.standard_bus || 0;
    const tractors = rawData.tractor || 0;
    const threeWheelerAuto = rawData['3-wheeler/_auto'] || 0;

    // Initialize traffic info data with single values based on chainage range
    this.trafficInfoData = [
      {
        title: 'AADT in Vehicles',
        value:
          typeof aadtInVehicles === 'number'
            ? aadtInVehicles.toFixed(0)
            : aadtInVehicles,
        unit: '',
      },
      {
        title: 'CVD in Vehicles',
        value:
          typeof cvdInVehicles === 'number'
            ? cvdInVehicles.toFixed(0)
            : cvdInVehicles,
        unit: '',
      },
      {
        title: 'AADT in PCU',
        value: typeof aadtInPCU === 'number' ? aadtInPCU.toFixed(0) : aadtInPCU,
        unit: '',
      },
      {
        title: 'Car/ Jeep/ Van',
        value: carJeepVanTaxi,
        unit: '',
      },
      {
        title: '3 Axle Trucks',
        value: threeAxleTrucks,
        unit: '',
      },
      {
        title: '2 Axle Trucks',
        value: twoAxleTrucks,
        unit: '',
      },
      {
        title: 'MAV',
        value: mav,
        unit: '',
      },
      {
        title: 'OSV',
        value: osv,
        unit: '',
      },
      {
        title: 'LCV',
        value: lcv,
        unit: '',
      },
      {
        title: 'Standard Bus',
        value: standardBus,
        unit: '',
      },
      {
        title: 'Tractors',
        value: tractors,
        unit: '',
      },
      {
        title: '3-Wheeler/ Auto',
        value: threeWheelerAuto,
        unit: '',
      },
    ];
  }

  updateChainageData() {
    const filteredData = this.getFilteredData();
    const maxChainage = Math.max(
      ...filteredData.map((item) => item.chainage_end)
    );
    const rangeSize = maxChainage / 5; // Divide into 5 ranges

    this.chainageData = [];
    for (let i = 0; i < 5; i++) {
      const start = i * rangeSize;
      const end = (i + 1) * rangeSize;

      const rangeData = filteredData.filter(
        (item) => item.chainage_start >= start && item.chainage_end <= end
      );

      this.chainageData.push({
        chainage_start: start,
        chainage_end: end,
        distress_count: rangeData.length,
      });
    }
  }

  initChartOptions() {
    this.chartOptions = {
      title: {
        text: 'Chainage Wise Distress',
        textStyle: {
          color: '#ffffff',
          fontSize: 16,
          fontWeight: 'bold',
        },
        left: 'center',
        top: 10,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        textStyle: {
          color: '#ffffff',
        },
        formatter: (params: any) => {
          if (Array.isArray(params)) {
            const dataIndex = Math.round(params[0].data[0]);
            const chainageItem = this.chainageData[dataIndex];
            const chainageRange = chainageItem
              ? `${chainageItem.chainage_start.toFixed(
                  1
                )} - ${chainageItem.chainage_end.toFixed(1)} KM`
              : 'Unknown Range';

            let result = `<div style="margin-bottom: 8px; font-weight: 600; color: #ffffff; font-size: 14px;">Chainage: ${chainageRange}</div>`;
            result += `<div style="margin-bottom: 4px; font-weight: 500; color: #cccccc; font-size: 12px;">Distress Distribution:</div>`;

            params.forEach((param: any) => {
              if (param.data && param.data[1] > 0) {
                result += `<div style="display: flex; align-items: center; margin: 3px 0;">
                  <span style="display: inline-block; width: 12px; height: 12px; background-color: ${param.color}; border-radius: 3px; margin-right: 10px;"></span>
                  <span style="color: #ffffff; font-size: 13px;">${param.seriesName}: <strong style="color: #4CAF50; font-size: 14px;">${param.data[1]}</strong></span>
                </div>`;
              }
            });
            return result;
          }
          return `${params.seriesName}: ${
            params.data ? params.data[1] : params.value
          }`;
        },
      },
      legend: {
        data: this.availableDistressTypes,
        textStyle: {
          color: '#ffffff',
        },
        top: 40,
        type: 'scroll',
        orient: 'horizontal',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '25%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: this.chainageData.map((_, index) => index),
        axisLabel: {
          color: '#ffffff',
          formatter: (value: number) => {
            const item = this.chainageData[value];
            return item ? `${item.chainage_start.toFixed(0)}` : '';
          },
        },
        axisLine: {
          lineStyle: {
            color: '#ffffff',
          },
        },
      },
      yAxis: {
        type: 'value',
        name: 'Total distress',
        nameTextStyle: {
          color: '#ffffff',
        },
        axisLabel: {
          color: '#ffffff',
        },
        axisLine: {
          lineStyle: {
            color: '#ffffff',
          },
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
        },
      },
      series: this.availableDistressTypes.map((distressType) => ({
        name: distressType,
        type: 'bar',
        data: this.chainageData.map((_, index) => [index, Math.random() * 10]), // Placeholder data
        itemStyle: {
          color: this.getDistressColor(distressType),
        },
        barWidth: '60%',
      })),
    };
  }

  private getSeverityFromDistressType(distressType: string): string {
    const highSeverityDistress = [
      'Alligator crack',
      'Pothole',
      'Rutting',
      'Edge break',
    ];
    const mediumSeverityDistress = [
      'Transverse crack',
      'Longitudinal crack',
      'Block crack',
    ];

    if (highSeverityDistress.includes(distressType)) return 'High';
    if (mediumSeverityDistress.includes(distressType)) return 'Medium';
    return 'Low';
  }

  private getDistressColor(distressType: string): string {
    const colorMap: { [key: string]: string } = {
      'Alligator crack': '#8B0000', // Dark red
      Bleeding: '#000066', // Dark navy blue
      'Block crack': '#004d00', // Dark green
      'Edge break': '#660066', // Dark purple
      'Hairline crack': '#996600', // Dark goldenrod
      Heaves: '#006666', // Dark cyan
      'Joint crack': '#663300', // Dark brown
      'Joint seal defects': '#804020', // Dark sienna
      'Longitudinal crack': '#000066', // Dark navy blue
      'Multiple cracks': '#990000', // Dark crimson
      'Oblique crack': '#CC6600', // Dark orange
      Patching: '#336699', // Dark steel blue
      Pothole: '#CC3300', // Dark orange-red
      Punchout: '#996600', // Dark goldenrod
      Raveling: '#1a661a', // Dark green
      'Simple crack': '#990066', // Dark magenta
      'Single discrete crack': '#004d4d', // Dark teal
      Rutting: '#4B0082', // Indigo
      'Transverse crack': '#2d7a4d', // Dark sea green
      Settlement: '#4d2966', // Dark purple
      Shoving: '#4d3621', // Dark brown
      Slippage: '#006666', // Dark cyan
      Stripping: '#8B0000', // Dark red
      Hotspots: '#CC3300', // Dark tomato
      'Hungry surface': '#CC6600', // Dark orange
      Repair: '#006666', // Dark cyan
      Roughness: '#7851a3', // Dark purple
    };
    return colorMap[distressType] || '#006600';
  }

  updateChart() {
    if (this.chartOptions) {
      this.chartOptions = { ...this.chartOptions };
    }
  }

  async initMap() {
    if (!this.isBrowser) return;

    // Check if map is already initialized
    if (this.map) {
      console.log('Map already initialized, skipping...');
      return;
    }

    try {
      const L = await import('leaflet');

      // Check if map container exists
      const mapContainer = document.getElementById('mapContainer');
      if (!mapContainer) {
        console.error('Map container not found');
        return;
      }

      // Check if container already has a map instance
      if ((mapContainer as any)._leaflet_id) {
        console.log(
          'Map container already has a Leaflet instance, removing...'
        );
        // Remove existing map instance
        const existingMap = (L as any).map.get(mapContainer);
        if (existingMap) {
          existingMap.remove();
        }
        // Clear the container
        mapContainer.innerHTML = '';
      }

      // Initialize map with satellite view
      this.map = L.map('mapContainer', {
        center: [26.7041, 89.1459],
        zoom: 1,
        zoomControl: true,
      });

      // Add Google satellite tile layer
      const googleSatelliteLayer = L.tileLayer(
        'http://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
        {
          attribution: '© Google',
          maxZoom: 21,
        }
      );

      // Add Google satellite layer by default
      googleSatelliteLayer.addTo(this.map);

      // Add zoom event listener for dynamic switching between colorful points and icons
      this.map.on('zoomend', () => {
        if (this.map) {
          this.currentZoomLevel = this.map.getZoom();
          // Use updateMapMarkersOnly to preserve selected card filter
          this.updateMapMarkersOnly();
        }
      });

      // Invalidate map size to ensure proper rendering
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
          console.log('Map initialized successfully');
          // Set initial view to show all projects
          this.adjustMapBounds();
        }
      }, 100);

      // Additional resize for mobile
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 500);

      this.addDistressMarkers();
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  async addDistressMarkers() {
    if (!this.map || !this.isBrowser) return;

    try {
      const L = await import('leaflet');

      this.clearMapMarkers();
      let filteredData = this.getFilteredData();

      // If a specific distress type is selected, filter to show only that type
      if (this.selectedDistressType) {
        filteredData = filteredData.filter(
          (item) => item.distress_type === this.selectedDistressType
        );
      }

      // Check current zoom level and decide what to show
      this.currentZoomLevel = this.map.getZoom();

      if (this.currentZoomLevel >= this.zoomThreshold) {
        // Zoomed in - show Font Awesome icons
        await this.showIconMarkers(filteredData, L);
      } else {
        // Zoomed out - show colorful circle markers
        await this.showColorfulPoints(filteredData, L);
      }

      // Adjust map bounds after adding markers
      this.adjustMapBounds();
    } catch (error) {
      console.error('Error adding distress markers:', error);
    }
  }

  // Method to update map markers WITHOUT refitting bounds (for info card clicks)
  async updateMapMarkersOnly() {
    if (!this.map || !this.isBrowser) return;

    try {
      const L = await import('leaflet');

      this.clearMapMarkers();
      let filteredData = this.getFilteredData();

      // Check current zoom level and decide what to show
      this.currentZoomLevel = this.map.getZoom();

      if (this.currentZoomLevel >= this.zoomThreshold) {
        // Zoomed in - show Font Awesome icons
        await this.showIconMarkers(filteredData, L);
      } else {
        // Zoomed out - show colorful circle markers
        await this.showColorfulPoints(filteredData, L);
      }

      // DON'T ADJUST MAP BOUNDS - Keep current zoom and position
      console.log(
        `✅ TIS: Updated map markers for ${
          this.selectedInfoCard || 'All Traffic'
        } without refitting bounds`
      );
    } catch (error) {
      console.error('Error updating map markers:', error);
    }
  }

  // Handle info card click for interactive selection
  onInfoCardClick(info: TrafficInfoData) {
    // If month comparison mode is ON, open the month comparison modal
    if (this.isMonthComparisonMode) {
      this.openMonthComparisonModalForMetric(info.title);
      return;
    }

    // Original behavior: Toggle selection - if clicking same card, deselect it
    if (this.selectedInfoCard === info.title) {
      this.selectedInfoCard = null;
      console.log('✅ TIS: Deselected card');
    } else {
      this.selectedInfoCard = info.title;
      console.log(`✅ TIS: Selected card: ${info.title}`);
    }

    // Update map WITHOUT refitting bounds
    if (this.map) {
      this.updateMapMarkersOnly();
    }
  }

  // Method to show colorful circle markers (zoomed out view)
  private async showColorfulPoints(filteredData: DistressReportData[], L: any) {
    filteredData.forEach((item) => {
      if (item.latitude && item.longitude) {
        const color = this.getTrafficColor(item._rawItem);
        const marker = L.circleMarker([item.latitude, item.longitude], {
          radius: 6,
          fillColor: color,
          color: color,
          weight: 0,
          opacity: 1,
          fillOpacity: 0.8,
        }).addTo(this.map);

        marker.bindPopup(`
          <div style="font-family: Arial, sans-serif; min-width: 200px;">
            <h4 style="margin: 0 0 10px 0; color: ${color}; font-size: 14px;">
              Traffic Data
            </h4>
            <p style="margin: 5px 0; font-size: 12px;">
              <strong>Chainage:</strong> ${item.chainage_start?.toFixed(
                2
              )} - ${item.chainage_end?.toFixed(2)} km
            </p>
            <p style="margin: 5px 0; font-size: 12px;">
              <strong>Direction:</strong> ${item.direction || 'N/A'}
            </p>
            <p style="margin: 5px 0; font-size: 12px;">
              <strong>AADT (Vehicles):</strong> ${
                item._rawItem?.aadt_in_vehicles?.toFixed(0) || 'N/A'
              }
            </p>
            <p style="margin: 5px 0; font-size: 12px;">
              <strong>AADT (PCU):</strong> ${
                item._rawItem?.aadt_in_pcu?.toFixed(0) || 'N/A'
              }
            </p>
            <p style="margin: 5px 0; font-size: 12px;">
              <strong>CVD:</strong> ${
                item._rawItem?.cvd_in_vehicles?.toFixed(0) || 'N/A'
              }
            </p>
          </div>
        `);

        this.distressMarkers.push(marker);
      }
    });
  }

  // Method to show icon markers (zoomed in view) - with caching and batch rendering
  private async showIconMarkers(filteredData: DistressReportData[], L: any) {
    // Batch render markers to prevent UI freeze
    const batchSize = 100;
    let currentIndex = 0;

    const addBatch = () => {
      const endIndex = Math.min(currentIndex + batchSize, filteredData.length);

      for (let i = currentIndex; i < endIndex; i++) {
        const item = filteredData[i];
        if (item.latitude && item.longitude) {
          // Use cached icon or create new one based on AADT
          const aadt =
            item._rawItem?.aadt_in_vehicles || item._rawItem?.aadt || 0;
          const cacheKey = `aadt_${Math.floor(aadt / 10000)}`; // Group by 10k ranges for caching

          let customIcon = this.iconCache.get(cacheKey);

          if (!customIcon) {
            const iconHtml = this.getDistressIcon(item._rawItem);
            customIcon = L.divIcon({
              html: iconHtml,
              className: 'custom-distress-icon',
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            });
            // Cache the icon for reuse
            this.iconCache.set(cacheKey, customIcon);
          }

          const marker = L.marker([item.latitude, item.longitude], {
            icon: customIcon,
          }).addTo(this.map);

          // Create popup only when clicked - saves memory
          marker.on('click', () => {
            const color = this.getTrafficColor(item._rawItem);
            const aadt = item._rawItem?.aadt_in_vehicles || 0;
            const popup = `<div style="padding:8px;"><div style="color:${color};font-weight:bold;margin-bottom:5px;">Traffic Data</div><div style="font-size:11px;">Ch: ${item.chainage_start?.toFixed(
              1
            )}-${item.chainage_end?.toFixed(1)} km<br>Dir: ${
              item.direction || 'N/A'
            }<br>AADT: ${aadt.toFixed(0)} vehicles</div></div>`;
            marker.bindPopup(popup).openPopup();
          });

          this.distressMarkers.push(marker);
        }
      }

      currentIndex = endIndex;

      // Continue with next batch
      if (currentIndex < filteredData.length) {
        setTimeout(() => addBatch(), 0);
      }
    };

    // Start batch rendering
    addBatch();
  }

  // Update map visualization based on zoom level
  private async updateMapVisualization() {
    if (!this.map || !this.rawData || this.rawData.length === 0) {
      return;
    }

    try {
      const L = await import('leaflet');
      this.clearMapMarkers();

      let filteredData = this.getFilteredData();

      if (this.currentZoomLevel >= this.zoomThreshold) {
        // Switched to zoomed in - show Font Awesome icons
        await this.showIconMarkers(filteredData, L);
      } else {
        // Switched to zoomed out - show colorful circle markers
        await this.showColorfulPoints(filteredData, L);
      }
    } catch (error) {
      console.error('Error updating map visualization:', error);
    }
  }

  // Get color for traffic data based on AADT
  private getTrafficColor(trafficData: any): string {
    const aadt = trafficData?.aadt_in_vehicles || trafficData?.aadt || 0;

    if (aadt >= 50000) {
      return '#CC0000'; // Very high traffic - red
    } else if (aadt >= 30000) {
      return '#FF6600'; // High traffic - orange
    } else if (aadt >= 15000) {
      return '#FFC107'; // Medium traffic - yellow
    } else if (aadt >= 5000) {
      return '#4CAF50'; // Low-Medium traffic - green
    } else {
      return '#2196F3'; // Very low traffic - blue
    }
  }

  // Get Font Awesome icon for asset type based on traffic data
  private getDistressIcon(trafficData: any): string {
    // For TIS, we can use vehicle counts or types to determine icon
    // Since TIS doesn't have distress_type, we'll use AADT (Average Annual Daily Traffic)
    const aadt = trafficData?.aadt_in_vehicles || trafficData?.aadt || 0;

    // Define icons based on traffic volume ranges
    if (aadt >= 50000) {
      // Very high traffic - use congested road icon
      return `
        <div style="width:28px;height:28px;border-radius:50%;background:#CC0000;display:flex;align-items:center;justify-content:center;">
          <i class="fa-solid fa-traffic-light" style="color:#fff;font-size:14px;"></i>
        </div>
      `;
    } else if (aadt >= 30000) {
      // High traffic - use road icon
      return `
        <div style="width:28px;height:28px;border-radius:50%;background:#FF6600;display:flex;align-items:center;justify-content:center;">
          <i class="fa-solid fa-road" style="color:#fff;font-size:14px;"></i>
        </div>
      `;
    } else if (aadt >= 15000) {
      // Medium traffic - use car icon
      return `
        <div style="width:28px;height:28px;border-radius:50%;background:#FFC107;display:flex;align-items:center;justify-content:center;">
          <i class="fa-solid fa-car" style="color:#fff;font-size:14px;"></i>
        </div>
      `;
    } else if (aadt >= 5000) {
      // Low-Medium traffic - use truck icon
      return `
        <div style="width:28px;height:28px;border-radius:50%;background:#4CAF50;display:flex;align-items:center;justify-content:center;">
          <i class="fa-solid fa-truck" style="color:#fff;font-size:14px;"></i>
        </div>
      `;
    } else {
      // Very low traffic - use bus icon
      return `
        <div style="width:28px;height:28px;border-radius:50%;background:#2196F3;display:flex;align-items:center;justify-content:center;">
          <i class="fa-solid fa-bus" style="color:#fff;font-size:14px;"></i>
        </div>
      `;
    }
  }

  async adjustMapBounds() {
    if (!this.map || !this.isBrowser) return;

    try {
      const L = await import('leaflet');

      // Use all data if "All" projects selected, otherwise use filtered data
      const dataToUse =
        this.filters.projectName === 'All'
          ? this.rawData
          : this.getFilteredData();

      // Get coordinates of data
      const coordinates = dataToUse
        .filter((item) => item.latitude && item.longitude)
        .map((item) => [item.latitude, item.longitude] as [number, number]);

      if (coordinates.length === 0) {
        // If no data, show default view
        this.map.setView([26.7041, 89.1459], 10);
        return;
      }

      if (coordinates.length === 1) {
        // If only one point, center on it with appropriate zoom
        this.map.setView(coordinates[0], 15);
        return;
      }

      // Create bounds from all coordinates
      const bounds = L.latLngBounds(coordinates);

      // Fit map to bounds with padding
      this.map.fitBounds(bounds, {
        padding: [20, 20],
        maxZoom: 16,
      });
    } catch (error) {
      console.error('Error adjusting map bounds:', error);
    }
  }

  clearMapMarkers() {
    if (!this.map) return;
    // Remove all tracked markers
    this.distressMarkers.forEach((marker: any) => {
      if (this.map) {
        this.map.removeLayer(marker);
      }
    });
    this.distressMarkers = [];
  }

  onFilterChange() {
    this.updateTrafficInformation();

    if (this.isBrowser) {
      this.addDistressMarkers();
    }
  }

  // Filter change methods
  async onDateChange(event: any) {
    this.filters.date = event.target.value;
    console.log('onDateChange triggered - new date:', this.filters.date);

    // Don't reload if we're in the middle of a project change
    if (this.isProjectChanging) {
      console.log('Skipping date change - project is changing');
      return;
    }

    if (this.filters.date) {
      await this.loadDistressData();
    }
  }

  private convertDateFormat(dateString: string): string {
    // Convert from DD-MM-YYYY to YYYY-MM-DD format for API
    if (dateString.includes('-') && dateString.length === 10) {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        // Check if it's already in YYYY-MM-DD format
        if (parts[0].length === 4) {
          return dateString;
        }
        // Convert from DD-MM-YYYY to YYYY-MM-DD
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    return dateString;
  }

  async onProjectChange(event: any) {
    console.log('onProjectChange triggered - new project:', event.target.value);
    this.isProjectChanging = true;

    // Clear old data first
    this.rawData = [];
    this.trafficInfoData = [];
    this.monthDataCache = {};
    // Reset traffic analysis state so new project picks correct origin/destination
    this.routeData = null;
    this.showTrafficAnalysis = false;
    this.clearTrafficRouteFromMap();

    this.filters.projectName = event.target.value;

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
      await this.loadDistressData();
    }

    this.isProjectChanging = false;
  }

  onDirectionChange(direction: string) {
    this.filters.direction = direction;
    this.onFilterChange();
  }

  onPavementTypeChange(event: any) {
    this.filters.pavementType = event.target.value;
    this.onFilterChange();
  }

  onLaneChange(event: any) {
    this.filters.lane = event.target.value;
    this.onFilterChange();
  }

  onDistressTypeChange(event: any) {
    this.filters.distressType = event.target.value;
    this.onFilterChange();
  }

  onChainageMinChange(event: any) {
    const value = parseFloat(event.target.value);
    if (value >= 0 && value <= this.filters.chainageRange.max) {
      this.filters.chainageRange.min = value;
      this.monthDataCache = {};
      this.onFilterChange();
      if (this.isMonthComparisonMode && this.filters.projectName) {
        this.preloadMonthData();
      }
    }
  }

  onChainageMaxChange(event: any) {
    const value = parseFloat(event.target.value);
    if (
      value >= this.filters.chainageRange.min &&
      value <= this.getChainageMax()
    ) {
      this.filters.chainageRange.max = value;
      this.monthDataCache = {};
      this.onFilterChange();
      if (this.isMonthComparisonMode && this.filters.projectName) {
        this.preloadMonthData();
      }
    }
  }

  onChainageMinSliderChange(event: any) {
    const value = parseFloat(event.target.value);
    if (value <= this.filters.chainageRange.max) {
      this.filters.chainageRange.min = value;
      this.monthDataCache = {};
      this.onFilterChange();
      if (this.isMonthComparisonMode && this.filters.projectName) {
        this.preloadMonthData();
      }
    }
  }

  onChainageMaxSliderChange(event: any) {
    const value = parseFloat(event.target.value);
    if (value >= this.filters.chainageRange.min) {
      this.filters.chainageRange.max = value;
      this.monthDataCache = {};
      this.onFilterChange();
      if (this.isMonthComparisonMode && this.filters.projectName) {
        this.preloadMonthData();
      }
    }
  }

  private updateChainageRangeForProject() {
    // Since we now filter by project in the API, rawData only contains the current project's data
    const chainages = this.rawData.flatMap((item) => [
      item.chainage_start,
      item.chainage_end,
    ]);
    if (chainages.length > 0) {
      this.filters.chainageRange.min = Math.min(...chainages);
      this.filters.chainageRange.max = Math.max(...chainages);
      console.log(
        'Updated chainage range for project:',
        this.filters.chainageRange
      );
    } else {
      // If no data, reset to default
      this.filters.chainageRange.min = 0;
      this.filters.chainageRange.max = 1380.387;
    }
  }

  getChainageMin(): number {
    // Since API filters by project, rawData contains current project's data
    if (this.rawData.length > 0) {
      return Math.floor(
        Math.min(...this.rawData.map((item) => item.chainage_start))
      );
    }
    return 0;
  }

  getChainageMax(): number {
    // Since API filters by project, rawData contains current project's data
    if (this.rawData.length > 0) {
      return Math.ceil(
        Math.max(...this.rawData.map((item) => item.chainage_end))
      );
    }
    return 1380.387;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    // Resize map after sidebar toggle
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 300);
  }

  // ============= Month-wise Comparison Chart Methods =============

  toggleMonthComparisonMode() {
    this.isMonthComparisonMode = !this.isMonthComparisonMode;
    console.log(
      'Month Comparison Mode:',
      this.isMonthComparisonMode ? 'ON' : 'OFF'
    );

    if (this.isMonthComparisonMode) {
      this.preloadMonthData();
    }
  }

  async preloadMonthData() {
    const availableMonths =
      this.projectDatesMap[this.filters.projectName] || [];
    const cacheKey = `${this.filters.projectName}_${this.filters.chainageRange.min}_${this.filters.chainageRange.max}`;

    const monthsToFetch = availableMonths.filter((month) => {
      const monthCacheKey = `${cacheKey}_${month}`;
      return !this.monthDataCache[monthCacheKey];
    });

    if (monthsToFetch.length === 0) return;

    this.isPreloadingMonthData = true;

    try {
      const fetchPromises = monthsToFetch.map(async (month) => {
        const monthCacheKey = `${cacheKey}_${month}`;

        const requestBody = {
          chainage_start: this.filters.chainageRange.min,
          chainage_end: this.filters.chainageRange.max,
          date: month,
          direction: ['All'],
          project_name: [this.filters.projectName.trim()],
        };

        try {
          const response = await fetch(
            'https://fantastic-reportapi-production.up.railway.app/tis_filter',
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
          // TIS API returns double-nested array: [[{...}, {...}], [{...}, {...}], ...]
          // Flatten the nested arrays
          const flatData: any[] = [];
          if (Array.isArray(apiResponse)) {
            apiResponse.forEach((group) => {
              if (Array.isArray(group)) {
                flatData.push(...group);
              } else {
                flatData.push(group);
              }
            });
          }

          this.monthDataCache[monthCacheKey] = flatData;
          console.log(
            `✅ TIS: Cached ${flatData.length} items for ${monthCacheKey}`
          );
        } catch (error) {
          console.error(`❌ Error pre-loading data for ${month}:`, error);
        }
      });

      await Promise.all(fetchPromises);
    } finally {
      this.isPreloadingMonthData = false;
    }
  }

  async openMonthComparisonModalForMetric(metricTitle: string) {
    this.availableMonthsForComparison =
      this.projectDatesMap[this.filters.projectName] || [];
    this.selectedMetricsForMonthComparison = [metricTitle];
    this.showMetricSelectionInModal = false;
    this.isMonthComparisonModalOpen = true;
    this.isLoadingMonthChart = true;

    if (Object.keys(this.monthDataCache).length === 0) {
      await this.preloadMonthData();
    }

    setTimeout(() => {
      this.generateMonthComparisonChart();
    }, 100);
  }

  closeMonthComparisonModal() {
    this.isMonthComparisonModalOpen = false;
    this.selectedMetricsForMonthComparison = [];
    this.isLoadingMonthChart = false;
    this.showMetricSelectionInModal = true;
  }

  toggleMetricForMonthComparison(metricName: string) {
    const index = this.selectedMetricsForMonthComparison.indexOf(metricName);

    if (index > -1) {
      this.selectedMetricsForMonthComparison.splice(index, 1);
    } else {
      if (this.selectedMetricsForMonthComparison.length < 5) {
        this.selectedMetricsForMonthComparison.push(metricName);
      } else {
        return;
      }
    }

    setTimeout(() => {
      this.generateMonthComparisonChart();
    }, 50);
  }

  isMetricSelectedForMonthComparison(metricName: string): boolean {
    return this.selectedMetricsForMonthComparison.includes(metricName);
  }

  getMetricChipBackgroundColorForMonth(metricName: string): string {
    return this.isMetricSelectedForMonthComparison(metricName)
      ? this.getMetricColor(metricName)
      : 'transparent';
  }

  getMetricColor(metricName: string): string {
    const metricColorMap: { [key: string]: string } = {
      'AADT in Vehicles': '#FF6B6B',
      'CVD in Vehicles': '#FFA07A',
      'AADT in PCU': '#FFD93D',
      'Car/ Jeep/ Van/ Taxi': '#6BCF7F',
      '3 Axle Trucks': '#4D96FF',
      '2 Axle Trucks': '#9D84B7',
      MAV: '#FF69B4',
      OSV: '#F59E0B',
      LCV: '#06B6D4',
      'Standard Bus': '#EF4444',
    };
    return metricColorMap[metricName] || '#667EEA';
  }

  async generateMonthComparisonChart() {
    if (
      !this.filters.projectName ||
      this.selectedMetricsForMonthComparison.length === 0
    ) {
      this.isLoadingMonthChart = false;
      return;
    }

    this.isLoadingMonthChart = true;

    try {
      const monthDataMap: { [month: string]: any } = {};
      const cacheKey = `${this.filters.projectName}_${this.filters.chainageRange.min}_${this.filters.chainageRange.max}`;

      const metricFieldMap: { [key: string]: string } = {
        'AADT in Vehicles': 'aadt_in_vehicles',
        'CVD in Vehicles': 'cvd_in_vehicles',
        'AADT in PCU': 'aadt_in_pcu',
        'Car/ Jeep/ Van/ Taxi': 'car/_jeep/_van/_taxi',
        '3 Axle Trucks': '3-axle_trucks',
        '2 Axle Trucks': '2-axle_trucks',
        MAV: 'mav',
        OSV: 'osv',
        LCV: 'lcv',
        'Standard Bus': 'standard_bus',
      };

      const fetchPromises = this.availableMonthsForComparison.map(
        async (month) => {
          const monthCacheKey = `${cacheKey}_${month}`;

          if (this.monthDataCache[monthCacheKey]) {
            return { month, data: this.monthDataCache[monthCacheKey] };
          }

          const requestBody = {
            chainage_start: this.filters.chainageRange.min,
            chainage_end: this.filters.chainageRange.max,
            date: month,
            direction: ['All'],
            project_name: [this.filters.projectName.trim()],
          };

          try {
            const response = await fetch(
              'https://fantastic-reportapi-production.up.railway.app/tis_filter',
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
            // TIS API returns double-nested array: [[{...}, {...}], [{...}, {...}], ...]
            // Flatten the nested arrays
            const flatData: any[] = [];
            if (Array.isArray(apiResponse)) {
              apiResponse.forEach((group) => {
                if (Array.isArray(group)) {
                  flatData.push(...group);
                } else {
                  flatData.push(group);
                }
              });
            }

            this.monthDataCache[monthCacheKey] = flatData;
            return { month, data: flatData };
          } catch (error) {
            console.error(`❌ Error fetching data for ${month}:`, error);
            return { month, data: [] };
          }
        }
      );

      const results = await Promise.all(fetchPromises);
      results.forEach(({ month, data }) => {
        monthDataMap[month] = data;
      });

      const series: any[] = [];

      this.selectedMetricsForMonthComparison.forEach((metricName) => {
        const metricColor = this.getMetricColor(metricName);
        const fieldName = metricFieldMap[metricName];
        const monthData: number[] = [];

        console.log(
          `📊 TIS: Processing metric: ${metricName}, field: ${fieldName}`
        );

        this.availableMonthsForComparison.forEach((month) => {
          const monthCacheKey = `${cacheKey}_${month}`;
          const cachedData = this.monthDataCache[monthCacheKey];

          let value = 0;

          // TIS data is an array of flat objects
          if (Array.isArray(cachedData)) {
            console.log(`  ${month}: ${cachedData.length} items in cache`);
            // Calculate average value across all items (both directions)
            const sum = cachedData.reduce((acc, item) => {
              const itemValue = parseFloat(item[fieldName]) || 0;
              return acc + itemValue;
            }, 0);
            value = cachedData.length > 0 ? sum / cachedData.length : 0;
            console.log(
              `  ${month}: Average ${fieldName} = ${value.toFixed(2)}`
            );
          } else if (cachedData && typeof cachedData === 'object') {
            // Single object (shouldn't happen for TIS)
            value = parseFloat(cachedData[fieldName]) || 0;
          }

          monthData.push(parseFloat(value.toFixed(2)));
        });

        console.log(`✅ TIS: Series data for ${metricName}:`, monthData);

        series.push({
          name: metricName,
          type: 'bar',
          data: monthData,
          itemStyle: {
            color: metricColor,
            borderRadius: [4, 4, 0, 0],
          },
        });
      });

      const isMobileView = window.innerWidth <= 768;

      this.monthComparisonChartOptions = {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(30, 30, 46, 0.95)',
          borderColor: 'rgba(102, 126, 234, 0.5)',
          borderWidth: 2,
          textStyle: { color: '#fff' },
        },
        legend: {
          data: this.selectedMetricsForMonthComparison,
          top: isMobileView ? 30 : 40,
          textStyle: { color: '#fff', fontSize: isMobileView ? 11 : 13 },
        },
        grid: {
          left: isMobileView ? '15%' : '10%',
          right: isMobileView ? '8%' : '5%',
          bottom: isMobileView ? '25%' : '20%',
          top: isMobileView ? '25%' : '20%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: this.availableMonthsForComparison,
          axisLabel: {
            color: '#fff',
            rotate: isMobileView ? 90 : 0,
            fontSize: isMobileView ? 9 : 12,
            interval: isMobileView ? 'auto' : 0,
            margin: isMobileView ? 10 : 8,
          },
          axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } },
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: '#fff',
            fontSize: isMobileView ? 10 : 12,
            formatter: (value: number) => {
              if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
              if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
              return value;
            },
          },
          axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } },
          splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
        },
        series: series,
      };

      this.isLoadingMonthChart = false;
    } catch (error) {
      console.error('Error generating month comparison chart:', error);
      this.isLoadingMonthChart = false;
    }
  }

  // ============= Traffic Analysis Methods =============

  /**
   * Get project start and end coordinates based on chainage
   */
  getProjectStartEndCoordinates(): {
    origin: string;
    destination: string;
  } | null {
    if (!this.rawData || this.rawData.length === 0) {
      return null;
    }

    // Filter data by current project, direction, and chainage range
    const filteredData = this.rawData.filter((item) => {
      const matchesProject = item.project_name === this.filters.projectName;
      const matchesDirection =
        this.filters.direction === 'All' ||
        item.direction === this.filters.direction;
      // Filter by chainage range - check if chainage_start or chainage_end falls within the range
      const matchesChainage =
        (item.chainage_start >= this.filters.chainageRange.min &&
          item.chainage_start <= this.filters.chainageRange.max) ||
        (item.chainage_end >= this.filters.chainageRange.min &&
          item.chainage_end <= this.filters.chainageRange.max) ||
        (item.chainage_start <= this.filters.chainageRange.min &&
          item.chainage_end >= this.filters.chainageRange.max);
      return matchesProject && matchesDirection && matchesChainage;
    });

    if (filteredData.length === 0) {
      return null;
    }

    // Sort by chainage to get start and end points within the selected range
    const sortedData = [...filteredData].sort(
      (a, b) => a.chainage_start - b.chainage_start
    );

    // Find points that match the exact chainage boundaries
    // For start: find point where chainage_start matches min chainage, or closest
    let startPoint = sortedData.find(
      item => item.chainage_start === this.filters.chainageRange.min
    ) || sortedData[0];
    
    // If exact match not found, find closest to min chainage
    if (!sortedData.find(item => item.chainage_start === this.filters.chainageRange.min)) {
      let minDiff = Math.abs(startPoint.chainage_start - this.filters.chainageRange.min);
      for (const item of sortedData) {
        const diff = Math.abs(item.chainage_start - this.filters.chainageRange.min);
        if (diff < minDiff) {
          minDiff = diff;
          startPoint = item;
        }
      }
    }

    // For end: find point where chainage_end matches max chainage, or closest
    let endPoint = sortedData.find(
      item => item.chainage_end === this.filters.chainageRange.max
    ) || sortedData[sortedData.length - 1];
    
    // If exact match not found, find closest to max chainage
    if (!sortedData.find(item => item.chainage_end === this.filters.chainageRange.max)) {
      let maxDiff = Math.abs(endPoint.chainage_end - this.filters.chainageRange.max);
      for (const item of sortedData) {
        const diff = Math.abs(item.chainage_end - this.filters.chainageRange.max);
        if (diff < maxDiff) {
          maxDiff = diff;
          endPoint = item;
        }
      }
    }

    const origin = `${startPoint.latitude},${startPoint.longitude}`;
    const destination = `${endPoint.latitude},${endPoint.longitude}`;

    return { origin, destination };
  }

  /**
   * Get project coordinates with lat/lng values
   */
  getProjectCoordinatesWithLatLng(): {
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
    origin: string;
    destination: string;
    startChainage?: number;
    endChainage?: number;
  } | null {
    if (!this.rawData || this.rawData.length === 0) {
      return null;
    }

    // Filter data by current project, direction, and chainage range
    const filteredData = this.rawData.filter((item) => {
      const matchesProject = item.project_name === this.filters.projectName;
      const matchesDirection =
        this.filters.direction === 'All' ||
        item.direction === this.filters.direction;
      // Filter by chainage range - check if chainage_start or chainage_end falls within the range
      const matchesChainage =
        (item.chainage_start >= this.filters.chainageRange.min &&
          item.chainage_start <= this.filters.chainageRange.max) ||
        (item.chainage_end >= this.filters.chainageRange.min &&
          item.chainage_end <= this.filters.chainageRange.max) ||
        (item.chainage_start <= this.filters.chainageRange.min &&
          item.chainage_end >= this.filters.chainageRange.max);
      return matchesProject && matchesDirection && matchesChainage;
    });

    if (filteredData.length === 0) {
      return null;
    }

    // Sort by chainage to get start and end points within the selected range
    const sortedData = [...filteredData].sort(
      (a, b) => a.chainage_start - b.chainage_start
    );

    // Find points that match the exact chainage boundaries
    // For start: find point where chainage_start matches min chainage, or closest
    let startPoint = sortedData.find(
      item => item.chainage_start === this.filters.chainageRange.min
    ) || sortedData[0];
    
    // If exact match not found, find closest to min chainage
    if (!sortedData.find(item => item.chainage_start === this.filters.chainageRange.min)) {
      let minDiff = Math.abs(startPoint.chainage_start - this.filters.chainageRange.min);
      for (const item of sortedData) {
        const diff = Math.abs(item.chainage_start - this.filters.chainageRange.min);
        if (diff < minDiff) {
          minDiff = diff;
          startPoint = item;
        }
      }
    }

    // For end: find point where chainage_end matches max chainage, or closest
    let endPoint = sortedData.find(
      item => item.chainage_end === this.filters.chainageRange.max
    ) || sortedData[sortedData.length - 1];
    
    // If exact match not found, find closest to max chainage
    if (!sortedData.find(item => item.chainage_end === this.filters.chainageRange.max)) {
      let maxDiff = Math.abs(endPoint.chainage_end - this.filters.chainageRange.max);
      for (const item of sortedData) {
        const diff = Math.abs(item.chainage_end - this.filters.chainageRange.max);
        if (diff < maxDiff) {
          maxDiff = diff;
          endPoint = item;
        }
      }
    }

    const startLat = startPoint.latitude;
    const startLng = startPoint.longitude;
    const origin = `${startLat},${startLng}`;

    const endLat = endPoint.latitude;
    const endLng = endPoint.longitude;
    const destination = `${endLat},${endLng}`;

    return { 
      startLat, 
      startLng, 
      endLat, 
      endLng, 
      origin, 
      destination,
      startChainage: this.filters.chainageRange.min,
      endChainage: this.filters.chainageRange.max
    };
  }

  /**
   * Helper method to safely extract lat/lng values from Google Maps objects
   */
  getLatLngValue(value: any): number {
    if (typeof value === 'function') {
      return value();
    }
    return typeof value === 'number' ? value : parseFloat(String(value));
  }

  /**
   * Fetch traffic data for the current project route
   */
  async fetchTrafficData() {
    if (!this.isBrowser) return;

    const coordinates = this.getProjectStartEndCoordinates();
    if (!coordinates) {
      this.trafficError =
        'No project data available. Please select a project and date.';
      return;
    }

    this.isFetchingTraffic = true;
    this.trafficError = null;

    try {
      // Load Google Maps API
      await this.trafficService.loadGoogleMaps();

      // Fetch traffic data - use modal time if available, otherwise use current time
      // IMPORTANT: Google Maps API only supports current or future times
      let departureTime = new Date();
      if (this.trafficModalTime && this.filters.date) {
        const selectedDate = new Date(this.filters.date);
        const [hours, minutes] = this.trafficModalTime.split(':').map(Number);
        selectedDate.setHours(hours || 0, minutes || 0, 0, 0);
        
        // If selected time is in the past, use current time instead
        const now = new Date();
        if (selectedDate < now) {
          departureTime = now;
          // Update modal time to current time
          const currentHours = String(now.getHours()).padStart(2, '0');
          const currentMinutes = String(now.getMinutes()).padStart(2, '0');
          this.trafficModalTime = `${currentHours}:${currentMinutes}`;
        } else {
          departureTime = selectedDate;
        }
      }

      const routeData = await this.trafficService.processRouteWithTraffic(
        coordinates.origin,
        coordinates.destination,
        departureTime
      );

      this.routeData = routeData;
      this.routeHistory.push(routeData);
      this.showTrafficAnalysis = true;

      // Calculate traffic density statistics
      this.calculateTrafficDensity(routeData);

      // Display route on existing Leaflet map instead of separate Google Map
      await this.displayTrafficRouteOnLeafletMap(routeData);
    } catch (error) {
      console.error('Error fetching traffic data:', error);
      let errorMessage = 'Failed to fetch traffic data';

      if (error instanceof Error) {
        errorMessage = error.message;
        // Check for specific Google Maps API errors
        if (
          errorMessage.includes('DeletedApiProjectMapError') ||
          errorMessage.includes('deleted-api-project')
        ) {
          errorMessage =
            'Google Maps API key is invalid or the project has been deleted. Please check your API key configuration.';
        } else if (errorMessage.includes('API key')) {
          errorMessage = 'Google Maps API key error: ' + errorMessage;
        }
      }

      this.trafficError = errorMessage;
    } finally {
      this.isFetchingTraffic = false;
    }
  }

  /**
   * Display traffic route on existing Leaflet map
   */
  async displayTrafficRouteOnLeafletMap(routeData: RouteData) {
    if (!this.isBrowser || !this.map) return;

    try {
      await this.trafficService.loadGoogleMaps();
      const google = (window as any).google;

      if (typeof google === 'undefined' || !google.maps) {
        throw new Error('Google Maps API not loaded');
      }

      // Get route from Google Maps Directions API
      const directionsService = new google.maps.DirectionsService();
      const directionsResult = await new Promise<any>((resolve, reject) => {
        directionsService.route(
          {
            origin: routeData.origin,
            destination: routeData.destination,
            travelMode: google.maps.TravelMode.DRIVING,
            drivingOptions: {
              departureTime: new Date(routeData.departure_time),
              trafficModel: google.maps.TrafficModel.BEST_GUESS,
            },
          },
          (result: any, status: any) => {
            if (status === 'OK' && result) {
              resolve(result);
            } else {
              reject(new Error('Directions request failed: ' + status));
            }
          }
        );
      });

      // Draw route on Leaflet map
      await this.drawTrafficRouteOnLeaflet(routeData, directionsResult);
    } catch (error) {
      console.error('Error displaying traffic route on Leaflet map:', error);
      let errorMessage = 'Failed to display traffic route on map';

      if (error instanceof Error) {
        errorMessage = error.message;
        if (
          errorMessage.includes('DeletedApiProjectMapError') ||
          errorMessage.includes('deleted-api-project')
        ) {
          errorMessage =
            'Google Maps API key is invalid. Please update your API key in the environment configuration.';
        }
      }

      this.trafficError = errorMessage;
    }
  }

  /**
   * Draw traffic route on Leaflet map with color-coded segments
   */
  async drawTrafficRouteOnLeaflet(routeData: RouteData, directionsResult: any) {
    if (!this.map || !routeData.segments || routeData.segments.length === 0)
      return;

    try {
      const L = await import('leaflet');
      const googleMaps = (window as any).google.maps;
      const route = directionsResult.routes[0];
      const leg = route.legs[0];

      // Clear existing traffic polylines
      if (this.trafficRoutePolylines) {
        this.trafficRoutePolylines.forEach((polyline: any) => {
          this.map.removeLayer(polyline);
        });
      }
      this.trafficRoutePolylines = [];

      // Clear existing traffic markers
      if (this.trafficMarkers) {
        this.trafficMarkers.forEach((marker: any) => {
          this.map.removeLayer(marker);
        });
      }
      this.trafficMarkers = [];

      // Decode polyline to get detailed path
      let detailedPath: any[] = [];
      leg.steps.forEach((step: any) => {
        const stepPolyline = step.polyline;
        if (stepPolyline && stepPolyline.points) {
          const stepPath = googleMaps.geometry.encoding.decodePath(
            stepPolyline.points
          );
          detailedPath = detailedPath.concat(stepPath);
        }
      });

      if (detailedPath.length === 0) {
        const overviewPolyline = route.overview_polyline;
        if (overviewPolyline) {
          const polylineString =
            typeof overviewPolyline === 'string'
              ? overviewPolyline
              : overviewPolyline.points || overviewPolyline;
          detailedPath =
            googleMaps.geometry.encoding.decodePath(polylineString);
        }
      }

      // Get markers every 1km
      const markers = this.trafficService.getMarkerCoordinatesFromPath(
        detailedPath,
        1000
      );

      const segments = routeData.segments;
      const totalSeconds = routeData.total_seconds;
      const avgSeconds = totalSeconds / segments.length;

      // Draw each segment with traffic color on Leaflet map
      for (let i = 0; i < segments.length && i < markers.length - 1; i++) {
        const segment = segments[i];
        const startPoint = markers[i];
        const endPoint = markers[i + 1];

        const segSeconds = segment.duration_seconds;
        const trafficColor = this.trafficService.getTrafficColor(
          segSeconds,
          avgSeconds
        );

        // Find path segment between start and end markers
        const segmentPath = this.getPathSegment(
          detailedPath,
          startPoint,
          endPoint
        );

        if (segmentPath.length > 0) {
          // Convert Google Maps LatLng to Leaflet LatLng format
          const leafletPath = segmentPath.map((point: any) => {
            const lat =
              typeof point.lat === 'function' ? point.lat() : point.lat;
            const lng =
              typeof point.lng === 'function' ? point.lng() : point.lng;
            return [lat, lng] as [number, number];
          });

          // Create Leaflet polyline with traffic color
          const polyline = L.polyline(leafletPath, {
            color: trafficColor,
            weight: 8,
            opacity: 0.9,
            smoothFactor: 1,
          });

          // Get traffic status for popup
          const status = this.trafficService.getTrafficStatus(
            segSeconds,
            avgSeconds
          );

          // Add popup with segment info
          polyline.bindPopup(`
            <div style="font-family: 'Segoe UI', sans-serif; min-width: 200px;">
              <strong>Segment ${segment.segment_no}</strong><br>
              <strong>From:</strong> ${segment.from_marker}<br>
              <strong>To:</strong> ${segment.to_marker}<br>
              <strong>Distance:</strong> ${segment.distance}<br>
              <strong>Time:</strong> ${segment.time_required}<br>
              <strong>Status:</strong> <span style="color: ${trafficColor}; font-weight: bold;">${status.text}</span>
            </div>
          `);

          polyline.addTo(this.map);
          this.trafficRoutePolylines.push(polyline);
        }
      }

      // Fit map to show entire route
      if (detailedPath.length > 0) {
        const bounds = L.latLngBounds(
          detailedPath.map((point: any) => {
            const lat =
              typeof point.lat === 'function' ? point.lat() : point.lat;
            const lng =
              typeof point.lng === 'function' ? point.lng() : point.lng;
            return [lat, lng] as [number, number];
          })
        );
        this.map.fitBounds(bounds, { padding: [50, 50] });
      }

      // Add start and end markers
      if (markers.length > 0) {
        const startPoint = markers[0];
        const endPoint = markers[markers.length - 1];

        // Helper function to safely extract lat/lng value
        const getLatLngValue = (point: any, prop: 'lat' | 'lng'): number => {
          const value = point[prop];
          if (typeof value === 'function') {
            return value();
          }
          return typeof value === 'number' ? value : parseFloat(String(value));
        };

        const startLat: number = getLatLngValue(startPoint, 'lat');
        const startLng: number = getLatLngValue(startPoint, 'lng');
        const endLat: number = getLatLngValue(endPoint, 'lat');
        const endLng: number = getLatLngValue(endPoint, 'lng');

        // Start marker
        const startMarker = L.marker([startLat, startLng], {
          icon: L.divIcon({
            className: 'traffic-start-marker',
            html: '<div style="background: #4CAF50; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white;">S</div>',
            iconSize: [24, 24],
          }),
        }).bindPopup(`<strong>Start:</strong> ${leg.start_address}`);
        startMarker.addTo(this.map);
        this.trafficMarkers.push(startMarker);

        // End marker
        const endMarker = L.marker([endLat, endLng], {
          icon: L.divIcon({
            className: 'traffic-end-marker',
            html: '<div style="background: #F44336; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white;">E</div>',
            iconSize: [24, 24],
          }),
        }).bindPopup(`<strong>End:</strong> ${leg.end_address}`);
        endMarker.addTo(this.map);
        this.trafficMarkers.push(endMarker);
      }
    } catch (error) {
      console.error('Error drawing traffic route on Leaflet map:', error);
    }
  }

  /**
   * Display traffic route on Google Maps (kept for reference, but not used)
   */
  async displayTrafficRoute(routeData: RouteData) {
    if (!this.isBrowser) return;

    try {
      await this.trafficService.loadGoogleMaps();

      const google = (window as any).google;
      if (typeof google === 'undefined' || !google.maps) {
        throw new Error('Google Maps API not loaded');
      }

      // Create or get Google Map instance
      const mapElement = document.getElementById('trafficMap');
      if (!mapElement) {
        // Create traffic map container if it doesn't exist
        const trafficMapDiv = document.createElement('div');
        trafficMapDiv.id = 'trafficMap';
        trafficMapDiv.style.width = '100%';
        trafficMapDiv.style.height = '400px';
        trafficMapDiv.style.borderRadius = '8px';
        // You can append this to a specific container in your template
        return;
      }

      // Initialize Google Map
      if (!this.googleMap) {
        const originCoords = routeData.origin.split(',');
        const googleMaps = (window as any).google.maps;

        // Check if element already has a map instance
        if ((mapElement as any)._googleMapInstance) {
          // Clear existing map
          (mapElement as any)._googleMapInstance = null;
        }

        this.googleMap = new googleMaps.Map(mapElement, {
          zoom: 12,
          center: {
            lat: parseFloat(originCoords[0]),
            lng: parseFloat(originCoords[1]),
          },
          mapTypeId: 'roadmap',
        });

        // Store reference
        (mapElement as any)._googleMapInstance = this.googleMap;

        // Add traffic layer
        this.trafficLayer = new googleMaps.TrafficLayer();
        this.trafficLayer.setMap(this.googleMap);
      }

      // Clear previous route
      if (this.directionsRenderer) {
        this.directionsRenderer.setMap(null);
      }
      this.segmentPolylines.forEach((polyline: any) => polyline.setMap(null));
      this.segmentPolylines = [];

      // Display route with directions
      const googleMaps = (window as any).google.maps;
      this.directionsRenderer = new googleMaps.DirectionsRenderer({
        map: this.googleMap,
        suppressMarkers: false,
      });

      const directionsService = new googleMaps.DirectionsService();
      directionsService.route(
        {
          origin: routeData.origin,
          destination: routeData.destination,
          travelMode: googleMaps.TravelMode.DRIVING,
          drivingOptions: {
            departureTime: new Date(routeData.departure_time),
            trafficModel: googleMaps.TrafficModel.BEST_GUESS,
          },
        },
        (result: any, status: any) => {
          if (status === 'OK' && result) {
            this.directionsRenderer.setDirections(result);

            // Draw color-coded segments
            this.drawColorCodedSegments(routeData, result);

            // Fit map to show entire route
            const bounds = new googleMaps.LatLngBounds();
            result.routes[0].bounds.forEach((bound: any) => {
              bounds.extend(bound);
            });
            this.googleMap.fitBounds(bounds);
          }
        }
      );
    } catch (error) {
      console.error('Error displaying traffic route:', error);
      let errorMessage = 'Failed to display traffic route on map';

      if (error instanceof Error) {
        errorMessage = error.message;
        if (
          errorMessage.includes('DeletedApiProjectMapError') ||
          errorMessage.includes('deleted-api-project')
        ) {
          errorMessage =
            'Google Maps API key is invalid. Please update your API key in the environment configuration.';
        }
      }

      this.trafficError = errorMessage;
    }
  }

  /**
   * Draw color-coded segments on the map
   */
  drawColorCodedSegments(routeData: RouteData, directionsResult: any) {
    if (!routeData.segments || routeData.segments.length === 0) return;
    if (!this.googleMap) return;

    const googleMaps = (window as any).google.maps;
    const route = directionsResult.routes[0];
    const leg = route.legs[0];

    // Decode polyline to get detailed path
    let detailedPath: any[] = [];
    leg.steps.forEach((step: any) => {
      // Access polyline property with proper type handling
      const stepPolyline = step.polyline;
      if (stepPolyline && stepPolyline.points) {
        const stepPath = googleMaps.geometry.encoding.decodePath(
          stepPolyline.points
        );
        detailedPath = detailedPath.concat(stepPath);
      }
    });

    if (detailedPath.length === 0) {
      // Access overview_polyline with proper type handling
      const overviewPolyline = route.overview_polyline;
      if (overviewPolyline) {
        const polylineString =
          typeof overviewPolyline === 'string'
            ? overviewPolyline
            : overviewPolyline.points || overviewPolyline;
        detailedPath = googleMaps.geometry.encoding.decodePath(polylineString);
      }
    }

    // Get markers every 1km
    const markers = this.trafficService.getMarkerCoordinatesFromPath(
      detailedPath,
      1000
    );

    const segments = routeData.segments;
    const totalSeconds = routeData.total_seconds;
    const avgSeconds = totalSeconds / segments.length;

    // Draw each segment with traffic color
    for (let i = 0; i < segments.length && i < markers.length - 1; i++) {
      const segment = segments[i];
      const startPoint = markers[i];
      const endPoint = markers[i + 1];

      const segSeconds = segment.duration_seconds;
      const trafficColor = this.trafficService.getTrafficColor(
        segSeconds,
        avgSeconds
      );

      // Find path segment between start and end markers
      const segmentPath = this.getPathSegment(
        detailedPath,
        startPoint,
        endPoint
      );

      if (segmentPath.length > 0) {
        const googleMaps = (window as any).google.maps;
        const polyline = new googleMaps.Polyline({
          path: segmentPath,
          geodesic: true,
          strokeColor: trafficColor,
          strokeOpacity: 0.9,
          strokeWeight: 8,
          map: this.googleMap,
        });

        // Add info window
        const infoWindow = new googleMaps.InfoWindow({
          content: `
            <div style="padding: 5px;">
              <strong>Segment ${segment.segment_no}</strong><br>
              <strong>From:</strong> ${segment.from_marker}<br>
              <strong>To:</strong> ${segment.to_marker}<br>
              <strong>Distance:</strong> ${segment.distance}<br>
              <strong>Time:</strong> ${segment.time_required}<br>
            </div>
          `,
        });

        polyline.addListener('click', () => {
          infoWindow.setPosition(
            segmentPath[Math.floor(segmentPath.length / 2)]
          );
          infoWindow.open(this.googleMap);
        });

        this.segmentPolylines.push(polyline);
      }
    }
  }

  /**
   * Get path segment between two points
   */
  getPathSegment(fullPath: any[], startPoint: any, endPoint: any): any[] {
    if (fullPath.length === 0) return [];

    let startIdx = 0;
    let endIdx = fullPath.length - 1;
    let minStartDist = Infinity;
    let minEndDist = Infinity;

    for (let i = 0; i < fullPath.length; i++) {
      const distToStart = this.trafficService.haversineDistance(
        fullPath[i],
        startPoint
      );
      const distToEnd = this.trafficService.haversineDistance(
        fullPath[i],
        endPoint
      );

      if (distToStart < minStartDist) {
        minStartDist = distToStart;
        startIdx = i;
      }
      if (distToEnd < minEndDist) {
        minEndDist = distToEnd;
        endIdx = i;
      }
    }

    if (startIdx > endIdx) {
      [startIdx, endIdx] = [endIdx, startIdx];
    }

    const segmentPath = fullPath.slice(startIdx, endIdx + 1);

    if (segmentPath.length < 2) {
      return [startPoint, endPoint];
    }

    return segmentPath;
  }

  /**
   * Calculate traffic density statistics
   */
  calculateTrafficDensity(routeData: RouteData) {
    if (!routeData.segments || routeData.segments.length === 0) {
      this.trafficDensity = {
        freeFlow: 0,
        light: 0,
        moderate: 0,
        heavy: 0,
        severe: 0,
      };
      return;
    }

    const segments = routeData.segments;
    const totalSeconds = routeData.total_seconds;
    const avgSeconds = totalSeconds / segments.length;

    // Reset counters
    let freeFlow = 0;
    let light = 0;
    let moderate = 0;
    let heavy = 0;
    let severe = 0;

    segments.forEach((segment) => {
      const segSeconds = segment.duration_seconds;
      const status = this.trafficService.getTrafficStatus(
        segSeconds,
        avgSeconds
      );

      if (status.class === 'traffic-green') freeFlow++;
      else if (status.class === 'traffic-yellow') light++;
      else if (status.class === 'traffic-orange') moderate++;
      else if (status.class === 'traffic-red') heavy++;
      else severe++;
    });

    this.trafficDensity = {
      freeFlow,
      light,
      moderate,
      heavy,
      severe,
    };
  }

  /**
   * Get average time per km
   */
  getAverageTimePerKm(): number {
    if (!this.routeData || this.routeData.total_kms === 0) return 0;
    return (
      Math.round(
        (this.routeData.total_seconds / this.routeData.total_kms / 60) * 100
      ) / 100
    );
  }

  /**
   * Get total time in hours and minutes
   */
  getTotalTimeFormatted(): string {
    if (!this.routeData) return '0m';
    const totalSeconds = this.routeData.total_seconds;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }

  /**
   * Get total time in minutes
   */
  getTotalTimeInMinutes(): number {
    if (!this.routeData) return 0;
    return Math.round((this.routeData.total_seconds / 60) * 100) / 100;
  }

  /**
   * Toggle traffic analysis visibility
   */
  toggleTrafficAnalysis() {
    this.showTrafficAnalysis = !this.showTrafficAnalysis;
    if (this.showTrafficAnalysis && !this.routeData) {
      this.fetchTrafficData();
    } else if (!this.showTrafficAnalysis) {
      // Clear traffic route from map when hiding
      this.clearTrafficRouteFromMap();
    }
  }

  /**
   * Open Traffic Analysis Modal
   */
  async openTrafficAnalysisModal() {
    if (!this.filters.date || !this.filters.projectName) {
      return;
    }

    // Ensure direction is set (default to Increasing)
    if (!this.filters.direction) {
      this.filters.direction = 'Increasing';
    }

    this.isTrafficAnalysisModalOpen = true;
    
    // Set default time to current time if not set
    if (!this.trafficModalTime) {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      this.trafficModalTime = `${hours}:${minutes}`;
    }

    // Set default analysis date to today if not set
    if (!this.trafficAnalysisDate) {
      const today = new Date();
      this.trafficAnalysisDate = today.toISOString().split('T')[0];
    }

    // Clear previous route data to force refetch with correct direction
    this.routeData = null;
    this.bestTravelTime = null;

    // Wait for modal to render, then initialize map and fetch data
    setTimeout(async () => {
      await this.initTrafficModalMap();
      await this.fetchTrafficData();
      if (this.routeData) {
        await this.displayTrafficRouteOnModalMap(this.routeData);
      }
      await this.load24hrTrafficTrend();
      await this.loadForecastTrafficData();
    }, 100);
  }

  /**
   * Close Traffic Analysis Modal
   */
  closeTrafficAnalysisModal() {
    this.isTrafficAnalysisModalOpen = false;
    this.clearTrafficModalMap();
  }

  /**
   * Initialize Google Maps in the modal
   */
  async initTrafficModalMap() {
    if (!this.isBrowser) return;

    try {
      await this.trafficService.loadGoogleMaps();
      const google = (window as any).google;

      if (typeof google === 'undefined' || !google.maps) {
        throw new Error('Google Maps API not loaded');
      }

      // Get project coordinates
      const coords = this.getProjectCoordinatesWithLatLng();
      if (!coords) {
        throw new Error('Could not get project coordinates');
      }

      const center = {
        lat: (coords.startLat + coords.endLat) / 2,
        lng: (coords.startLng + coords.endLng) / 2,
      };

      // Wait for DOM element to be available
      const mapElement = document.getElementById('trafficModalMap');
      if (!mapElement) {
        throw new Error('Map container element not found');
      }

      // Initialize map with mapId for AdvancedMarkerElement support
      // Default to SATELLITE view
      this.trafficModalMap = new google.maps.Map(mapElement, {
        zoom: 12,
        center: center,
        mapTypeId: google.maps.MapTypeId.SATELLITE, // Default to satellite view
        fullscreenControl: true,
        mapTypeControl: true,
        streetViewControl: true,
        mapId: 'TRAFFIC_ANALYSIS_MAP', // Required for AdvancedMarkerElement
      });

      // Add traffic layer
      this.trafficModalTrafficLayer = new google.maps.TrafficLayer();
      this.trafficModalTrafficLayer.setMap(this.trafficModalMap);
    } catch (error: any) {
      console.error('Error initializing traffic modal map:', error);
      this.trafficError = error.message || 'Failed to initialize map';
    }
  }

  /**
   * Display traffic route on modal map
   */
  async displayTrafficRouteOnModalMap(routeData: RouteData) {
    if (!this.isBrowser || !this.trafficModalMap) return;

    try {
      await this.trafficService.loadGoogleMaps();
      const google = (window as any).google;

      if (typeof google === 'undefined' || !google.maps) {
        throw new Error('Google Maps API not loaded');
      }

      // Clear previous route
      this.clearTrafficModalMap();

      const directionsService = new google.maps.DirectionsService();
      const directionsResult = await new Promise<any>((resolve, reject) => {
        directionsService.route(
          {
            origin: routeData.origin,
            destination: routeData.destination,
            travelMode: google.maps.TravelMode.DRIVING,
            drivingOptions: {
              departureTime: new Date(routeData.departure_time),
              trafficModel: google.maps.TrafficModel.BEST_GUESS,
            },
          },
          (result: any, status: any) => {
            if (status === 'OK' && result) {
              resolve(result);
            } else {
              reject(new Error(`Directions request failed: ${status}`));
            }
          }
        );
      });

      const route = directionsResult.routes[0];
      const leg = route.legs[0];

      // Decode polyline to get detailed path
      let detailedPath: any[] = [];
      leg.steps.forEach((step: any) => {
        const stepPolyline = step.polyline;
        if (stepPolyline && stepPolyline.points) {
          const stepPath = google.maps.geometry.encoding.decodePath(stepPolyline.points);
          detailedPath = detailedPath.concat(stepPath);
        }
      });

      if (detailedPath.length === 0) {
        const overviewPolyline = route.overview_polyline;
        if (overviewPolyline) {
          const polylineString = typeof overviewPolyline === 'string'
            ? overviewPolyline
            : overviewPolyline.points || overviewPolyline;
          detailedPath = google.maps.geometry.encoding.decodePath(polylineString);
        }
      }

      const markers = this.trafficService.getMarkerCoordinatesFromPath(detailedPath, 1000);

      // Draw color-coded segments
      this.drawColorCodedSegmentsOnModalMap(routeData, detailedPath, markers, leg);

      // Fit map to show entire route
      if (detailedPath.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        detailedPath.forEach((point: any) => {
          const lat = this.getLatLngValue(point.lat);
          const lng = this.getLatLngValue(point.lng);
          bounds.extend(new google.maps.LatLng(lat, lng));
        });
        this.trafficModalMap.fitBounds(bounds);
      }

      // Add start and end markers
      if (markers.length > 0) {
        const startPoint = markers[0];
        const endPoint = markers[markers.length - 1];

        const startLat: number = this.getLatLngValue(startPoint.lat);
        const startLng: number = this.getLatLngValue(startPoint.lng);
        const endLat: number = this.getLatLngValue(endPoint.lat);
        const endLng: number = this.getLatLngValue(endPoint.lng);

        // Get chainage information from coordinates
        const coords = this.getProjectCoordinatesWithLatLng();
        const startChainage = coords?.startChainage || this.filters.chainageRange.min;
        const endChainage = coords?.endChainage || this.filters.chainageRange.max;

        // Create start marker with chainage label
        const startLabel = document.createElement('div');
        startLabel.innerHTML = `
          <div style="
            background: #00bfff;
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            font-weight: bold;
            font-size: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            border: 2px solid white;
            text-align: center;
          ">
            <div>Start</div>
            <div style="font-size: 10px; margin-top: 2px;">Ch: ${startChainage.toFixed(3)}</div>
          </div>
        `;

        const startMarker = new google.maps.marker.AdvancedMarkerElement({
          map: this.trafficModalMap,
          position: { lat: startLat, lng: startLng },
          content: startLabel,
          title: `Start Chainage: ${startChainage.toFixed(3)} - ${leg.start_address}`,
        });
        this.trafficModalMarkers.push(startMarker);

        // Create end marker with chainage label
        const endLabel = document.createElement('div');
        endLabel.innerHTML = `
          <div style="
            background: #F44336;
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            font-weight: bold;
            font-size: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            border: 2px solid white;
            text-align: center;
          ">
            <div>End</div>
            <div style="font-size: 10px; margin-top: 2px;">Ch: ${endChainage.toFixed(3)}</div>
          </div>
        `;

        const endMarker = new google.maps.marker.AdvancedMarkerElement({
          map: this.trafficModalMap,
          position: { lat: endLat, lng: endLng },
          content: endLabel,
          title: `End Chainage: ${endChainage.toFixed(3)} - ${leg.end_address}`,
        });
        this.trafficModalMarkers.push(endMarker);
      }
    } catch (error: any) {
      console.error('Error displaying traffic route on modal map:', error);
      this.trafficError = error.message || 'Failed to display route on map';
    }
  }

  /**
   * Draw color-coded segments on modal map
   */
  drawColorCodedSegmentsOnModalMap(
    routeData: RouteData,
    detailedPath: any[],
    markers: any[],
    leg: any
  ) {
    if (!this.trafficModalMap || !routeData.segments || routeData.segments.length === 0) {
      return;
    }

    const google = (window as any).google;
    if (typeof google === 'undefined' || !google.maps) return;

    const totalSeconds = routeData.total_seconds;
    const averageDuration = totalSeconds / routeData.segments.length;

    let startIdx = 0;

    routeData.segments.forEach((segment, i) => {
      const endPoint = i < markers.length - 1 ? markers[i + 1] : markers[markers.length - 1];
      
      // Find the end index in detailedPath
      let endIdx = detailedPath.length - 1;
      if (i < markers.length - 1) {
        for (let j = startIdx; j < detailedPath.length; j++) {
          const distToEnd = this.trafficService.haversineDistance(
            detailedPath[j],
            endPoint
          );
          if (distToEnd < 100) {
            endIdx = j;
            break;
          }
        }
      }

      // Ensure we have at least 2 points
      if (endIdx <= startIdx) {
        endIdx = Math.min(startIdx + 1, detailedPath.length - 1);
      }

      const segmentPath = detailedPath.slice(startIdx, endIdx + 1);
      startIdx = endIdx;

      if (segmentPath.length < 2) return;

      const trafficColor = this.trafficService.getTrafficColor(
        segment.duration_seconds || 0,
        averageDuration
      );

      const polyline = new google.maps.Polyline({
        path: segmentPath.map((point: any) => ({
          lat: this.getLatLngValue(point.lat),
          lng: this.getLatLngValue(point.lng),
        })),
        geodesic: true,
        strokeColor: trafficColor,
        strokeOpacity: 1.0,
        strokeWeight: 6,
        map: this.trafficModalMap,
      });

      // Add info window on click
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <strong>Segment ${segment.segment_no}</strong><br>
            Duration: ${Math.round(segment.duration_seconds || 0)}s<br>
            Status: ${this.trafficService.getTrafficStatus(segment.duration_seconds || 0, averageDuration)}
          </div>
        `,
      });

      polyline.addListener('click', () => {
        infoWindow.setPosition(segmentPath[Math.floor(segmentPath.length / 2)]);
        infoWindow.open(this.trafficModalMap);
      });

      this.trafficModalSegmentPolylines.push(polyline);
    });
  }

  /**
   * Clear traffic modal map
   */
  clearTrafficModalMap() {
    if (this.trafficModalSegmentPolylines) {
      this.trafficModalSegmentPolylines.forEach((polyline: any) => {
        polyline.setMap(null);
      });
      this.trafficModalSegmentPolylines = [];
    }

    if (this.trafficModalMarkers) {
      this.trafficModalMarkers.forEach((marker: any) => {
        marker.setMap(null);
      });
      this.trafficModalMarkers = [];
    }

    if (this.trafficModalTrafficLayer) {
      this.trafficModalTrafficLayer.setMap(null);
      this.trafficModalTrafficLayer = null;
    }
  }

  /**
   * Handle traffic modal time change
   */
  onTrafficModalTimeChange() {
    // Optionally refetch traffic data with new time
    if (this.isTrafficAnalysisModalOpen && this.routeData) {
      this.getLiveTraffic();
    }
  }

  /**
   * Handle traffic analysis date change
   */
  onTrafficAnalysisDateChange() {
    // Reload 24hr trend and forecast when date changes
    if (this.isTrafficAnalysisModalOpen) {
      this.load24hrTrafficTrend();
      this.loadForecastTrafficData();
    }
  }

  /**
   * Handle traffic modal direction change
   */
  onTrafficModalDirectionChange() {
    // Clear previous route data and map
    if (this.isTrafficAnalysisModalOpen) {
      this.routeData = null;
      this.clearTrafficModalMap();
      // Refetch traffic data with new direction
      this.getLiveTraffic();
    }
  }

  /**
   * Get live traffic data
   */
  async getLiveTraffic() {
    if (!this.filters.date || !this.filters.projectName) {
      return;
    }

    this.isFetchingTraffic = true;
    this.trafficError = null;

    try {
      await this.fetchTrafficData();
      if (this.routeData && this.trafficModalMap) {
        await this.displayTrafficRouteOnModalMap(this.routeData);
      }
      await this.load24hrTrafficTrend();
      await this.loadForecastTrafficData();
    } catch (error: any) {
      console.error('Error getting live traffic:', error);
      this.trafficError = error.message || 'Failed to get live traffic data';
    } finally {
      this.isFetchingTraffic = false;
    }
  }

  /**
   * Load 24hr traffic trend data (last 24 hours from selected date/time)
   */
  async load24hrTrafficTrend() {
    if (!this.filters.date || !this.filters.projectName) {
      return;
    }

    this.isLoading24hrTrafficTrend = true;
    this.has24hrTrafficData = false;
    this.bestTravelTime = null;
    this.totalTravelTime = null;
    this.trafficTrendProgress = 0;

    try {
      const coords = this.getProjectCoordinatesWithLatLng();
      if (!coords) {
        throw new Error('Could not get project coordinates');
      }

      const origin = coords.origin;
      const destination = coords.destination;

      // Use analysis date or current date
      const now = new Date();
      let baseDate = new Date(now);
      
      if (this.trafficAnalysisDate) {
        baseDate = new Date(this.trafficAnalysisDate);
      }

      // Set time from modal time input or use current time
      if (this.trafficModalTime) {
        const [hours, minutes] = this.trafficModalTime.split(':').map(Number);
        baseDate.setHours(hours || now.getHours(), minutes || now.getMinutes(), 0, 0);
      }

      // Allow past dates for historical trend (we'll use cached data for past dates)

      // Fetch traffic data for past 24 hours - going backwards from base date
      // Fetch every 2 hours (12 data points) for faster loading
      const trafficDataPoints: any[] = [];
      const labels: string[] = [];
      const hoursToFetch = [0, -2, -4, -6, -8, -10, -12, -14, -16, -18, -20, -22]; // Every 2 hours going backwards

      // Prepare all fetch promises for parallel execution
      const fetchPromises = hoursToFetch.map(async (hourOffset) => {
        const hourDate = new Date(baseDate);
        hourDate.setHours(hourDate.getHours() + hourOffset); // Negative offset = past

        // Create cache key
        const cacheKey = `${origin}_${destination}_${hourDate.toISOString()}`;
        
        // Check cache first
        if (this.trafficDataCache.has(cacheKey)) {
          const cachedData = this.trafficDataCache.get(cacheKey)!;
          return {
            hourOffset,
            hourDate,
            routeData: cachedData,
            fromCache: true,
          };
        }

        // For past dates, only use cached data (Google Maps API doesn't support past dates)
        if (hourDate < now) {
          // Try to find similar cached data
          let bestMatch: { key: string; data: any; timeDiff: number } | null = null;
          
          for (const key of this.trafficDataCache.keys()) {
            if (key.includes(origin) && key.includes(destination)) {
              try {
                const keyParts = key.split('_');
                const dateStr = keyParts[keyParts.length - 1];
                const cachedDate = new Date(dateStr);
                
                if (!isNaN(cachedDate.getTime())) {
                  const hourDiff = Math.abs(cachedDate.getHours() - hourDate.getHours());
                  const minDiff = Math.abs(cachedDate.getMinutes() - hourDate.getMinutes());
                  const totalMinDiff = hourDiff * 60 + minDiff;
                  
                  if (!bestMatch || totalMinDiff < bestMatch.timeDiff) {
                    bestMatch = {
                      key,
                      data: this.trafficDataCache.get(key)!,
                      timeDiff: totalMinDiff,
                    };
                  }
                }
              } catch (e) {
                continue;
              }
            }
          }
          
          if (bestMatch && bestMatch.timeDiff < 180) { // Within 3 hours
            this.trafficDataCache.set(cacheKey, bestMatch.data);
            return {
              hourOffset,
              hourDate,
              routeData: bestMatch.data,
              fromCache: true,
            };
          }
          
          // If no similar data, try to use average from all cached data
          const routeCacheKeys = Array.from(this.trafficDataCache.keys()).filter(key => 
            key.includes(origin) && key.includes(destination)
          );
          
          if (routeCacheKeys.length > 0) {
            const cachedDataArray = routeCacheKeys.map(key => this.trafficDataCache.get(key)!);
            const avgSeconds = cachedDataArray.reduce((sum, d) => sum + d.total_seconds, 0) / cachedDataArray.length;
            const avgKms = cachedDataArray.reduce((sum, d) => sum + d.total_kms, 0) / cachedDataArray.length;
            const sampleData = cachedDataArray[0];
            
            // Format time strings
            const totalMinutes = Math.floor(avgSeconds / 60);
            const totalHours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            const totalTimeStr = totalHours > 0 ? `${totalHours} hr ${minutes} min` : `${minutes} min`;
            
            const syntheticData: RouteData = {
              route: sampleData?.route || `${origin} to ${destination}`,
              total_seconds: avgSeconds,
              total_kms: avgKms,
              total_time: totalTimeStr,
              date_times: hourDate.toISOString(),
              departure_time: hourDate.toISOString(),
              segments: sampleData?.segments || [],
              origin: sampleData?.origin || origin,
              destination: sampleData?.destination || destination,
            };
            
            this.trafficDataCache.set(cacheKey, syntheticData);
            return {
              hourOffset,
              hourDate,
              routeData: syntheticData,
              fromCache: true,
            };
          }
          
          return null;
        }

        // Fetch from API for current/future dates
        try {
          const routeData = await this.trafficService.processRouteWithTraffic(
            origin,
            destination,
            hourDate
          );
          
          // Cache the data
          if (routeData) {
            this.trafficDataCache.set(cacheKey, routeData);
          }
          
          return {
            hourOffset,
            hourDate,
            routeData,
            fromCache: false,
          };
        } catch (error) {
          console.warn(`Failed to fetch traffic data for hour ${hourOffset}:`, error);
          // Try to use cached data from a similar time if available
          const similarKey = Array.from(this.trafficDataCache.keys()).find(key => 
            key.startsWith(`${origin}_${destination}_`)
          );
          if (similarKey) {
            const cachedData = this.trafficDataCache.get(similarKey)!;
            return {
              hourOffset,
              hourDate,
              routeData: cachedData,
              fromCache: true,
            };
          }
          return null;
        }
      });

      // Execute all fetches in parallel (with batching to avoid overwhelming API)
      const batchSize = 4; // Process 4 requests at a time
      const results: any[] = [];
      const totalBatches = Math.ceil(fetchPromises.length / batchSize);
      
      for (let i = 0; i < fetchPromises.length; i += batchSize) {
        const batch = fetchPromises.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch);
        results.push(...batchResults.filter(r => r !== null));
        
        // Update progress
        const currentBatch = Math.floor(i / batchSize) + 1;
        this.trafficTrendProgress = Math.round((currentBatch / totalBatches) * 100);
      }

      // Sort results by hour offset (most recent first, then going backwards)
      results.sort((a, b) => b.hourOffset - a.hourOffset); // Descending for past dates
      
      results.forEach((result) => {
        if (result && result.routeData) {
          // Create label with date and time for day-wise representation
          const dateStr = result.hourDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
          const timeStr = result.hourDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });
          const timeLabel = `${dateStr} ${timeStr}`;

          trafficDataPoints.push({
            time: result.hourDate.toISOString(),
            totalSeconds: result.routeData.total_seconds,
            totalKms: result.routeData.total_kms,
            label: timeLabel,
            date: result.hourDate.toISOString().split('T')[0],
            hourOffset: result.hourOffset,
            dateOnly: dateStr,
            timeOnly: timeStr,
          });
          labels.push(timeLabel);
        }
      });

      if (trafficDataPoints.length > 0) {
        this.has24hrTrafficData = true;
        
        // Find best travel time (lowest travel time)
        const bestTimeData = trafficDataPoints.reduce((best, current) => {
          return current.totalSeconds < best.totalSeconds ? current : best;
        }, trafficDataPoints[0]);

        this.bestTravelTime = {
          time: bestTimeData.label,
          minutes: bestTimeData.totalSeconds / 60,
          date: bestTimeData.date,
        };

        // Calculate total travel time statistics
        const times = trafficDataPoints.map(d => d.totalSeconds / 60);
        const totalMinutes = times.reduce((sum, time) => sum + time, 0);
        const averageTime = totalMinutes / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);

        this.totalTravelTime = {
          average: averageTime,
          min: minTime,
          max: maxTime,
        };

        this.update24hrTrafficTrendChart(trafficDataPoints, labels, bestTimeData);
      } else {
        this.has24hrTrafficData = false;
        this.totalTravelTime = null;
      }
    } catch (error: any) {
      console.error('Error loading 24hr traffic trend:', error);
      this.has24hrTrafficData = false;
    } finally {
      this.isLoading24hrTrafficTrend = false;
    }
  }

  /**
   * Update 24hr traffic trend chart with best time highlighting
   */
  update24hrTrafficTrendChart(dataPoints: any[], labels: string[], bestTimeData?: any) {
    const times = dataPoints.map((d) => d.totalSeconds / 60); // Convert to minutes
    const bestTimeIndex = bestTimeData 
      ? dataPoints.findIndex(d => d.time === bestTimeData.time)
      : -1;

    this.traffic24hrTrendChartOptions = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          const param = params[0];
          const dataPoint = dataPoints[param.dataIndex];
          return `
            <div style="padding: 8px;">
              <strong>${param.name}</strong><br>
              Travel Time: ${(dataPoint.totalSeconds / 60).toFixed(2)} minutes<br>
              Distance: ${dataPoint.totalKms.toFixed(2)} km
            </div>
          `;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: {
          rotate: 45,
          interval: 0, // Show all labels for day-wise representation
          fontSize: 10,
          formatter: (value: string) => {
            // Format: "Jan 15 2:00 PM" -> "Jan 15\n2:00 PM" for better readability
            const parts = value.split(' ');
            if (parts.length >= 3) {
              const datePart = parts.slice(0, 2).join(' ');
              const timePart = parts.slice(2).join(' ');
              return `${datePart}\n${timePart}`;
            }
            return value;
          },
        },
      },
      yAxis: {
        type: 'value',
        name: 'Travel Time (minutes)',
        nameLocation: 'middle',
        nameGap: 50,
      },
      series: [
        {
          name: 'Travel Time',
          type: 'bar',
          data: times.map((time, index) => ({
            value: time,
            itemStyle: {
              // Highlight best time with special color
              color: index === bestTimeIndex 
                ? '#4CAF50' // Green for best time
                : (() => {
                    const max = Math.max(...times);
                    const min = Math.min(...times);
                    const ratio = (time - min) / (max - min);
                    
                    if (ratio < 0.2) return '#00bfff'; // Sky blue - Free Flow
                    if (ratio < 0.4) return '#ffeb3b'; // Yellow - Light
                    if (ratio < 0.6) return '#ff9800'; // Orange - Moderate
                    if (ratio < 0.8) return '#f44336'; // Red - Heavy
                    return '#b71c1c'; // Dark red - Severe
                  })(),
              borderColor: index === bestTimeIndex ? '#2E7D32' : 'transparent',
              borderWidth: index === bestTimeIndex ? 3 : 0,
            },
          })),
          label: {
            show: bestTimeIndex >= 0,
            position: 'top',
            formatter: (params: any) => {
              if (params.dataIndex === bestTimeIndex) {
                return '⭐ Best';
              }
              return '';
            },
            color: '#2E7D32',
            fontWeight: 'bold',
            fontSize: 12,
          },
          markPoint: bestTimeIndex >= 0 ? {
            data: [
              {
                name: 'Best Time',
                coord: [bestTimeIndex, times[bestTimeIndex]],
                value: times[bestTimeIndex].toFixed(1) + ' min',
                itemStyle: {
                  color: '#4CAF50',
                },
                label: {
                  color: '#fff',
                  fontWeight: 'bold',
                },
              },
            ],
          } : undefined,
        },
      ],
    };
  }

  /**
   * Clear traffic route polylines and markers from Leaflet map
   */
  clearTrafficRouteFromMap() {
    if (this.map) {
      // Clear traffic polylines
      if (this.trafficRoutePolylines) {
        this.trafficRoutePolylines.forEach((polyline: any) => {
          this.map.removeLayer(polyline);
        });
        this.trafficRoutePolylines = [];
      }

      // Clear traffic markers
      if (this.trafficMarkers) {
        this.trafficMarkers.forEach((marker: any) => {
          this.map.removeLayer(marker);
        });
        this.trafficMarkers = [];
      }
    }
  }

  /**
   * Load forecast traffic data for next 24 hours + past 1 week
   */
  async loadForecastTrafficData() {
    if (!this.filters.date || !this.filters.projectName) {
      return;
    }

    this.isLoadingForecastTraffic = true;
    this.hasForecastTrafficData = false;
    this.forecastBestTime = null;
    this.forecastProgress = 0;
    this.forecast24hrData = [];
    this.forecastWeekData = [];

    try {
      const coords = this.getProjectCoordinatesWithLatLng();
      if (!coords) {
        throw new Error('Could not get project coordinates');
      }

      const origin = coords.origin;
      const destination = coords.destination;

      // Use current time as base for forecast (always future predictions)
      const now = new Date();
      const baseTime = new Date(now);
      
      // Set time from modal if available, but ensure it's in the future
      if (this.trafficModalTime) {
        const [hours, minutes] = this.trafficModalTime.split(':').map(Number);
        baseTime.setHours(hours || now.getHours(), minutes || now.getMinutes(), 0, 0);
        
        // If time is in the past, use current time
        if (baseTime < now) {
          baseTime.setTime(now.getTime());
        }
      }

      // Fetch 24hr forecast data (every 2 hours for performance)
      const forecast24hrData: any[] = [];
      const hoursToFetch = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]; // Every 2 hours

      // Fetch past 1 week data (going backwards from today, daily at same time)
      const forecastWeekData: any[] = [];
      const pastDaysToFetch = [1, 2, 3, 4, 5, 6, 7]; // Past 7 days

      // Prepare all fetch promises for parallel execution
      const allFetchPromises: any[] = [];

      // 24hr forecast promises (future)
      hoursToFetch.forEach((hourOffset) => {
        const hourDate = new Date(baseTime);
        hourDate.setHours(hourDate.getHours() + hourOffset);
        allFetchPromises.push({
          type: '24hr',
          hourOffset,
          date: hourDate,
        });
      });

      // Past week promises (going backwards)
      pastDaysToFetch.forEach((dayOffset) => {
        const dayDate = new Date(baseTime);
        dayDate.setDate(dayDate.getDate() - dayOffset); // Go backwards
        // Use same time of day as base time
        dayDate.setHours(baseTime.getHours(), baseTime.getMinutes(), 0, 0);
        allFetchPromises.push({
          type: 'week',
          dayOffset: -dayOffset, // Negative to indicate past
          date: dayDate,
        });
      });

      // Create fetch function
      const fetchData = async (item: any) => {
        const cacheKey = `forecast_${item.type}_${origin}_${destination}_${item.date.toISOString()}`;
        
        // Check cache first (especially important for past dates)
        if (this.trafficDataCache.has(cacheKey)) {
          const cachedData = this.trafficDataCache.get(cacheKey)!;
          return { ...item, routeData: cachedData, fromCache: true };
        }

        // For past dates, Google Maps API won't work, so try to find similar cached data
        if (item.date < now) {
          // Try to find cached data from similar time
          const similarKey = Array.from(this.trafficDataCache.keys()).find(key => {
            const keyParts = key.split('_');
            if (keyParts.length >= 4 && keyParts[0] === 'forecast' && keyParts[1] === item.type) {
              const cachedDate = new Date(keyParts[keyParts.length - 1]);
              // Same time of day, different date
              return cachedDate.getHours() === item.date.getHours() && 
                     cachedDate.getMinutes() === item.date.getMinutes();
            }
            return false;
          });
          
          if (similarKey) {
            const cachedData = this.trafficDataCache.get(similarKey)!;
            // Store with new key for future reference
            this.trafficDataCache.set(cacheKey, cachedData);
            return { ...item, routeData: cachedData, fromCache: true };
          }
          // No cached data available for past dates
          return null;
        }

        // Fetch from API (only for future dates)
        try {
          const routeData = await this.trafficService.processRouteWithTraffic(
            origin,
            destination,
            item.date
          );
          
          // Cache the data
          if (routeData) {
            this.trafficDataCache.set(cacheKey, routeData);
          }
          
          return { ...item, routeData, fromCache: false };
        } catch (error) {
          console.warn(`Failed to fetch forecast traffic data:`, error);
          return null;
        }
      };

      // Execute all fetches in parallel (with batching)
      const batchSize = 4;
      const totalBatches = Math.ceil(allFetchPromises.length / batchSize);
      
      for (let i = 0; i < allFetchPromises.length; i += batchSize) {
        const batch = allFetchPromises.slice(i, i + batchSize);
        const batchPromises = batch.map(item => fetchData(item));
        const batchResults = await Promise.all(batchPromises);
        
        // Separate 24hr and week data
        batchResults.forEach((result) => {
          if (result && result.routeData) {
            if (result.type === '24hr') {
              const timeLabel = result.date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              });
              forecast24hrData.push({
                time: result.date.toISOString(),
                totalSeconds: result.routeData.total_seconds,
                totalKms: result.routeData.total_kms,
                label: timeLabel,
                date: result.date.toISOString().split('T')[0],
                hourOffset: result.hourOffset,
              });
            } else if (result.type === 'week') {
              const dateLabel = result.date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              });
              forecastWeekData.push({
                time: result.date.toISOString(),
                totalSeconds: result.routeData.total_seconds,
                totalKms: result.routeData.total_kms,
                label: dateLabel,
                date: result.date.toISOString().split('T')[0],
                dayOffset: result.dayOffset,
              });
            }
          }
        });
        
        // Update progress
        const currentBatch = Math.floor(i / batchSize) + 1;
        this.forecastProgress = Math.round((currentBatch / totalBatches) * 100);
      }

      // Sort data (week data should be sorted by dayOffset descending for past dates)
      forecast24hrData.sort((a, b) => a.hourOffset - b.hourOffset);
      forecastWeekData.sort((a, b) => b.dayOffset - a.dayOffset); // Descending for past dates

      this.forecast24hrData = forecast24hrData;
      this.forecastWeekData = forecastWeekData;

      if (forecast24hrData.length > 0 || forecastWeekData.length > 0) {
        this.hasForecastTrafficData = true;
        
        // Find best forecast time from both datasets (include month if loaded)
        const allForecastData = [...forecast24hrData, ...forecastWeekData, ...this.forecastMonthData];
        const bestTimeData = allForecastData.reduce((best, current) => {
          return current.totalSeconds < best.totalSeconds ? current : best;
        }, allForecastData[0]);

        this.forecastBestTime = {
          time: bestTimeData.label,
          minutes: bestTimeData.totalSeconds / 60,
          is24hr: forecast24hrData.some(d => d.time === bestTimeData.time),
        };

        this.updateForecastTrafficChart(forecast24hrData, forecastWeekData, this.forecastMonthData, bestTimeData);
      } else {
        this.hasForecastTrafficData = false;
      }
    } catch (error: any) {
      console.error('Error loading forecast traffic data:', error);
      this.hasForecastTrafficData = false;
    } finally {
      this.isLoadingForecastTraffic = false;
    }
  }

  /**
   * Load past 1 month traffic data
   */
  async loadPastMonthTrafficData() {
    if (!this.filters.date || !this.filters.projectName) {
      return;
    }

    this.isLoadingMonthData = true;
    this.showMonthData = true;

    try {
      const coords = this.getProjectCoordinatesWithLatLng();
      if (!coords) {
        throw new Error('Could not get project coordinates');
      }

      const origin = coords.origin;
      const destination = coords.destination;

      const now = new Date();
      const baseTime = new Date(now);
      
      // Set time from modal if available
      if (this.trafficModalTime) {
        const [hours, minutes] = this.trafficModalTime.split(':').map(Number);
        baseTime.setHours(hours || now.getHours(), minutes || now.getMinutes(), 0, 0);
      }

      // Fetch past 1 month data (daily, going backwards)
      const forecastMonthData: any[] = [];
      const pastDaysToFetch: number[] = [];
      
      // Generate past 30 days
      for (let i = 1; i <= 30; i++) {
        pastDaysToFetch.push(i);
      }

      // Create fetch function (similar to week data)
      const fetchData = async (dayOffset: number) => {
        const dayDate = new Date(baseTime);
        dayDate.setDate(dayDate.getDate() - dayOffset); // Go backwards
        dayDate.setHours(baseTime.getHours(), baseTime.getMinutes(), 0, 0);
        
        const cacheKey = `forecast_month_${origin}_${destination}_${dayDate.toISOString()}`;
        
        // Check cache first
        if (this.trafficDataCache.has(cacheKey)) {
          const cachedData = this.trafficDataCache.get(cacheKey)!;
          return { dayOffset, date: dayDate, routeData: cachedData, fromCache: true };
        }

        // For past dates, try to find similar cached data from any previous fetch
        // Look for data with same time of day from any date
        let similarKey: string | undefined;
        let bestMatch: { key: string; data: any; timeDiff: number } | null = null;
        
        for (const key of this.trafficDataCache.keys()) {
          try {
            // Try to parse date from various cache key formats
            let cachedDate: Date | null = null;
            
            // Format: forecast_month_origin_dest_ISOString
            if (key.includes('forecast_month_') || key.includes('forecast_')) {
              const keyParts = key.split('_');
              const dateStr = keyParts[keyParts.length - 1];
              cachedDate = new Date(dateStr);
            } 
            // Format: origin_dest_ISOString
            else if (key.includes(origin) && key.includes(destination)) {
              const keyParts = key.split('_');
              const dateStr = keyParts[keyParts.length - 1];
              cachedDate = new Date(dateStr);
            }
            
            if (cachedDate && !isNaN(cachedDate.getTime())) {
              // Same time of day (within 1 hour)
              const hourDiff = Math.abs(cachedDate.getHours() - dayDate.getHours());
              const minDiff = Math.abs(cachedDate.getMinutes() - dayDate.getMinutes());
              const totalMinDiff = hourDiff * 60 + minDiff;
              
              // Prefer exact match, then closest match within 2 hours
              if (totalMinDiff < 120) {
                if (!bestMatch || totalMinDiff < bestMatch.timeDiff) {
                  bestMatch = {
                    key,
                    data: this.trafficDataCache.get(key)!,
                    timeDiff: totalMinDiff,
                  };
                }
              }
            }
          } catch (e) {
            // Skip invalid keys
            continue;
          }
        }
        
        if (bestMatch) {
          // Use the best matching cached data
          this.trafficDataCache.set(cacheKey, bestMatch.data);
          return { dayOffset, date: dayDate, routeData: bestMatch.data, fromCache: true };
        }
        
        // If no similar data found, try to use average from all cached data for this route
        const routeCacheKeys = Array.from(this.trafficDataCache.keys()).filter(key => 
          key.includes(origin) && key.includes(destination)
        );
        
        if (routeCacheKeys.length > 0) {
          const cachedDataArray = routeCacheKeys.map(key => this.trafficDataCache.get(key)!);
          const avgSeconds = cachedDataArray.reduce((sum, d) => sum + d.total_seconds, 0) / cachedDataArray.length;
          const avgKms = cachedDataArray.reduce((sum, d) => sum + d.total_kms, 0) / cachedDataArray.length;
          const sampleData = cachedDataArray[0];
          
          // Format time strings
          const totalMinutes = Math.floor(avgSeconds / 60);
          const totalHours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          const totalTimeStr = totalHours > 0 ? `${totalHours} hr ${minutes} min` : `${minutes} min`;
          
          // Create synthetic data based on average
          const syntheticData: RouteData = {
            route: sampleData?.route || `${origin} to ${destination}`,
            total_seconds: avgSeconds,
            total_kms: avgKms,
            total_time: totalTimeStr,
            date_times: dayDate.toISOString(),
            departure_time: dayDate.toISOString(),
            segments: sampleData?.segments || [],
            origin: sampleData?.origin || origin,
            destination: sampleData?.destination || destination,
          };
          
          this.trafficDataCache.set(cacheKey, syntheticData);
          return { dayOffset, date: dayDate, routeData: syntheticData, fromCache: true };
        }
        
        // No cached data available for past dates
        console.warn(`No cached data found for past date: ${dayDate.toISOString()}`);
        return null;
      };

      // Execute fetches in batches
      const batchSize = 5;
      const totalBatches = Math.ceil(pastDaysToFetch.length / batchSize);
      
      for (let i = 0; i < pastDaysToFetch.length; i += batchSize) {
        const batch = pastDaysToFetch.slice(i, i + batchSize);
        const batchPromises = batch.map(dayOffset => fetchData(dayOffset));
        const batchResults = await Promise.all(batchPromises);
        
        batchResults.forEach((result) => {
          if (result && result.routeData) {
            const dateLabel = result.date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });
            forecastMonthData.push({
              time: result.date.toISOString(),
              totalSeconds: result.routeData.total_seconds,
              totalKms: result.routeData.total_kms,
              label: dateLabel,
              date: result.date.toISOString().split('T')[0],
              dayOffset: -result.dayOffset, // Negative for past
            });
          }
        });
        
        // Update progress
        const currentBatch = Math.floor(i / batchSize) + 1;
        this.forecastProgress = Math.round((currentBatch / totalBatches) * 100);
      }

      // Sort by dayOffset descending (most recent first)
      forecastMonthData.sort((a, b) => b.dayOffset - a.dayOffset);
      this.forecastMonthData = forecastMonthData;

      if (forecastMonthData.length === 0) {
        console.warn('No month data loaded. Try loading 24hr trend or forecast data first to populate cache.');
        // Show a message to user
        this.trafficError = 'No cached data available for past month. Please load 24hr trend data first to populate cache.';
      } else {
        console.log(`Loaded ${forecastMonthData.length} days of month data`);
        this.trafficError = null;
      }

      // Update chart with month data
      this.updateForecastTrafficChart(
        this.forecast24hrData, 
        this.forecastWeekData, 
        forecastMonthData, 
        this.forecastBestTime
      );
    } catch (error: any) {
      console.error('Error loading past month traffic data:', error);
      this.trafficError = error.message || 'Failed to load past month traffic data';
    } finally {
      this.isLoadingMonthData = false;
    }
  }

  /**
   * Update forecast traffic chart with 24hr, past week, and past month data
   */
  updateForecastTrafficChart(forecast24hrData: any[], forecastWeekData: any[], forecastMonthData: any[] = [], bestTimeData?: any) {
    // Prepare 24hr data
    const times24hr = forecast24hrData.map((d) => d.totalSeconds / 60);
    const labels24hr = forecast24hrData.map((d) => d.label);
    
    // Prepare week data (past)
    const timesWeek = forecastWeekData.map((d) => d.totalSeconds / 60);
    const labelsWeek = forecastWeekData.map((d) => d.label);
    
    // Prepare month data (past)
    const timesMonth = forecastMonthData.map((d) => d.totalSeconds / 60);
    const labelsMonth = forecastMonthData.map((d) => d.label);
    
    // Combine labels (past week, past month, then 24hr future)
    const allLabels = [...labelsWeek, ...labelsMonth, ...labels24hr];
    const allTimes = [...timesWeek, ...timesMonth, ...times24hr];
    const allDataPoints = [...forecastWeekData, ...forecastMonthData, ...forecast24hrData];
    
    // Find best time index
    const bestTimeIndex = bestTimeData 
      ? allDataPoints.findIndex(d => d.time === bestTimeData.time)
      : -1;

    // Calculate color ranges based on all data
    if (allTimes.length === 0) {
      this.trafficForecastChartOptions = {};
      return;
    }
    
    const maxTime = Math.max(...allTimes);
    const minTime = Math.min(...allTimes);

    this.trafficForecastChartOptions = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          let tooltipContent = '<div style="padding: 8px;">';
          params.forEach((param: any, index: number) => {
            const dataPoint = allDataPoints[param.dataIndex];
            const seriesName = param.seriesName;
            tooltipContent += `
              <div style="margin-bottom: ${index < params.length - 1 ? '8px' : '0'};">
                <strong>${seriesName}: ${param.name}</strong><br>
                Travel Time: ${param.value.toFixed(2)} minutes<br>
                Distance: ${dataPoint.totalKms.toFixed(2)} km
              </div>
            `;
          });
          tooltipContent += '</div>';
          return tooltipContent;
        },
      },
      legend: {
        data: forecastMonthData.length > 0 
          ? ['Past 1 Week', 'Past 1 Month', 'Future 24hr']
          : ['Past 1 Week', 'Future 24hr'],
        top: 10,
        textStyle: {
          color: '#ffffff',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: allLabels,
        axisLabel: {
          rotate: 45,
          interval: 0,
          fontSize: 10,
          color: '#ffffff',
        },
        axisLine: {
          lineStyle: {
            color: '#ffffff',
          },
        },
      },
      yAxis: {
        type: 'value',
        name: 'Travel Time (minutes)',
        nameLocation: 'middle',
        nameGap: 50,
        nameTextStyle: {
          color: '#ffffff',
        },
        axisLabel: {
          color: '#ffffff',
        },
        axisLine: {
          lineStyle: {
            color: '#ffffff',
          },
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
        },
      },
      series: [
        {
          name: 'Past 1 Week',
          type: 'bar',
          data: timesWeek.map((time, index) => {
            const globalIndex = index;
            const ratio = (time - minTime) / (maxTime - minTime);
            const isBest = globalIndex === bestTimeIndex && 
                          forecastWeekData.some(d => allDataPoints[bestTimeIndex]?.time === d.time);
            return {
              value: time,
              itemStyle: {
                color: isBest
                  ? '#4CAF50'
                  : (() => {
                      if (ratio < 0.2) return '#00bfff';
                      if (ratio < 0.4) return '#ffeb3b';
                      if (ratio < 0.6) return '#ff9800';
                      if (ratio < 0.8) return '#f44336';
                      return '#b71c1c';
                    })(),
                borderColor: isBest ? '#2E7D32' : 'transparent',
                borderWidth: isBest ? 3 : 0,
              },
            };
          }),
          label: {
            show: false,
          },
        },
        {
          name: 'Past 1 Month',
          type: 'bar',
          data: forecastMonthData.length > 0 ? timesMonth.map((time, index) => {
            const globalIndex = timesWeek.length + index;
            const ratio = (time - minTime) / (maxTime - minTime);
            const isBest = globalIndex === bestTimeIndex && 
                          forecastMonthData.some(d => allDataPoints[bestTimeIndex]?.time === d.time);
            return {
              value: time,
              itemStyle: {
                color: isBest
                  ? '#4CAF50'
                  : (() => {
                      if (ratio < 0.2) return '#00bfff';
                      if (ratio < 0.4) return '#ffeb3b';
                      if (ratio < 0.6) return '#ff9800';
                      if (ratio < 0.8) return '#f44336';
                      return '#b71c1c';
                    })(),
                borderColor: isBest ? '#2E7D32' : 'transparent',
                borderWidth: isBest ? 3 : 0,
              },
            };
          }) : [],
          label: {
            show: false,
          },
        },
        {
          name: 'Future 24hr',
          type: 'bar',
          data: times24hr.map((time, index) => {
            const globalIndex = timesWeek.length + timesMonth.length + index;
            const ratio = (time - minTime) / (maxTime - minTime);
            const isBest = globalIndex === bestTimeIndex && bestTimeData?.is24hr;
            return {
              value: time,
              itemStyle: {
                color: isBest
                  ? '#4CAF50'
                  : (() => {
                      if (ratio < 0.2) return '#00bfff';
                      if (ratio < 0.4) return '#ffeb3b';
                      if (ratio < 0.6) return '#ff9800';
                      if (ratio < 0.8) return '#f44336';
                      return '#b71c1c';
                    })(),
                borderColor: isBest ? '#2E7D32' : 'transparent',
                borderWidth: isBest ? 3 : 0,
              },
            };
          }),
          label: {
            show: bestTimeIndex >= 0 && bestTimeData?.is24hr,
            position: 'top',
            formatter: () => '⭐ Best',
            color: '#2E7D32',
            fontWeight: 'bold',
            fontSize: 12,
          },
        },
      ],
      dataZoom: [
        {
          type: 'slider',
          show: true,
          xAxisIndex: [0],
          start: 0,
          end: forecastMonthData.length > 0 ? 30 : 50, // Show more data if month is loaded
          bottom: 10,
          textStyle: {
            color: '#ffffff',
          },
        },
      ],
    };
  }
}
