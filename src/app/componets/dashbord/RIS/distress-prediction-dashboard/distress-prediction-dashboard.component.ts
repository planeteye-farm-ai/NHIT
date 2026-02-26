import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  PLATFORM_ID,
  Inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEchartsModule, provideEcharts } from 'ngx-echarts';
import { ProjectSelectionService } from '../../../../shared/services/project-selection.service';

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
  alligator_crack?: number;
  transverse_crack?: number;
  hairline_crack?: number;
  longitudinal_crack?: number;
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
  @ViewChild('mapContainerWrapper', { static: false }) mapContainerWrapper!: ElementRef;

  isMapFullScreen = false;
  private fullscreenChangeListener = () => this.onFullscreenChange();

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

  // Month-wise comparison chart modal properties
  isMonthComparisonModalOpen: boolean = false;
  selectedDistressesForMonthComparison: string[] = [];
  monthComparisonChartOptions: any = {};
  availableMonthsForComparison: string[] = [];
  isLoadingMonthChart: boolean = false;
  monthDataCache: { [month: string]: PredictedDistressData[] } = {};
  showDistressSelectionInModal: boolean = true;
  
  // Toggle for month comparison mode
  isMonthComparisonMode: boolean = false;
  isPreloadingMonthData: boolean = false;

  public map: any;
  public isBrowser: boolean;
  public isLoading: boolean = false;
  isLoadingKml: boolean = false;

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

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private projectSelection: ProjectSelectionService,
    private cdr: ChangeDetectorRef
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
      document.addEventListener('fullscreenchange', this.fullscreenChangeListener);
      setTimeout(() => {
        this.initChartOptions();
        // Map will be initialized after data loads in loadDistressData()
      }, 500);
    }
  }

  toggleMapFullScreen(): void {
    if (!this.mapContainerWrapper?.nativeElement) return;
    const el = this.mapContainerWrapper.nativeElement as HTMLElement;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.()?.then(() => {}).catch(() => {});
    } else {
      document.exitFullscreen?.();
    }
  }

  private onFullscreenChange(): void {
    this.isMapFullScreen = !!document.fullscreenElement;
    if (this.map) {
      setTimeout(() => this.map.invalidateSize(), 100);
    }
  }

  ngOnDestroy() {
    document.removeEventListener('fullscreenchange', this.fullscreenChangeListener);
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

    // Detect mobile/tablet view for responsive chart layout
    const isMobileView = window.innerWidth <= 768;
    const isTabletOrSmaller = window.innerWidth <= 1024; // Use horizontal bars for tablet and smaller

    // Create chainage bins using SELECTED chainage range (not full project range)
    const chainageMin = this.filters.chainageRange.min;
    const chainageMax = this.filters.chainageRange.max;
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
          borderRadius: isTabletOrSmaller ? [0, 4, 4, 0] : [4, 4, 0, 0], // Horizontal bars for tablet/mobile, vertical for desktop
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.3)',
          shadowOffsetX: isTabletOrSmaller ? 3 : 0,
          shadowOffsetY: isTabletOrSmaller ? 0 : 3
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

    const insideDataZoom = isTabletOrSmaller ? {
      type: 'inside',
      yAxisIndex: 0,
      start: 0,
      end: 100,
      moveOnMouseWheel: true,
      moveOnMouseMove: true
    } : {
      type: 'inside',
      start: 0,
      end: 100
    };

    const sliderDataZoom = isTabletOrSmaller ? {
      type: 'slider',
      yAxisIndex: 0,
      orient: 'vertical',
      left: isMobileView ? '4%' : '2%',
      top: isMobileView ? '24%' : '18%',
      bottom: isMobileView ? '18%' : '14%',
      width: isMobileView ? 16 : 18,
      start: 0,
      end: 100,
      borderColor: '#667eea',
      backgroundColor: 'rgba(102, 126, 234, 0.15)',
      fillerColor: 'rgba(102, 126, 234, 0.35)',
      handleIcon: 'path://M2,0 L2,8 L6,4 Z',
      handleSize: '120%',
      handleStyle: {
        color: '#ffffff',
        borderColor: '#667eea',
        borderWidth: 1,
        shadowBlur: 6,
        shadowColor: 'rgba(102, 126, 234, 0.6)'
      },
      moveHandleStyle: {
        color: '#ffffff',
        borderColor: '#667eea'
      },
      brushSelect: false,
      showDetail: false,
      filterMode: 'filter'
    } : {
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
    };

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
        left: isTabletOrSmaller ? (isMobileView ? '24%' : '18%') : '3%',
        right: isTabletOrSmaller ? (isMobileView ? '8%' : '12%') : '4%',
        bottom: isTabletOrSmaller ? (isMobileView ? '12%' : '10%') : '15%',
        top: isTabletOrSmaller ? (isMobileView ? '25%' : '15%') : '20%',
        containLabel: true
      },
      xAxis: isTabletOrSmaller ? {
        // Horizontal bars for tablet/mobile - X is value (Distress Count)
        type: 'value',
        name: 'Predicted Distress Count',
        nameLocation: 'middle',
        nameGap: isMobileView ? 25 : 35,
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
      } : {
        // Vertical bars for desktop - X is category (Chainage)
        type: 'category',
        boundaryGap: true,
        data: xAxisLabels,
        name: 'Chainage',
        nameLocation: 'middle',
        nameGap: 40,
        nameTextStyle: {
          color: '#fff',
          fontSize: 13,
          fontWeight: 'bold'
        },
        axisLabel: {
          color: '#fff',
          rotate: 45,
          fontSize: 10,
          interval: 0,
          margin: 10
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
      yAxis: isTabletOrSmaller ? {
        // Horizontal bars for tablet/mobile - Y is category (Chainage)
        type: 'category',
        boundaryGap: true,
        data: xAxisLabels,
        name: 'Chainage',
        nameLocation: 'end',
        nameGap: isMobileView ? 10 : 15,
        nameTextStyle: {
          color: '#fff',
          fontSize: isMobileView ? 11 : 13,
          fontWeight: 'bold'
        },
        axisLabel: {
          color: '#fff',
          fontSize: isMobileView ? 8 : 10,
          margin: isMobileView ? 5 : 8
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
        },
        inverse: true
      } : {
        // Vertical bars for desktop - Y is value (Distress Count)
        type: 'value',
        name: 'Predicted Distress Count',
        nameTextStyle: {
          color: '#fff',
          fontSize: 13,
          fontWeight: 'bold'
        },
        axisLabel: {
          color: '#fff',
          fontSize: 11,
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
        insideDataZoom,
        sliderDataZoom
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

      // Prefer globally selected project if it exists in available projects
      if (this.availableProjects.length > 0) {
        const match = this.projectSelection.getMatchingProject(this.availableProjects);
        this.filters.projectName = match || this.availableProjects[0];

        this.availableDates = (this.projectDatesMap[this.filters.projectName] || []).slice().sort((a, b) => b.localeCompare(a));

        if (this.availableDates.length > 0) {
          this.filters.date = this.availableDates[0];
        }
        // When a project is selected on Information System, show only that project in dropdown
        if (this.projectSelection.selectedProject && match) {
          this.availableProjects = [match];
        }
        this.cdr.detectChanges();
      }

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
      // Use a large chainage range to ensure we capture all data for all dates
      const requestBody = {
        chainage_start: 0,
        chainage_end: 10000, // Increased from 1381 to capture all possible chainage values
        date: this.filters.date,
        direction: ['All'],
        project_name: [this.filters.projectName.trim()],
        distress_type: ['All'],
      };

      console.log('Distress Prediction API Request:', {
        project: this.filters.projectName,
        date: this.filters.date,
        chainageRange: `${requestBody.chainage_start}-${requestBody.chainage_end}`
      });

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

      if (!response.ok) {
        console.error(`API returned HTTP ${response.status}: ${response.statusText}`);
        this.rawData = [];
        this.resetChainageCache();
        return;
      }

      const apiResponse = await response.json();
      console.log('Distress Prediction API Response:', apiResponse);

      // Handle API response - check if it's an error or valid data
      if (apiResponse && apiResponse.detail) {
        console.error('API returned error:', apiResponse.detail);
        this.rawData = [];
        this.resetChainageCache();
        return;
      }

      this.rawData = this.processApiResponseToRawData(apiResponse);

      console.log(`Distress Prediction API Response for ${this.filters.date}:`, {
        totalItems: this.rawData.length,
        project: this.filters.projectName
      });

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

  /** Flatten [location, distressData] pairs and map to PredictedDistressData for both main load and month fetch */
  private processApiResponseToRawData(apiResponse: any): PredictedDistressData[] {
    let flatData: any[] = [];
    if (Array.isArray(apiResponse)) {
      apiResponse.forEach((group: any) => {
        if (Array.isArray(group) && group.length >= 2) {
          const [loc, distress] = group;
          flatData.push({ ...loc, ...distress });
        } else if (Array.isArray(group)) {
          flatData.push(...group);
        } else {
          flatData.push(group);
        }
      });
    }
    return flatData.map((item: any) => ({
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
      rough_spot: item.rough_spot || 0,
      pothole: item.pothole || 0,
      hotspots: item.hotspots || 0,
      edge_break: item.edge_break || 0,
      simple_crack_alligator_crack: item.alligator_crack ?? item['simple_crack/alligator_crack'] ?? 0,
      alligator_crack: item.alligator_crack ?? item['simple_crack/alligator_crack'] ?? 0,
      transverse_crack: item.transverse_crack ?? 0,
      hairline_crack: item.hairline_crack ?? 0,
      longitudinal_crack: item.longitudinal_crack ?? 0,
      block_crack_oblique_crack: item['block_crack/oblique_crack'] ?? item.block_crack_oblique_crack ?? 0,
      longitudinal_crack_transverse_crack: ((item.longitudinal_crack ?? 0) + (item.transverse_crack ?? 0)) || (item['longitudinal_crack/transverse_crack'] ?? 0),
      rutting: item.rutting || 0,
      bleeding: item.bleeding || 0,
      raveling: item.raveling || 0,
    }));
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
    ]).filter(val => val != null && !isNaN(val) && isFinite(val)); // Filter out invalid values
    
    if (chainages.length > 0) {
      // Use reduce to avoid stack overflow with large arrays
      this.filters.chainageRange.min = chainages.reduce((min, val) => val < min ? val : min, chainages[0]);
      this.filters.chainageRange.max = chainages.reduce((max, val) => val > max ? val : max, chainages[0]);
      console.log('Updated chainage range:', this.filters.chainageRange);
    }
  }

  /** Whether an item matches current Direction, Pavement Type, and Lane (used for Month-wise Comparison chart). */
  private itemMatchesCurrentFilters(item: PredictedDistressData): boolean {
    const norm = (v: string | undefined) => (v || '').toString().trim().toLowerCase();
    const matchesDirection =
      this.filters.direction === 'All' ||
      norm(item.direction) === norm(this.filters.direction);
    const matchesPavement =
      this.filters.pavementType === 'All' ||
      norm(item.pavement_type) === norm(this.filters.pavementType);
    const matchesLane =
      this.filters.lane === 'All' ||
      norm(item.lane) === norm(this.filters.lane);
    const matchesChainage =
      item.chainage_start <= this.filters.chainageRange.max &&
      item.chainage_end >= this.filters.chainageRange.min;
    return matchesDirection && matchesPavement && matchesLane && matchesChainage;
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
          'Alligator Crack': 'alligator_crack',
          'Block/Oblique Crack': 'block_crack_oblique_crack',
          'Transverse crack': 'transverse_crack',
          'Hairline crack': 'hairline_crack',
          'Longitudinal crack': 'longitudinal_crack',
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
        name: 'Alligator Crack',
        color: '#FFEAA7',
        field: 'alligator_crack',
      },
      {
        name: 'Block/Oblique Crack',
        color: '#98FB98',
        field: 'block_crack_oblique_crack',
      },
      {
        name: 'Transverse crack',
        color: '#74B9FF',
        field: 'transverse_crack',
      },
      {
        name: 'Hairline crack',
        color: '#A29BFE',
        field: 'hairline_crack',
      },
      {
        name: 'Longitudinal crack',
        color: '#6C5CE7',
        field: 'longitudinal_crack',
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
    // Get filtered data based on current filter selections
    const filteredData = this.getFilteredData();
    
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
      };
      
      // Initialize count for each distress type
      this.availableDistressTypes.forEach(distressType => {
        groupedData[segmentKey][distressType] = 0;
      });
    }

    // Now count actual data in each segment
    filteredData.forEach((item) => {
      const segmentStart = Math.floor(item.chainage_start / segmentSize) * segmentSize;
      const segEnd = segmentStart + segmentSize;
      const segmentKey = `${segmentStart}-${segEnd}`;
      
      const segment = groupedData[segmentKey];
      if (segment && item.distress_type && segment[item.distress_type] !== undefined) {
        segment[item.distress_type] += 1;
      }
    });

    // Convert grouped data to array and sort by xAxisPosition
    this.chainageData = Object.values(groupedData).sort(
      (a: any, b: any) => a.xAxisPosition - b.xAxisPosition
    );
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
        data: this.chainageData.map((segment: any) => segment.name),
        axisLabel: {
          color: '#ffffff',
          fontSize: 10,
          rotate: 45,
          interval: 0,
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
        stack: 'total',
        data: this.chainageData.map((segment: any) => segment[distressType] || 0),
        itemStyle: {
          color: this.getDistressColor(distressType),
          borderRadius: [2, 2, 0, 0],
        },
        barWidth: '60%',
        emphasis: {
          focus: 'series'
        }
      })),
    };
  }

  getDistressColor(distressType: string): string {
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

        // Bind popup at creation so marker stays clickable on repeated clicks
        const lat = item.latitude != null ? Number(item.latitude).toFixed(6) : 'N/A';
        const lng = item.longitude != null ? Number(item.longitude).toFixed(6) : 'N/A';
        const popupContent = `<div style="padding:5px; min-width: 200px;"><b>Predicted: ${item.distress_type}</b><br><strong>Project:</strong> ${item.project_name || 'N/A'}<br><strong>Lat/Long:</strong> ${lat}, ${lng}<br>Ch: ${item.chainage_start?.toFixed(1)}-${item.chainage_end?.toFixed(1)} km</div>`;
        marker.bindPopup(popupContent);

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

        // Bind popup at creation so marker stays clickable on repeated clicks
        const displayDistressType = this.selectedDistressType || item.distress_type;
        const iconPopupColor = this.getDistressColor(displayDistressType);
        const lat = item.latitude != null ? Number(item.latitude).toFixed(6) : 'N/A';
        const lng = item.longitude != null ? Number(item.longitude).toFixed(6) : 'N/A';
        const popupContent = `<div style="padding:8px; min-width: 220px;"><div style="color:${iconPopupColor};font-weight:bold;margin-bottom:5px;">Predicted: ${displayDistressType}</div><div style="font-size:11px;"><strong>Project:</strong> ${item.project_name || 'N/A'}<br><strong>Lat/Long:</strong> ${lat}, ${lng}<br>Ch: ${item.chainage_start?.toFixed(1)}-${item.chainage_end?.toFixed(1)} km<br>Dir: ${item.direction || 'N/A'}</div></div>`;
        marker.bindPopup(popupContent);

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
  // Distress icon map - centralized for both map markers and UI
  private distressIconMap: { [key: string]: { icon: string; color: string } } = {
    Pothole: { icon: 'fa-solid fa-circle', color: '#CC6600' },
    Rutting: { icon: 'fa-solid fa-road', color: '#4B0082' },
    'Edge Break': { icon: 'fa-solid fa-divide', color: '#8B008B' },
    'Alligator Crack': {
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
    'Hairline crack': {
      icon: 'fa-solid fa-grip-lines',
      color: '#A29BFE',
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

  // Get Font Awesome icon for distress type (for map markers)
  private getDistressIcon(distressType: string): string {
    const iconData = this.distressIconMap[distressType] || {
      icon: 'fa-solid fa-triangle-exclamation',
      color: '#666666',
    };

    return `
      <div style="width:28px;height:28px;border-radius:50%;background:${iconData.color};display:flex;align-items:center;justify-content:center;">
        <i class="${iconData.icon}" style="color:#fff;font-size:14px;"></i>
      </div>
    `;
  }

  // Public method to get icon class for UI
  getDistressIconClass(distressType: string): string {
    const iconData = this.distressIconMap[distressType] || {
      icon: 'fa-solid fa-triangle-exclamation',
      color: '#666666',
    };
    return iconData.icon;
  }

  // Public method to get icon color for UI
  getDistressIconColor(distressType: string): string {
    const iconData = this.distressIconMap[distressType] || {
      icon: 'fa-solid fa-triangle-exclamation',
      color: '#666666',
    };
    return iconData.color;
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
    // Check if month comparison mode is enabled
    if (this.isMonthComparisonMode) {
      this.openMonthComparisonModalForDistress(distress.name);
      return;
    }

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

  // Toggle month comparison mode
  toggleMonthComparisonMode() {
    this.isMonthComparisonMode = !this.isMonthComparisonMode;
    console.log('Month Comparison Mode:', this.isMonthComparisonMode ? 'ON' : 'OFF');
    
    if (this.isMonthComparisonMode && this.filters.projectName) {
      this.preloadMonthData();
    }
  }

  // Pre-load month data in background
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
          distress_type: ['All'],
        };

        console.log(`📥 Preloading data for month ${month}, request:`, requestBody);

        try {
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
          console.log(`📥 API response for ${month}:`, apiResponse);
          const monthData = Array.isArray(apiResponse) ? apiResponse.flat() : [];
          
          this.monthDataCache[monthCacheKey] = monthData;
          console.log(`✅ Pre-loaded data for ${month}: ${monthData.length} records`);
          if (monthData.length > 0) {
            console.log(`   Sample data:`, monthData.slice(0, 2));
            const uniqueDistresses = [...new Set(monthData.map(d => d.distress_type))];
            console.log(`   Unique distress types in ${month}:`, uniqueDistresses);
          }
        } catch (error) {
          console.error(`❌ Error pre-loading data for ${month}:`, error);
        }
      });

      await Promise.all(fetchPromises);
    } finally {
      this.isPreloadingMonthData = false;
    }
  }

  onFilterChange() {
    this.updateDistressSummary();
    this.updateChainageData();
    this.initChartOptions();

    if (this.isBrowser) {
      this.addDistressMarkers();
      this.updateChart();
    }

    // Refresh Month-wise Comparison chart when filters change so it shows filter-wise data
    if (this.isMonthComparisonModalOpen && this.selectedDistressesForMonthComparison.length > 0) {
      this.generateMonthComparisonChart();
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
      'Alligator Crack',
      'Block/Oblique Crack',
      'Transverse crack',
      'Hairline crack',
      'Longitudinal crack',
      'Rutting',
      'Bleeding',
      'Raveling',
    ];
    this.cracksAndRutting = this.distressSummary
      .filter((d) => cracksAndRuttingNames.includes(d.name));
  }

  /** Format Cracks & Rutting values as float (2 decimal places) - API returns meter values */
  formatCracksAndRuttingValue(value: number): string {
    const n = Number(value);
    return Number.isFinite(n) ? n.toFixed(2) : '0';
  }

  /** Convert UI date (e.g. DD-MM-YYYY) to API format YYYY-MM-DD for KML endpoint */
  private convertDateFormat(dateString: string): string {
    if (!dateString || !dateString.includes('-') || dateString.length < 10) return dateString;
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    if (parts[0].length === 4) return dateString; // already YYYY-MM-DD
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  /** Call distress_predic_filter_kml and download the returned KML file using current filters. */
  async downloadKml(): Promise<void> {
    if (!this.filters.projectName?.trim() || !this.filters.date) {
      alert('Please select Project and Date before downloading KML.');
      return;
    }
    this.isLoadingKml = true;
    try {
      const requestBody = {
        chainage_start: Math.max(0, this.filters.chainageRange?.min ?? 0),
        chainage_end: Math.min(1381, this.filters.chainageRange?.max ?? 1380),
        date: this.convertDateFormat(this.filters.date),
        direction:['All'],
        project_name: [this.filters.projectName.trim()],
        distress_type:['All'],
      };

      const response = await fetch(
        'https://fantastic-reportapi-production.up.railway.app/distress_predic_filter_kml',
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
        const text = await response.text();
        console.error('KML API error:', response.status, text);
        alert(`Download failed: ${response.status}. Check console for details.`);
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `distress-predicted-${(this.filters.projectName || 'data').replace(/\s+/g, '-')}-${this.filters.date || 'export'}.kml`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download KML failed:', e);
      alert('Download failed. Check console for details.');
    } finally {
      this.isLoadingKml = false;
    }
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

  async onProjectChange(eventOrValue: any) {
    const newProject = typeof eventOrValue === 'string' ? eventOrValue : eventOrValue?.target?.value;
    if (!newProject) return;
    this.isProjectChanging = true;

    this.filters.projectName = newProject;

    // Update available dates for the selected project (latest first)
    this.availableDates = (this.projectDatesMap[this.filters.projectName] || []).slice().sort((a, b) => b.localeCompare(a));

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

    // Clear month data cache when project changes
    this.monthDataCache = {};

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

  // ============= Month-wise Comparison Chart Methods =============
  
  async openMonthComparisonModalForDistress(distressName: string) {
    this.availableMonthsForComparison = this.projectDatesMap[this.filters.projectName] || [];
    this.selectedDistressesForMonthComparison = [distressName];
    this.showDistressSelectionInModal = false;
    this.isMonthComparisonModalOpen = true;
    this.isLoadingMonthChart = true;
    
    // Ensure data is loaded
    if (Object.keys(this.monthDataCache).length === 0) {
      console.log('📥 Cache is empty, preloading month data first...');
      await this.preloadMonthData();
    }
    
    setTimeout(() => {
      this.generateMonthComparisonChart();
    }, 100);
  }

  closeMonthComparisonModal() {
    this.isMonthComparisonModalOpen = false;
    this.selectedDistressesForMonthComparison = [];
    this.isLoadingMonthChart = false;
    this.showDistressSelectionInModal = true;
  }

  toggleDistressForMonthComparison(distressName: string) {
    const index = this.selectedDistressesForMonthComparison.indexOf(distressName);
    
    if (index > -1) {
      this.selectedDistressesForMonthComparison.splice(index, 1);
    } else {
      if (this.selectedDistressesForMonthComparison.length < 5) {
        this.selectedDistressesForMonthComparison.push(distressName);
      } else {
        return;
      }
    }
    
    setTimeout(() => {
      this.generateMonthComparisonChart();
    }, 50);
  }

  isDistressSelectedForMonthComparison(distressName: string): boolean {
    return this.selectedDistressesForMonthComparison.includes(distressName);
  }

  getDistressChipBackgroundColorForMonth(distressName: string): string {
    return this.isDistressSelectedForMonthComparison(distressName) 
      ? this.getDistressColor(distressName)
      : 'transparent';
  }

  async generateMonthComparisonChart() {
    if (!this.filters.projectName || this.selectedDistressesForMonthComparison.length === 0) {
      this.isLoadingMonthChart = false;
      return;
    }

    this.isLoadingMonthChart = true;

    try {
      const monthDataMap: { [month: string]: PredictedDistressData[] } = {};
      const cacheKey = `${this.filters.projectName}_${this.filters.chainageRange.min}_${this.filters.chainageRange.max}`;
      
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
          distress_type: ['All'],
        };

        try {
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
          const monthData = this.processApiResponseToRawData(apiResponse);
          
          this.monthDataCache[monthCacheKey] = monthData;
          return { month, data: monthData };
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

      // Map distress names to their corresponding field names (matches updateDistressSummary)
      const distressFieldMap: { [key: string]: string } = {
        'Rough Spot': 'rough_spot',
        'Pothole': 'pothole',
        'Hotspot': 'hotspots',
        'Edge Break': 'edge_break',
        'Alligator Crack': 'alligator_crack',
        'Block/Oblique Crack': 'block_crack_oblique_crack',
        'Transverse crack': 'transverse_crack',
        'Hairline crack': 'hairline_crack',
        'Longitudinal crack': 'longitudinal_crack',
        'LG/Transverse crack': 'longitudinal_crack_transverse_crack',
        'Rutting': 'rutting',
        'Bleeding': 'bleeding',
        'Raveling': 'raveling'
      };

      this.selectedDistressesForMonthComparison.forEach(distressName => {
        const distressColor = this.getDistressColor(distressName);
        const fieldName = distressFieldMap[distressName];
        const monthData: number[] = [];
        
        this.availableMonthsForComparison.forEach(month => {
          const rawData = monthDataMap[month] || [];
          // Apply current filters (Direction, Pavement Type, Lane) so chart shows filter-wise data
          const data = rawData.filter((item) => this.itemMatchesCurrentFilters(item));
          
          const totalCount = data.reduce((sum, item) => {
            const fieldValue = parseFloat((item as any)[fieldName]) || 0;
            return sum + fieldValue;
          }, 0);
          
          monthData.push(totalCount);
        });

        series.push({
          name: distressName,
          type: 'bar',
          data: monthData,
          itemStyle: { 
            color: distressColor,
            borderRadius: [4, 4, 0, 0]
          }
        });
      });

      console.log('📈 Generated series:', series);
      console.log('📈 Series count:', series.length);

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
          data: this.selectedDistressesForMonthComparison,
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
          name: 'Month',
          nameLocation: 'middle',
          nameGap: isMobileView ? 40 : 35,
          nameTextStyle: { color: '#fff', fontSize: isMobileView ? 11 : 13, fontWeight: 'bold' },
          axisLabel: {
            color: '#fff',
            fontSize: isMobileView ? 9 : 11,
            rotate: isMobileView ? 90 : 30,
            interval: isMobileView ? 'auto' : 0,
            margin: isMobileView ? 10 : 8
          }
        },
        yAxis: {
          type: 'value',
          name: 'Distress Count',
          nameTextStyle: { color: '#fff', fontSize: isMobileView ? 11 : 13, fontWeight: 'bold' },
          axisLabel: {
            color: '#fff',
            fontSize: isMobileView ? 10 : 12,
            formatter: (value: number) => {
              if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
              if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
              return Math.round(value).toString();
            }
          },
          splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } }
        },
        series: series
      };
    } catch (error) {
      console.error('Error generating month comparison chart:', error);
    } finally {
      this.isLoadingMonthChart = false;
    }
  }
}
