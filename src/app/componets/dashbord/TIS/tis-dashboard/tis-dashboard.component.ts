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

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
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
        title: 'Car/ Jeep/ Van/ Taxi',
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

    try {
      const L = await import('leaflet');

      // Check if map container exists
      const mapContainer = document.getElementById('mapContainer');
      if (!mapContainer) {
        console.error('Map container not found');
        return;
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
      console.log(`✅ TIS: Updated map markers for ${this.selectedInfoCard || 'All Traffic'} without refitting bounds`);
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
    console.log('Month Comparison Mode:', this.isMonthComparisonMode ? 'ON' : 'OFF');
    
    if (this.isMonthComparisonMode) {
      this.preloadMonthData();
    }
  }

  async preloadMonthData() {
    const availableMonths = this.projectDatesMap[this.filters.projectName] || [];
    const cacheKey = `${this.filters.projectName}_${this.filters.chainageRange.min}_${this.filters.chainageRange.max}`;
    
    const monthsToFetch = availableMonths.filter(month => {
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
          console.log(`✅ TIS: Cached ${flatData.length} items for ${monthCacheKey}`);
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
    this.availableMonthsForComparison = this.projectDatesMap[this.filters.projectName] || [];
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
      'MAV': '#FF69B4',
      'OSV': '#F59E0B',
      'LCV': '#06B6D4',
      'Standard Bus': '#EF4444'
    };
    return metricColorMap[metricName] || '#667EEA';
  }

  async generateMonthComparisonChart() {
    if (!this.filters.projectName || this.selectedMetricsForMonthComparison.length === 0) {
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
        'MAV': 'mav',
        'OSV': 'osv',
        'LCV': 'lcv',
        'Standard Bus': 'standard_bus'
      };
      
      const fetchPromises = this.availableMonthsForComparison.map(async (month) => {
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
      });

      const results = await Promise.all(fetchPromises);
      results.forEach(({ month, data }) => {
        monthDataMap[month] = data;
      });

      const series: any[] = [];

      this.selectedMetricsForMonthComparison.forEach(metricName => {
        const metricColor = this.getMetricColor(metricName);
        const fieldName = metricFieldMap[metricName];
        const monthData: number[] = [];
        
        console.log(`📊 TIS: Processing metric: ${metricName}, field: ${fieldName}`);
        
        this.availableMonthsForComparison.forEach(month => {
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
            console.log(`  ${month}: Average ${fieldName} = ${value.toFixed(2)}`);
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
            borderRadius: [4, 4, 0, 0]
          }
        });
      });

      const isMobileView = window.innerWidth <= 768;

      this.monthComparisonChartOptions = {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(30, 30, 46, 0.95)',
          borderColor: 'rgba(102, 126, 234, 0.5)',
          borderWidth: 2,
          textStyle: { color: '#fff' }
        },
        legend: {
          data: this.selectedMetricsForMonthComparison,
          top: isMobileView ? 30 : 40,
          textStyle: { color: '#fff', fontSize: isMobileView ? 11 : 13 }
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
          axisLabel: {
            color: '#fff',
            rotate: isMobileView ? 90 : 0,
            fontSize: isMobileView ? 9 : 12,
            interval: isMobileView ? 'auto' : 0,
            margin: isMobileView ? 10 : 8
          },
          axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } }
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
            }
          },
          axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } },
          splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } }
        },
        series: series
      };

      this.isLoadingMonthChart = false;
    } catch (error) {
      console.error('Error generating month comparison chart:', error);
      this.isLoadingMonthChart = false;
    }
  }
}
