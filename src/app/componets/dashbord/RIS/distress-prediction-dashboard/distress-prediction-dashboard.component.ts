
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

interface PredictedDistressData {
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
  prediction_confidence?: number;
  // Individual distress counts
  rough_spot?: number;
  pothole?: number;
  hotspots?: number;
  edge_break?: number;
  simple_crack_alligator_crack?: number;
  block_crack_oblique_crack?: number;
  longitudinal_crack_transverse_crack?: number;
  rutting?: number;
  bleeding?: number;
  raveling?: number;
}

@Component({
  selector: 'app-distress-prediction-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEchartsModule],
  templateUrl: './distress-prediction-dashboard.component.html',
  styleUrl: './distress-prediction-dashboard.component.css'
})
export class DistressPredictionDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainerRef!: ElementRef;

  rawData: PredictedDistressData[] = [];
  filters: FilterData = {
    date: '',
    projectName: '',
    direction: 'Increasing',
    chainageRange: { min: 0, max: 1380.387 },
    pavementType: 'All',
    lane: 'All',
    distressType: 'All'
  };

  availableProjects: string[] = [];
  availableDirections: string[] = [];
  availablePavementTypes: string[] = [];
  availableLanes: string[] = [];
  availableDistressTypes: string[] = [];
  availableDates: string[] = [];
  
  // Project dates mapping from API
  projectDatesMap: ProjectDatesResponse = {};
  
  selectedDistressType: string | null = null;
  distressSummary: DistressData[] = [];
  chainageData: any[] = [];
  chartOptions: any = {};
  
  // Point distresses array - calculated once to avoid repeated filtering
  pointDistresses: DistressData[] = [];
  
  // Cracks and rutting array - calculated once to avoid repeated filtering
  cracksAndRutting: DistressData[] = [];
  
  public map: any;
  public isBrowser: boolean;
  public isLoading: boolean = false;
  
  // Flag to prevent duplicate data loads when project changes
  private isProjectChanging: boolean = false;
  
  // Cache for chainage min/max values
  private _chainageMin: number | null = null;
  private _chainageMax: number | null = null;

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
    console.log('ngAfterViewInit called, isBrowser:', this.isBrowser, 'rawData.length:', this.rawData.length);
    if (this.isBrowser) {
      setTimeout(() => {
        console.log('ngAfterViewInit timeout, rawData.length:', this.rawData.length);
        this.initChartOptions();
        // Map will be initialized after data loads in loadDistressData()
      }, 500);
    }
  }

  ngOnDestroy() {
    if (this.isBrowser && this.map) {
      this.map.remove();
    }
  }

  private async loadProjectsAndDates() {
    try {
      const response = await fetch('https://fantastic-reportapi-production.up.railway.app/projects-dates/distress_predicted', {
        method: 'GET',
        headers: {
          'accept': 'application/json'
        }
      });
      
      const projectDates: ProjectDatesResponse = await response.json();
      console.log('Predicted Distress Projects and Dates loaded:', projectDates);
      
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
      console.error('Error loading predicted distress projects and dates:', error);
      // Fallback to empty arrays
      this.availableProjects = [];
      this.availableDates = [];
    }
  }

  async loadDistressData() {
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
        date: this.filters.date,
        direction: ['All'],
        project_name: [this.filters.projectName.trim()],
        distress_type: ['All']
      };
      
      console.log('Predicted Distress API Request Body:', requestBody);
      
      const response = await fetch('https://fantastic-reportapi-production.up.railway.app/distress_predic_filter', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const apiResponse = await response.json();
      console.log('API Response:', apiResponse);
      
      if (!apiResponse) {
        console.error('No data received from API');
        return;
      }

      // Handle API response - check if it's an error or valid data
      if (apiResponse && apiResponse.detail) {
        console.error('API returned error:', apiResponse.detail);
        this.rawData = [];
        this.resetChainageCache();
        return;
      }
      
      // Process the response data - flatten nested arrays if needed
      let flatData: any[] = [];
      if (Array.isArray(apiResponse)) {
        apiResponse.forEach(group => {
          if (Array.isArray(group)) {
            flatData.push(...group);
          } else {
            flatData.push(group);
          }
        });
      } else {
        flatData = [];
      }
      
      console.log('Flattened data length:', flatData.length);
      console.log('Sample flattened item:', flatData[0]);
      
      this.rawData = flatData.map((item: any) => ({
        project_name: item.project_name || 'Unknown Project',
        chainage_start: item.chainage_start || 0,
        chainage_end: item.chainage_end || 0,
        direction: item.direction ? item.direction.charAt(0).toUpperCase() + item.direction.slice(1).toLowerCase() : 'Unknown',
        pavement_type: item.carriage_type || 'Unknown',
        lane: item.lane || 'Unknown',
        distress_type: item.distress_type || 'Unknown',
        latitude: item.latitude || 0,
        longitude: item.longitude || 0,
        date: item.date || '2025-07-20',
        severity: this.getSeverity(item),
        prediction_confidence: Math.random() * 100,
        // Add individual distress counts for summary calculation
        rough_spot: item.rough_spot || 0,
        pothole: item.pothole || 0,
        hotspots: item.hotspots || 0,
        edge_break: item.edge_break || 0,
        simple_crack_alligator_crack: item['simple_crack/alligator_crack'] || 0,
        block_crack_oblique_crack: item['block_crack/oblique_crack'] || 0,
        longitudinal_crack_transverse_crack: item['longitudinal_crack/transverse_crack'] || 0,
        rutting: item.rutting || 0,
        bleeding: item.bleeding || 0,
        raveling: item.raveling || 0
      }));

      console.log('Data loaded, rawData.length:', this.rawData.length);

      // Reset chainage cache after loading new data
      this.resetChainageCache();

      this.extractFilterOptions();
      this.updateDistressSummary();
      this.updateChainageData();
      
      // Initialize map after data is loaded
      if (!this.map) {
        console.log('Initializing map after data load...');
        setTimeout(() => {
          this.initMap();
        }, 500);
      } else {
        this.addDistressMarkers();
      }
      
      this.updateChart();
    } catch (error) {
      console.error('Error loading predicted distress data:', error);
      this.rawData = [];
    } finally {
      this.isLoading = false;
    }
  }

  private getSeverity(item: any): string {
    const totalDistress = item.total_distress || 0;
    if (totalDistress > 5) return 'High';
    if (totalDistress > 2) return 'Medium';
    return 'Low';
  }

  private resetChainageCache() {
    this._chainageMin = null;
    this._chainageMax = null;
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

  getFilteredData(): PredictedDistressData[] {
    return this.rawData.filter(item => {
      // Note: Project and Date filtering is now done by the API
      // Case-insensitive direction comparison
      const matchesDirection = this.filters.direction === 'All' || 
        item.direction.toLowerCase() === this.filters.direction.toLowerCase();
      const matchesPavement = this.filters.pavementType === 'All' || item.pavement_type === this.filters.pavementType;
      const matchesLane = this.filters.lane === 'All' || item.lane === this.filters.lane;
      const matchesDistress = this.filters.distressType === 'All' || item.distress_type === this.filters.distressType;
      const matchesChainage = (item.chainage_start <= this.filters.chainageRange.max && item.chainage_end >= this.filters.chainageRange.min);

      return matchesDirection && matchesPavement && matchesLane && matchesDistress && matchesChainage;
    });
  }

  // Get filtered data for map markers (includes selected distress type filter)
  getFilteredDataForMap(): PredictedDistressData[] {
    const baseFilteredData = this.getFilteredData();
    
    // If a distress card is selected, filter by that distress type
    if (this.selectedDistressType !== null) {
      const selectedType = this.selectedDistressType;
      return baseFilteredData.filter(item => {
        // Check if the selected distress type has a count > 0 for this item
        const distressFieldMap: { [key: string]: string } = {
          'Rough Spot': 'rough_spot',
          'Pothole': 'pothole',
          'Hotspot': 'hotspots',
          'Edge Break': 'edge_break',
          'Simple/Alligator Crack': 'simple_crack_alligator_crack',
          'Block/Oblique Crack': 'block_crack_oblique_crack',
          'LG/Transverse crack': 'longitudinal_crack_transverse_crack',
          'Rutting': 'rutting',
          'Bleeding': 'bleeding',
          'Raveling': 'raveling'
        };
        
        const fieldName = distressFieldMap[selectedType];
        if (fieldName) {
          const fieldValue = (item as any)[fieldName] || 0;
          return fieldValue > 0;
        }
        
        return false;
      });
    }
    
    return baseFilteredData;
  }

  updateDistressSummary() {
    // Define all possible distress types with their colors
    const allDistressTypes = [
      { name: 'Rough Spot', color: '#FF6B6B', field: 'rough_spot' },
      { name: 'Pothole', color: '#FF8C00', field: 'pothole' },
      { name: 'Hotspot', color: '#45B7D1', field: 'hotspots' },
      { name: 'Edge Break', color: '#DDA0DD', field: 'edge_break' },
      { name: 'Simple/Alligator Crack', color: '#FFEAA7', field: 'simple_crack_alligator_crack' },
      { name: 'Block/Oblique Crack', color: '#98FB98', field: 'block_crack_oblique_crack' },
      { name: 'LG/Transverse crack', color: '#74B9FF', field: 'longitudinal_crack_transverse_crack' },
      { name: 'Rutting', color: '#8A2BE2', field: 'rutting' },
      { name: 'Bleeding', color: '#FD79A8', field: 'bleeding' },
      { name: 'Raveling', color: '#00B894', field: 'raveling' }
    ];

    // Get filtered data
    const filteredData = this.getFilteredData();
    
    console.log('Filtered data for summary:', filteredData.length);
    console.log('Sample filtered item:', filteredData[0]);

    // Sum up the distress counts from individual fields
    const distressCounts = new Map<string, number>();

    // Initialize all distress types with 0
    allDistressTypes.forEach(distress => {
      distressCounts.set(distress.name, 0);
    });

    // Sum counts from the individual distress fields in the data
    filteredData.forEach(item => {
      allDistressTypes.forEach(distressType => {
        const fieldValue = (item as any)[distressType.field] || 0;
        const currentCount = distressCounts.get(distressType.name) || 0;
        distressCounts.set(distressType.name, currentCount + fieldValue);
      });
    });

    console.log('Distress counts:', Array.from(distressCounts.entries()));

    // Create summary array with all distress types
    this.distressSummary = allDistressTypes.map(distress => ({
      name: distress.name,
      count: distressCounts.get(distress.name) || 0,
      color: distress.color
    }));
    
    // Update the split arrays after summary is created
    this.updateDistressArrays();
  }

  updateChainageData() {
    const filteredData = this.getFilteredData();
    if (filteredData.length === 0) {
      this.chainageData = [];
      return;
    }
    
    const maxChainage = filteredData.reduce((max, item) => 
      Math.max(max, item.chainage_end), -Infinity);
    const rangeSize = maxChainage / 5;
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
        text: 'Chainage Wise Predicted Distress',
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
            result += `<div style="margin-bottom: 4px; font-weight: 500; color: #cccccc; font-size: 12px;">Predicted Distress Distribution:</div>`;
            
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
        name: 'Predicted distress',
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
        data: this.chainageData.map((_, index) => [index, Math.random() * 10]),
        itemStyle: {
          color: this.getDistressColor(distressType)
        },
        barWidth: '60%'
      }))
    };
  }

  private getDistressColor(distressType: string): string {
    const colorMap: { [key: string]: string} = {
      'Trees': '#B8860B',              // Dark goldenrod
      'Transverse crack': '#4682B4',   // Steel blue
      'Block crack': '#228B22',        // Forest green
      'Edge Break': '#8B008B',         // Dark magenta
      'Heaves': '#DAA520',             // Goldenrod
      'Hotspots': '#008B8B',           // Dark cyan
      'Joint crack': '#A0522D',        // Sienna
      'Joint seal defects': '#8B7355', // Burlywood4
      'Longitudinal crack': '#191970', // Midnight blue (already dark)
      'Multiple cracks': '#B22222',    // Firebrick
      'Oblique crack': '#D2691E',      // Chocolate
      'Patchwork': '#4682B4',          // Steel blue
      'Pothole': '#CC6600',            // Dark orange
      'Punchout': '#B8860B',           // Dark goldenrod
      'Raveling': '#228B22',           // Forest green
      'Simple crack': '#C71585',       // Medium violet red
      'Discrete crack': '#008B8B',     // Dark cyan
      'Rutting': '#4B0082',            // Indigo
      'Alligator crack': '#8B0000',    // Dark red
      'Rough Spot': '#8B0000',         // Dark red
      'Hotspot': '#006494'             // Dark blue
    };
    return colorMap[distressType] || '#666666';
  }

  updateChart() {
    if (this.chartOptions) {
      this.chartOptions = { ...this.chartOptions };
    }
  }

  async initMap() {
    console.log('===== initMap CALLED =====');
    console.log('isBrowser:', this.isBrowser);
    
    if (!this.isBrowser) {
      console.log('Not browser, skipping map init');
      return;
    }

    try {
      const L = await import('leaflet');
      console.log('Leaflet loaded successfully');
      
      // Check if map container exists
      const mapContainer = document.getElementById('mapContainer');
      if (!mapContainer) {
        console.error('Map container not found in DOM');
        return;
      }
      console.log('Map container found:', mapContainer);

      // If map already exists, remove it first
      if (this.map) {
        console.log('Removing existing map');
        this.map.remove();
        this.map = null;
      }

      // Calculate center from data
      let centerLat = 27.259;
      let centerLng = 77.814;
      
      if (this.rawData.length > 0) {
        const validData = this.rawData.filter(item => item.latitude && item.longitude);
        console.log('Valid coordinates found:', validData.length);
        if (validData.length > 0) {
          centerLat = validData.reduce((sum, item) => sum + item.latitude, 0) / validData.length;
          centerLng = validData.reduce((sum, item) => sum + item.longitude, 0) / validData.length;
          console.log('Map center calculated:', centerLat, centerLng);
        }
      }
      
      // Create map instance
      console.log('Creating map instance...');
      this.map = L.map('mapContainer', {
        center: [centerLat, centerLng],
        zoom: 12,
        zoomControl: true
      });
      console.log('Map instance created:', !!this.map);

      // Add tile layer
      const streetLayer = L.tileLayer('http://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        attribution: '© Google'
      });

      streetLayer.addTo(this.map);
      console.log('Tiles added to map');

      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
          console.log('Map initialized successfully');
          this.addDistressMarkers();
        }
      }, 200);

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  async addDistressMarkers() {
    if (!this.map || !this.isBrowser) {
      console.log('Cannot add markers: map not initialized or not browser');
      return;
    }

    try {
      const L = await import('leaflet');
      
      this.clearMapMarkers();

      const filteredData = this.getFilteredDataForMap();
      console.log('Adding markers for', filteredData.length, 'items');
      console.log('Selected distress type:', this.selectedDistressType);

      const bounds: any[] = [];

      filteredData.forEach(item => {
        if (item.latitude && item.longitude) {
          // Determine marker color based on selected distress type
          let markerColor = this.getDistressColor(item.distress_type);
          let markerRadius = 3;
          let markerOpacity = 0.8;
          
          // If a specific distress is selected, highlight it
          if (this.selectedDistressType) {
            const distressFieldMap: { [key: string]: string } = {
              'Rough Spot': 'rough_spot',
              'Pothole': 'pothole',
              'Hotspot': 'hotspots',
              'Edge Break': 'edge_break',
              'Simple/Alligator Crack': 'simple_crack_alligator_crack',
              'Block/Oblique Crack': 'block_crack_oblique_crack',
              'LG/Transverse crack': 'longitudinal_crack_transverse_crack',
              'Rutting': 'rutting',
              'Bleeding': 'bleeding',
              'Raveling': 'raveling'
            };
            
            const fieldName = distressFieldMap[this.selectedDistressType];
            const distressSummaryItem = this.distressSummary.find(d => d.name === this.selectedDistressType);
            
            if (fieldName && distressSummaryItem) {
              markerColor = distressSummaryItem.color;
              markerRadius = 5; // Larger marker for selected distress
              markerOpacity = 1;
            }
          }
          
          const marker = L.circleMarker([item.latitude, item.longitude], {
            radius: markerRadius,
            fillColor: markerColor,
            color: '#ffffff', // White border like Dashboard
            weight: 1,
            opacity: 1, // Full opacity for border
            fillOpacity: 0.8 // Match Dashboard fill opacity
          }).addTo(this.map);

          marker.bindPopup(`
            <div style="color: white ; font-size: 12px;">
              <strong>Predicted: ${this.selectedDistressType || item.distress_type}</strong><br>
              Chainage: ${item.chainage_start} - ${item.chainage_end} KM<br>
              Direction: ${item.direction}<br>
              Severity: ${item.severity}<br>
              Confidence: ${item.prediction_confidence?.toFixed(1)}%
            </div>
          `);

          // Collect coordinates for bounds
          bounds.push([item.latitude, item.longitude]);
        }
      });

      // Fit map to show all markers for the selected project
      if (bounds.length > 0) {
        await this.fitMapToProject(bounds);
      }
      
      console.log('Markers added successfully');
    } catch (error) {
      console.error('Error adding distress markers:', error);
    }
  }

  clearMapMarkers() {
    if (!this.map) return;
    
    this.map.eachLayer((layer: any) => {
      if (layer.options && layer.options.radius !== undefined) {
        this.map.removeLayer(layer);
      }
    });
  }

  // Fit map to show all data points for the selected project
  async fitMapToProject(bounds: any[]) {
    if (!this.map || !this.isBrowser || bounds.length === 0) {
      return;
    }

    try {
      const L = await import('leaflet');
      
      if (bounds.length === 1) {
        // If only one point, center on it with a reasonable zoom
        this.map.setView(bounds[0], 14);
        console.log('Map centered on single point');
      } else {
        // If multiple points, fit to bounds with padding
        const latLngBounds = L.latLngBounds(bounds);
        this.map.fitBounds(latLngBounds, {
          padding: [50, 50], // Add 50px padding around the bounds
          maxZoom: 15 // Don't zoom in too much
        });
        console.log('Map fitted to', bounds.length, 'project locations');
      }
    } catch (error) {
      console.error('Error fitting map to project:', error);
    }
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
    return '';
  }

  // Update the split arrays when summary changes
  private updateDistressArrays() {
    const pointDistressNames = ['Rough Spot', 'Pothole', 'Hotspot', 'Edge Break'];
    this.pointDistresses = this.distressSummary.filter(d => pointDistressNames.includes(d.name));
    
    const cracksAndRuttingNames = [
      'Simple/Alligator Crack', 
      'Block/Oblique Crack', 
      'LG/Transverse crack', 
      'Rutting', 
      'Bleeding', 
      'Raveling'
    ];
    this.cracksAndRutting = this.distressSummary.filter(d => cracksAndRuttingNames.includes(d.name)).map(d => ({...d, count: Math.round(d.count)}));
  }

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
}
