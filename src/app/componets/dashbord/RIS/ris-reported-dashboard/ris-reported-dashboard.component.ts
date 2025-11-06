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
  providers: [provideEcharts()],
  templateUrl: './ris-reported-dashboard.component.html',
  styleUrl: './ris-reported-dashboard.component.scss',
})
export class RisReportedDashboardComponent
  implements OnInit, AfterViewInit, OnDestroy
{
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
    distressType: 'All',
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
  monthDataCache: { [month: string]: DistressReportData[] } = {};
  showDistressSelectionInModal: boolean = true;
  
  // Toggle for month comparison mode
  isMonthComparisonMode: boolean = false;
  isPreloadingMonthData: boolean = false;

  // Pothole Detection Properties
  isPotholeModalOpen: boolean = false;
  isLoadingPotholeData: boolean = false;
  potholeDepthChartOptions: any = null;
  potholeAreaChartOptions: any = null;
  potholeProfileHeatmapOptions: any = null;
  profileHeatmapData: any = null;
  potholePolygonsData: any = null;
  currentSegmentIndex: number = 0;
  totalSegments: number = 0;
  segmentSize: number = 10;
  
  // 3D View properties
  currentView: string = 'top';
  potholeTopViewOptions: any = null;
  potholeSideViewOptions: any = null;
  pothole3DViewOptions: any = null;
  selectedLaserForSideView: number = 1;
  availableLasersForSideView: number[] = [];

  private map: any;
  public isBrowser: boolean;
  public isLoading: boolean = false;
  public isSidebarOpen: boolean = false;

  // Flag to prevent duplicate data loads when project changes
  private isProjectChanging: boolean = false;

  // Zoom-based visualization properties
  private currentZoomLevel: number = 10;
  private zoomThreshold: number = 16; // Show colorful points when zoom < 16, icons when zoom >= 16 (increased for performance)
  private distressMarkers: any[] = []; // Store all markers
  private iconCache: Map<string, any> = new Map(); // Cache for Leaflet icons (PERFORMANCE BOOST!)

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

  // ============================================
  // POTHOLE DETECTION METHODS
  // ============================================

  async openPotholeDetection() {
    this.isPotholeModalOpen = true;
    this.isLoadingPotholeData = true;

    try {
      // Load profile heatmap data
      const heatmapResponse = await fetch('/assets/profile_heatmap_data.json');
      this.profileHeatmapData = await heatmapResponse.json();

      // Load pothole polygon data
      const polygonsResponse = await fetch('/assets/pothole_polygons.json');
      this.potholePolygonsData = await polygonsResponse.json();

      console.log('✅ Loaded profile heatmap data:', this.profileHeatmapData.metadata);
      console.log('✅ Loaded pothole polygons:', this.potholePolygonsData.metadata);

      // Calculate total segments from profile heatmap data
      const totalDistance = this.profileHeatmapData.metadata.total_distance_m || 100;
      this.totalSegments = this.profileHeatmapData.metadata.num_segments || Math.ceil(totalDistance / this.segmentSize);
      this.currentSegmentIndex = 0; // Start with first segment

      console.log(`📊 Total segments: ${this.totalSegments} (${this.segmentSize}m each)`);

      // Generate charts for first segment
      console.log('ðŸŽ¨ Generating all charts...');
      this.generatePotholeDepthChart();
      this.generatePotholeAreaChart();
      this.generateProfileHeatmapChart();
      console.log('âœ… All charts generated');
    } catch (error) {
      console.error('âŒ Error loading pothole data:', error);
      alert('Failed to load pothole detection data. Please try again.');
    } finally {
      this.isLoadingPotholeData = false;
    }
  }

  closePotholeModal() {
    this.isPotholeModalOpen = false;
    this.currentSegmentIndex = 0;
  }

  // Navigation methods
  goToPreviousSegment() {
    if (this.currentSegmentIndex > 0) {
      this.currentSegmentIndex--;
      console.log(`â—€ï¸ Moved to segment ${this.currentSegmentIndex + 1}/${this.totalSegments}`);
      
      // Clear charts first to force recreation
      this.potholeDepthChartOptions = null;
      this.potholeAreaChartOptions = null;
      this.potholeProfileHeatmapOptions = null;
      this.potholeTopViewOptions = null;
      this.potholeSideViewOptions = null;
      this.pothole3DViewOptions = null;
      
      // Regenerate after a tiny delay
      setTimeout(() => {
        this.generatePotholeDepthChart();
        this.generatePotholeAreaChart();
        this.generateProfileHeatmapChart();
        
        // Regenerate 3D views if they were active
        if (this.currentView === 'top') this.generateTopView();
        if (this.currentView === 'side') this.generateSideView();
        if (this.currentView === '3d') this.generate3DView();
      }, 50);
    }
  }

  goToNextSegment() {
    if (this.currentSegmentIndex < this.totalSegments - 1) {
      this.currentSegmentIndex++;
      console.log(`â–¶ï¸ Moved to segment ${this.currentSegmentIndex + 1}/${this.totalSegments}`);
      
      // Clear charts first to force recreation
      this.potholeDepthChartOptions = null;
      this.potholeAreaChartOptions = null;
      this.potholeProfileHeatmapOptions = null;
      this.potholeTopViewOptions = null;
      this.potholeSideViewOptions = null;
      this.pothole3DViewOptions = null;
      
      // Regenerate after a tiny delay
      setTimeout(() => {
        this.generatePotholeDepthChart();
        this.generatePotholeAreaChart();
        this.generateProfileHeatmapChart();
        
        // Regenerate 3D views if they were active
        if (this.currentView === 'top') this.generateTopView();
        if (this.currentView === 'side') this.generateSideView();
        if (this.currentView === '3d') this.generate3DView();
      }, 50);
    }
  }

  canGoToPreviousSegment(): boolean {
    return this.currentSegmentIndex > 0;
  }

  canGoToNextSegment(): boolean {
    return this.currentSegmentIndex < this.totalSegments - 1;
  }

  // 3D View Methods
  switchView(view: string) {
    this.currentView = view;
    
    // Generate the appropriate chart
    if (view === 'top' && !this.potholeTopViewOptions) {
      this.generateTopView();
    } else if (view === 'side' && !this.potholeSideViewOptions) {
      this.generateSideView();
    } else if (view === '3d' && !this.pothole3DViewOptions) {
      this.generate3DView();
    }
  }

  generateTopView() {
    if (!this.profileHeatmapData?.segments) return;
    
    const currentSegment = this.profileHeatmapData.segments[this.currentSegmentIndex];
    if (!currentSegment) return;
    
    const heatmapData = currentSegment.heatmap_data;
    
    // This is essentially the same as the profile heatmap, but optimized for top view
    this.potholeTopViewOptions = Object.assign({}, this.potholeProfileHeatmapOptions);
    console.log('âœ… Generated top view chart');
  }

  generateSideView() {
    if (!this.profileHeatmapData?.segments) return;
    
    const currentSegment = this.profileHeatmapData.segments[this.currentSegmentIndex];
    if (!currentSegment) return;
    
    const heatmapData = currentSegment.heatmap_data;
    
    // Get unique laser lines for selector
    const uniqueLasers = [...new Set(heatmapData.map((p: any) => p.laser_line))].sort((a: any, b: any) => a - b);
    this.availableLasersForSideView = uniqueLasers as number[];
    
    if (!this.selectedLaserForSideView || !uniqueLasers.includes(this.selectedLaserForSideView)) {
      this.selectedLaserForSideView = uniqueLasers[0] as number;
    }
    
    // Filter data for selected laser line
    const laserData = heatmapData.filter((p: any) => p.laser_line === this.selectedLaserForSideView);
    const chartData = laserData.map((p: any) => [p.distance, 255 - p.gray_value]); // Invert for depth
    
    this.potholeSideViewOptions = {
      backgroundColor: '#ffffff',
      title: {
        text: `Side View - Laser Line L${this.selectedLaserForSideView}`,
        left: 'center',
        textStyle: { color: '#333' }
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          if (params.length > 0) {
            const distance = params[0].value[0];
            const depth = params[0].value[1];
            return `Distance: ${distance.toFixed(2)}m<br/>Depth: ${depth.toFixed(1)}`;
          }
          return '';
        }
      },
      grid: {
        left: '10%',
        right: '10%',
        top: '15%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        name: 'Distance (m)',
        nameLocation: 'middle',
        nameGap: 30
      },
      yAxis: {
        type: 'value',
        name: 'Depth',
        nameLocation: 'middle',
        nameGap: 50,
        inverse: true  // Deeper is lower
      },
      series: [{
        type: 'line',
        data: chartData,
        smooth: true,
        areaStyle: {
          color: 'rgba(102, 126, 234, 0.3)'
        },
        lineStyle: {
          color: '#667eea',
          width: 2
        },
        itemStyle: {
          color: '#667eea'
        }
      }]
    };
    
    console.log(`âœ… Generated side view for L${this.selectedLaserForSideView}`);
  }

  generate3DView() {
    if (!this.profileHeatmapData?.segments) return;
    
    const currentSegment = this.profileHeatmapData.segments[this.currentSegmentIndex];
    if (!currentSegment) return;
    
    const heatmapData = currentSegment.heatmap_data;
    
    // Create enhanced heatmap data with depth visualization
    const uniqueDistances = [...new Set(heatmapData.map((p: any) => p.distance))].sort((a: any, b: any) => a - b);
    const uniqueLasers = [...new Set(heatmapData.map((p: any) => p.laser_line))].sort((a: any, b: any) => a - b);
    
    // Create data map
    const dataMap = new Map();
    heatmapData.forEach((p: any) => {
      dataMap.set(`${p.distance}_${p.laser_line}`, p.gray_value);
    });
    
    // Create heatmap data with depth representation
    const chartData: any[] = [];
    uniqueDistances.forEach((dist: any, xIdx) => {
      uniqueLasers.forEach((laser: any, yIdx) => {
        const grayValue = dataMap.get(`${dist}_${laser}`) || 150;
        chartData.push([xIdx, yIdx, grayValue]);
      });
    });
    
    // Create multiple line series to simulate 3D depth perspective
    const lineSeries: any[] = [];
    
    // For each laser line, create a line showing depth variation
    uniqueLasers.forEach((laser: any, laserIdx) => {
      const lineData: any[] = [];
      
      uniqueDistances.forEach((dist: any, distIdx) => {
        const grayValue = dataMap.get(`${dist}_${laser}`) || 150;
        const depth = 255 - grayValue; // Invert for visualization
        
        // Create offset for pseudo-3D effect
        const yOffset = laserIdx * 15; // Vertical spacing
        lineData.push([distIdx, depth + yOffset]);
      });
      
      lineSeries.push({
        name: `L${laser}`,
        type: 'line',
        data: lineData,
        smooth: true,
        lineStyle: {
          width: 2,
          color: this.getDepthColor(laserIdx, uniqueLasers.length)
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0,
              color: this.getDepthColor(laserIdx, uniqueLasers.length)
            }, {
              offset: 1,
              color: 'rgba(0, 0, 0, 0.1)'
            }]
          },
          opacity: 0.3
        },
        showSymbol: false,
        z: uniqueLasers.length - laserIdx // Stack from back to front
      });
    });
    
    this.pothole3DViewOptions = {
      backgroundColor: '#1e1e2e',
      title: {
        text: '3D Perspective View - Road Surface Depth Profile',
        left: 'center',
        top: 10,
        textStyle: {
          color: '#ffffff',
          fontSize: 16
        }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(30, 30, 46, 0.95)',
        borderColor: '#667eea',
        textStyle: { color: '#ffffff' },
        formatter: (params: any) => {
          if (params && params.length > 0) {
            const distIdx = params[0].value[0];
            const dist = uniqueDistances[distIdx];
            let tooltip = `<strong>Distance:</strong> ${(dist as number).toFixed(2)}m<br/>`;
            
            params.forEach((param: any) => {
              const depth = param.value[1] - (param.seriesIndex * 15);
              tooltip += `<span style="color:${param.color}">${param.seriesName}:</span> Depth ${depth.toFixed(0)}<br/>`;
            });
            
            return tooltip;
          }
          return '';
        }
      },
      legend: {
        show: false
      },
      grid: {
        left: '10%',
        right: '15%',
        top: '15%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        name: 'Distance (m)',
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: { color: '#ffffff' },
        axisLine: { lineStyle: { color: '#667eea' } },
        axisLabel: {
          color: '#ffffff',
          formatter: (val: any) => {
            const dist = uniqueDistances[val];
            return dist ? (dist as number).toFixed(1) : '';
          }
        },
        splitLine: {
          lineStyle: { color: 'rgba(102, 126, 234, 0.2)' }
        }
      },
      yAxis: {
        type: 'value',
        name: 'Depth + Lane Offset',
        nameLocation: 'middle',
        nameGap: 50,
        nameTextStyle: { color: '#ffffff' },
        axisLine: { lineStyle: { color: '#667eea' } },
        axisLabel: { color: '#ffffff' },
        splitLine: {
          lineStyle: { color: 'rgba(102, 126, 234, 0.2)' }
        }
      },
      visualMap: {
        show: true,
        min: 0,
        max: 255,
        orient: 'vertical',
        right: '2%',
        top: 'center',
        text: ['Deep', 'Shallow'],
        inRange: {
          color: ['#d73027', '#f46d43', '#fdae61', '#fee090', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695']
        },
        textStyle: {
          color: '#ffffff'
        }
      },
      series: lineSeries
    };
    
    console.log(`âœ… Generated 3D perspective view with ${lineSeries.length} laser line layers`);
  }
  
  getDepthColor(index: number, total: number): string {
    const colors = [
      '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#fee090', 
      '#fdae61', '#f46d43', '#d73027', '#a50026', '#313695'
    ];
    return colors[index % colors.length];
  }

  getCurrentSegmentInfo(): string {
    const startDistance = this.currentSegmentIndex * this.segmentSize;
    const endDistance = Math.min(startDistance + this.segmentSize, this.profileHeatmapData?.metadata?.total_distance_m || 100);
    const startChainage = (this.profileHeatmapData?.metadata?.chainage_start_km || 0) + (startDistance / 1000);
    const endChainage = (this.profileHeatmapData?.metadata?.chainage_start_km || 0) + (endDistance / 1000);
    return `${startChainage.toFixed(3)} - ${endChainage.toFixed(3)} km (${startDistance}m - ${endDistance}m)`;
  }

  getSegmentPotholes(): any[] {
    if (!this.potholePolygonsData?.segments) return [];
    
    const currentSegment = this.potholePolygonsData.segments[this.currentSegmentIndex];
    if (!currentSegment) return [];
    
    return currentSegment.potholes || [];
  }

  getAverageDepth(): string {
    const segmentPotholes = this.getSegmentPotholes();
    if (segmentPotholes.length === 0) {
      return '0';
    }
    // Calculate depth from min_gray_value (inverted: lower gray = deeper)
    // Convert gray value to mm using the 0.2 multiplier: depth_mm = (255 - gray_value) * 0.2
    const total = segmentPotholes.reduce((sum: number, p: any) => {
      const depth_mm = (255 - p.min_gray_value) * 0.2;
      return sum + depth_mm;
    }, 0);
    return (total / segmentPotholes.length).toFixed(1);
  }

  getAverageArea(): string {
    const segmentPotholes = this.getSegmentPotholes();
    if (segmentPotholes.length === 0) {
      return '0';
    }
    // Use area_cells as a proxy for area (each cell represents a small area)
    const total = segmentPotholes.reduce((sum: number, p: any) => sum + (p.area_cells || 0), 0);
    return (total / segmentPotholes.length).toFixed(0);
  }

  getSeverityCount(severity: string): number {
    const segmentPotholes = this.getSegmentPotholes();
    return segmentPotholes.filter((p: any) => p.severity === severity).length;
  }

  generatePotholeDepthChart() {
    if (!this.profileHeatmapData?.segments) {
      console.error('❌ No profile heatmap data for depth chart');
      return;
    }

    // Get current segment heatmap data
    const currentSegment = this.profileHeatmapData.segments[this.currentSegmentIndex];
    if (!currentSegment) {
      console.error(`❌ No segment data for index ${this.currentSegmentIndex}`);
      return;
    }

    const heatmapData = currentSegment.heatmap_data;
    
    console.log(`📈 Generating depth chart for segment ${this.currentSegmentIndex + 1}:`);
    console.log(`   Heatmap data points: ${heatmapData?.length || 0}`);
    
    // Get actual distance range from the data
    const distances = heatmapData.map((p: any) => p.distance);
    const minDistance = Math.min(...distances);
    const maxDistance = Math.max(...distances);
    
    console.log(`   Distance range: ${minDistance.toFixed(3)}m - ${maxDistance.toFixed(3)}m`);
    
    // Group data by laser line
    const laserLineData: { [key: number]: Array<{distance: number, grayValue: number}> } = {};
    
    heatmapData.forEach((point: any) => {
      if (!laserLineData[point.laser_line]) {
        laserLineData[point.laser_line] = [];
      }
      laserLineData[point.laser_line].push({
        distance: point.distance,
        grayValue: point.gray_value
      });
    });

    // Sort each laser line by distance
    Object.keys(laserLineData).forEach(key => {
      laserLineData[parseInt(key)].sort((a, b) => a.distance - b.distance);
    });

    // Get unique laser lines and create color palette
    const laserLines = Object.keys(laserLineData).map(k => parseInt(k)).sort((a, b) => a - b);
    
    console.log(`   Laser lines found: ${laserLines.length} (${laserLines.slice(0, 5).map(l => `L${l}`).join(', ')}...)`);
    
    // Create color palette (matching Excel chart style)
    const colors = [
      '#4472C4', '#ED7D31', '#A5A5A5', '#FFC000', '#5B9BD5',
      '#70AD47', '#264478', '#9E480E', '#636363', '#997300',
      '#255E91', '#43682B', '#698ED0', '#F1975A', '#B7B7B7',
      '#FFCD33', '#7CAFDD', '#8CC168', '#1F3864', '#7D3C0E',
      '#4F4F4F', '#806000', '#1C4A73', '#37551C', '#5A8AC5'
    ];

    // Create series for each laser line
    const series: any[] = [];
    laserLines.forEach((laserLine, idx) => {
      const lineData = laserLineData[laserLine];
      // Multiply gray value by 0.2 for Y-axis
      const seriesData = lineData.map(point => [point.distance, point.grayValue * 0.2]);
      
      series.push({
        name: `L${laserLine}`,
        type: 'line',
        data: seriesData,
        smooth: false,  // Straight lines like Excel
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: {
          width: 2,
          color: colors[idx % colors.length]
        },
        itemStyle: {
          color: colors[idx % colors.length]
        },
        showSymbol: true,
        emphasis: {
          focus: 'series',
          lineStyle: {
            width: 3
          },
          itemStyle: {
            borderWidth: 2,
            borderColor: '#ffffff'
          }
        }
      });
    });

    console.log(`   Generated ${series.length} line series`);
    
    if (series.length === 0) {
      console.error(`❌ No series data generated for segment ${this.currentSegmentIndex + 1}!`);
      console.error(`   LaserLines array: ${laserLines.join(', ')}`);
      console.error(`   LaserLineData keys: ${Object.keys(laserLineData).join(', ')}`);
      return;
    }

    // Create a completely new object to trigger Angular change detection
    const chartOptions = {
      backgroundColor: 'transparent',
      title: {
        text: `Pothole Depth Profile - Segment ${this.currentSegmentIndex + 1}`,
        left: 'center',
        top: 10,
        textStyle: {
          color: '#ffffff',
          fontSize: 14,
          fontWeight: 600
        }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(30, 30, 46, 0.95)',
        borderColor: '#667eea',
        borderWidth: 1,
        textStyle: {
          color: '#ffffff'
        },
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#667eea'
          }
        },
        formatter: (params: any) => {
          if (!params || params.length === 0) return '';
          
          const distance = params[0].value[0];
          const chainage = currentSegment.start_chainage_km + distance / 1000;
          
          let tooltip = `<strong>Distance:</strong> ${distance.toFixed(3)}m<br/>`;
          tooltip += `<strong>Chainage:</strong> ${chainage.toFixed(6)} km<br/><br/>`;
          
          // Show data for all laser lines at this point
          params.forEach((param: any) => {
            const depthValue = param.value[1];  // This is already multiplied by 0.2
            const originalGrayValue = depthValue / 0.2;  // Convert back to original for severity
            const severity = this.getGrayValueSeverity(originalGrayValue);
            const marker = `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${param.color};margin-right:5px;"></span>`;
            tooltip += `${marker}<strong>${param.seriesName}:</strong> ${depthValue.toFixed(1)}mm (Gray: ${originalGrayValue.toFixed(0)}, ${severity})<br/>`;
          });
          
          return tooltip;
        }
      },
      legend: {
        type: 'scroll',
        data: laserLines.map(l => `L${l}`),
        top: 40,
        textStyle: {
          color: '#ffffff',
          fontSize: 10
        },
        itemGap: 8,
        itemWidth: 20,
        itemHeight: 10,
        pageIconColor: '#667eea',
        pageIconInactiveColor: 'rgba(255, 255, 255, 0.3)',
        pageTextStyle: {
          color: '#ffffff'
        }
      },
      grid: {
        left: '8%',
        right: '5%',
        top: '120px',
        bottom: '12%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        name: 'Distance (m)',
        nameLocation: 'middle',
        nameGap: 30,
        min: Math.floor(minDistance),
        max: Math.ceil(maxDistance),
        interval: Math.max(1, Math.floor((maxDistance - minDistance) / 5)),  // ~5 intervals
        nameTextStyle: {
          color: '#ffffff',
          fontSize: 12,
          fontWeight: 600
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.3)'
          }
        },
        axisLabel: {
          color: '#ffffff',
          fontSize: 11
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.15)',
            type: 'solid'
          }
        }
      },
      yAxis: {
        type: 'value',
        name: 'Depth (mm) - 0=Deep Pothole, 51=Normal',
        nameLocation: 'middle',
        nameGap: 55,
        min: 0,
        max: 51,
        interval: 10,  // Major ticks every 10 (0, 10, 20, 30, 40, 50)
        nameTextStyle: {
          color: '#ffffff',
          fontSize: 12,
          fontWeight: 600
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.3)'
          }
        },
        axisLabel: {
          color: '#ffffff',
          fontSize: 11
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.15)',
            type: 'solid'
          }
        }
      },
      series: series,
      animationDuration: 1000,
      animationEasing: 'cubicOut'
    };
    
    // Assign to component property to trigger change detection
    this.potholeDepthChartOptions = Object.assign({}, chartOptions);
    
    console.log(`✅ Depth chart assigned for segment ${this.currentSegmentIndex + 1}`);
  }

  generatePotholeAreaChart() {
    if (!this.potholePolygonsData?.segments) {
      console.error('❌ No polygon data available');
      return;
    }

    if (!this.profileHeatmapData?.segments) {
      console.error('❌ No profile heatmap data available');
      return;
    }

    // Get current segment polygon data
    const currentSegment = this.potholePolygonsData.segments[this.currentSegmentIndex];
    if (!currentSegment) {
      console.error('❌ No data for segment', this.currentSegmentIndex);
      return;
    }

    // Get current segment profile heatmap data to find all laser lines
    const currentHeatmapSegment = this.profileHeatmapData.segments[this.currentSegmentIndex];
    if (!currentHeatmapSegment) {
      console.error('❌ No heatmap data for segment', this.currentSegmentIndex);
      return;
    }

    const potholes = currentSegment.potholes || [];
    const gridDimensions = currentSegment.grid_dimensions;
    
    console.log(`📊 Generating area chart for segment ${this.currentSegmentIndex + 1}:`);
    console.log(`   Grid: ${gridDimensions.num_distances} × ${gridDimensions.num_lasers}`);
    console.log(`   Potholes: ${potholes.length}`);
    
    // Create series for grid and pothole visualization
    const series: any[] = [];
    
    // Get ALL laser lines present in this segment from profile heatmap data
    const heatmapData = currentHeatmapSegment.heatmap_data || [];
    
    console.log(`   Heatmap data points in segment: ${heatmapData.length}`);
    if (heatmapData.length > 0) {
      const samplePoint = heatmapData[0];
      console.log(`   Sample point: distance=${samplePoint.distance}, laser=${samplePoint.laser_line}, gray=${samplePoint.gray_value}`);
    }
    
    const laserLineNumbers = heatmapData.map((p: any) => Number(p.laser_line)) as number[];
    const uniqueLaserLines: number[] = [...new Set(laserLineNumbers)].sort((a, b) => a - b);
    
    if (uniqueLaserLines.length === 0) {
      console.error('❌ No laser lines found in heatmap data');
      return;
    }
    
    // Use the actual laser line numbers (not indices) from the data
    // Laser lines are 1-indexed in the data (L1, L2, L3, etc.), so convert to 0-indexed for display
    const minLaserNumber = Math.min(...uniqueLaserLines);  // e.g., 1, 3, 5, etc.
    const maxLaserNumber = Math.max(...uniqueLaserLines);  // e.g., 13, 20, 473, etc.
    
    // Convert to 0-indexed for internal processing
    const minLaserDisplay = minLaserNumber - 1;  // Convert L1->0, L2->1, etc.
    const maxLaserDisplay = maxLaserNumber;      // Keep as max for range
    
    console.log(`   Unique laser lines found: ${uniqueLaserLines.length}`);
    console.log(`   Laser range: L${minLaserNumber} - L${maxLaserNumber}`);
    console.log(`   First 10 lasers: ${uniqueLaserLines.slice(0, 10).map(l => `L${l}`).join(', ')}`);
    console.log(`   Last 10 lasers: ${uniqueLaserLines.slice(-10).map(l => `L${l}`).join(', ')}`);
    
    // Create a mapping from actual laser line number to display index (0-indexed)
    const laserLineToIndexMap = new Map<number, number>();
    uniqueLaserLines.forEach((laserNum, idx) => {
      laserLineToIndexMap.set(laserNum, idx);
    });
    
    const laserDisplayCount = uniqueLaserLines.length;
    const segmentDistanceCount = gridDimensions.num_distances;
    const segmentDistances = gridDimensions.distances || [];
    
    console.log(`   Grid cells: ${segmentDistanceCount} × ${laserDisplayCount}`);
    
    // Create a map of heatmap data for quick lookup: key = "distance_laser", value = gray_value
    const heatmapMap = new Map<string, number>();
    heatmapData.forEach((point: any) => {
      const key = `${point.distance.toFixed(6)}_${point.laser_line}`;
      heatmapMap.set(key, point.gray_value);
    });
    
    // Create heatmap data with actual gray values from the Excel data
    const cellData: any[] = [];
    
    // For each cell in the grid, find the corresponding gray value
    uniqueLaserLines.forEach((laserNum, yIdx) => {
      segmentDistances.forEach((distance: number, xIdx: number) => {
        // Try to find exact match first
        let key = `${distance.toFixed(6)}_${laserNum}`;
        let grayValue = heatmapMap.get(key);
        
        // If no exact match, try to find closest distance for this laser line
        if (grayValue === undefined) {
          // Find closest distance
          let closestDist = distance;
          let minDiff = Infinity;
          
          heatmapData.forEach((point: any) => {
            if (point.laser_line === laserNum) {
              const diff = Math.abs(point.distance - distance);
              if (diff < minDiff) {
                minDiff = diff;
                closestDist = point.distance;
                grayValue = point.gray_value;
              }
            }
          });
        }
        
        // If still no value, use default (200 = no pothole)
        if (grayValue === undefined) {
          grayValue = 200;
        }
        
        cellData.push([xIdx, yIdx, grayValue]);
      });
    });
    
    console.log(`   Total cells with gray values: ${cellData.length}`);
    
    // Helper function to determine color based on gray value ranges (like Excel)
    const getColorForGrayValue = (grayValue: number): string => {
      if (grayValue < 50) {
        return '#0000ff';  // Blue for 0-50
      } else if (grayValue < 100) {
        return '#ff0000';  // Red for 50-100
      } else if (grayValue < 150) {
        return '#ffff00';  // Yellow for 100-150
      } else {
        return 'rgba(255, 255, 255, 0.2)';  // Semi-transparent white for 150-200 (no pothole)
      }
    };
    
    // Add main heatmap with custom color mapping
    series.push({
      type: 'heatmap',
      data: cellData,
      itemStyle: {
        borderColor: '#ff0000',  // Red grid lines like Excel
        borderWidth: 1,
        color: (params: any) => {
          const grayValue = params.data[2];
          return getColorForGrayValue(grayValue);
        }
      },
      emphasis: {
        itemStyle: {
          borderColor: '#000000',
          borderWidth: 2
        }
      },
      tooltip: {
        formatter: (params: any) => {
          const xIdx = params.data[0];
          const yIdx = params.data[1];
          const grayValue = params.data[2];
          const distance = segmentDistances[xIdx];
          const laserNum = uniqueLaserLines[yIdx];
          const depthMm = (255 - grayValue) * 0.2;
          
          let severity = 'Normal';
          if (grayValue < 50) severity = 'Very High (0-50)';
          else if (grayValue < 100) severity = 'High (50-100)';
          else if (grayValue < 150) severity = 'Medium (100-150)';
          else severity = 'Low/None (150-200)';
          
          return `
            <strong>Position:</strong> ${distance.toFixed(3)}m, L${laserNum}<br/>
            <strong>Gray Value:</strong> ${grayValue.toFixed(1)}<br/>
            <strong>Depth:</strong> ${depthMm.toFixed(1)}mm<br/>
            <strong>Severity:</strong> ${severity}
          `;
        }
      },
      z: 2
    });

    const areaChartOptions = {
      backgroundColor: 'transparent',
      title: {
        text: `Plot ${String.fromCharCode(65 + this.currentSegmentIndex)}`,
        right: '3%',
        bottom: '3%',
        textStyle: {
          color: '#ffffff',
          fontSize: 14,
          fontWeight: 400
        }
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(30, 30, 46, 0.95)',
        borderColor: '#667eea',
        borderWidth: 1,
        textStyle: {
          color: '#ffffff'
        }
      },
      grid: {
        left: '8%',
        right: '10%',  // Extra space for Y-axis zoom slider
        top: '5%',
        bottom: '8%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: Array.from({ length: segmentDistanceCount }, (_, i) => i),
        boundaryGap: true,  // REQUIRED for heatmap!
        axisLine: {
          show: true,
          lineStyle: { color: 'rgba(255, 255, 255, 0.3)' }
        },
        axisTick: {
          show: true,
          lineStyle: { color: 'rgba(255, 255, 255, 0.2)' }
        },
        axisLabel: {
          show: true,
          color: '#ffffff',
          fontSize: 9,
          interval: Math.floor(segmentDistanceCount / 10),
          formatter: (value: any) => {
            const dist = segmentDistances[value];
            return dist ? dist.toFixed(1) : '';
          }
        },
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: 'category',
        data: uniqueLaserLines.map(l => `L${l}`),  // Use actual laser line numbers from data
        boundaryGap: true,  // REQUIRED for heatmap!
        inverse: false,
        axisLine: {
          show: true,
          lineStyle: { color: 'rgba(255, 255, 255, 0.3)' }
        },
        axisTick: {
          show: true,
          lineStyle: { color: 'rgba(255, 255, 255, 0.2)' }
        },
        axisLabel: {
          show: true,
          color: '#ffffff',
          fontSize: 9,
          interval: uniqueLaserLines.length > 30 ? Math.floor(uniqueLaserLines.length / 15) : 0  // Show fewer labels if >30 lanes
        },
        splitLine: {
          show: false
        }
      },
      visualMap: {
        show: true,
        type: 'piecewise',
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        pieces: [
          { min: 0, max: 50, label: '0-50', color: '#0000ff' },
          { min: 50, max: 100, label: '50-100', color: '#ff0000' },
          { min: 100, max: 150, label: '100-150', color: '#ffff00' },
          { min: 150, max: 255, label: '150-200', color: 'rgba(255, 255, 255, 0.2)' }
        ],
        textStyle: {
          color: '#ffffff',
          fontSize: 11,
          fontWeight: 500
        },
        itemWidth: 20,
        itemHeight: 14,
        itemGap: 10,
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        padding: 8,
        borderRadius: 5,
        borderColor: 'rgba(102, 126, 234, 0.3)',
        borderWidth: 1
      },
      dataZoom: [
        {
          type: 'slider',
          yAxisIndex: 0,
          show: true,
          left: '93%',
          start: 0,
          end: uniqueLaserLines.length > 20 ? Math.min(100, (20 / uniqueLaserLines.length) * 100) : 100,  // Show first 20 lanes initially if >20
          width: 25,
          borderColor: '#667eea',
          fillerColor: 'rgba(102, 126, 234, 0.2)',
          handleIcon: 'path://M0,0 L0,8 L6,4 Z',
          handleSize: '80%',
          handleStyle: {
            color: '#667eea',
            borderColor: '#667eea'
          },
          textStyle: {
            color: '#333333',
            fontSize: 10
          },
          moveHandleSize: 5,
          brushSelect: false,
          showDetail: true,
          showDataShadow: false,
          filterMode: 'none'
        },
        {
          type: 'inside',
          yAxisIndex: 0,
          start: 0,
          end: uniqueLaserLines.length > 20 ? Math.min(100, (20 / uniqueLaserLines.length) * 100) : 100,
          zoomOnMouseWheel: 'shift',  // Hold Shift + scroll to zoom Y-axis
          moveOnMouseMove: 'ctrl',     // Hold Ctrl + drag to pan Y-axis
          moveOnMouseWheel: true       // Scroll to pan Y-axis
        }
      ],
      series: series,
      animation: true,
      animationDuration: 600
    };
    
    // Assign to component property to trigger change detection
    this.potholeAreaChartOptions = Object.assign({}, areaChartOptions);

    console.log(`✅ Generated area chart: ${series.length} series (1 grid + ${potholes.length} potholes × 4 elements)`);
    console.log(`   Y-axis categories: ${areaChartOptions.yAxis.data.length} labels (${areaChartOptions.yAxis.data.slice(0, 5).join(', ')}, ..., ${areaChartOptions.yAxis.data.slice(-5).join(', ')})`);
    console.log(`   Y-axis zoom: ${uniqueLaserLines.length > 20 ? 'Enabled (showing first 20 lanes)' : 'Disabled (all lanes fit)'}`);
  }

  generateProfileHeatmapChart() {
    if (!this.profileHeatmapData?.segments) return;

    // Get current segment data
    const currentSegment = this.profileHeatmapData.segments[this.currentSegmentIndex];
    if (!currentSegment) return;

    const heatmapData = currentSegment.heatmap_data;
    
    // Prepare data for heatmap with contour-like representation
    // Create a 2D grid structure
    const uniqueDistances = [...new Set(heatmapData.map((p: any) => p.distance))].sort((a: any, b: any) => a - b);
    const uniqueLaserLines = [...new Set(heatmapData.map((p: any) => p.laser_line))].sort((a: any, b: any) => a - b);

    // Create a 2D grid array for contour calculation
    const gridData: number[][] = [];
    const dataMap = new Map<string, number>();
    
    heatmapData.forEach((point: any) => {
      const key = `${point.distance.toFixed(3)}_${point.laser_line}`;
      dataMap.set(key, point.gray_value);
    });

    // Build 2D grid
    for (let y = 0; y < uniqueLaserLines.length; y++) {
      const row: number[] = [];
      for (let x = 0; x < uniqueDistances.length; x++) {
        const distance: any = uniqueDistances[x];
        const laserLine = uniqueLaserLines[y];
        const key = `${distance.toFixed(3)}_${laserLine}`;
        const value = dataMap.get(key);
        row.push(value !== undefined ? value : 150); // Default to medium value
      }
      gridData.push(row);
    }

    // Create heatmap data in [x, y, value] format
    const chartData: any[] = [];
    uniqueDistances.forEach((distance: any, xIdx) => {
      uniqueLaserLines.forEach((laserLine, yIdx) => {
        const key = `${distance.toFixed(3)}_${laserLine}`;
        const grayValue = dataMap.get(key);
        if (grayValue !== undefined) {
          chartData.push([xIdx, yIdx, grayValue]);
        }
      });
    });

    // Define contour levels with colors matching the image
    const contourLevels = [
      { value: 0, color: '#ff0000', label: 'Very High' },      // Red for very deep potholes
      { value: 50, color: '#ff6b00', label: 'High' },          // Orange for deep potholes
      { value: 100, color: '#3366ff', label: 'Medium' },       // Blue for medium depressions
      { value: 150, color: '#99cc66', label: 'Low' },          // Yellow-green for slight depressions
      { value: 200, color: '#cc99ff', label: 'Normal' }        // Purple for normal surface
    ];

    const heatmapChartOptions = {
      backgroundColor: '#2d2d3d',
      title: {
        text: `Plot ${String.fromCharCode(65 + this.currentSegmentIndex)}`,  // Plot A, B, C, ...
        right: '5%',
        bottom: '5%',
        textStyle: {
          color: '#ffffff',
          fontSize: 14,
          fontWeight: 400
        }
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(30, 30, 46, 0.95)',
        borderColor: '#667eea',
        borderWidth: 1,
        textStyle: {
          color: '#ffffff'
        },
        formatter: (params: any) => {
          const xIdx = params.value[0];
          const yIdx = params.value[1];
          const grayValue = params.value[2];
          const distance: any = uniqueDistances[xIdx];
          const laserLine = uniqueLaserLines[yIdx];
          const chainage = currentSegment.start_chainage_km + (distance - currentSegment.start_distance) / 1000;
          
          return `
            <strong>Distance:</strong> ${distance.toFixed(3)}m<br/>
            <strong>Chainage:</strong> ${chainage.toFixed(3)} km<br/>
            <strong>Laser Line:</strong> L${laserLine}<br/>
            <strong>Gray Value:</strong> ${grayValue.toFixed(1)}<br/>
            <strong>Status:</strong> ${this.getGrayValueSeverity(grayValue)}
          `;
        }
      },
      grid: {
        left: '8%',
        right: '15%',
        top: '5%',
        bottom: '12%',
        containLabel: true,
        backgroundColor: '#3d3d4d',
        borderColor: '#4d4d5d',
        borderWidth: 1
      },
      xAxis: {
        type: 'category',
        data: uniqueDistances.map((d, idx) => idx),
        position: 'bottom',
        nameTextStyle: {
          color: '#ffffff',
          fontSize: 11
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#5d5d6d'
          }
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: '#5d5d6d'
          }
        },
        axisLabel: {
          show: true,
          color: '#ffffff',
          fontSize: 9,
          rotate: 90,
          interval: Math.floor(uniqueDistances.length / 8),
          formatter: (value: any) => {
            const dist: any = uniqueDistances[value];
            return dist ? dist.toFixed(6) : '';  // Match the format in image (many decimals)
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#4a6fa5',  // Blue grid lines like in image
            width: 1,
            type: 'solid'
          }
        }
      },
      yAxis: {
        type: 'category',
        data: uniqueLaserLines.map(l => `L${l} gray value`).reverse(),  // Reverse to match image (L29 at top)
        position: 'right',
        nameTextStyle: {
          color: '#ffffff',
          fontSize: 11
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#5d5d6d'
          }
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: '#5d5d6d'
          }
        },
        axisLabel: {
          show: true,
          color: '#ffffff',
          fontSize: 9,
          margin: 5
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#4a6fa5',  // Blue grid lines like in image
            width: 1,
            type: 'solid'
          }
        }
      },
      visualMap: {
        type: 'piecewise',
        pieces: [
          { min: 0, max: 50, color: '#ff0000', label: 'Very High (0-50)' },
          { min: 50, max: 100, color: '#ff6b00', label: 'High (50-100)' },
          { min: 100, max: 150, color: '#3366ff', label: 'Medium (100-150)' },
          { min: 150, max: 180, color: '#99cc66', label: 'Low (150-180)' },
          { min: 180, max: 255, color: '#cc99ff', label: 'Normal (180-255)' }
        ],
        orient: 'vertical',
        right: '1%',
        top: 'center',
        textStyle: {
          color: '#ffffff',
          fontSize: 10
        },
        itemWidth: 18,
        itemHeight: 12,
        itemGap: 8
      },
      series: [{
        name: 'Gray Value',
        type: 'heatmap',
        data: chartData.map((item) => [item[0], uniqueLaserLines.length - 1 - item[1], item[2]]), // Reverse Y to match image
        itemStyle: {
          borderColor: '#000000',
          borderWidth: 0.5
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 8,
            shadowColor: 'rgba(0, 0, 0, 0.7)',
            borderColor: '#ffffff',
            borderWidth: 2
          }
        },
        label: {
          show: false
        }
      }],
      animationDuration: 800,
      animationEasing: 'cubicOut'
    };
    
    // Assign to component property to trigger change detection
    this.potholeProfileHeatmapOptions = Object.assign({}, heatmapChartOptions);

    console.log(`🗺️ Generated profile heatmap: ${chartData.length} data points`);
  }

  getGrayValueSeverity(grayValue: number): string {
    if (grayValue < 50) return 'Very High Severity';
    if (grayValue < 100) return 'High Severity';
    if (grayValue < 150) return 'Medium Severity';
    if (grayValue < 200) return 'Low Severity';
    return 'Normal';
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
      console.log('âœ… RIS Reported: Generated chainage comparison chart');
    }, 100);
    
    console.log('âœ… RIS Reported: Opened chainage comparison chart modal with distresses:', this.selectedDistressesForComparison);
  }

  // Close chainage comparison chart modal
  closeChainageComparisonModal() {
    this.isChainageComparisonModalOpen = false;
    this.selectedDistressesForComparison = [];
    console.log('âœ… RIS Reported: Closed chainage comparison chart modal');
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
        console.warn('âš ï¸ Maximum 5 distresses can be compared at once');
        return;
      }
    }
    
    console.log('âœ… RIS Reported: Selected distresses for comparison:', this.selectedDistressesForComparison);
    
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

    console.log('ðŸ” Generating chart for distresses:', this.selectedDistressesForComparison);
    console.log('ðŸ” Chainage range:', chainageMin, 'to', chainageMax);

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
      console.log(`ðŸ“Š ${distressName}: Total count = ${totalCount}, Color = ${distressColor}`);

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

    console.log('ðŸ“ˆ Generated series count:', series.length);

    // Generate X-axis labels
    const xAxisLabels = chainageBins.slice(0, binCount).map(chainage => 
      chainage.toFixed(2)
    );

    // Configure chart options
    this.chainageComparisonChartOptions = Object.assign({}, {
      title: {
        // text: 'Distress Distribution Along Chainage (Bar Chart)',
        left: 'center',
        textStyle: {
          color: '#fff',
          fontSize: 18,
          fontWeight: 'bold'
        },
        // subtext: 'Interactive comparison of distress types across road sections',
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
            ðŸ“ ${params[0].axisValue}
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
        left: isTabletOrSmaller ? (isMobileView ? '15%' : '10%') : '3%',
        right: isTabletOrSmaller ? (isMobileView ? '8%' : '15%') : '4%',
        bottom: isTabletOrSmaller ? (isMobileView ? '12%' : '10%') : '15%',
        top: isTabletOrSmaller ? (isMobileView ? '25%' : '15%') : '20%',
        containLabel: true
      },
      xAxis: isTabletOrSmaller ? {
        // Horizontal bars for tablet/mobile - X is value (Distress Count)
        type: 'value',
        name: 'Distress Count',
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
        name: 'Distress Count',
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

    console.log('âœ… RIS Reported: Generated chainage comparison chart with', series.length, 'distresses');
  }

  private async loadProjectsAndDates() {
    try {
      const response = await fetch(
        'https://fantastic-reportapi-production.up.railway.app/projects-dates/distress_reported',
        {
          method: 'GET',
          headers: {
            accept: 'application/json',
          },
        }
      );

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
        distress_type: ['All'],
      };

      console.log('Distress API Request Body:', requestBody);

      const response = await fetch(
        'https://fantastic-reportapi-production.up.railway.app/distress_report_filter',
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
        apiResponse.forEach((group) => {
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
        severity: this.getSeverityFromDistressType(item.distress_type),
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
      Trees: item.trees || 0,
      'Transverse crack': item.culvert || 0,
      'Block crack': item.street_lights || 0,
      'Edge Break': item.bridges || 0,
      Heaves: item.traffic_signals || 0,
      Hotspots: item.bus_stop || 0,
      'Joint crack': item.truck_layby || 0,
      'Joint seal defects': item.toll_plaza || 0,
      'Longitudinal crack': item.adjacent_road || 0,
      'Multiple cracks': item.toilet_blocks || 0,
      'Oblique crack': item.rest_area || 0,
      Patchwork: item.rcc_drain || 0,
      Pothole: item.fuel_station || 0,
      Punchout: item.emergency_call_box || 0,
      Raveling: item.tunnels || 0,
      'Simple crack': item.footpath || 0,
      'Discrete crack': item.junction || 0,
      Rutting: item.sign_boards || 0,
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

  getFilteredData(): DistressReportData[] {
    return this.rawData.filter((item) => {
      // Note: Project and Date filtering is now done by the API
      const matchesDirection =
        this.filters.direction === 'All' ||
        item.direction === this.filters.direction;
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

  updateDistressSummary() {
    const filteredData = this.getFilteredData();

    // Define all distress types from the image
    const allDistressTypes = [
      'Alligator crack',
      'Transverse crack',
      'Hairline crack',
      'Block crack',
      'Edge Break',
      'Heaves',
      'Hungry crack',
      'Hotspots',
      'Joint crack',
      'Joint seal defects',
      'Slippage',
      'Longitudinal crack',
      'Multiple cracks',
      'Bleeding',
      'Stripping',
      'Patchwork',
      'Pothole',
      'Punchout',
      'Settlement',
      'Raveling',
      'Simple crack',
      'Discrete crack',
      'Shoving',
      'Rutting',
    ];

    // Define colors for distress types
    const distressColors: { [key: string]: string } = {
      'Alligator crack': '#CC0000',
      'Transverse crack': '#2E8B57',
      'Hairline crack': '#B8860B',
      'Block crack': '#006400',
      'Edge Break': '#800080',
      Heaves: '#008B8B',
      'Hungry crack': '#FF8C00',
      Hotspots: '#FF6347',
      'Joint crack': '#8B4513',
      'Joint seal defects': '#A0522D',
      Slippage: '#008B8B',
      'Longitudinal crack': '#000080',
      'Multiple cracks': '#DC143C',
      Bleeding: '#000080',
      Stripping: '#B22222',
      Patchwork: '#4682B4',
      Pothole: '#FF4500',
      Punchout: '#DAA520',
      Settlement: '#663399',
      Raveling: '#228B22',
      'Simple crack': '#C71585',
      'Discrete crack': '#008B8B',
      Shoving: '#654321',
      Rutting: '#4B0082',
    };

    this.distressSummary = allDistressTypes.map((distressType) => {
      const count = filteredData.filter(
        (item) => item.distress_type === distressType
      ).length;
      return {
        name: distressType,
        count: count,
        color: distressColors[distressType] || '#9E9E9E',
      };
    });
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

  getDistressColor(distressType: string): string {
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
          attribution: 'Â© Google',
          maxZoom: 21,
        }
      );

      // Add Google satellite layer by default
      googleSatelliteLayer.addTo(this.map);

      // Add zoom event listener for dynamic switching between colorful points and icons
      this.map.on('zoomend', () => {
        if (this.map) {
          this.currentZoomLevel = this.map.getZoom();
          // Use updateMapMarkersOnly to preserve selected distress filter and not refit bounds
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

  // Method to update map markers WITHOUT refitting bounds (for distress selection)
  async updateMapMarkersOnly() {
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

      // DON'T ADJUST MAP BOUNDS - Keep current zoom and position
      console.log(`âœ… Updated map markers for ${this.selectedDistressType || 'All Distresses'} without refitting bounds`);
    } catch (error) {
      console.error('Error updating map markers:', error);
    }
  }

  // Method to show colorful circle markers (zoomed out view)
  private async showColorfulPoints(filteredData: DistressReportData[], L: any) {
    // Get color for selected distress type (if any)
    const selectedColor = this.selectedDistressType 
      ? (this.distressSummary.find(d => d.name === this.selectedDistressType)?.color || this.getDistressColor(this.selectedDistressType))
      : null;

    filteredData.forEach((item) => {
      if (item.latitude && item.longitude) {
        // Use selected distress color if filtering, otherwise use item's color
        const color = selectedColor || this.getDistressColor(item.distress_type);
        
        const marker = L.circleMarker([item.latitude, item.longitude], {
          radius: this.selectedDistressType ? 8 : 6, // Larger when filtering specific distress
          fillColor: color,
          color: color,
          weight: 0,
          opacity: 1,
          fillOpacity: this.selectedDistressType ? 0.9 : 0.8, // More opaque when filtering
        }).addTo(this.map);

        marker.bindPopup(`
          <div style="font-family: Arial, sans-serif; min-width: 200px;">
            <h4 style="margin: 0 0 10px 0; color: ${color}; font-size: 14px;">
              ${item.distress_type}
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
              <strong>Severity:</strong> ${item.severity || 'N/A'}
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
          // Use cached icon or create new one
          let customIcon = this.iconCache.get(item.distress_type);

          if (!customIcon) {
            const iconHtml = this.getDistressIcon(item.distress_type);
            customIcon = L.divIcon({
              html: iconHtml,
              className: 'custom-distress-icon',
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            });
            // Cache the icon for reuse
            this.iconCache.set(item.distress_type, customIcon);
          }

          const marker = L.marker([item.latitude, item.longitude], {
            icon: customIcon,
          }).addTo(this.map);

          // Create popup only when clicked - saves memory
          marker.on('click', () => {
            const color = this.getDistressColor(item.distress_type);
            const popup = `<div style="padding:8px;"><div style="color:${color};font-weight:bold;margin-bottom:5px;">${
              item.distress_type
            }</div><div style="font-size:11px;">Ch: ${item.chainage_start?.toFixed(
              1
            )}-${item.chainage_end?.toFixed(1)} km<br>Dir: ${
              item.direction || 'N/A'
            }<br>Sev: ${item.severity || 'N/A'}</div></div>`;
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

      // If a specific distress type is selected, filter to show only that type
      if (this.selectedDistressType) {
        filteredData = filteredData.filter(
          (item) => item.distress_type === this.selectedDistressType
        );
      }

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

  // Distress icon map - centralized for both map markers and UI
  private distressIconMap: { [key: string]: { icon: string; color: string } } = {
    'Alligator crack': { icon: 'fa-solid fa-wave-square', color: '#8B0000' },
    Bleeding: { icon: 'fa-solid fa-droplet', color: '#000066' },
    'Block crack': { icon: 'fa-solid fa-grip', color: '#004d00' },
    'Edge break': { icon: 'fa-solid fa-divide', color: '#660066' },
      'Hairline crack': { icon: 'fa-solid fa-minus', color: '#996600' },
      Heaves: { icon: 'fa-solid fa-chart-line', color: '#006666' },
      'Joint crack': { icon: 'fa-solid fa-link-slash', color: '#663300' },
      'Joint seal defects': {
        icon: 'fa-solid fa-circle-xmark',
        color: '#804020',
      },
      'Longitudinal crack': {
        icon: 'fa-solid fa-arrows-up-down',
        color: '#000066',
      },
      'Multiple cracks': { icon: 'fa-solid fa-burst', color: '#990000' },
      'Oblique crack': { icon: 'fa-solid fa-slash', color: '#CC6600' },
      Patching: { icon: 'fa-solid fa-band-aid', color: '#336699' },
      Pothole: { icon: 'fa-solid fa-circle', color: '#CC3300' },
      Punchout: { icon: 'fa-solid fa-square-minus', color: '#996600' },
      Raveling: { icon: 'fa-solid fa-hands-bound', color: '#1a661a' },
      'Simple crack': { icon: 'fa-solid fa-grip-lines', color: '#990066' },
      'Single discrete crack': {
        icon: 'fa-solid fa-grip-lines-vertical',
        color: '#004d4d',
      },
      Rutting: { icon: 'fa-solid fa-road', color: '#4B0082' },
      'Transverse crack': {
        icon: 'fa-solid fa-arrows-left-right',
        color: '#2d7a4d',
      },
      Settlement: { icon: 'fa-solid fa-arrow-down', color: '#4d2966' },
      Shoving: { icon: 'fa-solid fa-arrows-alt-h', color: '#4d3621' },
      Slippage: { icon: 'fa-solid fa-skiing', color: '#006666' },
      Stripping: { icon: 'fa-solid fa-layer-group', color: '#8B0000' },
      Hotspots: { icon: 'fa-solid fa-fire', color: '#CC3300' },
      'Hungry surface': { icon: 'fa-solid fa-warehouse', color: '#CC6600' },
      Repair: { icon: 'fa-solid fa-wrench', color: '#006666' },
      Roughness: { icon: 'fa-solid fa-mountain', color: '#7851a3' },
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

        console.log(`ðŸ“¥ Preloading data for month ${month}, request:`, requestBody);

        try {
          const response = await fetch(
            'https://fantastic-reportapi-production.up.railway.app/distress_report_filter',
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
          console.log(`ðŸ“¥ API response for ${month}:`, apiResponse);
          const monthData = Array.isArray(apiResponse) ? apiResponse.flat() : [];
          
          this.monthDataCache[monthCacheKey] = monthData;
          console.log(`âœ… Pre-loaded data for ${month}: ${monthData.length} records`);
          if (monthData.length > 0) {
            console.log(`   Sample data:`, monthData.slice(0, 2));
            const uniqueDistresses = [...new Set(monthData.map(d => d.distress_type))];
            console.log(`   Unique distress types in ${month}:`, uniqueDistresses);
          }
        } catch (error) {
          console.error(`âŒ Error pre-loading data for ${month}:`, error);
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
  }

  formatDistressCount(distress: DistressData): string {
    return distress.count.toString();
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
  
  async openMonthComparisonModalForDistress(distressName: string) {
    this.availableMonthsForComparison = this.projectDatesMap[this.filters.projectName] || [];
    this.selectedDistressesForMonthComparison = [distressName];
    this.showDistressSelectionInModal = false;
    this.isMonthComparisonModalOpen = true;
    this.isLoadingMonthChart = true;
    
    // Ensure data is loaded
    if (Object.keys(this.monthDataCache).length === 0) {
      console.log('ðŸ“¥ Cache is empty, preloading month data first...');
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
      const monthDataMap: { [month: string]: DistressReportData[] } = {};
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
            'https://fantastic-reportapi-production.up.railway.app/distress_report_filter',
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
          
          this.monthDataCache[monthCacheKey] = monthData;
          return { month, data: monthData };
        } catch (error) {
          console.error(`âŒ Error fetching data for ${month}:`, error);
          return { month, data: [] };
        }
      });

      const results = await Promise.all(fetchPromises);
      results.forEach(({ month, data }) => {
        monthDataMap[month] = data;
      });

      const series: any[] = [];

      this.selectedDistressesForMonthComparison.forEach(distressName => {
        const distressColor = this.getDistressColor(distressName);
        const monthData: number[] = [];
        
        console.log(`ðŸ“Š Processing distress: ${distressName}`);
        
        this.availableMonthsForComparison.forEach(month => {
          const data = monthDataMap[month] || [];
          console.log(`  Month ${month}: ${data.length} total records`);
          
          // Log first few items to see the actual distress_type values
          if (data.length > 0) {
            console.log(`    Sample distress types:`, data.slice(0, 3).map(d => d.distress_type));
          }
          
          const totalCount = data.reduce((count, item) => {
            // Case-insensitive comparison
            const itemDistressType = (item.distress_type || '').toLowerCase().trim();
            const searchDistressType = (distressName || '').toLowerCase().trim();
            
            if (itemDistressType === searchDistressType) {
              return count + 1;
            }
            return count;
          }, 0);
          
          console.log(`  ${month}: Count = ${totalCount}`);
          monthData.push(totalCount);
        });

        console.log(`ðŸ“Š Final data for ${distressName}:`, monthData);

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

      console.log('ðŸ“ˆ Generated series:', series);
      console.log(`ðŸ“ˆ Series count: ${series.length}`);
      
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
