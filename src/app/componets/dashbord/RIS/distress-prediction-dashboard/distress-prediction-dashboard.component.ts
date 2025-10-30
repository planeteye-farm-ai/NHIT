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
  providers: [provideEcharts()],
  templateUrl: './distress-prediction-dashboard.component.html',
  styleUrl: './distress-prediction-dashboard.component.scss',
})
export class DistressPredictionDashboardComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('mapContainer', { static: false }) mapContainerRef!: ElementRef;

  rawData: PredictedDistressData[] = [];
  filters: FilterData = {
    date: '',
    projectName: '',
    direction: 'Increasing',
    chainageRange: { min: 0, max: 1380.387 },
    pavementType: 'All',
    lane: 'All',
    distressType: 'All',
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

  // Chainage comparison chart modal properties
  isChainageComparisonModalOpen: boolean = false;
  selectedDistressesForComparison: string[] = [];
  chainageComparisonChartOptions: any = {};
  availableDistressesForComparison: string[] = [];

  public map: any;
  public isBrowser: boolean;
  public isLoading: boolean = false;

  // Flag to prevent duplicate data loads when project changes
  private isProjectChanging: boolean = false;

  // Cache for chainage min/max values
  private _chainageMin: number | null = null;
  private _chainageMax: number | null = null;

  // Zoom-based visualization properties
  private currentZoomLevel: number = 10;
  private zoomThreshold: number = 16; // Show colorful points when zoom < 16, icons when zoom >= 16 (high for better performance)
  private distressMarkers: any[] = []; // Store all markers
  private iconCache: Map<string, any> = new Map(); // Cache for Leaflet icons (PERFORMANCE BOOST!)

  // Data limiting for performance with large datasets
  private maxMarkersToShow: number = 1000; // Maximum markers to render at once
  private dataLimitThreshold: number = 500; // When to start limiting data

  // Data size indicator properties
  showDataSizeIndicator: boolean = false;
  displayedMarkersCount: number = 0;
  totalDataCount: number = 0;
  isDataLimited: boolean = false;

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
      setTimeout(() => {
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

  // ============================================
  // CHAINAGE COMPARISON CHART METHODS
  // ============================================

  // Open chainage comparison chart modal
  openChainageComparisonModal() {
    // Initialize available distresses for comparison
    this.availableDistressesForComparison = this.distressSummary
      .filter(distress => distress.count > 0)
      .map(distress => distress.name);
    
    // Start with first 3 distresses selected by default
    this.selectedDistressesForComparison = this.availableDistressesForComparison.slice(0, 3);
    
    // Open modal first
    this.isChainageComparisonModalOpen = true;
    
    // Generate chart after a short delay to ensure DOM is ready
    setTimeout(() => {
      this.generateChainageComparisonChart();
      console.log('✅ Distress Prediction: Generated chainage comparison chart');
    }, 100);
    
    console.log('✅ Distress Prediction: Opened chainage comparison chart modal with distresses:', this.selectedDistressesForComparison);
  }

  // Close chainage comparison chart modal
  closeChainageComparisonModal() {
    this.isChainageComparisonModalOpen = false;
    this.selectedDistressesForComparison = [];
    console.log('✅ Distress Prediction: Closed chainage comparison chart modal');
  }

  // Toggle distress selection for comparison chart
  toggleDistressForComparison(distressName: string) {
    const index = this.selectedDistressesForComparison.indexOf(distressName);
    
    if (index > -1) {
      // Distress already selected, remove it
      this.selectedDistressesForComparison.splice(index, 1);
    } else {
      // Distress not selected, add it (limit to 5 for readability)
      if (this.selectedDistressesForComparison.length < 5) {
        this.selectedDistressesForComparison.push(distressName);
      } else {
        console.warn('⚠️ Maximum 5 distresses can be compared at once');
        return;
      }
    }
    
    console.log('✅ Distress Prediction: Selected distresses for comparison:', this.selectedDistressesForComparison);
    
    // Regenerate chart with new selection
    setTimeout(() => {
      this.generateChainageComparisonChart();
    }, 50);
  }

  // Check if distress is selected for comparison
  isDistressSelectedForComparison(distressName: string): boolean {
    return this.selectedDistressesForComparison.includes(distressName);
  }

  // Get distress color for template
  getDistressColorForChip(distressName: string): string {
    return this.distressSummary.find(d => d.name === distressName)?.color || '#4CAF50';
  }

  // Get distress background color for chip
  getDistressChipBackgroundColor(distressName: string): string {
    return this.isDistressSelectedForComparison(distressName) 
      ? this.getDistressColorForChip(distressName)
      : 'transparent';
  }

  // Generate chainage comparison chart
  generateChainageComparisonChart() {
    if (!this.rawData || this.rawData.length === 0) {
      console.log('No data available for chainage comparison chart');
      return;
    }

    const filteredData = this.getFilteredData();

    if (filteredData.length === 0) {
      console.log('No filtered data for chainage comparison chart');
      return;
    }

    // Detect mobile view for responsive chart layout
    const isMobileView = window.innerWidth <= 768;

    // Create chainage bins
    const chainageMin = this.getChainageMin();
    const chainageMax = this.getChainageMax();
    const binCount = 20;
    const binSize = (chainageMax - chainageMin) / binCount;

    const chainageBins: number[] = [];
    for (let i = 0; i <= binCount; i++) {
      chainageBins.push(chainageMin + (i * binSize));
    }

    // Generate series data for each selected distress
    const series: any[] = [];

    console.log('🔍 Generating chart for distresses:', this.selectedDistressesForComparison);
    console.log('🔍 Chainage range:', chainageMin, 'to', chainageMax);

    this.selectedDistressesForComparison.forEach(distressName => {
      const distressColor = this.distressSummary.find(d => d.name === distressName)?.color || '#4CAF50';
      
      // Calculate distress count for each chainage bin
      const binData: number[] = new Array(binCount).fill(0);

      filteredData.forEach(item => {
        if (item.distress_type === distressName) {
          const itemChainage = (item.chainage_start + item.chainage_end) / 2;
          const binIndex = Math.floor((itemChainage - chainageMin) / binSize);
          
          if (binIndex >= 0 && binIndex < binCount) {
            binData[binIndex] += 1; // Count distress occurrences
          }
        }
      });

      const totalCount = binData.reduce((sum, val) => sum + val, 0);
      console.log(`📊 ${distressName}: Total count = ${totalCount}, Color = ${distressColor}`);

      series.push({
        name: distressName,
        type: 'bar',
        data: binData,
        itemStyle: { 
          color: distressColor,
          borderRadius: [4, 4, 0, 0],
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.3)',
          shadowOffsetY: 3
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            color: distressColor,
            shadowBlur: 20,
            shadowColor: distressColor,
            borderWidth: 2,
            borderColor: '#fff'
          }
        },
        barGap: '10%',
        barCategoryGap: '20%'
      });
    });

    console.log('📈 Generated series count:', series.length);

    // Generate X-axis labels
    const xAxisLabels = chainageBins.slice(0, binCount).map(chainage => 
      chainage.toFixed(2)
    );

    // Configure chart options
    this.chainageComparisonChartOptions = Object.assign({}, {
      title: {
        // text: 'Predicted Distress Distribution Along Chainage (Bar Chart)',
        left: 'center',
        textStyle: {
          color: '#fff',
          fontSize: 18,
          fontWeight: 'bold'
        },
        // subtext: 'Interactive comparison of predicted distress types across road sections',
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
        data: this.selectedDistressesForComparison,
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
        selectedMode: true,
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
        boundaryGap: true,
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
        name: 'Predicted Distress Count',
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
        min: 0
      },
      series: series,
      backgroundColor: 'transparent',
      animationDuration: 1000,
      animationEasing: 'cubicOut',
      animationDelay: (idx: number) => idx * 50,
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100
        },
        {
          type: 'slider',
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

    console.log('✅ Distress Prediction: Generated chainage comparison chart with', series.length, 'distresses');
  }

  private async loadProjectsAndDates() {
    try {
      const response = await fetch(
        'https://fantastic-reportapi-production.up.railway.app/projects-dates/distress_predicted',
        {
          method: 'GET',
          headers: {
            accept: 'application/json',
          },
        }
      );

      const projectDates: ProjectDatesResponse = await response.json();
      // Projects and dates loaded successfully

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
      console.error(
        'Error loading predicted distress projects and dates:',
        error
      );
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
        distress_type: ['All'],
      };

      // API request prepared

      const response = await fetch(
        'https://fantastic-reportapi-production.up.railway.app/distress_predic_filter',
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
      // API response received

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
        apiResponse.forEach((group) => {
          if (Array.isArray(group)) {
            flatData.push(...group);
          } else {
            flatData.push(group);
          }
        });
      } else {
        flatData = [];
      }

      // Data flattened successfully

      this.rawData = flatData.map((item: any) => ({
        project_name: item.project_name || 'Unknown Project',
        chainage_start: item.chainage_start || 0,
        chainage_end: item.chainage_end || 0,
        direction: item.direction
          ? item.direction.charAt(0).toUpperCase() +
            item.direction.slice(1).toLowerCase()
          : 'Unknown',
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
        longitudinal_crack_transverse_crack:
          item['longitudinal_crack/transverse_crack'] || 0,
        rutting: item.rutting || 0,
        bleeding: item.bleeding || 0,
        raveling: item.raveling || 0,
      }));

      // Data loaded successfully

      // Reset chainage cache after loading new data
      this.resetChainageCache();

      this.extractFilterOptions();
      this.updateDistressSummary();
      this.updateChainageData();

      // Initialize map after data is loaded
      if (!this.map) {
        // Initializing map after data load
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
    this.availableDirections = [
      ...new Set(this.rawData.map((item) => item.direction)),
    ];
    this.availablePavementTypes = [
      ...new Set(this.rawData.map((item) => item.pavement_type)),
    ];
    this.availableLanes = [...new Set(this.rawData.map((item) => item.lane))];
    this.availableDistressTypes = [
      ...new Set(this.rawData.map((item) => item.distress_type)),
    ];

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

  getFilteredData(): PredictedDistressData[] {
    return this.rawData.filter((item) => {
      // Note: Project and Date filtering is now done by the API
      // Case-insensitive direction comparison
      const matchesDirection =
        this.filters.direction === 'All' ||
        item.direction.toLowerCase() === this.filters.direction.toLowerCase();
      const matchesPavement =
        this.filters.pavementType === 'All' ||
        item.pavement_type === this.filters.pavementType;
      const matchesLane =
        this.filters.lane === 'All' || item.lane === this.filters.lane;
      const matchesDistress =
        this.filters.distressType === 'All' ||
        item.distress_type === this.filters.distressType;
      const matchesChainage =
        item.chainage_start <= this.filters.chainageRange.max &&
        item.chainage_end >= this.filters.chainageRange.min;

      return (
        matchesDirection &&
        matchesPavement &&
        matchesLane &&
        matchesDistress &&
        matchesChainage
      );
    });
  }

  // Get filtered data for map markers (includes selected distress type filter)
  getFilteredDataForMap(): PredictedDistressData[] {
    const baseFilteredData = this.getFilteredData();

    // If a distress card is selected, filter by that distress type
    if (this.selectedDistressType !== null) {
      const selectedType = this.selectedDistressType;
      const filteredByDistress = baseFilteredData.filter((item) => {
        // Check if the selected distress type has a count > 0 for this item
        const distressFieldMap: { [key: string]: string } = {
          'Rough Spot': 'rough_spot',
          Pothole: 'pothole',
          Hotspot: 'hotspots',
          'Edge Break': 'edge_break',
          'Simple/Alligator Crack': 'simple_crack_alligator_crack',
          'Block/Oblique Crack': 'block_crack_oblique_crack',
          'LG/Transverse crack': 'longitudinal_crack_transverse_crack',
          Rutting: 'rutting',
          Bleeding: 'bleeding',
          Raveling: 'raveling',
        };

        const fieldName = distressFieldMap[selectedType];
        if (fieldName) {
          const fieldValue = (item as any)[fieldName] || 0;
          return fieldValue > 0;
        }

        return false;
      });

      // Apply data limiting for large datasets
      return this.limitDataForPerformance(filteredByDistress);
    }

    // Apply data limiting for large datasets
    return this.limitDataForPerformance(baseFilteredData);
  }

  // Limit data for performance with large datasets
  private limitDataForPerformance(
    data: PredictedDistressData[]
  ): PredictedDistressData[] {
    // Set total data count for indicator
    this.totalDataCount = data.length;

    // If data is small, return as-is
    if (data.length <= this.dataLimitThreshold) {
      this.displayedMarkersCount = data.length;
      this.isDataLimited = false;
      this.showDataSizeIndicator = false;
      return data;
    }

    // For large datasets, limit based on zoom level
    const currentZoom = this.map ? this.map.getZoom() : 10;

    // Calculate dynamic limit based on zoom level
    let limit = this.maxMarkersToShow;

    if (currentZoom < 12) {
      // Very zoomed out - show fewer markers for performance
      limit = Math.min(300, data.length);
    } else if (currentZoom < 14) {
      // Moderately zoomed out - show medium amount
      limit = Math.min(600, data.length);
    } else if (currentZoom < 16) {
      // Zoomed in - show more markers
      limit = Math.min(800, data.length);
    } else {
      // Very zoomed in - show all or maximum
      limit = Math.min(this.maxMarkersToShow, data.length);
    }

    // If we need to limit, sample evenly across the data
    if (data.length > limit) {
      const step = Math.floor(data.length / limit);
      const limitedData = data
        .filter((_, index) => index % step === 0)
        .slice(0, limit);

      // Set indicator properties
      this.displayedMarkersCount = limitedData.length;
      this.isDataLimited = true;
      this.showDataSizeIndicator = true;

      return limitedData;
    }

    // No limiting needed
    this.displayedMarkersCount = data.length;
    this.isDataLimited = false;
    this.showDataSizeIndicator = data.length > this.dataLimitThreshold;

    return data;
  }

  updateDistressSummary() {
    // Define all possible distress types with their colors
    const allDistressTypes = [
      { name: 'Rough Spot', color: '#FF6B6B', field: 'rough_spot' },
      { name: 'Pothole', color: '#FF8C00', field: 'pothole' },
      { name: 'Hotspot', color: '#45B7D1', field: 'hotspots' },
      { name: 'Edge Break', color: '#DDA0DD', field: 'edge_break' },
      {
        name: 'Simple/Alligator Crack',
        color: '#FFEAA7',
        field: 'simple_crack_alligator_crack',
      },
      {
        name: 'Block/Oblique Crack',
        color: '#98FB98',
        field: 'block_crack_oblique_crack',
      },
      {
        name: 'LG/Transverse crack',
        color: '#74B9FF',
        field: 'longitudinal_crack_transverse_crack',
      },
      { name: 'Rutting', color: '#8A2BE2', field: 'rutting' },
      { name: 'Bleeding', color: '#FD79A8', field: 'bleeding' },
      { name: 'Raveling', color: '#00B894', field: 'raveling' },
    ];

    // Get filtered data
    const filteredData = this.getFilteredData();

    // Processing filtered data for summary

    // Sum up the distress counts from individual fields
    const distressCounts = new Map<string, number>();

    // Initialize all distress types with 0
    allDistressTypes.forEach((distress) => {
      distressCounts.set(distress.name, 0);
    });

    // Sum counts from the individual distress fields in the data
    filteredData.forEach((item) => {
      allDistressTypes.forEach((distressType) => {
        const fieldValue = (item as any)[distressType.field] || 0;
        const currentCount = distressCounts.get(distressType.name) || 0;
        distressCounts.set(distressType.name, currentCount + fieldValue);
      });
    });

    // Distress counts calculated

    // Create summary array with all distress types
    this.distressSummary = allDistressTypes.map((distress) => ({
      name: distress.name,
      count: distressCounts.get(distress.name) || 0,
      color: distress.color,
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

    const maxChainage = filteredData.reduce(
      (max, item) => Math.max(max, item.chainage_end),
      -Infinity
    );
    const rangeSize = maxChainage / 5;
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
        text: 'Chainage Wise Predicted Distress',
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
        name: 'Predicted distress',
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
        data: this.chainageData.map((_, index) => [index, Math.random() * 10]),
        itemStyle: {
          color: this.getDistressColor(distressType),
        },
        barWidth: '60%',
      })),
    };
  }

  private getDistressColor(distressType: string): string {
    const colorMap: { [key: string]: string } = {
      Trees: '#B8860B', // Dark goldenrod
      'Transverse crack': '#4682B4', // Steel blue
      'Block crack': '#228B22', // Forest green
      'Edge Break': '#8B008B', // Dark magenta
      Heaves: '#DAA520', // Goldenrod
      Hotspots: '#008B8B', // Dark cyan
      'Joint crack': '#A0522D', // Sienna
      'Joint seal defects': '#8B7355', // Burlywood4
      'Longitudinal crack': '#191970', // Midnight blue (already dark)
      'Multiple cracks': '#B22222', // Firebrick
      'Oblique crack': '#D2691E', // Chocolate
      Patchwork: '#4682B4', // Steel blue
      Pothole: '#CC6600', // Dark orange
      Punchout: '#B8860B', // Dark goldenrod
      Raveling: '#228B22', // Forest green
      'Simple crack': '#C71585', // Medium violet red
      'Discrete crack': '#008B8B', // Dark cyan
      Rutting: '#4B0082', // Indigo
      'Alligator crack': '#8B0000', // Dark red
      'Rough Spot': '#8B0000', // Dark red
      Hotspot: '#006494', // Dark blue
    };
    return colorMap[distressType] || '#666666';
  }

  updateChart() {
    if (this.chartOptions) {
      this.chartOptions = { ...this.chartOptions };
    }
  }

  async initMap() {
    if (!this.isBrowser) {
      return;
    }

    try {
      const L = await import('leaflet');

      // Check if map container exists
      const mapContainer = document.getElementById('mapContainer');
      if (!mapContainer) {
        console.error('Map container not found in DOM');
        return;
      }

      // If map already exists, remove it first
      if (this.map) {
        this.map.remove();
        this.map = null;
      }

      // Calculate center from data
      let centerLat = 27.259;
      let centerLng = 77.814;

      if (this.rawData.length > 0) {
        const validData = this.rawData.filter(
          (item) => item.latitude && item.longitude
        );
        if (validData.length > 0) {
          centerLat =
            validData.reduce((sum, item) => sum + item.latitude, 0) /
            validData.length;
          centerLng =
            validData.reduce((sum, item) => sum + item.longitude, 0) /
            validData.length;
        }
      }

      // Create map instance
      this.map = L.map('mapContainer', {
        center: [centerLat, centerLng],
        zoom: 12,
        zoomControl: true,
      });

      // Add tile layer
      const streetLayer = L.tileLayer(
        'http://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
        {
          maxZoom: 20,
          attribution: '© Google',
        }
      );

      streetLayer.addTo(this.map);

      // Add zoom event listener (like Dashboard - no debouncing for better responsiveness)
      this.map.on('zoomend', () => {
        if (this.map) {
          this.currentZoomLevel = this.map.getZoom();
          // Use updateMapMarkersOnly to preserve selected distress filter and not refit bounds
          this.updateMapMarkersOnly();
        }
      });

      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
          this.addDistressMarkers();
        }
      }, 200);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  async addDistressMarkers() {
    if (!this.map || !this.isBrowser) {
      // Cannot add markers: map not initialized or not browser
      return;
    }

    try {
      const L = await import('leaflet');

      this.clearMapMarkers();

      const filteredData = this.getFilteredDataForMap();

      // Check current zoom level and decide what to show
      this.currentZoomLevel = this.map.getZoom();

      if (this.currentZoomLevel >= this.zoomThreshold) {
        // Zoomed in - show Font Awesome icons
        await this.showIconMarkers(filteredData, L);
      } else {
        // Zoomed out - show colorful circle markers
        await this.showColorfulPoints(filteredData, L);
      }

      // Fit map to show all markers for the selected project
      const bounds: any[] = [];
      filteredData.forEach((item) => {
        if (item.latitude && item.longitude) {
          bounds.push([item.latitude, item.longitude]);
        }
      });

      if (bounds.length > 0) {
        await this.fitMapToProject(bounds);
      }
    } catch (error) {
      console.error('Error adding distress markers:', error);
    }
  }

  // Method to update map markers WITHOUT refitting bounds (for distress selection)
  async updateMapMarkersOnly() {
    if (!this.map || !this.isBrowser) {
      return;
    }

    try {
      const L = await import('leaflet');

      this.clearMapMarkers();

      const filteredData = this.getFilteredDataForMap();

      // Check current zoom level and decide what to show
      this.currentZoomLevel = this.map.getZoom();

      if (this.currentZoomLevel >= this.zoomThreshold) {
        // Zoomed in - show Font Awesome icons
        await this.showIconMarkers(filteredData, L);
      } else {
        // Zoomed out - show colorful circle markers
        await this.showColorfulPoints(filteredData, L);
      }

      // DON'T FIT MAP BOUNDS - Keep current zoom and position
      console.log(`✅ Updated map markers for ${this.selectedDistressType || 'All Distresses'} without refitting bounds`);
    } catch (error) {
      console.error('Error updating map markers:', error);
    }
  }

  // Method to show colorful circle markers (zoomed out view) - optimized for large data
  private async showColorfulPoints(
    filteredData: PredictedDistressData[],
    L: any
  ) {
    // Clear existing markers first
    this.clearMapMarkers();

    // Log data size for debugging
    console.log(
      `Rendering ${filteredData.length} markers (limited from larger dataset)`
    );

    // Get color for selected distress type from summary (for consistency)
    const selectedColor = this.selectedDistressType 
      ? (this.distressSummary.find(d => d.name === this.selectedDistressType)?.color || this.getDistressColor(this.selectedDistressType))
      : null;

    // Determine marker size once before loop (moved outside for performance)
    const markerRadius = this.selectedDistressType ? 8 : 5; // Larger when filtering
    const markerOpacity = this.selectedDistressType ? 0.9 : 0.7;

    // Use for loop instead of forEach for better performance with large data
    for (let i = 0; i < filteredData.length; i++) {
      const item = filteredData[i];
      if (item.latitude && item.longitude) {
        // Use selected distress color if filtering, otherwise use item's color
        const color = selectedColor || this.getDistressColor(item.distress_type);

        const marker = L.circleMarker([item.latitude, item.longitude], {
          radius: markerRadius,
          fillColor: color,
          color: color,
          weight: 0,
          opacity: 1,
          fillOpacity: markerOpacity,
        }).addTo(this.map);

        // Create popup only when clicked - saves massive memory
        marker.on('click', () => {
          const popup = `<div style="padding:5px;"><b>Predicted: ${
            item.distress_type
          }</b><br>Ch: ${item.chainage_start?.toFixed(
            1
          )}-${item.chainage_end?.toFixed(
            1
          )} km<br>Conf: ${item.prediction_confidence?.toFixed(0)}%</div>`;
          marker.bindPopup(popup).openPopup();
        });

        this.distressMarkers.push(marker);
      }
    }
  }

  // Method to show icon markers (zoomed in view) - optimized for large data
  private async showIconMarkers(filteredData: PredictedDistressData[], L: any) {
    // Clear existing markers first
    this.clearMapMarkers();

    // Log data size for debugging
    console.log(
      `Rendering ${filteredData.length} icon markers (limited from larger dataset)`
    );

    // Use for loop instead of forEach for better performance with large data
    for (let i = 0; i < filteredData.length; i++) {
      const item = filteredData[i];
      if (item.latitude && item.longitude) {
        // If a specific distress type is selected, use that icon; otherwise use the item's distress type
        const iconType = this.selectedDistressType || item.distress_type;

        // Use cached icon or create new one
        let customIcon = this.iconCache.get(iconType);

        if (!customIcon) {
          const iconHtml = this.getDistressIcon(iconType);
          customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-distress-icon',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });
          // Cache the icon for reuse
          this.iconCache.set(iconType, customIcon);
        }

        const marker = L.marker([item.latitude, item.longitude], {
          icon: customIcon,
        }).addTo(this.map);

        // Create popup only when clicked - saves massive memory
        marker.on('click', () => {
          const displayDistressType =
            this.selectedDistressType || item.distress_type;
          const color = this.getDistressColor(displayDistressType);
          const popup = `<div style="padding:8px;"><div style="color:${color};font-weight:bold;margin-bottom:5px;">Predicted: ${displayDistressType}</div><div style="font-size:11px;">Ch: ${item.chainage_start?.toFixed(
            1
          )}-${item.chainage_end?.toFixed(1)} km<br>Dir: ${
            item.direction || 'N/A'
          }<br>Conf: ${item.prediction_confidence?.toFixed(0)}%</div></div>`;
          marker.bindPopup(popup).openPopup();
        });

        this.distressMarkers.push(marker);
      }
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

      const filteredData = this.getFilteredDataForMap();

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

  // Get Font Awesome icon for distress type
  private getDistressIcon(distressType: string): string {
    const iconMap: { [key: string]: { icon: string; color: string } } = {
      Pothole: { icon: 'fa-solid fa-circle', color: '#CC6600' },
      Rutting: { icon: 'fa-solid fa-road', color: '#4B0082' },
      'Edge Break': { icon: 'fa-solid fa-divide', color: '#8B008B' },
      'Simple/Alligator Crack': {
        icon: 'fa-solid fa-wave-square',
        color: '#C71585',
      },
      'Block/Oblique Crack': { icon: 'fa-solid fa-grip', color: '#228B22' },
      'LG/Transverse crack': {
        icon: 'fa-solid fa-arrows-left-right',
        color: '#191970',
      },
      Bleeding: { icon: 'fa-solid fa-droplet', color: '#191970' },
      Raveling: { icon: 'fa-solid fa-hands-bound', color: '#228B22' },
      Hotspot: { icon: 'fa-solid fa-fire', color: '#006494' },
      'Rough Spot': { icon: 'fa-solid fa-mountain', color: '#8B0000' },
      'Alligator crack': { icon: 'fa-solid fa-wave-square', color: '#8B0000' },
      'Transverse crack': {
        icon: 'fa-solid fa-arrows-left-right',
        color: '#4682B4',
      },
      'Block crack': { icon: 'fa-solid fa-grip', color: '#228B22' },
      'Longitudinal crack': {
        icon: 'fa-solid fa-arrows-up-down',
        color: '#191970',
      },
      'Oblique crack': { icon: 'fa-solid fa-slash', color: '#D2691E' },
      Patchwork: { icon: 'fa-solid fa-band-aid', color: '#4682B4' },
      Heaves: { icon: 'fa-solid fa-chart-line', color: '#DAA520' },
      Hotspots: { icon: 'fa-solid fa-fire', color: '#008B8B' },
      'Joint crack': { icon: 'fa-solid fa-link-slash', color: '#A0522D' },
      'Joint seal defects': {
        icon: 'fa-solid fa-circle-xmark',
        color: '#8B7355',
      },
      'Multiple cracks': { icon: 'fa-solid fa-burst', color: '#B22222' },
      Punchout: { icon: 'fa-solid fa-square-minus', color: '#B8860B' },
      'Simple crack': { icon: 'fa-solid fa-grip-lines', color: '#C71585' },
      'Discrete crack': {
        icon: 'fa-solid fa-grip-lines-vertical',
        color: '#008B8B',
      },
    };

    const iconData = iconMap[distressType] || {
      icon: 'fa-solid fa-triangle-exclamation',
      color: '#666666',
    };

    return `
      <div style="width:28px;height:28px;border-radius:50%;background:${iconData.color};display:flex;align-items:center;justify-content:center;">
        <i class="${iconData.icon}" style="color:#fff;font-size:14px;"></i>
      </div>
    `;
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
    // Note: We keep iconCache for performance - icons can be reused across different views
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
        // Map centered on single point
      } else {
        // If multiple points, fit to bounds with padding
        const latLngBounds = L.latLngBounds(bounds);
        this.map.fitBounds(latLngBounds, {
          padding: [50, 50], // Add 50px padding around the bounds
          maxZoom: 15, // Don't zoom in too much
        });
        // Map fitted to project locations
      }
    } catch (error) {
      console.error('Error fitting map to project:', error);
    }
  }

  onDistressCardClick(distress: DistressData) {
    // Toggle selection - if clicking same distress, deselect it
    this.selectedDistressType =
      this.selectedDistressType === distress.name ? null : distress.name;

    if (this.isBrowser) {
      // Update chart
      this.updateChart();
      
      // Update map markers WITHOUT refitting bounds
      this.updateMapMarkersOnly();
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

  // Update the split arrays when summary changes
  private updateDistressArrays() {
    const pointDistressNames = [
      'Rough Spot',
      'Pothole',
      'Hotspot',
      'Edge Break',
    ];
    this.pointDistresses = this.distressSummary.filter((d) =>
      pointDistressNames.includes(d.name)
    );

    const cracksAndRuttingNames = [
      'Simple/Alligator Crack',
      'Block/Oblique Crack',
      'LG/Transverse crack',
      'Rutting',
      'Bleeding',
      'Raveling',
    ];
    this.cracksAndRutting = this.distressSummary
      .filter((d) => cracksAndRuttingNames.includes(d.name))
      .map((d) => ({ ...d, count: Math.round(d.count) }));
  }

  async onDateChange(event: any) {
    this.filters.date = event.target.value;
    // Date change triggered

    // Don't reload if we're in the middle of a project change
    if (this.isProjectChanging) {
      // Skipping date change - project is changing
      return;
    }

    if (this.filters.date) {
      await this.loadDistressData();
    }
  }

  async onProjectChange(event: any) {
    // Project change triggered
    this.isProjectChanging = true;

    this.filters.projectName = event.target.value;

    // Update available dates for the selected project
    this.availableDates = this.projectDatesMap[this.filters.projectName] || [];
    // Available dates for project updated

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
}
