import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';

interface DistressData {
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
}

@Component({
  selector: 'app-ris-reported-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEchartsModule],
  templateUrl: './ris-reported-dashboard.component.html',
  styleUrl: './ris-reported-dashboard.component.css'
})
export class RisReportedDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
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
    distressType: 'All'
  };

  // Available filter options
  availableProjects: string[] = [];
  availableDirections: string[] = [];
  availablePavementTypes: string[] = [];
  availableLanes: string[] = [];
  availableDistressTypes: string[] = [];
  availableDates: string[] = [];
  
  // Project dates mapping from API
  projectDatesMap: ProjectDatesResponse = {};
  
  // Selected distress for map filtering
  selectedDistressType: string | null = null;

  // Distress summary data - calculated from raw data
  distressSummary: DistressData[] = [];

  // Chart data for chainage - ECharts format
  chainageData: any[] = [];

  // ECharts options for bar chart
  chartOptions: any = {};

  private map: any;
  public isBrowser: boolean;
  public isLoading: boolean = false;
  public isSidebarOpen: boolean = false;
  
  // Flag to prevent duplicate data loads when project changes
  private isProjectChanging: boolean = false;

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
        this.initChartOptions();
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
      const response = await fetch('https://fantastic-reportapi-production.up.railway.app/projects-dates/distress_reported', {
        method: 'GET',
        headers: {
          'accept': 'application/json'
        }
      });
      
      const projectDates: ProjectDatesResponse = await response.json();
      console.log('Distress Projects and Dates loaded:', projectDates);
      
      // Store the mapping
      this.projectDatesMap = projectDates;
      
      // Extract project names
      this.availableProjects = Object.keys(projectDates);
      
      // Set first project as default
      if (this.availableProjects.length > 0) {
        this.filters.projectName = this.availableProjects[0];
        
        // Set available dates for first project
        this.availableDates = this.projectDatesMap[this.filters.projectName] || [];
        
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
      console.error('Error loading distress projects and dates:', error);
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
      // Prepare API request body with selected filters
      const requestBody = {
        chainage_start: 0,
        chainage_end: 1381,
        date: this.convertDateFormat(this.filters.date),
        direction: ['All'],
        project_name: [this.filters.projectName.trim()],
        distress_type: ['All']
      };
      
      console.log('Distress API Request Body:', requestBody);
      
      const response = await fetch('https://fantastic-reportapi-production.up.railway.app/distress_report_filter', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      const apiResponse = await response.json();
      console.log('API Response:', apiResponse);
      
      // Handle API response - check if it's an error or valid data
      if (apiResponse && apiResponse.detail) {
        console.error('API returned error:', apiResponse.detail);
        this.rawData = [];
        return;
      }
      
      // Process the response data - flatten nested arrays
      const flatData: any[] = [];
      if (Array.isArray(apiResponse)) {
        apiResponse.forEach(group => {
          if (Array.isArray(group)) {
            flatData.push(...group);
          } else {
            flatData.push(group);
          }
        });
      }
      
      // Transform the data to distress format
      this.rawData = flatData.map((item: any) => ({
        project_name: item.project_name || 'Unknown Project',
        chainage_start: item.chainage_start || 0,
        chainage_end: item.chainage_end || 0,
        direction: item.direction || 'Unknown',
        pavement_type: item.carriage_type || 'Unknown',
        lane: item.lane || 'Unknown',
        distress_type: item.distress_type || 'Unknown',
        latitude: item.latitude || 0,
        longitude: item.longitude || 0,
        date: item.date || '2025-07-20',
        severity: this.getSeverityFromDistressType(item.distress_type)
      }));

      this.extractFilterOptions();
      this.updateDistressSummary();
      this.updateChainageData();
      
      // Initialize map after data is loaded
      setTimeout(() => {
        this.initMap();
        this.addDistressMarkers();
        this.updateChart();
      }, 500);
    } catch (error) {
      console.error('Error loading distress data:', error);
      this.rawData = [];
    } finally {
      this.isLoading = false;
    }
  }

  private mapAssetToDistress(item: any): string {
    // Map infrastructure assets to distress types based on the image
    const assetCounts = {
      'Trees': item.trees || 0,
      'Transverse crack': item.culvert || 0,
      'Block crack': item.street_lights || 0,
      'Edge Break': item.bridges || 0,
      'Heaves': item.traffic_signals || 0,
      'Hotspots': item.bus_stop || 0,
      'Joint crack': item.truck_layby || 0,
      'Joint seal defects': item.toll_plaza || 0,
      'Longitudinal crack': item.adjacent_road || 0,
      'Multiple cracks': item.toilet_blocks || 0,
      'Oblique crack': item.rest_area || 0,
      'Patchwork': item.rcc_drain || 0,
      'Pothole': item.fuel_station || 0,
      'Punchout': item.emergency_call_box || 0,
      'Raveling': item.tunnels || 0,
      'Simple crack': item.footpath || 0,
      'Discrete crack': item.junction || 0,
      'Rutting': item.sign_boards || 0
    };

    // Find the distress type with the highest count
    let maxCount = 0;
    let dominantDistress = 'Trees'; // Default distress type
    
    for (const [distress, count] of Object.entries(assetCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantDistress = distress;
      }
    }

    return dominantDistress;
  }

  private getSeverity(item: any): string {
    const totalAssets = Object.values(item).reduce((sum: number, val: any) => {
      return sum + (typeof val === 'number' ? val : 0);
    }, 0);

    if (totalAssets > 100) return 'High';
    if (totalAssets > 50) return 'Medium';
    return 'Low';
  }

  extractFilterOptions() {
    // Check if rawData is valid array
    if (!Array.isArray(this.rawData) || this.rawData.length === 0) {
      // Don't reset availableProjects - they come from the API
      this.availableDirections = ['Increasing', 'Decreasing'];
      this.availablePavementTypes = [];
      this.availableLanes = [];
      this.availableDistressTypes = [];
      return;
    }
    
    // Extract filter options from data (projects come from API)
    this.availableDirections = [...new Set(this.rawData.map(item => item.direction))];
    this.availablePavementTypes = [...new Set(this.rawData.map(item => item.pavement_type))];
    this.availableLanes = [...new Set(this.rawData.map(item => item.lane))];
    this.availableDistressTypes = [...new Set(this.rawData.map(item => item.distress_type))];
    
    // Update chainage range based on current data
    const chainages = this.rawData.flatMap(item => [item.chainage_start, item.chainage_end]);
    if (chainages.length > 0) {
      this.filters.chainageRange.min = Math.min(...chainages);
      this.filters.chainageRange.max = Math.max(...chainages);
      console.log('Updated chainage range:', this.filters.chainageRange);
    }
  }

  getFilteredData(): DistressReportData[] {
    return this.rawData.filter(item => {
      // Note: Project and Date filtering is now done by the API
      const matchesDirection = this.filters.direction === 'All' || item.direction === this.filters.direction;
      const matchesPavement = this.filters.pavementType === 'All' || item.pavement_type === this.filters.pavementType;
      const matchesLane = this.filters.lane === 'All' || item.lane === this.filters.lane;
      const matchesDistress = this.filters.distressType === 'All' || item.distress_type === this.filters.distressType;
      const matchesChainage = (item.chainage_start <= this.filters.chainageRange.max && item.chainage_end >= this.filters.chainageRange.min);

      return matchesDirection && matchesPavement && matchesLane && matchesDistress && matchesChainage;
    });
  }

  updateDistressSummary() {
    const filteredData = this.getFilteredData();
    
    // Define all distress types from the image
    const allDistressTypes = [
      'Alligator crack', 'Transverse crack', 'Hairline crack', 'Block crack',
      'Edge Break', 'Heaves', 'Hungry crack', 'Hotspots',
      'Joint crack', 'Joint seal defects', 'Slippage', 'Longitudinal crack',
      'Multiple cracks', 'Bleeding', 'Stripping', 'Patchwork',
      'Pothole', 'Punchout', 'Settlement', 'Raveling',
      'Simple crack', 'Discrete crack', 'Shoving', 'Rutting'
    ];
    
    // Define colors for distress types
    const distressColors: { [key: string]: string } = {
      'Alligator crack': '#CC0000',
      'Transverse crack': '#2E8B57',
      'Hairline crack': '#B8860B',
      'Block crack': '#006400',
      'Edge Break': '#800080',
      'Heaves': '#008B8B',
      'Hungry crack': '#FF8C00',
      'Hotspots': '#FF6347',
      'Joint crack': '#8B4513',
      'Joint seal defects': '#A0522D',
      'Slippage': '#008B8B',
      'Longitudinal crack': '#000080',
      'Multiple cracks': '#DC143C',
      'Bleeding': '#000080',
      'Stripping': '#B22222',
      'Patchwork': '#4682B4',
      'Pothole': '#FF4500',
      'Punchout': '#DAA520',
      'Settlement': '#663399',
      'Raveling': '#228B22',
      'Simple crack': '#C71585',
      'Discrete crack': '#008B8B',
      'Shoving': '#654321',
      'Rutting': '#4B0082'
    };

    this.distressSummary = allDistressTypes.map(distressType => {
      const count = filteredData.filter(item => item.distress_type === distressType).length;
      return {
        name: distressType,
        count: count,
        color: distressColors[distressType] || '#9E9E9E'
      };
    });
  }

  updateChainageData() {
    const filteredData = this.getFilteredData();
    const maxChainage = Math.max(...filteredData.map(item => item.chainage_end));
    const rangeSize = maxChainage / 5; // Divide into 5 ranges

    this.chainageData = [];
    for (let i = 0; i < 5; i++) {
      const start = i * rangeSize;
      const end = (i + 1) * rangeSize;
      
      const rangeData = filteredData.filter(item => 
        item.chainage_start >= start && item.chainage_end <= end
      );

      this.chainageData.push({
        chainage_start: start,
        chainage_end: end,
        distress_count: rangeData.length
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
          fontWeight: 'bold'
        },
        left: 'center',
        top: 10
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        textStyle: {
          color: '#ffffff'
        },
        formatter: (params: any) => {
          if (Array.isArray(params)) {
            const dataIndex = Math.round(params[0].data[0]);
            const chainageItem = this.chainageData[dataIndex];
            const chainageRange = chainageItem ? `${chainageItem.chainage_start.toFixed(1)} - ${chainageItem.chainage_end.toFixed(1)} KM` : 'Unknown Range';

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
          return `${params.seriesName}: ${params.data ? params.data[1] : params.value}`;
        }
      },
      legend: {
        data: this.availableDistressTypes,
        textStyle: {
          color: '#ffffff'
        },
        top: 40,
        type: 'scroll',
        orient: 'horizontal'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '25%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: this.chainageData.map((_, index) => index),
        axisLabel: {
          color: '#ffffff',
          formatter: (value: number) => {
            const item = this.chainageData[value];
            return item ? `${item.chainage_start.toFixed(0)}` : '';
          }
        },
        axisLine: {
          lineStyle: {
            color: '#ffffff'
          }
        }
      },
      yAxis: {
        type: 'value',
        name: 'Total distress',
        nameTextStyle: {
          color: '#ffffff'
        },
        axisLabel: {
          color: '#ffffff'
        },
        axisLine: {
          lineStyle: {
            color: '#ffffff'
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        }
      },
      series: this.availableDistressTypes.map(distressType => ({
        name: distressType,
        type: 'bar',
        data: this.chainageData.map((_, index) => [index, Math.random() * 10]), // Placeholder data
        itemStyle: {
          color: this.getDistressColor(distressType)
        },
        barWidth: '60%'
      }))
    };
  }

  private getSeverityFromDistressType(distressType: string): string {
    const highSeverityDistress = ['Alligator crack', 'Pothole', 'Rutting', 'Edge break'];
    const mediumSeverityDistress = ['Transverse crack', 'Longitudinal crack', 'Block crack'];
    
    if (highSeverityDistress.includes(distressType)) return 'High';
    if (mediumSeverityDistress.includes(distressType)) return 'Medium';
    return 'Low';
  }

  private getDistressColor(distressType: string): string {
    const colorMap: { [key: string]: string } = {
      'Alligator crack': '#8B0000',      // Dark red
      'Bleeding': '#000066',             // Dark navy blue
      'Block crack': '#004d00',          // Dark green
      'Edge break': '#660066',           // Dark purple
      'Hairline crack': '#996600',       // Dark goldenrod
      'Heaves': '#006666',               // Dark cyan
      'Joint crack': '#663300',          // Dark brown
      'Joint seal defects': '#804020',   // Dark sienna
      'Longitudinal crack': '#000066',   // Dark navy blue
      'Multiple cracks': '#990000',      // Dark crimson
      'Oblique crack': '#CC6600',        // Dark orange
      'Patching': '#336699',             // Dark steel blue
      'Pothole': '#CC3300',              // Dark orange-red
      'Punchout': '#996600',             // Dark goldenrod
      'Raveling': '#1a661a',             // Dark green
      'Simple crack': '#990066',         // Dark magenta
      'Single discrete crack': '#004d4d', // Dark teal
      'Rutting': '#4B0082',              // Indigo
      'Transverse crack': '#2d7a4d',     // Dark sea green
      'Settlement': '#4d2966',           // Dark purple
      'Shoving': '#4d3621',              // Dark brown
      'Slippage': '#006666',             // Dark cyan
      'Stripping': '#8B0000',            // Dark red
      'Hotspots': '#CC3300',             // Dark tomato
      'Hungry surface': '#CC6600',       // Dark orange
      'Repair': '#006666',               // Dark cyan
      'Roughness': '#7851a3'             // Dark purple
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
        zoomControl: true
      });

      // Add Google satellite tile layer
      const googleSatelliteLayer = L.tileLayer('http://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: '© Google',
        maxZoom: 21,
      });

      // Add Google satellite layer by default
      googleSatelliteLayer.addTo(this.map);

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
        filteredData = filteredData.filter(item => item.distress_type === this.selectedDistressType);
      }

      filteredData.forEach(item => {
        if (item.latitude && item.longitude) {
          const marker = L.circleMarker([item.latitude, item.longitude], {
            radius: 3,
            fillColor: this.getDistressColor(item.distress_type),
            color: '#ffffff', // White border like Dashboard
            weight: 1,
            opacity: 1, // Full opacity for border
            fillOpacity: 0.8 // Match Dashboard fill opacity
          }).addTo(this.map);

          marker.bindPopup(`
            <div style="color:rgb(8, 8, 8); font-size: 12px;">
              <strong>${item.distress_type}</strong><br>
              Chainage: ${item.chainage_start} - ${item.chainage_end} KM<br>
              Direction: ${item.direction}<br>
              Severity: ${item.severity}
            </div>
          `);
        }
      });
      
      // Adjust map bounds after adding markers
      this.adjustMapBounds();
    } catch (error) {
      console.error('Error adding distress markers:', error);
    }
  }

  async adjustMapBounds() {
    if (!this.map || !this.isBrowser) return;

    try {
      const L = await import('leaflet');
      
      // Use all data if "All" projects selected, otherwise use filtered data
      const dataToUse = this.filters.projectName === 'All' ? this.rawData : this.getFilteredData();
      
      // Get coordinates of data
      const coordinates = dataToUse
        .filter(item => item.latitude && item.longitude)
        .map(item => [item.latitude, item.longitude] as [number, number]);

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
        maxZoom: 16
      });
    } catch (error) {
      console.error('Error adjusting map bounds:', error);
    }
  }

  clearMapMarkers() {
    if (!this.map) return;
    this.map.eachLayer((layer: any) => {
      // Check if layer is a circle marker by checking its properties
      if (layer.options && layer.options.radius !== undefined) {
        this.map.removeLayer(layer);
      }
    });
  }

  onDistressCardClick(distress: DistressData) {
    this.selectedDistressType = this.selectedDistressType === distress.name ? null : distress.name;
    
    if (this.isBrowser) {
      this.addDistressMarkers();
      this.updateChart();
    }
  }

  onFilterChange() {
    this.updateDistressSummary();
    this.updateChainageData();
    
    if (this.isBrowser) {
      this.addDistressMarkers();
      this.updateChart();
    }
  }

  formatDistressCount(distress: DistressData): string {
    return distress.count.toString();
  }

  getDistressIcon(distressName: string): string {
    // Return empty string to remove icons
    return '';
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
    await new Promise(resolve => setTimeout(resolve, 10));
    
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
      this.onFilterChange();
    }
  }

  onChainageMaxChange(event: any) {
    const value = parseFloat(event.target.value);
    if (value >= this.filters.chainageRange.min && value <= this.getChainageMax()) {
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
    const chainages = this.rawData.flatMap(item => [item.chainage_start, item.chainage_end]);
    if (chainages.length > 0) {
      this.filters.chainageRange.min = Math.min(...chainages);
      this.filters.chainageRange.max = Math.max(...chainages);
      console.log('Updated chainage range for project:', this.filters.chainageRange);
    } else {
      // If no data, reset to default
      this.filters.chainageRange.min = 0;
      this.filters.chainageRange.max = 1380.387;
    }
  }

  getChainageMin(): number {
    // Since API filters by project, rawData contains current project's data
    if (this.rawData.length > 0) {
      return Math.floor(Math.min(...this.rawData.map(item => item.chainage_start)));
    }
    return 0;
  }

  getChainageMax(): number {
    // Since API filters by project, rawData contains current project's data
    if (this.rawData.length > 0) {
      return Math.ceil(Math.max(...this.rawData.map(item => item.chainage_end)));
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
