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
import { NgxEchartsModule } from 'ngx-echarts';

interface AccidentInfoData {
  title: string;
  value: string | number;
  unit?: string;
}

interface AccidentStatistics {
  non_injured_accident: number;
  major_accident: number;
  minor_injury: number;
  minor_accident: number;
  fatal_accident: number;
  major_injury: number;
  total_accident: number;
  fatal_injury: number;
  grievous_injury: number;
  fatalities: number;
  head_tail: number;
  total_injury: number;
  nature_of_accident: string;
  cause_of_accident: string;
  skidding: number;
  mechanical_fault: number;
  vehicle_lost_control: number;
  grievous_accident: number;
  pedestrian_related: number;
  hit_and_run: number;
  fault_of_driver: number;
}

interface AccidentData {
  project_name: string;
  date: string;
  accident_statistics: AccidentStatistics;
  chainage_start: number;
  chainage_end: number;
  direction: string;
  latitude: number;
  longitude: number;
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
  selector: 'app-ais-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEchartsModule],
  templateUrl: './ais-dashboard.component.html',
  styleUrl: './ais-dashboard.component.scss',
})
export class AisDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainerRef!: ElementRef;

  // Raw accident data from JSON
  rawData: AccidentData[] = [];

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

  // Accident information data
  accidentInfoData: AccidentInfoData[] = [];

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

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      // Load projects and dates first, then load accident data
      this.loadProjectsAndDates();
    }
  }

  ngAfterViewInit() {
    // Map will be initialized when data is loaded
  }

  ngOnDestroy() {
    if (this.isBrowser && this.map) {
      this.map.remove();
    }
  }

  private async loadProjectsAndDates() {
    try {
      const response = await fetch(
        'https://fantastic-reportapi-production.up.railway.app/projects-dates/ais',
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
      console.log('Projects and Dates loaded from AIS API:', projectDates);

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
      await this.loadAccidentData();
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

  async loadAccidentData() {
    // Only load data in browser environment
    if (!this.isBrowser) return;

    this.isLoading = true;

    try {
      // Load accident data from API endpoint
      const response = await fetch(
        'https://fantastic-reportapi-production.up.railway.app/ais_filter',
        {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chainage_start: 0,
            chainage_end: 1381,
            date: this.filters.date || '2025-01-01',
            direction: ['All'],
            project_name: [this.filters.projectName || 'All'],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiData = await response.json();
      console.log('AIS API Response:', apiData);

      // Flatten nested arrays if needed
      const flatData = Array.isArray(apiData) ? apiData.flat() : [];

      // Transform API data to AccidentData format
      const data: AccidentData[] = flatData.map((item: any) => ({
        project_name: item.project_name || 'Unknown',
        date: item.date || this.filters.date || '2025-01-01',
        accident_statistics: {
          non_injured_accident: item['non-injured_accident'] || 0,
          major_accident: item.major_accident || 0,
          minor_injury: item.minor_injury || 0,
          minor_accident: item.minor_accident || 0,
          fatal_accident: item.fatal_accident || 0,
          major_injury: item.major_injury || 0,
          total_accident: item.total_accident || 0,
          fatal_injury: item.fatal_injury || 0,
          grievous_injury: item.grievous_injury || 0,
          fatalities: item.fatalities || 0,
          head_tail: item.head_tail || 0,
          total_injury: item.total_injury || 0,
          nature_of_accident: item.nature_of_accident || 'Data NA',
          cause_of_accident: item.cause_of_accident || 'Data NA',
          skidding: item.skidding || 0,
          mechanical_fault: item.mechanical_fault || 0,
          vehicle_lost_control: item.vehicle_lost_control || 0,
          grievous_accident: item.grievous_accident || 0,
          pedestrian_related: item.pedestrian_related || 0,
          hit_and_run: item['pedestrian/hit_&_run'] || 0,
          fault_of_driver: item.fault_of_driver || 0,
        },
        chainage_start: item.chainage_start || 0,
        chainage_end: item.chainage_end || 0,
        direction: item.direction || 'Both',
        latitude: item.latitude || 0,
        longitude: item.longitude || 0,
      }));

      // Store raw data
      this.rawData = data;

      // Don't overwrite availableProjects here - they come from loadProjectsAndDates()
      // Only set default project if not already set and we have projects available
      if (this.availableProjects.length > 0 && !this.filters.projectName) {
        this.filters.projectName = this.availableProjects[0];
      }

      // Update accident information
      this.updateAccidentInformation();

      // Update chainage range based on the loaded data
      this.updateChainageRangeForProject();

      // Initialize map if not already done (wait for view to be ready)
      if (!this.map && this.rawData.length > 0) {
        // Use ngZone to ensure the view is updated before accessing the DOM
        setTimeout(() => {
          if (this.isBrowser) {
            const mapContainer = document.getElementById('mapContainer');
            if (mapContainer) {
              this.initMap();
            } else {
              console.warn('Map container not found, retrying...');
              setTimeout(() => {
                const retryContainer = document.getElementById('mapContainer');
                if (retryContainer) {
                  this.initMap();
                }
              }, 500);
            }
          }
        }, 1000);
      } else if (this.map && this.rawData.length > 0) {
        // Update existing map
        this.addDistressMarkers();
      }
    } catch (error) {
      console.error('Error loading accident data:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      this.rawData = [];
      this.accidentInfoData = [];
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

  getFilteredData(): AccidentData[] {
    return this.rawData.filter((item) => {
      // Note: Project and Date filtering is done by the API
      // Accident data doesn't have pavement_type or lane, so these filters don't apply
      const matchesDirection =
        this.filters.direction === 'All' ||
        item.direction === this.filters.direction;
      const matchesChainage =
        item.chainage_start <= this.filters.chainageRange.max &&
        item.chainage_end >= this.filters.chainageRange.min;

      return matchesDirection && matchesChainage;
    });
  }

  updateAccidentInformation() {
    if (!this.rawData || this.rawData.length === 0) {
      this.accidentInfoData = [];
      return;
    }

    // Use all raw data since API already filters by project and date
    const filteredData = this.rawData;

    if (filteredData.length === 0) {
      this.accidentInfoData = [];
      return;
    }

    // Sum up accident statistics from all filtered data
    const totalStats = filteredData.reduce(
      (acc, item) => {
        const stats = item.accident_statistics;
        return {
          non_injured_accident:
            acc.non_injured_accident + stats.non_injured_accident,
          major_accident: acc.major_accident + stats.major_accident,
          minor_injury: acc.minor_injury + stats.minor_injury,
          minor_accident: acc.minor_accident + stats.minor_accident,
          fatal_accident: acc.fatal_accident + stats.fatal_accident,
          major_injury: acc.major_injury + stats.major_injury,
          total_accident: acc.total_accident + stats.total_accident,
          fatal_injury: acc.fatal_injury + stats.fatal_injury,
          grievous_injury: acc.grievous_injury + stats.grievous_injury,
          fatalities: acc.fatalities + stats.fatalities,
          head_tail: acc.head_tail + stats.head_tail,
          total_injury: acc.total_injury + stats.total_injury,
          skidding: acc.skidding + stats.skidding,
          mechanical_fault: acc.mechanical_fault + stats.mechanical_fault,
          vehicle_lost_control:
            acc.vehicle_lost_control + stats.vehicle_lost_control,
          grievous_accident: acc.grievous_accident + stats.grievous_accident,
          pedestrian_related: acc.pedestrian_related + stats.pedestrian_related,
          hit_and_run: acc.hit_and_run + stats.hit_and_run,
          fault_of_driver: acc.fault_of_driver + stats.fault_of_driver,
        };
      },
      {
        non_injured_accident: 0,
        major_accident: 0,
        minor_injury: 0,
        minor_accident: 0,
        fatal_accident: 0,
        major_injury: 0,
        total_accident: 0,
        fatal_injury: 0,
        grievous_injury: 0,
        fatalities: 0,
        head_tail: 0,
        total_injury: 0,
        skidding: 0,
        mechanical_fault: 0,
        vehicle_lost_control: 0,
        grievous_accident: 0,
        pedestrian_related: 0,
        hit_and_run: 0,
        fault_of_driver: 0,
      }
    );

    // Get nature and cause from first item (assuming they're consistent)
    const firstItem = filteredData[0];
    const natureOfAccident = firstItem.accident_statistics.nature_of_accident;
    const causeOfAccident = firstItem.accident_statistics.cause_of_accident;

    // Initialize accident info data with rounded up values
    this.accidentInfoData = [
      {
        title: 'Non-Injured Accident',
        value: Math.ceil(totalStats.non_injured_accident),
        unit: '',
      },
      {
        title: 'Major Accident',
        value: Math.ceil(totalStats.major_accident),
        unit: '',
      },
      {
        title: 'Minor Injury',
        value: Math.ceil(totalStats.minor_injury),
        unit: '',
      },
      {
        title: 'Minor Accident',
        value: Math.ceil(totalStats.minor_accident),
        unit: '',
      },
      {
        title: 'Fatal Accident',
        value: Math.ceil(totalStats.fatal_accident),
        unit: '',
      },
      {
        title: 'Major Injury',
        value: Math.ceil(totalStats.major_injury),
        unit: '',
      },
      {
        title: 'Total Accident',
        value: Math.ceil(totalStats.total_accident),
        unit: '',
      },
      {
        title: 'Fatal Injury',
        value: Math.ceil(totalStats.fatal_injury),
        unit: '',
      },
      {
        title: 'Grievous Injury',
        value: Math.ceil(totalStats.grievous_injury),
        unit: '',
      },
      {
        title: 'Fatalities',
        value: Math.ceil(totalStats.fatalities),
        unit: '',
      },
      {
        title: 'Head-tail',
        value: Math.ceil(totalStats.head_tail),
        unit: '',
      },
      {
        title: 'Total Injury',
        value: Math.ceil(totalStats.total_injury),
        unit: '',
      },
      {
        title: 'Nature of Accident',
        value: natureOfAccident,
        unit: '',
      },
      {
        title: 'Cause of Accident',
        value: causeOfAccident,
        unit: '',
      },
      {
        title: 'Skidding',
        value: Math.ceil(totalStats.skidding),
        unit: '',
      },
      {
        title: 'Mechanical Fault',
        value: Math.ceil(totalStats.mechanical_fault),
        unit: '',
      },
      {
        title: 'Vehicle lost Control',
        value: Math.ceil(totalStats.vehicle_lost_control),
        unit: '',
      },
      {
        title: 'Grievous Accident',
        value: Math.ceil(totalStats.grievous_accident),
        unit: '',
      },
      {
        title: 'Pedestrian Related',
        value: Math.ceil(totalStats.pedestrian_related),
        unit: '',
      },
      {
        title: 'Hit & Run',
        value: Math.ceil(totalStats.hit_and_run),
        unit: '',
      },
      {
        title: 'Fault of driver',
        value: Math.ceil(totalStats.fault_of_driver),
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
          this.updateMapVisualization();
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

      // Check current zoom level and decide what to show
      this.currentZoomLevel = this.map.getZoom();

      if (this.currentZoomLevel >= this.zoomThreshold) {
        // Zoomed in - show Font Awesome icons
        await this.showAccidentMarkers(filteredData, L);
      } else {
        // Zoomed out - show colorful circle markers
        await this.showColorfulPoints(filteredData, L);
      }

      // Adjust map bounds after adding markers
      this.adjustMapBounds();
    } catch (error) {
      console.error('Error adding accident markers:', error);
    }
  }

  // Method to show colorful circle markers (zoomed out view)
  private async showColorfulPoints(filteredData: AccidentData[], L: any) {
    filteredData.forEach((item) => {
      if (item.latitude && item.longitude) {
        // Use accident severity to determine color
        const color = this.getAccidentColor(item);

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
              Accident Data
            </h4>
            <p style="margin: 5px 0; font-size: 12px;">
              <strong>Project:</strong> ${item.project_name}
            </p>
            <p style="margin: 5px 0; font-size: 12px;">
              <strong>Chainage:</strong> ${item.chainage_start?.toFixed(
                2
              )} - ${item.chainage_end?.toFixed(2)} km
            </p>
            <p style="margin: 5px 0; font-size: 12px;">
              <strong>Direction:</strong> ${item.direction || 'N/A'}
            </p>
            <p style="margin: 5px 0; font-size: 12px;">
              <strong>Total Accidents:</strong> ${
                item.accident_statistics.total_accident
              }
            </p>
            <p style="margin: 5px 0; font-size: 12px;">
              <strong>Fatalities:</strong> ${
                item.accident_statistics.fatalities
              }
            </p>
            <p style="margin: 5px 0; font-size: 12px;">
              <strong>Total Injuries:</strong> ${
                item.accident_statistics.total_injury
              }
            </p>
          </div>
        `);

        this.distressMarkers.push(marker);
      }
    });
  }

  // Get color for accident data based on severity
  private getAccidentColor(accidentData: AccidentData): string {
    const fatalities = accidentData.accident_statistics.fatalities;
    const totalAccidents = accidentData.accident_statistics.total_accident;

    if (fatalities > 0) {
      return '#CC0000'; // Red for fatal accidents
    } else if (totalAccidents >= 5) {
      return '#FF6600'; // Orange for high accident count
    } else if (totalAccidents >= 2) {
      return '#FFCC00'; // Yellow for medium accident count
    } else {
      return '#00CC00'; // Green for low accident count
    }
  }

  // Method to show accident markers (zoomed in view)
  private async showAccidentMarkers(filteredData: AccidentData[], L: any) {
    filteredData.forEach((item) => {
      if (item.latitude && item.longitude) {
        // Use accident severity to determine icon
        const iconClass = this.getAccidentIcon(item);

        const customIcon = L.divIcon({
          html: `<i class="fas ${iconClass}" style="color: ${this.getAccidentColor(
            item
          )}; font-size: 20px;"></i>`,
          className: 'custom-div-icon',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const marker = L.marker([item.latitude, item.longitude], {
          icon: customIcon,
        });

        // Create popup content for accident data
        const popupContent = `
          <div style="font-family: Arial, sans-serif; min-width: 200px;">
            <h4 style="margin: 0 0 10px 0; color: ${this.getAccidentColor(
              item
            )}; font-size: 14px;">
              Accident Data
            </h4>
            <p style="margin: 5px 0; font-size: 12px;">
              <strong>Project:</strong> ${item.project_name}
            </p>
            <p style="margin: 5px 0; font-size: 12px;">
              <strong>Chainage:</strong> ${item.chainage_start?.toFixed(
                2
              )} - ${item.chainage_end?.toFixed(2)} km
            </p>
            <p style="margin: 5px 0; font-size: 12px;">
              <strong>Direction:</strong> ${item.direction || 'N/A'}
            </p>
            <p style="margin: 5px 0; font-size: 12px;">
              <strong>Total Accidents:</strong> ${
                item.accident_statistics.total_accident
              }
            </p>
            <p style="margin: 5px 0; font-size: 12px;">
              <strong>Fatalities:</strong> ${
                item.accident_statistics.fatalities
              }
            </p>
            <p style="margin: 5px 0; font-size: 12px;">
              <strong>Total Injuries:</strong> ${
                item.accident_statistics.total_injury
              }
            </p>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(this.map);
        this.distressMarkers.push(marker);
      }
    });
  }

  // Get icon for accident data based on severity
  private getAccidentIcon(accidentData: AccidentData): string {
    const fatalities = accidentData.accident_statistics.fatalities;
    const totalAccidents = accidentData.accident_statistics.total_accident;

    if (fatalities > 0) {
      return 'fa-exclamation-triangle'; // Warning triangle for fatal accidents
    } else if (totalAccidents >= 5) {
      return 'fa-exclamation-circle'; // Exclamation circle for high accident count
    } else if (totalAccidents >= 2) {
      return 'fa-info-circle'; // Info circle for medium accident count
    } else {
      return 'fa-check-circle'; // Check circle for low accident count
    }
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
        await this.showAccidentMarkers(filteredData, L);
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
    this.updateAccidentInformation();

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
      await this.loadAccidentData();
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
    this.accidentInfoData = [];

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

    // Load data with new project
    await this.loadAccidentData();

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
      this.onFilterChange();
    }
  }

  onChainageMaxChange(event: any) {
    const value = parseFloat(event.target.value);
    if (
      value >= this.filters.chainageRange.min &&
      value <= this.getChainageMax()
    ) {
      this.filters.chainageRange.max = value;
      this.onFilterChange();
    }
  }

  onChainageMinSliderChange(event: any) {
    const value = parseFloat(event.target.value);
    if (value <= this.filters.chainageRange.max) {
      this.filters.chainageRange.min = value;
      this.onFilterChange();
    }
  }

  onChainageMaxSliderChange(event: any) {
    const value = parseFloat(event.target.value);
    if (value >= this.filters.chainageRange.min) {
      this.filters.chainageRange.max = value;
      this.onFilterChange();
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
}
