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
import {
  GoogleMapsTrafficService,
  RouteData,
} from '../../../../shared/services/google-maps-traffic.service';
import { ProjectSelectionService } from '../../../../shared/services/project-selection.service';

interface InfoData {
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

// Interface for the data structure
interface ReportData {
  project_name: string;
  chainage_start: number;
  chainage_end: number;
  direction: string;
  pavement_type: string;
  lane: string;
  distress_type: string;
  latitude: number | null;
  longitude: number | null;
  date: string;
  severity: string;
  prediction_confidence?: number;
  apiType?: string; // 'inventory', 'reported', 'predicted', 'tis', 'ais', 'pms', 'rwfis'
  // Individual distress counts
  rough_spot?: number;
  pothole?: number;
  hotspots?: number;
  edge_break?: number;
  alligator_crack?: number;
  transverse_crack?: number;
  longitudinal_crack?: number;
  hairline_crack?: number;
  patchwork?: number;
  rutting?: number;
  bleeding?: number;
  raveling?: number;
  // Measurement fields for reported data
  area?: number;
  depth?: number;
  length?: number;
  width?: number;
  _rawItem?: any;
}

interface DashboardCard {
  title: string;
  path: string;
  icon: string;
  apiType?: string; // 'inventory', 'reported', 'predicted', etc.
}

interface CardAssetData {
  name: string;
  count: number;
  unit?: string;
}

interface CardWithAssets {
  card: DashboardCard;
  assets: CardAssetData[];
}

@Component({
  selector: 'app-new-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEchartsModule],
  providers: [provideEcharts()],
  templateUrl: './new-dashboard.component.html',
  styleUrl: './new-dashboard.component.scss',
})
export class NewDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainerRef!: ElementRef;
  @ViewChild('mapContainerWrapper', { static: false }) mapContainerWrapper!: ElementRef;

  isMapFullScreen = false;
  private fullscreenChangeListener = () => this.onFullscreenChange();

  // Raw data from API
  rawData: ReportData[] = [];

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
  availableDates: string[] = [];
  availableDistressTypes: string[] = [];

  // Project dates mapping from API
  projectDatesMap: ProjectDatesResponse = {};
  // Store project dates by API type for smart date selection
  projectDatesByApiType: { [apiType: string]: ProjectDatesResponse } = {};
  // Store original project names by API type (to handle case differences)
  originalProjectNamesByApiType: { [apiType: string]: { [normalized: string]: string } } = {};
  // Store raw project dates responses (with original keys) for exact project name lookup
  rawProjectDatesByApiType: { [apiType: string]: ProjectDatesResponse } = {};

  // Information data
  infoData: InfoData[] = [];

  // Card assets data - stores assets for each card
  cardAssetsMap: { [cardTitle: string]: CardAssetData[] } = {};
  
  // Comparison card assets data - stores assets for comparison modal (based on comparisonChartData)
  comparisonCardAssetsMap: { [cardTitle: string]: CardAssetData[] } = {};

  // Selected cards for API loading (supports multiple selections)
  selectedCards: Set<string> = new Set();
  currentApiTypes: Set<string> = new Set();

  // Dashboard navigation cards
  dashboardCards: DashboardCard[] = [
    {
      title: 'Inventory',
      path: '/ris/inventory-dashboard',
      icon: 'bi bi-box-seam',
      apiType: 'inventory',
    },
    {
      title: 'Reported',
      path: '/ris/reported',
      icon: 'bi bi-file-earmark-text',
      apiType: 'reported',
    },
    {
      title: 'Predicted',
      path: '/ris/distress-prediction',
      icon: 'bi bi-graph-up-arrow',
      apiType: 'predicted',
    },
    {
      title: 'TIS',
      path: '/tis/tis-dashboard',
      icon: 'bi bi-traffic-light',
      apiType: 'tis',
    },
    {
      title: 'AIS',
      path: '/ais/ais-dashboard',
      icon: 'bi bi-exclamation-triangle',
      apiType: 'ais',
    },
    {
      title: 'PMS',
      path: '/pms/pms-dashboard',
      icon: 'bi bi-road',
      apiType: 'pms',
    },
    {
      title: 'RWFIS',
      path: '/rwfis',
      icon: 'bi bi-geo-alt',
      apiType: 'rwfis',
    },
  ];

  private map: any;
  public isBrowser: boolean;
  public isLoading: boolean = false;
  public isSidebarOpen: boolean = false;

  // Flag to prevent duplicate data loads when project changes
  private isProjectChanging: boolean = false;

  // Zoom-based visualization properties
  private currentZoomLevel: number = 10;
  private zoomThreshold: number = 16;
  private markers: any[] = [];
  private iconCache: Map<string, any> = new Map();
  private zoomUpdateTimeout: any = null;
  private lastMarkerMode: 'dots' | 'icons' | null = null; // Track current marker mode

  // Toggle icons visibility on this map card only (hide/show all data markers)
  mapIconsVisible: boolean = true;

  // TIS Traffic route visualization
  private trafficRoutePolylines: any[] = [];
  private trafficMarkers: any[] = [];
  private originMarker: any = null;
  private destinationMarker: any = null;
  private currentRouteData: RouteData | null = null;
  private pendingTisRoute: { routeData: RouteData; coordinates: { origin: string; destination: string }; directionsResult?: any } | null = null;

  // Selected info card for interactive filtering
  public selectedInfoCard: string | null = null;

  // Chainage comparison chart modal properties
  isChainageComparisonModalOpen: boolean = false;
  chainageComparisonChartOptions: any = {};
  selectedCardsForComparison: Set<string> = new Set(); // Card titles selected for comparison
  
  // Selected assets for comparison (cardTitle -> Set of asset names)
  selectedAssetsForComparison: { [cardTitle: string]: Set<string> } = {};
  
  comparisonChainageMin: number = 0;
  comparisonChainageMax: number = 1;
  comparisonChartData: ReportData[] = []; // Data specifically loaded for comparison chart
  isLoadingComparisonData: boolean = false; // Loading state for comparison data
  comparisonDataByCard: { [cardTitle: string]: ReportData[] } = {}; // Store data per card
  comparisonDataCache: { [key: string]: { data: ReportData[]; projectName: string; date: string } } = {}; // Cache data by project/date/apiType
  
  // Comparison chart filters (separate from main dashboard filters)
  comparisonFilters: {
    projectName: string;
    date: string;
    direction: string;
    pavementType: string;
    lane: string;
  } = {
    projectName: '',
    date: '',
    direction: 'All',
    pavementType: 'All',
    lane: 'All',
  };

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

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private trafficService: GoogleMapsTrafficService,
    private projectSelection: ProjectSelectionService,
    private cdr: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {}

  ngAfterViewInit() {
    if (this.isBrowser) {
      document.addEventListener('fullscreenchange', this.fullscreenChangeListener);
      // Initialize map after view is ready
      setTimeout(() => {
        console.log('🔄 ngAfterViewInit: Initializing map...');
        this.initMap();
        
        // Auto-select and load TIS card after map is initialized
        const tisCard = this.dashboardCards.find(card => card.apiType === 'tis');
        if (tisCard) {
          setTimeout(() => {
            console.log('🚦 Auto-selecting and loading TIS card on initialization...');
            // Call onCardClick to select TIS card and load data
            this.onCardClick(tisCard);
          }, 1500);
        }
      }, 1000);
    }
  }

  /** Convert UI date (e.g. DD-MM-YYYY) to API format YYYY-MM-DD for TIS and other APIs. */
  private convertDateFormat(dateString: string): string {
    if (!dateString || !dateString.includes('-') || dateString.length !== 10) return dateString;
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    if (parts[0].length === 4) return dateString; // already YYYY-MM-DD
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  /**
   * When TIS was selected but TIS API returned no data for this date, try to show the route
   * using start/end coordinates from other cards (Reported, Inventory, etc.) so the map still shows the road.
   */
  private async tryTisRouteFallbackFromOtherData(results: { apiType: string; flatData: any[]; data?: any }[]): Promise<void> {
    if (!this.currentApiTypes.has('tis')) return;
    const tisResult = results.find((r) => r.apiType === 'tis');
    if (!tisResult || tisResult.flatData.length > 0) return;

    const coordinates = this.getProjectStartEndCoordinates();
    if (!coordinates) {
      console.warn('⚠️ TIS: No data for this date and no coordinates from other cards. TIS route not shown.');
      return;
    }

    console.log('✅ TIS: No TIS data for this date; using coordinates from other cards to show route.');
    try {
      const departureTime = new Date(Date.now() + 2 * 60 * 1000);
      const { routeData, directionsResult } = await this.trafficService.getRouteForDisplay(
        coordinates.origin,
        coordinates.destination,
        departureTime
      );
      this.currentRouteData = routeData;

      const displayRoute = async () => {
        let retries = 0;
        while (!this.map && retries < 10) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          retries++;
        }
        if (this.map) {
          try {
            await this.displayTrafficRouteOnMap(routeData, coordinates, directionsResult);
            console.log('✅ TIS route displayed using coordinates from other cards.');
          } catch (err) {
            console.error('❌ Error displaying TIS fallback route:', err);
          }
        } else {
          this.pendingTisRoute = { routeData, coordinates, directionsResult };
        }
      };
      displayRoute();
    } catch (err) {
      console.warn('⚠️ TIS fallback route failed:', err);
    }
  }

  /**
   * Get project start/end coordinates for traffic service
   */
  private getProjectStartEndCoordinates(): {
    origin: string;
    destination: string;
  } | null {
    // First, try to use inventory data (if Inventory card is selected)
    const inventoryData = this.rawData.filter((item) => item.apiType === 'inventory');
    if (inventoryData && inventoryData.length > 0) {
      // Use case-insensitive matching for project name
      const normalizedFilterProjectName = this.filters.projectName ? this.filters.projectName.toLowerCase().trim() : '';
      const projectInventoryData = inventoryData.filter((item: any) => {
        const itemProjectName = item.project_name ? item.project_name.toLowerCase().trim() : '';
        return itemProjectName === normalizedFilterProjectName;
      });

      if (projectInventoryData.length > 0) {
        const originAsset = projectInventoryData.reduce(
          (min: any, item: any) => {
            const itemChainage = item.chainage_start || 0;
            const minChainage = min.chainage_start || 0;
            return itemChainage < minChainage ? item : min;
          },
          projectInventoryData[0]
        );

        const destinationAsset = projectInventoryData.reduce(
          (max: any, item: any) => {
            const itemChainage = item.chainage_end || 0;
            const maxChainage = max.chainage_end || 0;
            return itemChainage > maxChainage ? item : max;
          },
          projectInventoryData[0]
        );

        if (
          originAsset.latitude &&
          originAsset.longitude &&
          destinationAsset.latitude &&
          destinationAsset.longitude &&
          originAsset.latitude !== 0 &&
          originAsset.longitude !== 0 &&
          destinationAsset.latitude !== 0 &&
          destinationAsset.longitude !== 0
        ) {
          return {
            origin: `${parseFloat(originAsset.latitude)},${parseFloat(originAsset.longitude)}`,
            destination: `${parseFloat(destinationAsset.latitude)},${parseFloat(destinationAsset.longitude)}`
          };
        }
      }
    }

    // Fallback to other available data
    if (this.rawData && this.rawData.length > 0) {
      const projectData = this.rawData.filter((item: any) => {
        return item.project_name === this.filters.projectName;
      });

      if (projectData.length > 0) {
        const originItem = projectData.reduce(
          (min: any, item: any) => {
            const itemChainage = item.chainage_start || 0;
            const minChainage = min.chainage_start || 0;
            return itemChainage < minChainage ? item : min;
          },
          projectData[0]
        );

        const destinationItem = projectData.reduce(
          (max: any, item: any) => {
            const itemChainage = item.chainage_end || 0;
            const maxChainage = max.chainage_end || 0;
            return itemChainage > maxChainage ? item : max;
          },
          projectData[0]
        );

        if (
          originItem.latitude &&
          originItem.longitude &&
          destinationItem.latitude &&
          destinationItem.longitude &&
          originItem.latitude !== 0 &&
          originItem.longitude !== 0 &&
          destinationItem.latitude !== 0 &&
          destinationItem.longitude !== 0
        ) {
          return {
            origin: `${parseFloat(originItem.latitude)},${parseFloat(originItem.longitude)}`,
            destination: `${parseFloat(destinationItem.latitude)},${parseFloat(destinationItem.longitude)}`
          };
        }
      }
    }

    return null;
  }

  /**
   * Display traffic route on Leaflet map (similar to TIS dashboard).
   * If directionsResult is provided, skips fetching Directions again and draws immediately.
   */
  private async displayTrafficRouteOnMap(
    routeData: RouteData,
    coordinates: { origin: string; destination: string },
    directionsResult?: any
  ): Promise<void> {
    if (!this.map || !this.isBrowser) {
      console.warn('⚠️ Cannot display traffic route: map or browser not available');
      return;
    }

    try {
      console.log('🚦 Starting traffic route display...');
      if (!directionsResult) {
        await this.trafficService.loadGoogleMaps();
        const google = (window as any).google;
        if (typeof google === 'undefined' || !google.maps) throw new Error('Google Maps API not loaded');
        const directionsService = new google.maps.DirectionsService();
        directionsResult = await new Promise<any>((resolve, reject) => {
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
              if (status === 'OK' && result) resolve(result);
              else reject(new Error('Directions request failed: ' + status));
            }
          );
        });
      }

      await this.drawTrafficRouteOnLeaflet(routeData, directionsResult, coordinates);
    } catch (error) {
      console.error('Error displaying traffic route on map:', error);
      // Handle Google Maps API errors gracefully
      if (error instanceof Error) {
        const errorMessage = error.message;
        if (
          errorMessage.includes('DeletedApiProjectMapError') ||
          errorMessage.includes('deleted-api-project') ||
          errorMessage.includes('InvalidKeyMapError') ||
          errorMessage.includes('API key')
        ) {
          console.warn('⚠️ Google Maps API key is invalid. TIS route visualization requires a valid API key.');
          console.warn('⚠️ Please update your Google Maps API key in the environment configuration files.');
          // The map will still work for other features, just TIS routing won't work
        }
      }
    }
  }

  /**
   * Draw traffic route on Leaflet map with color-coded segments
   */
  private async drawTrafficRouteOnLeaflet(routeData: RouteData, directionsResult: any, coordinates: { origin: string; destination: string }) {
    if (!this.map || !routeData.segments || routeData.segments.length === 0) return;

    try {
      const L = await import('leaflet');
      const googleMaps = (window as any).google.maps;
      const route = directionsResult.routes[0];
      const leg = route.legs[0];

      // Clear existing traffic polylines and markers
      this.clearTrafficRoute();

      // Decode polyline to get detailed path
      let detailedPath: any[] = [];
      leg.steps.forEach((step: any) => {
        const stepPolyline = step.polyline;
        if (stepPolyline && stepPolyline.points) {
          const stepPath = googleMaps.geometry.encoding.decodePath(stepPolyline.points);
          detailedPath = detailedPath.concat(stepPath);
        }
      });

      if (detailedPath.length === 0) {
        const overviewPolyline = route.overview_polyline;
        if (overviewPolyline) {
          const polylineString = typeof overviewPolyline === 'string' 
            ? overviewPolyline 
            : overviewPolyline.points || overviewPolyline;
          detailedPath = googleMaps.geometry.encoding.decodePath(polylineString);
        }
      }

      // Get markers every 1km
      const markers = this.trafficService.getMarkerCoordinatesFromPath(detailedPath, 1000);

      // Convert entire detailed path to Leaflet format for single blue route line
      const leafletPath = detailedPath.map((point: any) => {
        const lat = typeof point.lat === 'function' ? point.lat() : point.lat;
        const lng = typeof point.lng === 'function' ? point.lng() : point.lng;
        return [lat, lng] as [number, number];
      });

      // Create single blue route line (like in the image)
      const routePolyline = L.polyline(leafletPath, {
        color: '#2196F3', // Bright blue color
        weight: 6,
        opacity: 0.9,
        smoothFactor: 1,
      });

      // Add popup with route info
      routePolyline.bindPopup(`
        <div style="font-family: 'Segoe UI', sans-serif; min-width: 200px;">
          <strong>TIS Route</strong><br>
          <strong>From:</strong> ${routeData.origin}<br>
          <strong>To:</strong> ${routeData.destination}<br>
          <strong>Total Distance:</strong> ${routeData.total_kms} km<br>
          <strong>Total Time:</strong> ${routeData.total_time}
        </div>
      `);

      routePolyline.addTo(this.map);
      this.trafficRoutePolylines.push(routePolyline);

      // Fit map to show entire route
      if (detailedPath.length > 0) {
        const bounds = L.latLngBounds(
          detailedPath.map((point: any) => {
            const lat = typeof point.lat === 'function' ? point.lat() : point.lat;
            const lng = typeof point.lng === 'function' ? point.lng() : point.lng;
            return [lat, lng] as [number, number];
          })
        );
        this.map.fitBounds(bounds, { padding: [50, 50] });
      }

      // Add start and end markers
      if (markers.length > 0) {
        const startPoint = markers[0];
        const endPoint = markers[markers.length - 1];

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

        // Start marker - Red 'E' (Entry/Start) - like in the image
        const startMarker = L.marker([startLat, startLng], {
          icon: L.divIcon({
            className: 'traffic-start-marker',
            html: '<div style="background: #F44336; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">E</div>',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
        }).bindPopup(`<strong>Entry (Start):</strong> ${leg.start_address}`);
        startMarker.addTo(this.map);
        this.trafficMarkers.push(startMarker);
        this.originMarker = startMarker;

        // End marker - Green 'S' (Stop/End) - like in the image
        const endMarker = L.marker([endLat, endLng], {
          icon: L.divIcon({
            className: 'traffic-end-marker',
            html: '<div style="background: #4CAF50; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">S</div>',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
        }).bindPopup(`<strong>Stop (End):</strong> ${leg.end_address}`);
        endMarker.addTo(this.map);
        this.trafficMarkers.push(endMarker);
        this.destinationMarker = endMarker;
      }
    } catch (error) {
      console.error('Error drawing traffic route on Leaflet map:', error);
    }
  }

  /**
   * Get path segment between two points
   */
  private getPathSegment(fullPath: any[], startPoint: any, endPoint: any): any[] {
    if (fullPath.length === 0) return [];

    let startIdx = 0;
    let endIdx = fullPath.length - 1;
    let minStartDist = Infinity;
    let minEndDist = Infinity;

    for (let i = 0; i < fullPath.length; i++) {
      const distToStart = this.trafficService.haversineDistance(fullPath[i], startPoint);
      const distToEnd = this.trafficService.haversineDistance(fullPath[i], endPoint);

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
    return segmentPath.length < 2 ? [] : segmentPath;
  }

  /**
   * Clear traffic route from map
   */
  private clearTrafficRoute() {
    if (!this.map) return;

    // Clear polylines
    if (this.trafficRoutePolylines) {
      this.trafficRoutePolylines.forEach((polyline: any) => {
        try {
          this.map.removeLayer(polyline);
        } catch (e) {
          // Ignore errors
        }
      });
      this.trafficRoutePolylines = [];
    }

    // Clear markers
    if (this.trafficMarkers) {
      this.trafficMarkers.forEach((marker: any) => {
        try {
          this.map.removeLayer(marker);
        } catch (e) {
          // Ignore errors
        }
      });
      this.trafficMarkers = [];
    }

    // Clear origin/destination markers
    if (this.originMarker) {
      try {
        this.map.removeLayer(this.originMarker);
      } catch (e) {
        // Ignore errors
      }
      this.originMarker = null;
    }

    if (this.destinationMarker) {
      try {
        this.map.removeLayer(this.destinationMarker);
      } catch (e) {
        // Ignore errors
      }
      this.destinationMarker = null;
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
      try {
        // Clear traffic route
        this.clearTrafficRoute();
        // Remove all markers first
        this.clearMapMarkers();
        // Remove the map instance
        this.map.remove();
        // Clear the map reference
        this.map = null as any;
        // Clear icon cache
        this.iconCache.clear();
      } catch (error) {
        console.error('New Dashboard: Error cleaning up map:', error);
      }
    }
  }

  // Helper method to check if value is greater than 0 (handles both string and number)
  isValueGreaterThanZero(value: string | number): boolean {
    if (typeof value === 'number') {
      return value > 0;
    }
    const numValue = parseFloat(value as string) || 0;
    return numValue > 0;
  }

  private async loadProjectsAndDates() {
    try {
      console.log('🔄 Loading projects and dates for multiple cards...', Array.from(this.currentApiTypes));

      // Get endpoints for all selected API types
      const endpointMap: { [key: string]: string } = {
        'inventory': 'https://fantastic-reportapi-production.up.railway.app/projects-dates/inventory',
        'reported': 'https://fantastic-reportapi-production.up.railway.app/projects-dates/distress_reported',
        'predicted': 'https://fantastic-reportapi-production.up.railway.app/projects-dates/distress_predicted',
        'tis': 'https://fantastic-reportapi-production.up.railway.app/projects-dates/tis',
        'ais': 'https://fantastic-reportapi-production.up.railway.app/projects-dates/ais',
        'pms': 'https://fantastic-reportapi-production.up.railway.app/projects-dates/pms',
        'rwfis': 'https://fantastic-reportapi-production.up.railway.app/projects-dates/rwfis',
      };

      // Fetch projects and dates from all selected endpoints
      const fetchPromises = Array.from(this.currentApiTypes).map(async (apiType) => {
        const endpoint = endpointMap[apiType];
        if (!endpoint) {
          console.warn(`No endpoint defined for API type: ${apiType}`);
          return null;
        }

        try {
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              accept: 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const projectDates: ProjectDatesResponse = await response.json();
          console.log(`✅ Projects and Dates loaded for ${apiType}:`, projectDates);
          return projectDates;
        } catch (error) {
          console.error(`Error loading projects and dates for ${apiType}:`, error);
          return null;
        }
      });

      const results = await Promise.all(fetchPromises);
      
      // Helper function to normalize project names for case-insensitive matching
      const normalizeProjectName = (name: string): string => {
        return name.toLowerCase().trim();
      };
      
      // Store project dates by API type for smarter date selection
      // Store project dates by API type with both normalized and original names
      const projectDatesByApiType: { [apiType: string]: ProjectDatesResponse } = {};
      const originalProjectNamesByApiType: { [apiType: string]: { [normalized: string]: string } } = {};
      const rawProjectDatesByApiType: { [apiType: string]: ProjectDatesResponse } = {};
      const apiTypesArray = Array.from(this.currentApiTypes);
      results.forEach((projectDates, index) => {
        if (projectDates && index < apiTypesArray.length) {
          const apiType = apiTypesArray[index];
          const normalizedProjectDates: ProjectDatesResponse = {};
          const originalNames: { [normalized: string]: string } = {};
          
          // Store raw response with original keys
          rawProjectDatesByApiType[apiType] = projectDates;
          
          // Normalize all project names in this API type's response
          Object.keys(projectDates).forEach((projectName) => {
            const normalized = normalizeProjectName(projectName);
            // Use normalized name as key, but preserve original dates
            normalizedProjectDates[normalized] = projectDates[projectName];
            // Store mapping from normalized to original name
            originalNames[normalized] = projectName;
          });
          
          projectDatesByApiType[apiType] = normalizedProjectDates;
          originalProjectNamesByApiType[apiType] = originalNames;
        }
      });
      
      // Store original project names mapping and raw responses for later use
      this.originalProjectNamesByApiType = originalProjectNamesByApiType;
      this.rawProjectDatesByApiType = rawProjectDatesByApiType;
      
      // Merge all project dates maps - use union (all dates from all sources)
      // This gives users all available dates, even if not all cards have data for every date
      // Use case-insensitive matching to handle variations like "Amarnath road" vs "Amarnath Road"
      const mergedProjectDates: ProjectDatesResponse = {};
      const projectNameMap: { [normalized: string]: string } = {}; // Maps normalized name to actual name
      
      results.forEach((projectDates) => {
        if (projectDates) {
          Object.keys(projectDates).forEach((projectName) => {
            const normalized = normalizeProjectName(projectName);
            
            // Use the first encountered actual project name for this normalized name
            if (!projectNameMap[normalized]) {
              projectNameMap[normalized] = projectName;
            }
            
            const actualProjectName = projectNameMap[normalized];
            if (!mergedProjectDates[actualProjectName]) {
              mergedProjectDates[actualProjectName] = [];
            }
            // Merge dates, avoiding duplicates
            const existingDates = new Set(mergedProjectDates[actualProjectName]);
            projectDates[projectName].forEach((date) => {
              existingDates.add(date);
            });
            mergedProjectDates[actualProjectName] = Array.from(existingDates).sort();
          });
        }
      });
      
      // Store project dates by API type for later use
      this.projectDatesByApiType = projectDatesByApiType;
      
      console.log('✅ Merged Projects and Dates (union):', mergedProjectDates);
      console.log('✅ Project Dates by API Type:', projectDatesByApiType);

      console.log('✅ Merged Projects and Dates:', mergedProjectDates);

      // Store the merged mapping
      this.projectDatesMap = mergedProjectDates;

      // Extract project names
      this.availableProjects = Object.keys(mergedProjectDates);

      // Prefer globally selected project, then current selection, else first available
      if (this.availableProjects.length > 0 && !this.filters.projectName) {
        const match = this.projectSelection.getMatchingProject(this.availableProjects);
        this.filters.projectName = match || this.availableProjects[0];

        this.availableDates =
          this.projectDatesMap[this.filters.projectName] || [];

        if (this.availableDates.length > 0) {
          this.filters.date = this.availableDates[0];
        }
        this.cdr.detectChanges();
      } else if (this.filters.projectName) {
        // Update available dates for currently selected project
        this.availableDates = this.projectDatesMap[this.filters.projectName] || [];
        
        // If current date is not in available dates, reset to first available date
        if (this.filters.date && !this.availableDates.includes(this.filters.date)) {
          if (this.availableDates.length > 0) {
            this.filters.date = this.availableDates[0];
          } else {
            this.filters.date = '';
          }
        }
      }
      
      // Note: loadData() is called explicitly from onCardClick() to ensure
      // it loads data for ALL selected cards, not just when projects/dates are loaded
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

  async loadData() {
    // Only load data in browser environment
    if (!this.isBrowser) {
      console.log('🚫 Not in browser environment, skipping data load');
      return;
    }

    if (!this.filters.date) {
      console.log('🚫 No date selected, skipping data load');
      this.isLoading = false;
      return;
    }

    if (!this.filters.projectName) {
      console.log('🚫 No project selected, skipping data load');
      this.isLoading = false;
      return;
    }

    console.log('🔄 Starting data load...', {
      date: this.filters.date,
      projectName: this.filters.projectName,
      selectedApiTypes: Array.from(this.currentApiTypes),
      selectedCards: Array.from(this.selectedCards),
    });

    this.isLoading = true;
    
    // Clear rawData at the start to prevent stale data from showing
    // This ensures we don't show data from previously selected cards
    this.rawData = [];

    try {
      // Get endpoints and request bodies for all selected API types
      const endpointConfigMap: { [key: string]: { endpoint: string; requestBody: any } } = {
        'inventory': {
          endpoint: 'https://fantastic-reportapi-production.up.railway.app/inventory_filter',
          requestBody: {
            chainage_start: 0,
            chainage_end: 1381,
            date: this.filters.date,
            direction: ['All'],
            project_name: [this.filters.projectName.trim()],
            asset_type: ['All'],
          }
        },
        'reported': {
          endpoint: 'https://fantastic-reportapi-production.up.railway.app/distress_report_filter',
          requestBody: {
            chainage_start: 0,
              chainage_end: 1381,
            date: this.filters.date,
            direction: ['All'],
            project_name: [this.filters.projectName.trim()],
            distress_type: ['All'],
          }
        },
        'predicted': {
          endpoint: 'https://fantastic-reportapi-production.up.railway.app/distress_predic_filter',
          requestBody: {
            chainage_start: 0,
              chainage_end: 1381,
            date: this.filters.date,
            direction: ['All'],
            project_name: [this.filters.projectName.trim()],
            distress_type: ['All'],
          }
        },
        'tis': {
          endpoint: 'https://fantastic-reportapi-production.up.railway.app/tis_filter',
          requestBody: {
            chainage_start: 0,
              chainage_end: 1381,
            date: this.convertDateFormat(this.filters.date),
            direction: ['All'],
            project_name: [this.filters.projectName.trim()],
          }
        },
        'ais': {
          endpoint: 'https://fantastic-reportapi-production.up.railway.app/ais_filter',
          requestBody: {
            chainage_start: 0,
              chainage_end: 1381,
            date: this.filters.date,
            direction: ['All'],
            project_name: [this.filters.projectName.trim()],
          }
        },
        'pms': {
          endpoint: 'https://fantastic-reportapi-production.up.railway.app/pms_filter',
          requestBody: {
            chainage_start: 0,
              chainage_end: 1381,
            date: this.filters.date,
            direction: ['All'],
            project_name: [this.filters.projectName.trim()],
          }
        },
        'rwfis': {
          endpoint: 'https://fantastic-reportapi-production.up.railway.app/rwfis_filter',
          requestBody: {
            chainage_start: 0,
              chainage_end: 1381,
            date: this.filters.date,
            direction: ['All'],
            project_name: [this.filters.projectName.trim()],
          }
        },
      };

      // Fetch data from all selected endpoints in parallel
      console.log('🔄 Loading data for all selected API types:', Array.from(this.currentApiTypes));
      console.log('🔄 Selected cards:', Array.from(this.selectedCards));
      
      if (this.currentApiTypes.size === 0) {
        console.warn('⚠️ No API types selected, skipping data load');
        this.rawData = [];
        this.infoData = [];
        this.isLoading = false;
        return;
      }
      
      const fetchPromises = Array.from(this.currentApiTypes).map(async (apiType) => {
        // Special handling for TIS - use GoogleMapsTrafficService
        if (apiType === 'tis') {
          try {
            console.log(`🚦 Fetching TIS traffic data using GoogleMapsTrafficService...`);
            
            // Get coordinates from existing data or fetch TIS data to get coordinates
            let coordinates = this.getProjectStartEndCoordinates();
            
            if (!coordinates) {
              console.log('⚠️ TIS: No coordinates from existing data. Fetching TIS data to get coordinates...');
              const tisConfig = endpointConfigMap['tis'];
              if (tisConfig) {
                // Get exact project name for TIS API (to handle case differences)
                let exactTisProjectName = this.filters.projectName.trim();
                const tisOriginalNamesMap = this.originalProjectNamesByApiType?.['tis'];
                const tisRawProjectDates = this.rawProjectDatesByApiType?.['tis'];
                const normalizedTisProjectName = this.filters.projectName ? this.filters.projectName.toLowerCase().trim() : null;
                
                if (tisOriginalNamesMap && normalizedTisProjectName && tisOriginalNamesMap[normalizedTisProjectName]) {
                  exactTisProjectName = tisOriginalNamesMap[normalizedTisProjectName];
                  console.log(`✅ TIS: Using exact project name for API request: "${exactTisProjectName}"`);
                } else if (tisRawProjectDates && normalizedTisProjectName) {
                  const tisProjectKeys = Object.keys(tisRawProjectDates);
                  const matchingTisKey = tisProjectKeys.find(key => key.toLowerCase().trim() === normalizedTisProjectName);
                  if (matchingTisKey) {
                    exactTisProjectName = matchingTisKey;
                    console.log(`✅ TIS: Found exact project name for API request: "${exactTisProjectName}"`);
                  }
                }
                
                // Create request body with exact project name
                const tisRequestBody = {
                  ...tisConfig.requestBody,
                  project_name: [exactTisProjectName]
                };
                
                const response = await fetch(tisConfig.endpoint, {
                  method: 'POST',
                  headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(tisRequestBody),
                });

                if (response.ok) {
                  const tisApiResponse = await response.json();
                  console.log('📥 TIS API Response for coordinates:', tisApiResponse);
                  
                  // Handle "No match" response
                  if (tisApiResponse && typeof tisApiResponse === 'object' && tisApiResponse.message) {
                    const message = tisApiResponse.message.toLowerCase();
                    if (message === 'no match' || message.includes('no data') || message.includes('not found')) {
                      console.warn(`⚠️ TIS API returned: ${tisApiResponse.message} for project: ${exactTisProjectName}`);
                      return { apiType, data: [], flatData: [] };
                    }
                  }
                  
                  const tisFlatData: any[] = [];
                  if (Array.isArray(tisApiResponse)) {
                    tisApiResponse.forEach((group) => {
                      if (Array.isArray(group)) {
                        tisFlatData.push(...group);
                      } else if (group && typeof group === 'object') {
                        tisFlatData.push(group);
                      }
                    });
                  }
                  
                  console.log(`📊 TIS: Flattened ${tisFlatData.length} items for coordinate extraction`);
                  
                  if (tisFlatData.length > 0) {
                    // Use case-insensitive matching for project name
                    const normalizedFilterProjectName = exactTisProjectName ? exactTisProjectName.toLowerCase().trim() : '';
                    const normalizedFilterProjectName2 = this.filters.projectName ? this.filters.projectName.toLowerCase().trim() : '';
                    
                    const projectTisData = tisFlatData.filter((item: any) => {
                      const itemProjectName = item.project_name ? item.project_name.toLowerCase().trim() : '';
                      // Try matching against both exact project name and filter project name
                      return itemProjectName === normalizedFilterProjectName || itemProjectName === normalizedFilterProjectName2;
                    });
                    
                    console.log(`📊 TIS: Found ${projectTisData.length} items matching project name (looking for: "${exactTisProjectName}" or "${this.filters.projectName}")`);
                    
                    if (projectTisData.length > 0) {
                      const originItem = projectTisData.reduce(
                        (min: any, item: any) => {
                          const itemChainage = item.chainage_start || 0;
                          const minChainage = min.chainage_start || 0;
                          return itemChainage < minChainage ? item : min;
                        },
                        projectTisData[0]
                      );

                      const destinationItem = projectTisData.reduce(
                        (max: any, item: any) => {
                          const itemChainage = item.chainage_end || 0;
                          const maxChainage = max.chainage_end || 0;
                          return itemChainage > maxChainage ? item : max;
                        },
                        projectTisData[0]
                      );

                      if (
                        originItem.latitude &&
                        originItem.longitude &&
                        destinationItem.latitude &&
                        destinationItem.longitude &&
                        originItem.latitude !== 0 &&
                        originItem.longitude !== 0 &&
                        destinationItem.latitude !== 0 &&
                        destinationItem.longitude !== 0
                      ) {
                        coordinates = {
                          origin: `${parseFloat(originItem.latitude)},${parseFloat(originItem.longitude)}`,
                          destination: `${parseFloat(destinationItem.latitude)},${parseFloat(destinationItem.longitude)}`
                        };
                        console.log('✅ TIS: Got coordinates from TIS API data:', coordinates);
                      }
                    }
                  }
                }
              }
            }
            
            if (!coordinates) {
              console.warn('⚠️ TIS: No project coordinates available. Cannot fetch traffic data.');
              return { apiType, data: [], flatData: [] };
            }

            // Get route for immediate display (Directions only – no slow per-segment traffic calls)
            const departureTime = new Date(Date.now() + 2 * 60 * 1000);
            const { routeData, directionsResult } = await this.trafficService.getRouteForDisplay(
              coordinates.origin,
              coordinates.destination,
              departureTime
            );

            this.currentRouteData = routeData;

            const displayRoute = async () => {
              let retries = 0;
              while (!this.map && retries < 10) {
                await new Promise(resolve => setTimeout(resolve, 200));
                retries++;
              }
              if (this.map) {
                console.log('🚦 Displaying TIS route on map (instant)...');
                try {
                  await this.displayTrafficRouteOnMap(routeData, coordinates, directionsResult);
                  console.log(`✅ TIS route displayed: ${this.trafficRoutePolylines.length} polyline(s)`);
                } catch (error) {
                  console.error('❌ Error displaying TIS route:', error);
                }
              } else {
                this.pendingTisRoute = { routeData, coordinates, directionsResult };
              }
            };
            displayRoute();

            // Also fetch TIS data for markers (in addition to route visualization)
            // Fetch the actual TIS API data to show individual traffic points as markers
            const tisConfig = endpointConfigMap['tis'];
            if (tisConfig) {
              try {
                // Get exact project name for TIS API
                let exactTisProjectName = this.filters.projectName.trim();
                const tisOriginalNamesMap = this.originalProjectNamesByApiType?.['tis'];
                const tisRawProjectDates = this.rawProjectDatesByApiType?.['tis'];
                const normalizedTisProjectName = this.filters.projectName ? this.filters.projectName.toLowerCase().trim() : null;
                
                if (tisOriginalNamesMap && normalizedTisProjectName && tisOriginalNamesMap[normalizedTisProjectName]) {
                  exactTisProjectName = tisOriginalNamesMap[normalizedTisProjectName];
                } else if (tisRawProjectDates && normalizedTisProjectName) {
                  const tisProjectKeys = Object.keys(tisRawProjectDates);
                  const matchingTisKey = tisProjectKeys.find(key => key.toLowerCase().trim() === normalizedTisProjectName);
                  if (matchingTisKey) {
                    exactTisProjectName = matchingTisKey;
                  }
                }
                
                const tisRequestBody = {
                  ...tisConfig.requestBody,
                  project_name: [exactTisProjectName]
                };
                
                const tisResponse = await fetch(tisConfig.endpoint, {
                  method: 'POST',
                  headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(tisRequestBody),
                });

                if (tisResponse.ok) {
                  const tisApiResponse = await tisResponse.json();
                  
                  // Handle "No match" response
                  if (tisApiResponse && typeof tisApiResponse === 'object' && tisApiResponse.message) {
                    const message = tisApiResponse.message.toLowerCase();
                    if (message === 'no match' || message.includes('no data') || message.includes('not found')) {
                      console.warn(`⚠️ TIS API returned: ${tisApiResponse.message} for project: ${exactTisProjectName}`);
                      return { apiType, data: routeData, flatData: [] };
                    }
                  }
                  
                  // Flatten TIS data for markers
                  const tisFlatData: any[] = [];
                  if (Array.isArray(tisApiResponse)) {
                    tisApiResponse.forEach((group) => {
                      if (Array.isArray(group)) {
                        tisFlatData.push(...group);
                      } else if (group && typeof group === 'object') {
                        tisFlatData.push(group);
                      }
                    });
                  }
                  
                  console.log(`✅ TIS: Flattened ${tisFlatData.length} items for markers (route also displayed)`);
                  return { apiType, data: routeData, flatData: tisFlatData };
                }
              } catch (error) {
                console.warn('⚠️ Error fetching TIS data for markers:', error);
              }
            }

            // Return empty flatData if we couldn't fetch TIS data for markers
            return { apiType, data: routeData, flatData: [] };
          } catch (error) {
            console.error(`Error loading TIS traffic data:`, error);
            // Handle Google Maps API errors gracefully
            if (error instanceof Error) {
              const errorMessage = error.message;
              if (
                errorMessage.includes('DeletedApiProjectMapError') ||
                errorMessage.includes('deleted-api-project') ||
                errorMessage.includes('InvalidKeyMapError') ||
                errorMessage.includes('API key') ||
                errorMessage.includes('Failed to load Google Maps API')
              ) {
                console.warn('⚠️ Google Maps API key is invalid. TIS route visualization requires a valid API key.');
                console.warn('⚠️ Please update your Google Maps API key in src/environments/environment.ts and environment.prod.ts');
              }
            }
            return { apiType, data: [], flatData: [] };
          }
        }

        const config = endpointConfigMap[apiType];
        if (!config) {
          console.warn(`No endpoint configuration for API type: ${apiType}`);
          return { apiType, data: [], flatData: [] };
        }

        // Helper function to normalize project names (same as in loadProjectsAndDates)
        const normalizeProjectName = (name: string): string => {
          return name.toLowerCase().trim();
        };

        // Try to find a date that works for this specific API type
        let dateToUse = this.filters.date;
        const apiTypeDates = this.projectDatesByApiType[apiType];
        
        // Normalize project name for lookup (projectDatesByApiType uses normalized keys)
        const normalizedProjectName = this.filters.projectName ? normalizeProjectName(this.filters.projectName) : null;
        const availableDatesForApiType = normalizedProjectName && apiTypeDates ? (apiTypeDates[normalizedProjectName] || []) : [];
        
        // Find the exact project name for this API type (to handle case differences)
        let exactProjectName = this.filters.projectName.trim();
        const originalNamesMap = this.originalProjectNamesByApiType?.[apiType];
        const rawProjectDates = this.rawProjectDatesByApiType?.[apiType];
        
        if (originalNamesMap && normalizedProjectName && originalNamesMap[normalizedProjectName]) {
          exactProjectName = originalNamesMap[normalizedProjectName];
          console.log(`✅ ${apiType}: Using exact project name: "${exactProjectName}" (normalized: "${normalizedProjectName}")`);
        } else if (rawProjectDates && normalizedProjectName) {
          // Fallback: Find the actual project name in the raw response
          const projectKeys = Object.keys(rawProjectDates);
          const matchingKey = projectKeys.find(key => normalizeProjectName(key) === normalizedProjectName);
          if (matchingKey) {
            exactProjectName = matchingKey;
            console.log(`✅ ${apiType}: Found exact project name from raw response: "${exactProjectName}"`);
          } else {
            console.warn(`⚠️ ${apiType}: Could not find exact project name, using: "${exactProjectName}"`);
          }
        }

        // If still using dropdown name (e.g. "Abu Road to Swaroopganj"), fetch this API's projects-dates to get exact casing (e.g. "Abu Road to swaroopganj")
        if (normalizedProjectName && exactProjectName === this.filters.projectName.trim() && (!originalNamesMap || !originalNamesMap[normalizedProjectName])) {
          const projectsDatesEndpointMap: { [key: string]: string } = {
            inventory: 'https://fantastic-reportapi-production.up.railway.app/projects-dates/inventory',
            reported: 'https://fantastic-reportapi-production.up.railway.app/projects-dates/distress_reported',
            predicted: 'https://fantastic-reportapi-production.up.railway.app/projects-dates/distress_predicted',
            tis: 'https://fantastic-reportapi-production.up.railway.app/projects-dates/tis',
            ais: 'https://fantastic-reportapi-production.up.railway.app/projects-dates/ais',
            pms: 'https://fantastic-reportapi-production.up.railway.app/projects-dates/pms',
            rwfis: 'https://fantastic-reportapi-production.up.railway.app/projects-dates/rwfis',
          };
          const projectsDatesUrl = projectsDatesEndpointMap[apiType];
          if (projectsDatesUrl) {
            try {
              const pdResponse = await fetch(projectsDatesUrl, { method: 'GET', headers: { accept: 'application/json' } });
              if (pdResponse.ok) {
                const rawProjectDatesForType: ProjectDatesResponse = await pdResponse.json();
                const projectKeys = Object.keys(rawProjectDatesForType || {});
                const matchingKey = projectKeys.find((key) => normalizeProjectName(key) === normalizedProjectName);
                if (matchingKey) {
                  exactProjectName = matchingKey;
                  console.log(`✅ ${apiType}: Using exact project name from projects-dates: "${exactProjectName}"`);
                  if (!this.rawProjectDatesByApiType) this.rawProjectDatesByApiType = {};
                  this.rawProjectDatesByApiType[apiType] = rawProjectDatesForType;
                  if (!this.originalProjectNamesByApiType) this.originalProjectNamesByApiType = {};
                  const orig: { [norm: string]: string } = {};
                  projectKeys.forEach((key) => { orig[normalizeProjectName(key)] = key; });
                  this.originalProjectNamesByApiType[apiType] = orig;
                }
              }
            } catch (e) {
              console.warn(`⚠️ ${apiType}: Could not fetch projects-dates for exact name:`, e);
            }
          }
        }
        
        console.log(`🔍 ${apiType}: Checking dates - Current date: ${dateToUse}, Project: ${this.filters.projectName} (normalized: ${normalizedProjectName}, exact: ${exactProjectName})`);
        console.log(`🔍 ${apiType}: Available dates for this API type:`, availableDatesForApiType.length > 0 ? availableDatesForApiType : 'None');
        
        if (normalizedProjectName && availableDatesForApiType.length > 0) {
          // If current date is not available for this API type, try to find one that is
          if (!availableDatesForApiType.includes(dateToUse)) {
            console.log(`⚠️ ${apiType}: Current date ${dateToUse} not available. Available dates:`, availableDatesForApiType);
            // Try to find a date that exists in both current selection and this API type
            const currentAvailableDates = this.availableDates || [];
            const commonDates = availableDatesForApiType.filter(d => currentAvailableDates.includes(d));
            if (commonDates.length > 0) {
              dateToUse = commonDates[0];
              console.log(`✅ ${apiType}: Found common date ${dateToUse} (exists in both current selection and ${apiType})`);
            } else {
              // If no common date, use first available date for this API type
              dateToUse = availableDatesForApiType[0];
              console.log(`✅ ${apiType}: Using first available date ${dateToUse} from ${apiType}'s dates`);
            }
          } else {
            console.log(`✅ ${apiType}: Current date ${dateToUse} is available for this API type`);
          }
        } else {
          console.warn(`⚠️ ${apiType}: No date mapping available for project "${this.filters.projectName}", using current date ${dateToUse}`);
        }
        
        // Create request body with the exact project name and date for this API type
        const requestBody = { ...config.requestBody, date: dateToUse, project_name: [exactProjectName] };

        try {
          console.log(`📤 Fetching data for ${apiType} with date ${dateToUse}:`, requestBody);

          const response = await fetch(config.endpoint, {
            method: 'POST',
            headers: {
              accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ HTTP error for ${apiType}:`, errorText);
            return { apiType, data: [], flatData: [] };
          }

          const apiResponse = await response.json();
          console.log(`📥 API Response for ${apiType}:`, apiResponse);
          console.log(`📥 API Response type for ${apiType}:`, typeof apiResponse, Array.isArray(apiResponse) ? `Array[${apiResponse.length}]` : '');

          // Flatten nested arrays
          const flatData: any[] = [];
          
          // Special handling for AIS - use simpler flattening like the AIS dashboard
          if (apiType === 'ais') {
            if (Array.isArray(apiResponse)) {
              // Use flat() method like AIS dashboard does
              flatData.push(...apiResponse.flat());
            } else if (apiResponse && typeof apiResponse === 'object') {
              if (apiResponse.detail) {
                console.error(`API returned error for ${apiType}:`, apiResponse.detail);
                return { apiType, data: [], flatData: [] };
              }
              // Try to find data in common properties
              if (Array.isArray(apiResponse.data)) {
                flatData.push(...apiResponse.data.flat());
              } else if (Array.isArray(apiResponse.result)) {
                flatData.push(...apiResponse.result.flat());
              }
            }
          } else {
            // Standard flattening for other API types
            if (Array.isArray(apiResponse)) {
              apiResponse.forEach((group) => {
                if (Array.isArray(group)) {
                  flatData.push(...group);
                } else if (group && typeof group === 'object') {
                  flatData.push(group);
                }
              });
            } else if (apiResponse && typeof apiResponse === 'object') {
              // Handle "No match" or error messages
              if (apiResponse.message) {
                const message = apiResponse.message.toLowerCase();
                if (message === 'no match' || message.includes('no data') || message.includes('not found')) {
                  console.warn(`⚠️ ${apiType} API returned: ${apiResponse.message} for project: ${config.requestBody.project_name}, date: ${config.requestBody.date}`);
                  return { apiType, data: [], flatData: [] };
                }
              }
              if (apiResponse.detail) {
                console.error(`API returned error for ${apiType}:`, apiResponse.detail);
                return { apiType, data: [], flatData: [] };
              }
              if (Array.isArray(apiResponse.data)) {
                apiResponse.data.forEach((group: any) => {
                  if (Array.isArray(group)) {
                    flatData.push(...group);
                  } else {
                    flatData.push(group);
                  }
                });
              } else if (Array.isArray(apiResponse.result)) {
                apiResponse.result.forEach((group: any) => {
                  if (Array.isArray(group)) {
                    flatData.push(...group);
                  } else {
                    flatData.push(group);
                  }
                });
              }
            }
          }
          
          console.log(`📊 Flattened ${flatData.length} items for ${apiType}`);
          if (flatData.length > 0) {
            console.log(`📋 Sample item for ${apiType}:`, flatData[0]);
            console.log(`📋 Sample item coordinates for ${apiType}:`, { 
              lat: flatData[0].latitude, 
              lng: flatData[0].longitude 
            });
          }

          return { apiType, data: apiResponse, flatData };
        } catch (error) {
          console.error(`Error loading data for ${apiType}:`, error);
          return { apiType, data: [], flatData: [] };
        }
      });

      const results = await Promise.all(fetchPromises);
      console.log('✅ All data fetched from selected cards:', results.map(r => ({ apiType: r.apiType, count: r.flatData.length, hasRouteData: !!r.data })));
      console.log('📊 Selected API types:', Array.from(this.currentApiTypes));
      console.log('📊 Selected cards:', Array.from(this.selectedCards));

      // Check if TIS is selected and has route data (TIS uses route visualization, not markers)
      const hasTisRoute = results.some(r => r.apiType === 'tis' && r.data && !Array.isArray(r.data) && r.data.segments);
      const onlyTisSelected = Array.from(this.currentApiTypes).length === 1 && Array.from(this.currentApiTypes)[0] === 'tis';

      // Process and transform data from all sources
      const allTransformedData: ReportData[] = [];
      
      results.forEach(({ apiType, flatData, data }) => {
        // TIS can show both route visualization AND markers
        // If TIS has route data, it will be displayed separately
        // But we still process flatData for markers if available
        if (apiType === 'tis' && flatData.length === 0) {
          console.log(`✅ TIS: Using route visualization only (no marker data available)`);
          return;
        }
        
        if (flatData.length === 0) {
          console.log(`⚠️ No data for ${apiType}`);
          return;
        }

        // Transform data based on API type
        const transformed = this.transformDataByApiType(flatData, apiType);
        const validCoordinates = transformed.filter(item => item.latitude != null && item.longitude != null);
        console.log(`✅ Transformed ${transformed.length} items from ${apiType}, ${validCoordinates.length} with valid coordinates`);
        
        if (validCoordinates.length === 0 && transformed.length > 0) {
          console.warn(`⚠️ ${apiType}: All items have invalid coordinates. Sample item:`, transformed[0]);
        }
        
        allTransformedData.push(...transformed);
      });

      console.log('✅ Total transformed data count from ALL selected cards:', allTransformedData.length);

      // If only TIS is selected and it has route data, we still want to display the route
      if (allTransformedData.length === 0 && !hasTisRoute) {
        console.warn('⚠️ No data found after processing all API types');
        this.rawData = [];
        this.infoData = [];
        this.isLoading = false;
        setTimeout(() => {
          if (!this.map) {
            this.initMap();
          }
        }, 500);
        return;
      }
      
      // If only TIS is selected, ensure map is initialized for route display
      if (onlyTisSelected && hasTisRoute) {
        console.log('🚦 TIS only selected with route data - ensuring map is ready for route display');
        if (!this.map) {
          await this.initMap();
        }
      }

      // Store data from all selected cards only
      // This ensures rawData only contains data from currently selected cards
      this.rawData = allTransformedData;

      // When TIS had no data for this date, try to show route using coordinates from other cards (Reported, Inventory, etc.)
      await this.tryTisRouteFallbackFromOtherData(results);

      this.extractFilterOptions();
      this.updateInfoSummary();

      // Don't initialize map here - let onCardClick handle it
      // This prevents duplicate map initialization and race conditions
      console.log('✅ Data loaded successfully. Map will be initialized/updated by onCardClick.');
    } catch (error) {
      console.error('❌ Error loading data:', error);
      if (error instanceof Error) {
        console.error('❌ Error details:', error.message);
      }
      this.rawData = [];
      this.infoData = [];
      setTimeout(() => {
        if (!this.map) {
          this.initMap();
        }
      }, 500);
    } finally {
      this.isLoading = false;
    }
  }

  private transformDataByApiType(flatData: any[], apiType: string): ReportData[] {
    const coordsFromItem = (item: any): { lat: number | null; lng: number | null } => {
      const toNumberOrNull = (v: unknown): number | null => {
        if (v === null || v === undefined) return null;
        const n = typeof v === 'number' ? v : parseFloat(String(v));
        if (!Number.isFinite(n) || n === 0) return null;
        return n;
      };

      // Common variations seen across APIs
      const lat =
        toNumberOrNull(item?.latitude) ??
        toNumberOrNull(item?.lat) ??
        toNumberOrNull(item?.Latitude) ??
        toNumberOrNull(item?.LATITUDE);
      const lng =
        toNumberOrNull(item?.longitude) ??
        toNumberOrNull(item?.lng) ??
        toNumberOrNull(item?.lon) ??
        toNumberOrNull(item?.Longitude) ??
        toNumberOrNull(item?.LONGITUDE);

      return { lat, lng };
    };

    if (apiType === 'inventory') {
      return flatData.map((item: any) => ({
        ...(() => {
          const { lat, lng } = coordsFromItem(item);
          return { latitude: lat, longitude: lng };
        })(),
        project_name: item.project_name || 'Unknown Project',
        chainage_start: item.chainage_start || 0,
        chainage_end: item.chainage_end || 0,
        direction: item.direction || 'Unknown',
        pavement_type: item.carriage_type || item.pavement_type || 'N/A',
        lane: item.lane || 'N/A',
        distress_type: item.distress_type || 'N/A',
        date: item.date || this.filters.date || '2025-01-01',
        severity: 'Low',
        apiType: 'inventory',
        _rawItem: item,
      }));
    } else if (apiType === 'reported') {
      return flatData.map((item: any) => ({
        ...(() => {
          const { lat, lng } = coordsFromItem(item);
          return { latitude: lat, longitude: lng };
        })(),
        project_name: item.project_name || 'Unknown Project',
        chainage_start: item.chainage_start || 0,
        chainage_end: item.chainage_end || 0,
        direction: item.direction || 'Unknown',
        pavement_type: item.carriage_type || 'Unknown',
        lane: item.lane || 'Unknown',
        distress_type: item.distress_type || 'Unknown',
        date: item.date || this.filters.date || '2025-12-20',
        severity: this.getSeverityFromDistressType(item.distress_type),
        apiType: 'reported',
        area: item.area || 0,
        depth: item.depth || 0,
        length: item.length || 0,
        width: item.width || 0,
        _rawItem: item,
      }));
    } else if (apiType === 'predicted') {
      return flatData.map((item: any) => ({
        ...(() => {
          const { lat, lng } = coordsFromItem(item);
          return { latitude: lat, longitude: lng };
        })(),
        project_name: item.project_name || 'Unknown Project',
        chainage_start: item.chainage_start || 0,
        chainage_end: item.chainage_end || 0,
        direction: item.direction
          ? item.direction.charAt(0).toUpperCase() + item.direction.slice(1).toLowerCase()
          : 'Unknown',
        pavement_type: item.carriage_type || 'Unknown',
        lane: item.lane || 'Unknown',
        distress_type: item.distress_type || 'Unknown',
        date: item.date || this.filters.date || '2025-12-20',
        severity: this.getSeverityFromPredictedData(item),
        apiType: 'predicted',
        prediction_confidence: Math.random() * 100,
        rough_spot: item.rough_spot || 0,
        pothole: item.pothole || 0,
        hotspots: item.hotspots || 0,
        edge_break: item.edge_break || 0,
        alligator_crack: item.alligator_crack || 0,
        transverse_crack: item.transverse_crack || 0,
        longitudinal_crack: item.longitudinal_crack || 0,
        hairline_crack: item.hairline_crack || 0,
        patchwork: item.patchwork || 0,
        rutting: item.rutting || 0,
        bleeding: item.bleeding || 0,
        raveling: item.raveling || 0,
        _rawItem: item,
      }));
    } else if (apiType === 'tis') {
      return flatData.map((item: any) => ({
        ...(() => {
          const { lat, lng } = coordsFromItem(item);
          return { latitude: lat, longitude: lng };
        })(),
        project_name: item.project_name || 'Unknown Project',
        chainage_start: item.chainage_start || 0,
        chainage_end: item.chainage_end || 0,
        direction: item.direction || 'Unknown',
        pavement_type: 'N/A',
        lane: 'N/A',
        distress_type: 'N/A',
        date: item.date || this.filters.date || '2025-01-01',
        severity: 'Low',
        apiType: 'tis',
        _rawItem: item,
      }));
    } else if (apiType === 'ais') {
      return flatData.map((item: any, index: number) => {
        const { lat, lng } = coordsFromItem(item);
        const validLat = lat;
        const validLng = lng;
        
        // Log first few items for debugging
        if (index < 3) {
          console.log(`🔍 AIS item ${index} coordinates:`, { 
            rawLat: lat, 
            rawLng: lng, 
            validLat, 
            validLng,
            itemKeys: Object.keys(item)
          });
        }
        
        return {
          project_name: item.project_name || 'Unknown Project',
          chainage_start: item.chainage_start || 0,
          chainage_end: item.chainage_end || 0,
          direction: item.direction || 'Unknown',
          pavement_type: 'N/A',
          lane: 'N/A',
          distress_type: 'N/A',
          latitude: validLat,
          longitude: validLng,
          date: item.date || this.filters.date || '2025-01-01',
          severity: 'Low',
          apiType: 'ais',
          _rawItem: item,
        };
      });
    } else if (apiType === 'pms') {
      return flatData.map((item: any, index: number) => {
        const { lat, lng } = coordsFromItem(item);
        const validLat = lat;
        const validLng = lng;
        
        // Log first few items for debugging
        if (index < 3) {
          console.log(`🔍 PMS item ${index} coordinates:`, { 
            rawLat: lat, 
            rawLng: lng, 
            validLat, 
            validLng,
            itemKeys: Object.keys(item)
          });
        }
        
        return {
          project_name: item.project_name || 'Unknown Project',
          chainage_start: item.chainage_start || 0,
          chainage_end: item.chainage_end || 0,
          direction: item.direction || 'Unknown',
          pavement_type: item.carriage_type || 'N/A',
          lane: 'N/A',
          distress_type: item['pavement_condition_score_(pcs):'] || item.temperature || item['rainfall_(mm):'] || 'Pavement Condition',
          latitude: validLat,
          longitude: validLng,
          date: item.date || this.filters.date || '2025-01-01',
          severity: 'Low',
          apiType: 'pms',
          _rawItem: item,
        };
      });
    } else if (apiType === 'rwfis') {
      return flatData.map((item: any) => ({
        ...(() => {
          const { lat, lng } = coordsFromItem(item);
          return { latitude: lat, longitude: lng };
        })(),
        project_name: item.project_name || 'Unknown Project',
        chainage_start: item.chainage_start || 0,
        chainage_end: item.chainage_end || 0,
        direction: item.direction || 'Unknown',
        pavement_type: item.carriage_type || 'N/A',
        lane: 'N/A',
        distress_type: 'N/A',
        date: item.date || this.filters.date || '2025-01-01',
        severity: 'Low',
        apiType: 'rwfis',
        _rawItem: item,
      }));
    } else {
      // Default transformation
      return flatData.map((item: any) => ({
        ...(() => {
          const { lat, lng } = coordsFromItem(item);
          return { latitude: lat ?? 0, longitude: lng ?? 0 };
        })(),
        project_name: item.project_name || 'Unknown Project',
        chainage_start: item.chainage_start || 0,
        chainage_end: item.chainage_end || 0,
        direction: item.direction || 'Unknown',
        pavement_type: item.carriage_type || item.pavement_type || 'N/A',
        lane: item.lane || 'N/A',
        distress_type: item.distress_type || 'N/A',
        date: item.date || this.filters.date || '2025-01-01',
        severity: 'Low',
        _rawItem: item,
      }));
    }
  }

  extractFilterOptions() {
    if (!Array.isArray(this.rawData) || this.rawData.length === 0) {
      this.availableDirections = ['Increasing', 'Decreasing'];
      this.availablePavementTypes = [];
      this.availableLanes = [];
      return;
    }

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
    }
  }

  /**
   * Filter data for either map rendering or summary calculations.
   * - forMap=true: show ALL points that match UI filters + selected cards (no "count/measurement" gating)
   * - forMap=false: apply additional "count/measurement" gating used for summaries
   */
  getFilteredData(forMap: boolean = false): ReportData[] {
    return this.rawData.filter((item) => {
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

      // Summary-only gating (do NOT apply to map markers)
      let matchesCount: boolean = true;
      if (!forMap) {
        if (item.apiType === 'reported' && item._rawItem) {
          const rawItem = item._rawItem;
          const hasMeasurement = Boolean(
            (item.area && item.area > 0) ||
              (item.depth && item.depth > 0) ||
              (item.length && item.length > 0) ||
              (item.width && item.width > 0)
          );
          const count = rawItem.total_distress || rawItem.count || 0;
          matchesCount = (count as number) > 1 || hasMeasurement;
        } else if (item.apiType === 'predicted' && item._rawItem) {
          const rawItem = item._rawItem;
          const hasDistress = Boolean(
            (item.rough_spot && item.rough_spot > 1) ||
              (item.pothole && item.pothole > 1) ||
              (item.hotspots && item.hotspots > 1) ||
              (item.edge_break && item.edge_break > 1) ||
              (item.alligator_crack && item.alligator_crack > 1) ||
              (item.transverse_crack && item.transverse_crack > 1) ||
              (item.longitudinal_crack && item.longitudinal_crack > 1) ||
              (item.hairline_crack && item.hairline_crack > 1) ||
              (item.patchwork && item.patchwork > 1) ||
              (item.rutting && item.rutting > 1) ||
              (item.bleeding && item.bleeding > 1) ||
              (item.raveling && item.raveling > 1)
          );
          const count = rawItem.total_distress || 0;
          matchesCount = (count as number) > 1 || hasDistress;
        } else if (item.apiType === 'ais' && item._rawItem) {
          const rawItem = item._rawItem;
          const totalAccident = rawItem.total_accident || 0;
          const hasAnyAccident = Boolean(
            (rawItem.fatal_accident && rawItem.fatal_accident > 0) ||
              (rawItem.major_accident && rawItem.major_accident > 0) ||
              (rawItem.minor_accident && rawItem.minor_accident > 0) ||
              (rawItem.grievous_accident && rawItem.grievous_accident > 0) ||
              (rawItem['non-injured_accident'] &&
                rawItem['non-injured_accident'] > 0) ||
              (rawItem.fatalities && rawItem.fatalities > 0) ||
              (rawItem.total_injury && rawItem.total_injury > 0)
          );
          matchesCount = (totalAccident as number) > 0 || hasAnyAccident;
        } else if (item.apiType === 'pms' && item._rawItem) {
          const rawItem = item._rawItem;
          const hasValidMeasurement = Boolean(
            (rawItem['pavement_condition_score_(pcs):'] &&
              rawItem['pavement_condition_score_(pcs):'] !== 'N/A' &&
              rawItem['pavement_condition_score_(pcs):'] !== '') ||
              (rawItem['temperature_(°c):'] &&
                rawItem['temperature_(°c):'] !== 'N/A' &&
                rawItem['temperature_(°c):'] !== '') ||
              (rawItem['rainfall_(mm):'] &&
                (typeof rawItem['rainfall_(mm):'] === 'number'
                  ? rawItem['rainfall_(mm):'] > 0
                  : parseFloat(rawItem['rainfall_(mm):']) > 0)) ||
              (rawItem['international_roughness_index_(iri):'] &&
                (typeof rawItem['international_roughness_index_(iri):'] ===
                'number'
                  ? rawItem['international_roughness_index_(iri):'] > 0
                  : parseFloat(
                      rawItem['international_roughness_index_(iri):']
                    ) > 0)) ||
              (rawItem.iri_index &&
                (typeof rawItem.iri_index === 'number'
                  ? rawItem.iri_index > 0
                  : parseFloat(rawItem.iri_index) > 0))
          );
          matchesCount = hasValidMeasurement;
        }
      }

      // Filter by selected cards - only show data from currently selected cards
      const matchesSelectedCard = item.apiType ? this.currentApiTypes.has(item.apiType) : false;

      return (
        matchesDirection &&
        matchesPavement &&
        matchesLane &&
        matchesDistress &&
        matchesChainage &&
        matchesCount &&
        matchesSelectedCard
      );
    });
  }

  updateInfoSummary() {
    try {
      console.log('🔄 Updating information summary...');

      if (!this.rawData || this.rawData.length === 0) {
        console.log('⚠️ No rawData available');
        this.infoData = [];
        this.updateCardAssets();
        return;
      }

      const filteredData = this.getFilteredData(true);
      const dataToUse = filteredData.length > 0 ? filteredData : this.rawData;

      if (dataToUse.length === 0) {
        console.log('⚠️ No filtered data available');
        this.infoData = [];
        this.updateCardAssets();
        return;
      }

      // TODO: Customize this based on your data structure
      const firstItem = dataToUse[0];
      const rawData = firstItem._rawItem || {};

      // Example summary data - customize based on your needs
      this.infoData = [
        {
          title: 'Total Records',
          value: dataToUse.length,
          unit: '',
        },
        {
          title: 'Project Name',
          value: rawData.project_name || 'N/A',
          unit: '',
        },
        {
          title: 'Date',
          value: rawData.date || this.filters.date || 'N/A',
          unit: '',
        },
        // Add more fields as needed
      ];

      console.log('✅ Information summary updated:', this.infoData.length, 'items');
      
      // Update card assets after updating info summary
      this.updateCardAssets();
    } catch (error) {
      console.error('❌ Error updating information summary:', error);
      this.infoData = [];
      this.updateCardAssets();
    }
  }

  updateCardAssets() {
    try {
      console.log('🔄 Updating card assets...');
      
      // Clear existing card assets
      this.cardAssetsMap = {};

      // Process Inventory card assets
      const inventoryData = this.rawData.filter(item => item.apiType === 'inventory');
      if (inventoryData.length > 0) {
        this.cardAssetsMap['Inventory'] = this.calculateInventoryAssets(inventoryData);
      }

      // Process Reported card assets
      const reportedData = this.rawData.filter(item => item.apiType === 'reported');
      if (reportedData.length > 0) {
        this.cardAssetsMap['Reported'] = this.calculateReportedAssets(reportedData);
      }

      // Process Predicted card assets
      const predictedData = this.rawData.filter(item => item.apiType === 'predicted');
      if (predictedData.length > 0) {
        this.cardAssetsMap['Predicted'] = this.calculatePredictedAssets(predictedData);
      }

      // Process TIS card assets
      const tisData = this.rawData.filter(item => item.apiType === 'tis');
      if (tisData.length > 0) {
        this.cardAssetsMap['TIS'] = this.calculateTisAssets(tisData);
      }

      // Process AIS card assets
      const aisData = this.rawData.filter(item => item.apiType === 'ais');
      if (aisData.length > 0) {
        this.cardAssetsMap['AIS'] = this.calculateAisAssets(aisData);
      }

      // Process PMS card assets
      const pmsData = this.rawData.filter(item => item.apiType === 'pms');
      if (pmsData.length > 0) {
        this.cardAssetsMap['PMS'] = this.calculatePmsAssets(pmsData);
      }

      // Process RWFIS card assets
      const rwfisData = this.rawData.filter(item => item.apiType === 'rwfis');
      if (rwfisData.length > 0) {
        this.cardAssetsMap['RWFIS'] = this.calculateRwfisAssets(rwfisData);
      }

      console.log('✅ Card assets updated:', this.cardAssetsMap);
    } catch (error) {
      console.error('❌ Error updating card assets:', error);
      this.cardAssetsMap = {};
    }
  }

  calculateInventoryAssets(inventoryData: ReportData[]): CardAssetData[] {
    const assetMap: { [key: string]: number } = {};
    const assetUnits: { [key: string]: string } = {
      'adjacent_road': 'KM',
      'service_road': 'KM',
      'crash_barrier': 'KM',
    };

    // Inventory asset fields from InfrastructureData interface
    const assetFields = [
      'trees', 'culvert', 'street_lights', 'bridges', 'traffic_signals',
      'bus_stop', 'truck_layby', 'toll_plaza', 'adjacent_road', 'toilet_blocks',
      'rest_area', 'rcc_drain', 'fuel_station', 'emergency_call_box', 'tunnels',
      'footpath', 'junction', 'sign_boards', 'solar_blinker', 'median_plants',
      'service_road', 'km_stones', 'crash_barrier', 'median_opening', 'manhole',
      'circular_chamber', 'rectangular_chamber', 'drinking_water', 'storm_water',
      'stp_sinkhole', 'fire_hydrant'
    ];

    // Aggregate counts for each asset
    inventoryData.forEach(item => {
      const rawItem = item._rawItem || {};
      assetFields.forEach(field => {
        const value = rawItem[field];
        if (value != null && value !== undefined && value !== 0) {
          if (!assetMap[field]) {
            assetMap[field] = 0;
          }
          assetMap[field] += Number(value) || 0;
        }
      });
    });

    // Convert to CardAssetData array with formatted names
    const assetNameMap: { [key: string]: string } = {
      'trees': 'Trees',
      'culvert': 'Culvert',
      'street_lights': 'Street Lights',
      'bridges': 'Bridges',
      'traffic_signals': 'Traffic Signals',
      'bus_stop': 'Bus Stop',
      'truck_layby': 'Truck Layby',
      'toll_plaza': 'Toll Plaza',
      'adjacent_road': 'Adjacent Road',
      'toilet_blocks': 'Toilet Block',
      'rest_area': 'Rest Area',
      'rcc_drain': 'RCC Drain',
      'fuel_station': 'Fuel Station',
      'emergency_call_box': 'Emergency Call',
      'tunnels': 'Tunnels',
      'footpath': 'Footpath',
      'junction': 'Junction',
      'sign_boards': 'Sign Boards',
      'solar_blinker': 'Solar Blinker',
      'median_plants': 'Median Plants',
      'service_road': 'Service Road',
      'km_stones': 'KM Stones',
      'crash_barrier': 'Crash Barrier',
      'median_opening': 'Median Opening',
      'manhole': 'Manhole',
      'circular_chamber': 'Chamber',
      'rectangular_chamber': 'Chamber',
      'drinking_water': 'Drinking Water',
      'storm_water': 'Storm Water',
      'stp_sinkhole': 'STP Sinkhole',
      'fire_hydrant': 'Fire Hydrant'
    };

    const assets: CardAssetData[] = [];
    
    // Handle chamber separately (circular + rectangular combined)
    const chamberCount = (assetMap['circular_chamber'] || 0) + (assetMap['rectangular_chamber'] || 0);
    if (chamberCount > 0) {
      assets.push({
        name: 'Chamber',
        count: chamberCount,
        unit: ''
      });
    }
    
    // Add other assets
    Object.keys(assetMap).forEach(key => {
      const count = assetMap[key];
      // Skip chamber fields as they're already handled
      if (key !== 'circular_chamber' && key !== 'rectangular_chamber' && count > 0) {
        assets.push({
          name: assetNameMap[key] || key,
          count: count,
          unit: assetUnits[key] || ''
        });
      }
    });

    // Sort assets by name
    assets.sort((a, b) => a.name.localeCompare(b.name));

    return assets;
  }

  calculateReportedAssets(reportedData: ReportData[]): CardAssetData[] {
    const distressMap: { [key: string]: number } = {};

    // Count by distress_type
    reportedData.forEach(item => {
      const distressType = item.distress_type || 'Unknown';
      if (!distressMap[distressType]) {
        distressMap[distressType] = 0;
      }
      distressMap[distressType] += 1;
    });

    // Convert to CardAssetData array
    const assets: CardAssetData[] = Object.keys(distressMap).map(distressType => ({
      name: distressType,
      count: distressMap[distressType],
      unit: ''
    }));

    // Sort by count (descending), then by name
    assets.sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.name.localeCompare(b.name);
    });

    return assets;
  }

  calculatePredictedAssets(predictedData: ReportData[]): CardAssetData[] {
    const distressMap: { [key: string]: number } = {};

    // Only count by individual distress type fields (these have the actual numeric values)
    const distressFields = [
      'rough_spot', 'pothole', 'hotspots', 'edge_break', 'alligator_crack',
      'transverse_crack', 'longitudinal_crack', 'hairline_crack', 'patchwork',
      'rutting', 'bleeding', 'raveling'
    ];

    const distressNameMap: { [key: string]: string } = {
      'rough_spot': 'Rough Spot',
      'pothole': 'Pothole',
      'hotspots': 'Hotspots',
      'edge_break': 'Edge Break',
      'alligator_crack': 'Alligator Crack',
      'transverse_crack': 'Transverse Crack',
      'longitudinal_crack': 'Longitudinal Crack',
      'hairline_crack': 'Hairline Crack',
      'patchwork': 'Patchwork',
      'rutting': 'Rutting',
      'bleeding': 'Bleeding',
      'raveling': 'Raveling'
    };

    predictedData.forEach(item => {
      distressFields.forEach(field => {
        const value = item[field as keyof ReportData] as number;
        if (value != null && value !== undefined && value > 0 && !isNaN(value)) {
          const displayName = distressNameMap[field];
          if (!distressMap[displayName]) {
            distressMap[displayName] = 0;
          }
          distressMap[displayName] += value;
        }
      });
    });

    // Convert to CardAssetData array
    const assets: CardAssetData[] = Object.keys(distressMap).map(distressName => ({
      name: distressName,
      count: distressMap[distressName],
      unit: ''
    }));

    // Sort by count (descending), then by name
    assets.sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.name.localeCompare(b.name);
    });

    return assets;
  }

  calculateTisAssets(tisData: ReportData[]): CardAssetData[] {
    // TIS typically represents traffic routes, so we'll just show route count
    const assets: CardAssetData[] = [{
      name: 'Traffic Routes',
      count: tisData.length,
      unit: ''
    }];
    return assets;
  }

  calculateAisAssets(aisData: ReportData[]): CardAssetData[] {
    const accidentMap: { [key: string]: number } = {};
    const accidentNameMap: { [key: string]: string } = {
      'fatal_accident': 'Fatal Accident',
      'major_accident': 'Major Accident',
      'minor_accident': 'Minor Accident',
      'grievous_accident': 'Grievous Accident',
      'non-injured_accident': 'Non-Injured Accident',
      'fatalities': 'Fatalities',
      'total_injury': 'Total Injury',
      'total_accident': 'Total Accident'
    };

    // Aggregate accident counts
    aisData.forEach(item => {
      const rawItem = item._rawItem || {};
      Object.keys(accidentNameMap).forEach(field => {
        const value = rawItem[field];
        if (value != null && value !== undefined && value !== 0) {
          const name = accidentNameMap[field];
          if (!accidentMap[name]) {
            accidentMap[name] = 0;
          }
          accidentMap[name] += Number(value) || 0;
        }
      });
    });

    // Convert to CardAssetData array
    const assets: CardAssetData[] = Object.keys(accidentMap).map(accidentName => ({
      name: accidentName,
      count: accidentMap[accidentName],
      unit: ''
    }));

    // Sort by count (descending), then by name
    assets.sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.name.localeCompare(b.name);
    });

    return assets;
  }

  calculatePmsAssets(pmsData: ReportData[]): CardAssetData[] {
    const metricsMap: { [key: string]: { count: number; unit: string } } = {};
    const metricsNameMap: { [key: string]: { name: string; unit: string } } = {
      'pavement_condition_score_(pcs):': { name: 'PCS Score', unit: '' },
      'temperature_(°c):': { name: 'Temperature', unit: '°C' },
      'rainfall_(mm):': { name: 'Rainfall', unit: 'mm' },
      'international_roughness_index_(iri):': { name: 'IRI', unit: '' },
      'iri_index': { name: 'IRI Index', unit: '' }
    };

    // Count records with each metric
    pmsData.forEach(item => {
      const rawItem = item._rawItem || {};
      Object.keys(metricsNameMap).forEach(field => {
        const value = rawItem[field];
        if (value != null && value !== undefined && value !== '' && value !== 'N/A') {
          const metricInfo = metricsNameMap[field];
          if (!metricsMap[metricInfo.name]) {
            metricsMap[metricInfo.name] = { count: 0, unit: metricInfo.unit };
          }
          metricsMap[metricInfo.name].count += 1;
        }
      });
    });

    // Convert to CardAssetData array
    const assets: CardAssetData[] = Object.keys(metricsMap).map(metricName => ({
      name: metricName,
      count: metricsMap[metricName].count,
      unit: metricsMap[metricName].unit
    }));

    // Sort by name
    assets.sort((a, b) => a.name.localeCompare(b.name));

    return assets;
  }

  calculateRwfisAssets(rwfisData: ReportData[]): CardAssetData[] {
    // RWFIS - Road Weather and Field Information System
    // For now, just show record count as it's not clear what specific assets/metrics it has
    const assets: CardAssetData[] = [{
      name: 'Weather Records',
      count: rwfisData.length,
      unit: ''
    }];
    return assets;
  }

  /** Unique key for an item so we can deduplicate same-asset entries at one location (e.g. TIS duplicate rows). */
  private getItemDedupKey(item: ReportData): string {
    const asset = this.getAssetNameForItem(item);
    const chStart = item.chainage_start ?? '';
    const chEnd = item.chainage_end ?? '';
    const dir = item.direction ?? '';
    return `${item.apiType ?? ''}|${asset}|${chStart}|${chEnd}|${dir}`;
  }

  /** Deduplicate items at a location so popup shows each distinct asset once. */
  private deduplicateLocationItems(items: ReportData[]): ReportData[] {
    const seen = new Set<string>();
    return items.filter((item) => {
      const key = this.getItemDedupKey(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Get asset name for a single ReportData item
  private getAssetNameForItem(item: ReportData): string {
    if (!item.apiType) return 'Unknown';

    const apiType = item.apiType;

    // For Reported - use distress_type
    if (apiType === 'reported') {
      return item.distress_type || 'Unknown Distress';
    }

    // For Predicted - use distress_type
    if (apiType === 'predicted') {
      return item.distress_type || 'Unknown Distress';
    }

    // For TIS - single asset
    if (apiType === 'tis') {
      return 'Traffic Routes';
    }

    // For RWFIS - single asset
    if (apiType === 'rwfis') {
      return 'Weather Records';
    }

    // For Inventory - find which asset field has a value
    if (apiType === 'inventory') {
      const rawItem = item._rawItem || {};
      const assetNameMap: { [key: string]: string } = {
        'trees': 'Trees',
        'culvert': 'Culvert',
        'street_lights': 'Street Lights',
        'bridges': 'Bridges',
        'traffic_signals': 'Traffic Signals',
        'bus_stop': 'Bus Stop',
        'truck_layby': 'Truck Layby',
        'toll_plaza': 'Toll Plaza',
        'adjacent_road': 'Adjacent Road',
        'toilet_blocks': 'Toilet Block',
        'rest_area': 'Rest Area',
        'rcc_drain': 'RCC Drain',
        'fuel_station': 'Fuel Station',
        'emergency_call_box': 'Emergency Call',
        'tunnels': 'Tunnels',
        'footpath': 'Footpath',
        'junction': 'Junction',
        'sign_boards': 'Sign Boards',
        'solar_blinker': 'Solar Blinker',
        'median_plants': 'Median Plants',
        'service_road': 'Service Road',
        'km_stones': 'KM Stones',
        'crash_barrier': 'Crash Barrier',
        'median_opening': 'Median Opening',
        'manhole': 'Manhole',
        'circular_chamber': 'Chamber',
        'rectangular_chamber': 'Chamber',
        'drinking_water': 'Drinking Water',
        'storm_water': 'Storm Water',
        'stp_sinkhole': 'STP Sinkhole',
        'fire_hydrant': 'Fire Hydrant'
      };

      // Check for chamber first (circular + rectangular)
      if ((rawItem['circular_chamber'] && rawItem['circular_chamber'] > 0) ||
          (rawItem['rectangular_chamber'] && rawItem['rectangular_chamber'] > 0)) {
        return 'Chamber';
      }

      // Check other assets
      for (const [field, assetName] of Object.entries(assetNameMap)) {
        if (field !== 'circular_chamber' && field !== 'rectangular_chamber') {
          const value = rawItem[field];
          if (value != null && value !== undefined && value !== 0) {
            return assetName;
          }
        }
      }

      return 'Unknown Asset';
    }

    // For AIS - find which accident type has a value
    if (apiType === 'ais') {
      const rawItem = item._rawItem || {};
      const accidentNameMap: { [key: string]: string } = {
        'fatal_accident': 'Fatal Accident',
        'major_accident': 'Major Accident',
        'minor_accident': 'Minor Accident',
        'grievous_accident': 'Grievous Accident',
        'non-injured_accident': 'Non-Injured Accident',
        'fatalities': 'Fatalities',
        'total_injury': 'Total Injury',
        'total_accident': 'Total Accident'
      };

      for (const [field, assetName] of Object.entries(accidentNameMap)) {
        const value = rawItem[field];
        if (value != null && value !== undefined && value !== 0) {
          return assetName;
        }
      }

      return 'Accident Record';
    }

    // For PMS - find which metric has a value
    if (apiType === 'pms') {
      const rawItem = item._rawItem || {};
      const metricsNameMap: { [key: string]: string } = {
        'pavement_condition_score_(pcs):': 'PCS Score',
        'temperature_(°c):': 'Temperature',
        'rainfall_(mm):': 'Rainfall',
        'international_roughness_index_(iri):': 'IRI',
        'iri_index': 'IRI Index'
      };

      for (const [field, assetName] of Object.entries(metricsNameMap)) {
        const value = rawItem[field];
        if (value != null && value !== undefined && value !== '' && value !== 'N/A') {
          return assetName;
        }
      }

      return 'PMS Record';
    }

    return 'Unknown';
  }

  updateComparisonCardAssets() {
    try {
      console.log('🔄 Updating comparison card assets...');
      
      // Clear existing comparison card assets
      this.comparisonCardAssetsMap = {};

      // Process Inventory card assets
      const inventoryData = this.comparisonChartData.filter(item => item.apiType === 'inventory');
      if (inventoryData.length > 0) {
        this.comparisonCardAssetsMap['Inventory'] = this.calculateInventoryAssets(inventoryData);
      }

      // Process Reported card assets
      const reportedData = this.comparisonChartData.filter(item => item.apiType === 'reported');
      if (reportedData.length > 0) {
        this.comparisonCardAssetsMap['Reported'] = this.calculateReportedAssets(reportedData);
      }

      // Process Predicted card assets
      const predictedData = this.comparisonChartData.filter(item => item.apiType === 'predicted');
      if (predictedData.length > 0) {
        this.comparisonCardAssetsMap['Predicted'] = this.calculatePredictedAssets(predictedData);
      }

      // Process TIS card assets
      const tisData = this.comparisonChartData.filter(item => item.apiType === 'tis');
      if (tisData.length > 0) {
        this.comparisonCardAssetsMap['TIS'] = this.calculateTisAssets(tisData);
      }

      // Process AIS card assets
      const aisData = this.comparisonChartData.filter(item => item.apiType === 'ais');
      if (aisData.length > 0) {
        this.comparisonCardAssetsMap['AIS'] = this.calculateAisAssets(aisData);
      }

      // Process PMS card assets
      const pmsData = this.comparisonChartData.filter(item => item.apiType === 'pms');
      if (pmsData.length > 0) {
        this.comparisonCardAssetsMap['PMS'] = this.calculatePmsAssets(pmsData);
      }

      // Process RWFIS card assets
      const rwfisData = this.comparisonChartData.filter(item => item.apiType === 'rwfis');
      if (rwfisData.length > 0) {
        this.comparisonCardAssetsMap['RWFIS'] = this.calculateRwfisAssets(rwfisData);
      }

      console.log('✅ Comparison card assets updated:', this.comparisonCardAssetsMap);
    } catch (error) {
      console.error('❌ Error updating comparison card assets:', error);
      this.comparisonCardAssetsMap = {};
    }
  }

  async destroyMap() {
    if (this.map) {
      try {
        this.map.remove();
        this.map = null as any;
        const mapContainer = document.getElementById('mapContainer');
        if (mapContainer) {
          mapContainer.innerHTML = '';
          delete (mapContainer as any)._leaflet_id;
        }
        this.iconCache.clear();
        console.log('🗑️ Map destroyed successfully');
      } catch (e) {
        console.warn('Error destroying map:', e);
        this.map = null as any;
      }
    }
  }

  async initMap() {
    if (!this.isBrowser) {
      console.log('🚫 Not in browser environment, skipping map initialization');
      return;
    }

    try {
      const L = await import('leaflet');

      // Check if map container exists
      const mapContainer = document.getElementById('mapContainer');
      if (!mapContainer) {
        console.error('❌ Map container not found. Retrying in 500ms...');
        setTimeout(() => {
          this.initMap();
        }, 500);
        return;
      }

      // If map instance exists, check if it's still valid
      if (this.map) {
        try {
          // Try to get the container from the map instance
          const mapContainerFromInstance = this.map.getContainer();
          if (mapContainerFromInstance && mapContainerFromInstance.id === 'mapContainer') {
            // Check if container is empty (means map was destroyed but instance still exists)
            if (mapContainer.innerHTML.trim() === '') {
              console.log('🗺️ Map container is empty, cleaning up invalid map instance...');
              try {
                this.map.remove();
              } catch (e) {
                console.warn('Error removing invalid map:', e);
              }
              this.map = null as any;
            } else {
              // Map is still valid, just invalidate size and return
              console.log('🗺️ Map already initialized and valid, invalidating size...');
              setTimeout(() => {
                if (this.map) {
                  this.map.invalidateSize();
                  // Force tile redraw
                  this.map.eachLayer((layer: any) => {
                    if (layer.redraw) {
                      try {
                        layer.redraw();
                      } catch (e) {
                        // Ignore errors
                      }
                    }
                  });
                  if (this.rawData && this.rawData.length > 0) {
                    this.addMarkers();
                  }
                }
              }, 100);
              return;
            }
          } else {
            // Map instance exists but container is different, clean it up
            console.log('🗺️ Map instance exists but container mismatch, cleaning up...');
            try {
              this.map.remove();
            } catch (e) {
              console.warn('Error removing old map:', e);
            }
            this.map = null as any;
          }
        } catch (e) {
          // Map instance is invalid, clean it up
          console.log('🗺️ Map instance is invalid, cleaning up...');
          this.map = null as any;
        }
      }

      // Clear any existing Leaflet instances from the container
      if ((mapContainer as any)._leaflet_id) {
        console.log('🗺️ Cleaning up existing Leaflet instance from container...');
        try {
          // Try to get and remove the existing map
          const existingMapId = (mapContainer as any)._leaflet_id;
          const existingMap = (L as any).map?.instances?.[existingMapId];
          if (existingMap && existingMap.remove) {
            existingMap.remove();
          }
          // Clear the container
          mapContainer.innerHTML = '';
          // Clear the leaflet ID
          delete (mapContainer as any)._leaflet_id;
        } catch (e) {
          console.warn('Error cleaning up map container:', e);
          // Fallback: just clear the container
          mapContainer.innerHTML = '';
        }
      }

      console.log('🗺️ Starting map initialization...');

      // Initialize map with satellite view
      this.map = L.map('mapContainer', {
        center: [26.7041, 89.1459],
        zoom: 1,
        zoomControl: true,
      });

      console.log('✅ Map instance created');

      // Add Google satellite tile layer (use HTTPS)
      const googleSatelliteLayer = L.tileLayer(
        'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
        {
          attribution: '© Google',
          maxZoom: 21,
        }
      );

      // Add Google satellite layer by default
      googleSatelliteLayer.addTo(this.map);
      console.log('✅ Satellite tile layer added');

      // Add zoom event listener with debouncing and threshold checking
      this.map.on('zoomend', () => {
        if (this.map) {
          // Clear any pending zoom update
          if (this.zoomUpdateTimeout) {
            clearTimeout(this.zoomUpdateTimeout);
          }
          
          // Debounce zoom updates to reduce lag
          this.zoomUpdateTimeout = setTimeout(() => {
            if (!this.map) return;
            
            const newZoom = this.map.getZoom();
            const wasAboveThreshold = this.currentZoomLevel >= this.zoomThreshold;
            const isAboveThreshold = newZoom >= this.zoomThreshold;
            
            this.currentZoomLevel = newZoom;
            
            // Only update markers if zoom crossed the threshold
            // This prevents unnecessary marker recreation during zoom
            if (wasAboveThreshold !== isAboveThreshold) {
              console.log(`🔄 Zoom threshold crossed: ${wasAboveThreshold ? 'icons' : 'dots'} -> ${isAboveThreshold ? 'icons' : 'dots'}`);
              this.updateMapMarkersOnly();
            }
          }, 150); // 150ms debounce
        }
      });

      // Invalidate map size to ensure proper rendering
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
          console.log('✅ Map size invalidated');
          // Add markers if data is available
          if (this.rawData && this.rawData.length > 0) {
            this.addMarkers();
          } else {
            // Set initial view even without data
            this.map.setView([26.7041, 89.1459], 10);
          }
          
          // If there's a pending TIS route, display it now that map is ready
          if (this.pendingTisRoute) {
            console.log('🚦 Displaying pending TIS route now that map is ready...');
            this.displayTrafficRouteOnMap(
              this.pendingTisRoute.routeData,
              this.pendingTisRoute.coordinates,
              this.pendingTisRoute.directionsResult
            ).then(() => {
              this.pendingTisRoute = null;
              console.log('✅ Pending TIS route displayed successfully');
            });
          }
        }
      }, 100);

      // Additional resize for mobile and ensure tiles load
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
          // Force a redraw of tiles to fix black screen issue
          this.map.eachLayer((layer: any) => {
            if (layer.redraw) {
              try {
                layer.redraw();
              } catch (e) {
                // Ignore errors for layers that don't support redraw
              }
            }
          });
        }
      }, 500);
    } catch (error) {
      console.error('❌ Error initializing map:', error);
    }
  }

  async addMarkers() {
    if (!this.map || !this.isBrowser) return;

    try {
      const L = await import('leaflet');

      this.clearMapMarkers();
      const filteredData = this.getFilteredData(true);

      // Use all filtered data for markers (all cards including TIS now show markers)
      const dataForMarkers = filteredData;

      console.log(`🗺️ Adding markers: ${dataForMarkers.length} items after filtering (${filteredData.length} total filtered, ${this.rawData.length} raw)`);
      console.log(`📊 Selected API types:`, Array.from(this.currentApiTypes));
      console.log(`📊 Selected cards:`, Array.from(this.selectedCards));
      
      // Log data breakdown by API type
      const dataByApiType: { [key: string]: number } = {};
      this.rawData.forEach(item => {
        if (item.apiType) {
          dataByApiType[item.apiType] = (dataByApiType[item.apiType] || 0) + 1;
        }
      });
      console.log(`📊 Data by API type:`, dataByApiType);
      
      if (dataForMarkers.length === 0) {
        console.log('⚠️ No data for markers after filtering');
        // Log why no data is available
        const nonTisData = this.rawData.filter(item => item.apiType !== 'tis');
        console.log(`📊 Raw data (non-TIS): ${nonTisData.length} items`);
        if (nonTisData.length > 0) {
          console.log(`📋 Sample item:`, nonTisData[0]);
          console.log(`📋 Sample item coordinates:`, { lat: nonTisData[0].latitude, lng: nonTisData[0].longitude });
        }
        return;
      }

      // Always start with dots (colorful points) regardless of current zoom
      // Icons will show when user zooms in via the zoom event listener
      this.currentZoomLevel = this.map.getZoom();
      console.log(`🔍 Current zoom level: ${this.currentZoomLevel}, Threshold: ${this.zoomThreshold}`);

      // Force dots mode initially - icons will appear only when user manually zooms in
      this.lastMarkerMode = 'dots';
      await this.showColorfulPoints(dataForMarkers, L);

      console.log(`✅ Markers added: ${this.markers.length} markers on map (dots mode)`);

      // Only adjust bounds if we have markers (don't interfere with TIS route bounds)
      if (dataForMarkers.length > 0 && !(this.currentRouteData && this.trafficRoutePolylines.length > 0)) {
        // Store current zoom before adjusting bounds
        const zoomBeforeBounds = this.map.getZoom();
        this.adjustMapBounds();
        
        // After adjusting bounds, ensure we're still showing dots (don't auto-switch to icons)
        setTimeout(() => {
          if (this.map && this.lastMarkerMode === 'dots') {
            const newZoom = this.map.getZoom();
            // Only switch to icons if user manually zoomed in (not from bounds adjustment)
            // If bounds adjustment zoomed us too high, force it back to dots mode
            if (newZoom >= this.zoomThreshold) {
              // If we got zoomed too high by bounds, reduce zoom to stay in dots mode
              if (zoomBeforeBounds < this.zoomThreshold) {
                this.map.setZoom(12); // Force zoom to 12 to stay in dots mode
                console.log(`🔧 Adjusted zoom from ${newZoom} to 12 to keep dots mode`);
              }
            }
          }
        }, 200);
      }
    } catch (error) {
      console.error('Error adding markers:', error);
    }
  }

  async updateMapMarkersOnly() {
    if (!this.map || !this.isBrowser) return;

    try {
      const L = await import('leaflet');

      const filteredData = this.getFilteredData(true);
      
      if (filteredData.length === 0) {
        this.clearMapMarkers();
        return;
      }

      this.currentZoomLevel = this.map.getZoom();
      const shouldShowIcons = this.currentZoomLevel >= this.zoomThreshold;
      const newMode = shouldShowIcons ? 'icons' : 'dots';
      
      // Only update if mode actually changed
      if (this.lastMarkerMode === newMode) {
        return; // No change needed
      }
      
      console.log(`🔄 Switching marker mode: ${this.lastMarkerMode || 'none'} -> ${newMode} (zoom: ${this.currentZoomLevel})`);
      
      this.clearMapMarkers();
      this.lastMarkerMode = newMode;

      if (shouldShowIcons) {
        await this.showIconMarkers(filteredData, L);
      } else {
        await this.showColorfulPoints(filteredData, L);
      }
    } catch (error) {
      console.error('Error updating map markers:', error);
    }
  }

  onInfoCardClick(info: InfoData) {
    if (this.isMonthComparisonMode) {
      // TODO: Implement month comparison modal
      return;
    }

    if (this.selectedInfoCard === info.title) {
      this.selectedInfoCard = null;
    } else {
      this.selectedInfoCard = info.title;
    }

    if (this.map) {
      this.updateMapMarkersOnly();
    }
  }

  private async showColorfulPoints(filteredData: ReportData[], L: any) {
    // Group markers by lat/lon (with small tolerance for floating point differences)
    const locationGroups = new Map<string, ReportData[]>();
    const tolerance = 0.00001; // Very small tolerance for grouping
    
    filteredData.forEach((item) => {
      if (item.latitude != null && item.longitude != null && !isNaN(item.latitude) && !isNaN(item.longitude) && item.latitude !== 0 && item.longitude !== 0) {
        // Round coordinates to create location key (group nearby markers)
        const latKey = Math.round(item.latitude / tolerance) * tolerance;
        const lngKey = Math.round(item.longitude / tolerance) * tolerance;
        const locationKey = `${latKey.toFixed(6)},${lngKey.toFixed(6)}`;
        
        if (!locationGroups.has(locationKey)) {
          locationGroups.set(locationKey, []);
        }
        locationGroups.get(locationKey)!.push(item);
      }
    });
    
    // Create markers for each location group
    locationGroups.forEach((items, locationKey) => {
      const [lat, lng] = locationKey.split(',').map(Number);
      const isCluster = items.length > 1;
      
      if (isCluster) {
        const uniqueItems = this.deduplicateLocationItems(items);
        const displayCount = uniqueItems.length;

        // Create cluster marker with count (use unique count so badge matches popup)
        const marker = L.circleMarker([lat, lng], {
          radius: 8,
          fillColor: '#FF6B6B',
          color: '#FFFFFF',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        });
        if (this.mapIconsVisible) marker.addTo(this.map);
        this.markers.push(marker);
        
        // Add count label
        const countLabel = L.divIcon({
          className: 'cluster-count-label',
          html: `<div style="
            background: #FF6B6B;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 11px;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">${displayCount}</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        
        const labelMarker = L.marker([lat, lng], { icon: countLabel, zIndexOffset: 1000 });
        if (this.mapIconsVisible) labelMarker.addTo(this.map);
        this.markers.push(labelMarker);
        
        // Build popup with unique items only (no duplicate assets at same location)
        let popupContent = `
          <div style="font-family: Arial, sans-serif; max-width: 400px; max-height: 500px; overflow-y: auto;">
            <h4 style="margin: 0 0 10px 0; color: #FF6B6B; font-size: 16px; border-bottom: 2px solid #FF6B6B; padding-bottom: 5px;">
              ${displayCount} Item${displayCount !== 1 ? 's' : ''} at this Location
            </h4>
        `;
        
        uniqueItems.forEach((item, index) => {
          const markerColor = item.apiType === 'reported' && item.distress_type
            ? this.getDistressColor(item.distress_type)
            : item.apiType === 'pms' && item.distress_type
            ? this.getPMSColor(item.distress_type)
            : this.getColorForApiType(item.apiType || 'inventory');
          
          const cardTitle = this.getCardTitleForApiType(item.apiType || 'inventory');
          const assetName = this.getAssetNameForItem(item);
          
          popupContent += `
            <div style="margin: 10px 0; padding: 10px; background-color: #f9f9f9; border-left: 4px solid ${markerColor}; border-radius: 4px;">
              <div style="color: ${markerColor}; font-weight: bold; margin-bottom: 5px;">${index + 1}. ${cardTitle}</div>
              <div style="font-size: 12px; margin: 3px 0;"><strong>Asset:</strong> ${assetName}</div>
              <div style="font-size: 12px; margin: 3px 0;"><strong>Chainage:</strong> ${item.chainage_start?.toFixed(2)} - ${item.chainage_end?.toFixed(2)} km</div>
              <div style="font-size: 12px; margin: 3px 0;"><strong>Direction:</strong> ${item.direction || 'N/A'}</div>
          `;
          
          if (item.apiType === 'reported' && item.distress_type) {
            popupContent += `<div style="font-size: 12px; margin: 3px 0;"><strong>Distress:</strong> ${item.distress_type}</div>`;
          }
          
          popupContent += `</div>`;
        });
        
        popupContent += `</div>`;
        
        marker.bindPopup(popupContent, {
          className: 'cluster-popup',
          maxWidth: 450,
          maxHeight: 550
        });
        marker.on('popupopen', () => marker.closeTooltip?.());
        marker.on('popupclose', () => marker.closeTooltip?.());
        this.markers.push(marker);
      } else {
        // Single marker - use original logic
        const item = items[0];
        // Get color based on API type
        let markerColor = this.getColorForApiType(item.apiType || 'inventory');
        
        // For reported data, use distress-specific color if available
        if (item.apiType === 'reported' && item.distress_type) {
          markerColor = this.getDistressColor(item.distress_type);
        } else if (item.apiType === 'pms' && item.distress_type) {
          // For PMS, use PMS-specific color based on PCS score
          markerColor = this.getPMSColor(item.distress_type);
        }
        
        // Use original coordinates - no offset
        const marker = L.circleMarker([item.latitude, item.longitude], {
          radius: 6,
          fillColor: markerColor,
          color: markerColor,
          weight: 0,
          opacity: 1,
          fillOpacity: 0.8,
        });
        if (this.mapIconsVisible) marker.addTo(this.map);
        this.markers.push(marker);

        // Build popup content based on API type
        const popupTitle = item.apiType === 'reported' 
          ? (item.distress_type || 'Unknown') 
          : item.project_name;
        
        // Get card title for this API type
        const cardTitle = this.getCardTitleForApiType(item.apiType || 'inventory');
        
        let popupContent = `
          <div style="font-family: Arial, sans-serif; min-width: 200px;">
            <h4 style="margin: 0 0 10px 0; color: ${markerColor}; font-size: 14px;">
              ${popupTitle}
            </h4>
            <p style="margin: 5px 0; font-size: 12px; padding: 5px; background-color: #f0f0f0; border-radius: 4px;">
             <span style="color: ${markerColor}; font-weight: bold;">${cardTitle}</span>
            </p>
            <p style="margin: 5px 0; font-size: 12px; padding: 5px; background-color: #e8f4f8; border-radius: 4px;">
              <strong>Asset:</strong> <span style="color: ${markerColor}; font-weight: bold;">${this.getAssetNameForItem(item)}</span>
            </p>
            <p style="margin: 5px 0; font-size: 12px;">
              <strong>Chainage:</strong> ${item.chainage_start?.toFixed(2)} - ${item.chainage_end?.toFixed(2)} km
            </p>
            <p style="margin: 5px 0; font-size: 12px;">
              <strong>Direction:</strong> ${item.direction || 'N/A'}
            </p>
        `;
        
        // Add reported-specific fields
        if (item.apiType === 'reported') {
          const area = item.area && item.area > 0 ? item.area.toFixed(2) : 'N/A';
          const depth = item.depth && item.depth > 0 ? item.depth.toFixed(2) : 'N/A';
          const length = item.length && item.length > 0 ? item.length.toFixed(2) : 'N/A';
          const width = item.width && item.width > 0 ? item.width.toFixed(2) : 'N/A';
          
          popupContent += `
            <p style="margin: 5px 0; font-size: 12px;">
              <strong>Area:</strong> ${area}
            </p>
            <p style="margin: 5px 0; font-size: 12px;">
              <strong>Depth:</strong> ${depth}
            </p>
            <p style="margin: 5px 0; font-size: 12px;">
              <strong>Length:</strong> ${length}
            </p>
            <p style="margin: 5px 0; font-size: 12px;">
              <strong>Width:</strong> ${width}
            </p>
          `;
        } else if (item.apiType === 'pms') {
          // Add PMS-specific fields
          const rawItem = item._rawItem || {};
          // Try both with and without colon (API field name includes colon)
          const iriValue = rawItem['international_roughness_index_(iri):'] ?? 
                         rawItem['international_roughness_index_(iri)'];
          const iriDisplay = iriValue !== undefined && iriValue !== null 
            ? (typeof iriValue === 'number' ? iriValue.toFixed(3) : String(iriValue))
            : 'N/A';
          
          popupContent += `
            <p style="margin: 5px 0; font-size: 12px;">
              <strong>Carriage Type:</strong> ${item.pavement_type || 'N/A'}
            </p>
            <p style="margin: 5px 0; font-size: 12px;">
              <strong>RI:</strong> ${iriDisplay}
            </p>
          `;
        } else {
          popupContent += `
            <p style="margin: 5px 0; font-size: 12px;">
              <strong>Type:</strong> ${item.pavement_type || 'N/A'}
            </p>
          `;
        }
        
        popupContent += `</div>`;
        
        marker.bindPopup(popupContent, {
          className: 'flag-popup-connected',
          offset: L.point(0, -40)
        });
        marker.on('popupopen', () => marker.closeTooltip?.());
        marker.on('popupclose', () => marker.closeTooltip?.());
      }
    });
  }

  private async showIconMarkers(filteredData: ReportData[], L: any) {
    // Group markers by lat/lon (with small tolerance for floating point differences)
    const locationGroups = new Map<string, ReportData[]>();
    const tolerance = 0.00001; // Very small tolerance for grouping
    
    filteredData.forEach((item) => {
      if (item.latitude != null && item.longitude != null && !isNaN(item.latitude) && !isNaN(item.longitude) && item.latitude !== 0 && item.longitude !== 0) {
        // Round coordinates to create location key (group nearby markers)
        const latKey = Math.round(item.latitude / tolerance) * tolerance;
        const lngKey = Math.round(item.longitude / tolerance) * tolerance;
        const locationKey = `${latKey.toFixed(6)},${lngKey.toFixed(6)}`;
        
        if (!locationGroups.has(locationKey)) {
          locationGroups.set(locationKey, []);
        }
        locationGroups.get(locationKey)!.push(item);
      }
    });
    
    // Process location groups in batches (reduced batch size for better performance)
    const batchSize = 50; // Reduced from 100 to improve responsiveness
    const locationArray = Array.from(locationGroups.entries());
    let currentIndex = 0;

    const addBatch = () => {
      const endIndex = Math.min(currentIndex + batchSize, locationArray.length);

      for (let i = currentIndex; i < endIndex; i++) {
        const [locationKey, items] = locationArray[i];
        const [lat, lng] = locationKey.split(',').map(Number);
        const isCluster = items.length > 1;
        
        if (isCluster) {
          const uniqueItems = this.deduplicateLocationItems(items);
          const displayCount = uniqueItems.length;

          // Create cluster marker with count (use unique count so badge matches popup)
          const clusterIcon = L.divIcon({
            className: 'cluster-icon',
            html: `<div style="
              background: #FF6B6B;
              color: white;
              border-radius: 50%;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 14px;
              border: 3px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            ">${displayCount}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });
          
          const marker = L.marker([lat, lng], { icon: clusterIcon, zIndexOffset: 1000 });
          if (this.mapIconsVisible) marker.addTo(this.map);
          
          // Build popup with unique items only (no duplicate assets at same location)
          let popupContent = `
            <div style="font-family: Arial, sans-serif; max-width: 400px; max-height: 500px; overflow-y: auto;">
              <h4 style="margin: 0 0 10px 0; color: #FF6B6B; font-size: 16px; border-bottom: 2px solid #FF6B6B; padding-bottom: 5px;">
                ${displayCount} Item${displayCount !== 1 ? 's' : ''} at this Location
              </h4>
          `;
          
          uniqueItems.forEach((item, index) => {
            const popupColor = item.apiType === 'reported' && item.distress_type
              ? this.getDistressColor(item.distress_type)
              : item.apiType === 'pms' && item.distress_type
              ? this.getPMSColor(item.distress_type)
              : this.getColorForApiType(item.apiType || 'inventory');
            
            const cardTitle = this.getCardTitleForApiType(item.apiType || 'inventory');
            const assetName = this.getAssetNameForItem(item);
            
            popupContent += `
              <div style="margin: 10px 0; padding: 10px; background-color: #f9f9f9; border-left: 4px solid ${popupColor}; border-radius: 4px;">
                <div style="color: ${popupColor}; font-weight: bold; margin-bottom: 5px;">${index + 1}. ${cardTitle}</div>
                <div style="font-size: 12px; margin: 3px 0;"><strong>Asset:</strong> ${assetName}</div>
                <div style="font-size: 12px; margin: 3px 0;"><strong>Chainage:</strong> ${item.chainage_start?.toFixed(2)} - ${item.chainage_end?.toFixed(2)} km</div>
                <div style="font-size: 12px; margin: 3px 0;"><strong>Direction:</strong> ${item.direction || 'N/A'}</div>
            `;
            
            if (item.apiType === 'reported' && item.distress_type) {
              popupContent += `<div style="font-size: 12px; margin: 3px 0;"><strong>Distress:</strong> ${item.distress_type}</div>`;
            }
            
            popupContent += `</div>`;
          });
          
          popupContent += `</div>`;
          
          marker.bindPopup(popupContent, {
            className: 'cluster-popup',
            maxWidth: 450,
            maxHeight: 550
          });
          this.markers.push(marker);
        } else {
          // Single marker - use original logic
          const item = items[0];
          
          // Get icon HTML based on API type
          // For PMS, use PMS-specific icon based on PCS score with caching
          let customIcon: any;
          if (item.apiType === 'pms' && item.distress_type) {
            // Normalize distress type for stable caching and lookup
            const normalizedType = (item.distress_type || 'Unknown')
              .toString()
              .toLowerCase()
              .trim();
            
            // Use cached icon or create new one
            const cacheKey = `pms_${normalizedType}`;
            customIcon = this.iconCache.get(cacheKey);
            
            if (!customIcon) {
              const iconHtml = this.getPMSIcon(item.distress_type);
              customIcon = L.divIcon({
                html: iconHtml,
                className: 'custom-distress-icon',
                iconSize: [28, 28],
                iconAnchor: [14, 14],
              });
              // Cache the icon for reuse
              this.iconCache.set(cacheKey, customIcon);
            }
          } else {
            // For other API types, use standard icon
            const iconHtml = this.getIconForApiType(item.apiType || 'inventory');
            customIcon = L.divIcon({
              html: iconHtml,
              className: 'custom-marker-icon',
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            });
          }

          // Build popup content once
          // Get color based on API type
          let popupColor = this.getColorForApiType(item.apiType || 'inventory');
          
          // For reported data, use distress-specific color if available
          if (item.apiType === 'reported' && item.distress_type) {
            popupColor = this.getDistressColor(item.distress_type);
          } else if (item.apiType === 'pms' && item.distress_type) {
            // For PMS, use PMS-specific color based on PCS score
            popupColor = this.getPMSColor(item.distress_type);
          }
          
          // Build popup content based on API type
          const popupTitle = item.apiType === 'reported' 
            ? (item.distress_type || 'Unknown') 
            : item.project_name;
          
          // Get card title for this API type
          const cardTitle = this.getCardTitleForApiType(item.apiType || 'inventory');
          
          // Get asset name for this item
          const assetName = this.getAssetNameForItem(item);
          
          let popup = `<div style="padding:8px;"><div style="color:${popupColor};font-weight:bold;margin-bottom:5px;">${popupTitle}</div><div style="font-size:11px; padding: 4px; background-color: #f0f0f0; border-radius: 3px; margin-bottom: 5px;"> <span style="color: ${popupColor}; font-weight: bold;">${cardTitle}</span></div><div style="font-size:11px; padding: 4px; background-color: #e8f4f8; border-radius: 3px; margin-bottom: 5px;"> <span style="color: ${popupColor}; font-weight: bold;">${assetName}</span></div><div style="font-size:11px;">Ch: ${item.chainage_start?.toFixed(1)}-${item.chainage_end?.toFixed(1)} km<br>Dir: ${item.direction || 'N/A'}`;
          
          // Add reported-specific fields
          if (item.apiType === 'reported') {
            const area = item.area && item.area > 0 ? item.area.toFixed(2) : 'N/A';
            const depth = item.depth && item.depth > 0 ? item.depth.toFixed(2) : 'N/A';
            const length = item.length && item.length > 0 ? item.length.toFixed(2) : 'N/A';
            const width = item.width && item.width > 0 ? item.width.toFixed(2) : 'N/A';
            popup += `<br>Area: ${area}<br>Depth: ${depth}<br>Length: ${length}<br>Width: ${width}`;
          } else if (item.apiType === 'pms') {
            // Add PMS-specific fields
            const rawItem = item._rawItem || {};
            // Try both with and without colon (API field name includes colon)
            const iriValue = rawItem['international_roughness_index_(iri):'] ?? 
                           rawItem['international_roughness_index_(iri)'];
            const iriDisplay = iriValue !== undefined && iriValue !== null 
              ? (typeof iriValue === 'number' ? iriValue.toFixed(3) : String(iriValue))
              : 'N/A';
            popup += `<br>Carriage Type: ${item.pavement_type || 'N/A'}<br>IRI: ${iriDisplay}`;
          } else {
            // popup += `<br>Type: ${item.pavement_type || 'N/A'}`;
          }
          
          popup += `</div></div>`;
          
          // Use original coordinates - no offset
          if (item.latitude != null && item.longitude != null) {
            const marker = L.marker([item.latitude, item.longitude], {
              icon: customIcon,
            });
            if (this.mapIconsVisible) marker.addTo(this.map);

            // Bind popup once when marker is created (not in click handler)
            marker.bindPopup(popup, {
              className: 'flag-popup-connected',
              offset: L.point(0, -40)
            });
            marker.on('popupopen', () => marker.closeTooltip?.());
            marker.on('popupclose', () => marker.closeTooltip?.());

            this.markers.push(marker);
          }
        }
      }

      currentIndex = endIndex;

      if (currentIndex < locationArray.length) {
        // Use requestAnimationFrame for smoother rendering during zoom
        requestAnimationFrame(() => addBatch());
      }
    };

    addBatch();
  }

  async adjustMapBounds() {
    if (!this.map || !this.isBrowser) return;

    // Don't adjust bounds if TIS route is displayed (route drawing handles bounds)
    if (this.currentRouteData && this.trafficRoutePolylines.length > 0) {
      console.log('🚦 Skipping bounds adjustment - TIS route handles bounds');
      return;
    }

    try {
      const L = await import('leaflet');

      const dataToUse = this.getFilteredData(true);
      
      // Include all data for bounds calculation (all cards including TIS now show markers)
      const dataForBounds = dataToUse;

      const coordinates = dataForBounds
        .filter((item) => item.latitude && item.longitude)
        .map((item) => [item.latitude, item.longitude] as [number, number]);

      if (coordinates.length === 0) {
        // If no coordinates and TIS route exists, don't reset view
        if (!this.currentRouteData) {
          this.map.setView([26.7041, 89.1459], 10);
        }
        return;
      }

      if (coordinates.length === 1) {
        // Set zoom to 12 to ensure dots are shown (threshold is 16)
        this.map.setView(coordinates[0], 12);
        return;
      }

      const bounds = L.latLngBounds(coordinates);

      // Calculate appropriate zoom to fit bounds while staying below threshold
      const boundsZoom = this.map.getBoundsZoom(bounds, false);
      const targetZoom = Math.min(boundsZoom, 12); // Cap at 12 to ensure dots mode (threshold is 16)
      
      this.map.fitBounds(bounds, {
        padding: [20, 20],
        maxZoom: 12, // Strictly limit to 12 to ensure dots show initially (threshold is 16)
      });
      
      // Double-check and enforce max zoom after fitBounds
      setTimeout(() => {
        if (this.map && this.map.getZoom() >= this.zoomThreshold) {
          this.map.setZoom(12);
          console.log(`🔧 Enforced zoom to 12 to keep dots mode`);
        }
      }, 100);
    } catch (error) {
      console.error('Error adjusting map bounds:', error);
    }
  }

  clearMapMarkers() {
    if (!this.map) return;
    try {
      // Remove all tracked markers in batch for better performance
      const markersToRemove = [...this.markers]; // Create copy to avoid issues during iteration
      this.markers = []; // Clear array immediately to prevent re-rendering
      
      // Remove markers from map (batch operation)
      markersToRemove.forEach((marker: any) => {
        try {
          if (this.map && marker && this.map.hasLayer && this.map.hasLayer(marker)) {
            this.map.removeLayer(marker);
          }
        } catch (e) {
          // Marker might already be removed, ignore
        }
      });
    } catch (error) {
      console.warn('Error clearing markers:', error);
      this.markers = [];
    }
  }

  /** Toggle visibility of all data icons on this map card only. */
  toggleMapIconsVisibility() {
    if (!this.map) return;
    this.mapIconsVisible = !this.mapIconsVisible;
    this.markers.forEach((marker: any) => {
      try {
        if (!marker) return;
        if (this.mapIconsVisible) {
          if (this.map && (!this.map.hasLayer || !this.map.hasLayer(marker))) {
            marker.addTo(this.map);
          }
        } else {
          if (this.map && this.map.hasLayer && this.map.hasLayer(marker)) {
            this.map.removeLayer(marker);
          }
        }
      } catch (_) {}
    });
  }

  onFilterChange() {
    this.updateInfoSummary();

    if (this.isBrowser) {
      this.addMarkers();
    }
  }

  async onDateChange(event: any) {
    this.filters.date = event.target.value;
    console.log('onDateChange triggered - new date:', this.filters.date);

    if (this.isProjectChanging) {
      console.log('Skipping date change - project is changing');
      return;
    }

    // Clear comparison cache when date changes (data is now for different date)
    this.comparisonDataCache = {};
    this.comparisonDataByCard = {};
    this.comparisonChartData = [];

    if (this.filters.date) {
      await this.loadData();
      // Update markers after data is loaded
      if (this.map && this.isBrowser) {
        setTimeout(() => {
          this.addMarkers();
        }, 300);
      }
    }
  }

  async onProjectChange(eventOrValue: any) {
    const newProject = typeof eventOrValue === 'string' ? eventOrValue : eventOrValue?.target?.value;
    if (!newProject) return;
    console.log('onProjectChange triggered - new project:', newProject);
    this.isProjectChanging = true;

    this.rawData = [];
    this.infoData = [];
    this.monthDataCache = {};
    
    // Clear comparison cache when project changes (data is now for different project)
    this.comparisonDataCache = {};
    this.comparisonDataByCard = {};
    this.comparisonChartData = [];

    this.filters.projectName = newProject;

    this.availableDates = this.projectDatesMap[this.filters.projectName] || [];

    if (this.availableDates.length > 0) {
      this.filters.date = this.availableDates[0];
    } else {
      this.filters.date = '';
    }

    await new Promise((resolve) => setTimeout(resolve, 10));

    if (this.filters.date) {
      await this.loadData();
      // Update markers after data is loaded
      if (this.map && this.isBrowser) {
        setTimeout(() => {
          this.addMarkers();
        }, 300);
      }
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
    if (this.rawData.length > 0) {
      return Math.floor(
        Math.min(...this.rawData.map((item) => item.chainage_start))
      );
    }
    return 0;
  }

  getChainageMax(): number {
    if (this.rawData.length > 0) {
      return Math.ceil(
        Math.max(...this.rawData.map((item) => item.chainage_end))
      );
    }
    return 1380.387;
  }

  // Get chainage min/max from comparison chart data (for comparison modal slider)
  getComparisonChainageMin(): number {
    if (this.comparisonChartData.length > 0) {
      return Math.floor(
        Math.min(...this.comparisonChartData.map((item) => item.chainage_start))
      );
    }
    // Fallback: use project-specific chainage range from filters (which is set based on selected project)
    if (this.filters.chainageRange && 
        this.filters.chainageRange.min >= 0 && 
        this.filters.chainageRange.max > this.filters.chainageRange.min) {
      return this.filters.chainageRange.min;
    }
    // Fallback to rawData if comparisonChartData is empty, but only if rawData exists
    if (this.rawData.length > 0) {
      return this.getChainageMin();
    }
    // If no data at all, return current min if set, otherwise 0
    return this.comparisonChainageMin;
  }

  getComparisonChainageMax(): number {
    if (this.comparisonChartData.length > 0) {
      return Math.ceil(
        Math.max(...this.comparisonChartData.map((item) => item.chainage_end))
      );
    }
    // Fallback: use project-specific chainage range from filters (which is set based on selected project)
    if (this.filters.chainageRange && 
        this.filters.chainageRange.max > this.filters.chainageRange.min &&
        this.filters.chainageRange.max < 1381) {
      return this.filters.chainageRange.max;
    }
    // Fallback to rawData if comparisonChartData is empty, but only if rawData exists
    if (this.rawData.length > 0) {
      return this.getChainageMax();
    }
    // If no data at all, return current max if set, otherwise 100
    return this.comparisonChainageMax > 1 ? this.comparisonChainageMax : 100;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 300);
  }

  // Month comparison methods (placeholder - implement as needed)
  toggleMonthComparisonMode() {
    this.isMonthComparisonMode = !this.isMonthComparisonMode;
  }

  openMonthComparisonModal() {
    this.isMonthComparisonModalOpen = true;
  }

  closeMonthComparisonModal() {
    this.isMonthComparisonModalOpen = false;
  }

  toggleMetricForMonthComparison(metricName: string) {
    const index = this.selectedMetricsForMonthComparison.indexOf(metricName);
    if (index > -1) {
      this.selectedMetricsForMonthComparison.splice(index, 1);
    } else {
      if (this.selectedMetricsForMonthComparison.length < 5) {
        this.selectedMetricsForMonthComparison.push(metricName);
      }
    }
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
      Metric1: '#FF6B6B',
      Metric2: '#4D96FF',
      Metric3: '#9D84B7',
    };
    return metricColorMap[metricName] || '#667EEA';
  }

  async onCardClick(card: DashboardCard) {
    console.log('Card clicked:', card.title);
    
    // Toggle card selection (add if not selected, remove if already selected)
    const wasSelected = this.selectedCards.has(card.title);
    
    if (wasSelected) {
      // Deselect card - remove from selected sets
      this.selectedCards.delete(card.title);
      if (card.apiType) {
        this.currentApiTypes.delete(card.apiType);
      }
      
      // Clear traffic route if TIS is deselected
      if (card.apiType === 'tis') {
        this.clearTrafficRoute();
        this.currentRouteData = null;
      }
      
      console.log('Card deselected:', card.title);
      console.log('Remaining selected cards:', Array.from(this.selectedCards));
      console.log('Remaining API types:', Array.from(this.currentApiTypes));
    } else {
      // Select card - add to selected sets
      this.selectedCards.add(card.title);
      if (card.apiType) {
        this.currentApiTypes.add(card.apiType);
      }
      console.log('Card selected:', card.title);
      console.log('All selected cards:', Array.from(this.selectedCards));
      console.log('All API types:', Array.from(this.currentApiTypes));
    }

    // If no cards are selected, clear data and map
    if (this.selectedCards.size === 0) {
      console.log('🗑️ No cards selected, clearing all data...');
      this.rawData = [];
      this.infoData = [];
      this.availableProjects = [];
      this.availableDates = [];
      this.projectDatesMap = {};
      this.projectDatesByApiType = {};
      this.originalProjectNamesByApiType = {};
      this.rawProjectDatesByApiType = {};
      this.filters.projectName = '';
      this.filters.date = '';
      this.clearMapMarkers();
      this.clearTrafficRoute(); // Clear traffic route
      this.currentRouteData = null;
      
      // Destroy map completely when no cards are selected
      if (this.map) {
        try {
          this.map.remove();
          this.map = null as any;
          const mapContainer = document.getElementById('mapContainer');
          if (mapContainer) {
            mapContainer.innerHTML = '';
            delete (mapContainer as any)._leaflet_id;
          }
          console.log('🗑️ Map destroyed after deselecting all cards');
        } catch (e) {
          console.warn('Error destroying map:', e);
        }
      }
      return;
    }

    // Check if any selected cards have valid API types
    const hasAnyValidApiType = Array.from(this.currentApiTypes).some(apiType => 
      apiType === 'inventory' || 
      apiType === 'reported' || 
      apiType === 'predicted' || 
      apiType === 'tis' || 
      apiType === 'ais' || 
      apiType === 'pms' || 
      apiType === 'rwfis'
    );

    if (hasAnyValidApiType && this.currentApiTypes.size > 0) {
      // Clear markers immediately when cards change to prevent showing stale data
      this.clearMapMarkers();
      
      // Store current project/date to preserve user selection
      const currentProject = this.filters.projectName;
      const currentDate = this.filters.date;
      
      console.log('🔄 Reloading data for all selected cards:', Array.from(this.selectedCards));
      
      // Load projects and dates for ALL selected card types
      await this.loadProjectsAndDates();
      
      // Restore or set project: prefer current selection, then globally selected, then first available
      if (currentProject && this.availableProjects.includes(currentProject)) {
        this.filters.projectName = currentProject;
        this.availableDates = this.projectDatesMap[currentProject] || [];
        if (currentDate && this.availableDates.includes(currentDate)) {
          this.filters.date = currentDate;
        } else if (this.availableDates.length > 0) {
          this.filters.date = this.availableDates[0];
        }
      } else if (this.availableProjects.length > 0) {
        // Previous project missing or first load: use globally selected project if it matches
        const matchFromSelection = this.projectSelection.getMatchingProject(this.availableProjects);
        this.filters.projectName = matchFromSelection || this.availableProjects[0];
        this.availableDates = this.projectDatesMap[this.filters.projectName] || [];
        if (this.availableDates.length > 0) {
          this.filters.date = this.availableDates[0];
        }
        this.cdr.detectChanges();
      }

      // Load data for ALL selected cards (this will fetch from all selected API types)
      if (this.filters.projectName && this.filters.date) {
        console.log('📊 Loading data for all selected cards with project:', this.filters.projectName, 'date:', this.filters.date);
        
        await this.loadData();
        
        // Verify data was loaded successfully
        console.log(`📊 Data load complete. rawData length: ${this.rawData.length}, selected API types:`, Array.from(this.currentApiTypes));
        
        // After data is loaded, ensure map is initialized and markers are added
        if (this.isBrowser) {
          try {
            // Initialize map if it doesn't exist (e.g., after deselecting all cards)
            if (!this.map) {
              console.log('🗺️ Map not initialized, initializing now...');
              await this.initMap();
              // Wait a bit for map to be fully ready
              await new Promise(resolve => setTimeout(resolve, 300));
            }
            
            // Ensure map is ready before adding markers
            if (this.map) {
              console.log('🗺️ Map exists, updating markers with data from all selected cards...');
              console.log(`📊 About to add markers. rawData: ${this.rawData.length} items, selected cards:`, Array.from(this.selectedCards));
              
              // Invalidate size to ensure map is rendered
              this.map.invalidateSize();
              
              // Wait a bit to ensure map is fully rendered and data is ready
              await new Promise(resolve => setTimeout(resolve, 150));
              
              // Add markers for all selected cards (including TIS)
              await this.addMarkers();
              
              console.log('✅ Markers updated successfully');
            } else {
              console.warn('⚠️ Map still not available after initialization attempt');
            }
          } catch (error) {
            console.error('❌ Error initializing/updating map:', error);
          }
        }
      } else {
        // No project/date selected, but ensure map is initialized if needed
        if (this.isBrowser && !this.map) {
          setTimeout(async () => {
            await this.initMap();
          }, 300);
        }
      }
    }
  }

  isCardSelected(cardTitle: string): boolean {
    return this.selectedCards.has(cardTitle);
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
      'Multiple cracks',
    ];
    
    if (highSeverityDistress.includes(distressType)) {
      return 'High';
    } else if (mediumSeverityDistress.includes(distressType)) {
      return 'Medium';
    }
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

  private getSeverityFromPredictedData(item: any): string {
    const totalDistress = item.total_distress || 0;
    if (totalDistress > 5) return 'High';
    if (totalDistress > 2) return 'Medium';
    return 'Low';
  }

  private getIconForApiType(apiType: string): string {
    // Return icon HTML based on API type
    const iconMap: { [key: string]: { icon: string; color: string; bgColor: string } } = {
      inventory: {
        icon: 'bi-box-seam',
        color: '#FFFFFF',
        bgColor: '#4CAF50', // Green
      },
      reported: {
        icon: 'bi-exclamation-triangle-fill',
        color: '#FFFFFF',
        bgColor: '#FF5722', // Deep Orange
      },
      predicted: {
        icon: 'bi-graph-up',
        color: '#FFFFFF',
        bgColor: '#9C27B0', // Purple
      },
      tis: {
        icon: 'bi-stoplights',
        color: '#FFFFFF',
        bgColor: '#FF9800', // Orange
      },
      ais: {
        icon: 'bi-car-front',
        color: '#FFFFFF',
        bgColor: '#F44336', // Red
      },
      pms: {
        icon: 'bi-signpost-2',
        color: '#FFFFFF',
        bgColor: '#2196F3', // Blue
      },
      rwfis: {
        icon: 'bi-droplet',
        color: '#FFFFFF',
        bgColor: '#00BCD4', // Cyan
      },
    };

    const config = iconMap[apiType] || {
      icon: 'bi-circle-fill',
      color: '#FFFFFF',
      bgColor: '#9E9E9E', // Grey
    };

    return `
      <div style="width:32px;height:32px;border-radius:50%;background:${config.bgColor};display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,0.3);">
        <i class="bi ${config.icon}" style="color:${config.color};font-size:16px;"></i>
      </div>
    `;
  }

  private getColorForApiType(apiType: string): string {
    const colorMap: { [key: string]: string } = {
      inventory: '#4CAF50', // Green
      reported: '#FF5722', // Deep Orange
      predicted: '#9C27B0', // Purple
      tis: '#FF9800', // Orange
      ais: '#F44336', // Red
      pms: '#2196F3', // Blue
      rwfis: '#00BCD4', // Cyan
    };
    return colorMap[apiType] || '#9E9E9E'; // Grey default
  }

  /**
   * Get PMS-specific icon based on PCS score or pavement condition
   */
  private getPMSIcon(distressType: string): string {
    // Normalize distress type
    const normalizedType = (distressType || 'Unknown').toString().toLowerCase().trim();
    
    // Try to parse as PCS score (0-100)
    const pcsNum = parseFloat(normalizedType);
    
    // If it's a PCS score (0-100), use icon based on condition
    if (!isNaN(pcsNum)) {
      let iconData = { icon: 'fa-solid fa-circle-check', color: '#4CAF50' }; // Excellent (90-100)
      
      if (pcsNum >= 85) {
        iconData = { icon: 'fa-solid fa-circle-check', color: '#4CAF50' }; // Excellent
      } else if (pcsNum >= 70) {
        iconData = { icon: 'fa-solid fa-circle-check', color: '#8BC34A' }; // Good
      } else if (pcsNum >= 55) {
        iconData = { icon: 'fa-solid fa-circle-exclamation', color: '#FFC107' }; // Fair
      } else if (pcsNum >= 40) {
        iconData = { icon: 'fa-solid fa-circle-exclamation', color: '#FF9800' }; // Poor
      } else {
        iconData = { icon: 'fa-solid fa-circle-xmark', color: '#F44336' }; // Very Poor
      }
      
      return `
        <div style="width:28px;height:28px;border-radius:50%;background:${iconData.color};display:flex;align-items:center;justify-content:center;">
          <i class="${iconData.icon}" style="color:#fff;font-size:14px;"></i>
        </div>
      `;
    }
    
    // Icon mapping for other pavement condition indicators
    const iconMap: { [key: string]: { icon: string; color: string } } = {
      excellent: { icon: 'fa-solid fa-circle-check', color: '#4CAF50' },
      good: { icon: 'fa-solid fa-circle-check', color: '#8BC34A' },
      fair: { icon: 'fa-solid fa-circle-exclamation', color: '#FFC107' },
      poor: { icon: 'fa-solid fa-circle-exclamation', color: '#FF9800' },
      'very poor': { icon: 'fa-solid fa-circle-xmark', color: '#F44336' },
      flexible: { icon: 'fa-solid fa-road', color: '#2196F3' },
      rigid: { icon: 'fa-solid fa-square', color: '#607D8B' },
      'pavement condition': { icon: 'fa-solid fa-road', color: '#9C27B0' },
    };
    
    const fallback = { icon: 'fa-solid fa-road', color: '#666666' };
    const iconData = iconMap[normalizedType] || fallback;
    
    return `
      <div style="width:28px;height:28px;border-radius:50%;background:${iconData.color};display:flex;align-items:center;justify-content:center;">
        <i class="${iconData.icon}" style="color:#fff;font-size:14px;"></i>
      </div>
    `;
  }

  /**
   * Get PMS-specific color based on distress type (PCS score or pavement condition)
   */
  private getPMSColor(distressType: string): string {
    // Try to parse as PCS score
    const pcsNum = parseFloat(distressType);
    
    if (!isNaN(pcsNum)) {
      // Color based on PCS score ranges
      if (pcsNum >= 85) {
        return '#4CAF50'; // Excellent - Green
      } else if (pcsNum >= 70) {
        return '#8BC34A'; // Good - Light Green
      } else if (pcsNum >= 55) {
        return '#FFC107'; // Fair - Amber
      } else if (pcsNum >= 40) {
        return '#FF9800'; // Poor - Orange
      } else {
        return '#F44336'; // Very Poor - Red
      }
    }
    
    // Use distress color if available, otherwise default PMS color
    return this.getDistressColor(distressType) || '#2196F3';
  }

  /**
   * Get card title from API type
   */
  private getCardTitleForApiType(apiType: string): string {
    const card = this.dashboardCards.find(c => c.apiType === apiType);
    return card ? card.title : apiType.charAt(0).toUpperCase() + apiType.slice(1);
  }

  // Open chainage comparison chart modal
  async openChainageComparisonModal() {
    if (!this.isBrowser) return;

    // Check if we have project and date selected
    if (!this.filters.projectName || !this.filters.date) {
      alert('Please select a project and date before opening the comparison chart.');
      return;
    }

    // Initialize comparison filters from main dashboard filters
    this.comparisonFilters = {
      projectName: this.filters.projectName,
      date: this.filters.date,
      direction: this.filters.direction || 'All',
      pavementType: this.filters.pavementType === 'All' ? 'All' : (this.filters.pavementType || 'All'),
      lane: this.filters.lane === 'All' ? 'All' : (this.filters.lane || 'All'),
    };
    
    // Update available dates for the selected project
    const projectDates = this.projectDatesMap[this.comparisonFilters.projectName] || [];
    if (projectDates.length > 0 && !projectDates.includes(this.comparisonFilters.date)) {
      this.comparisonFilters.date = projectDates[0];
    }
    
    console.log('🔧 Initialized comparison filters:', this.comparisonFilters);

    // Don't auto-initialize comparison chainage range
    // Preserve user's custom selection (default is 0-1 km)
    
    // Ensure comparisonChainageMax is at least comparisonChainageMin + 0.1
    if (this.comparisonChainageMax <= this.comparisonChainageMin) {
      this.comparisonChainageMax = this.comparisonChainageMin + 1;
    }

    // Don't auto-select cards - let user select cards manually
    // Clear any previous selections
    this.selectedCardsForComparison.clear();

    // Open modal
    this.isChainageComparisonModalOpen = true;

    // Don't auto-load data - data will load when user clicks on cards
    // Clear comparison data, but keep cache intact so we can reuse data for same project/date
    this.comparisonChartData = [];
    // Only clear comparisonDataByCard if project/date changed, otherwise keep it for reuse
    // We'll check cache when cards are clicked, so clearing is fine here
    this.comparisonDataByCard = {};

    // Generate chart (will be empty initially until cards are clicked)
    setTimeout(() => {
      this.generateChainageComparisonChart();
    }, 100);
  }

  // Close chainage comparison chart modal
  closeChainageComparisonModal() {
    this.isChainageComparisonModalOpen = false;
    this.selectedCardsForComparison.clear();
    this.comparisonChartData = []; // Clear comparison data when modal closes
    this.comparisonDataByCard = {}; // Clear per-card data
  }

  // Handle comparison filter changes
  async onComparisonProjectChange(event: any) {
    const newProject = event.target.value;
    if (newProject === this.comparisonFilters.projectName) return;
    
    this.comparisonFilters.projectName = newProject;
    // Update available dates for the new project
    const projectDates = this.projectDatesMap[newProject] || [];
    if (projectDates.length > 0) {
      this.comparisonFilters.date = projectDates[0];
    } else {
      this.comparisonFilters.date = '';
    }
    
    // Clear cache and reload data for all selected cards
    this.comparisonDataCache = {};
    this.comparisonDataByCard = {};
    this.comparisonChartData = [];
    
    // Reload data for all selected cards
    for (const cardTitle of Array.from(this.selectedCardsForComparison)) {
      await this.loadComparisonChartDataForCard(cardTitle);
    }
    
    this.updateCombinedComparisonData();
    // Extract filter options from loaded data
    this.extractComparisonFilterOptions();
    this.generateChainageComparisonChart();
  }

  async onComparisonDateChange(event: any) {
    const newDate = event.target.value;
    if (newDate === this.comparisonFilters.date) return;
    
    this.comparisonFilters.date = newDate;
    
    // Clear cache and reload data for all selected cards
    this.comparisonDataCache = {};
    this.comparisonDataByCard = {};
    this.comparisonChartData = [];
    
    // Reload data for all selected cards
    for (const cardTitle of Array.from(this.selectedCardsForComparison)) {
      await this.loadComparisonChartDataForCard(cardTitle);
    }
    
    this.updateCombinedComparisonData();
    // Extract filter options from loaded data
    this.extractComparisonFilterOptions();
    this.generateChainageComparisonChart();
  }

  // Extract filter options from comparison chart data
  extractComparisonFilterOptions() {
    if (!this.comparisonChartData || this.comparisonChartData.length === 0) {
      console.log('⚠️ No comparison chart data available for extracting filter options');
      return;
    }

    // Extract unique values from comparison data
    const pavementTypes = [
      ...new Set(this.comparisonChartData.map((item) => item.pavement_type).filter(Boolean))
    ].sort();
    
    const lanes = [
      ...new Set(this.comparisonChartData.map((item) => item.lane).filter(Boolean))
    ].sort();

    // Only update if we have new values
    if (pavementTypes.length > 0) {
      this.availablePavementTypes = pavementTypes;
    }
    
    if (lanes.length > 0) {
      this.availableLanes = lanes;
    }

    console.log('📊 Extracted filter options from comparison data:', {
      pavementTypes: this.availablePavementTypes,
      lanes: this.availableLanes,
      currentFilters: this.comparisonFilters
    });

    // Don't auto-change filter values - let user keep "All" if they want
    // Only set if filter is empty (not "All")
    if (!this.comparisonFilters.pavementType) {
      if (this.availablePavementTypes.length > 0) {
        this.comparisonFilters.pavementType = this.availablePavementTypes[0];
      } else {
        this.comparisonFilters.pavementType = 'All';
      }
    }

    if (!this.comparisonFilters.lane) {
      if (this.availableLanes.length > 0) {
        this.comparisonFilters.lane = this.availableLanes[0];
      } else {
        this.comparisonFilters.lane = 'All';
      }
    }
  }

  onComparisonDirectionChange(valueOrEvent: any) {
    const direction = typeof valueOrEvent === 'string' ? valueOrEvent : valueOrEvent?.target?.value ?? '';
    this.comparisonFilters.direction = direction;
    this.filters.direction = direction;
    this.generateChainageComparisonChart();
  }

  onComparisonPavementTypeChange(event: any) {
    const value = event?.target?.value ?? 'All';
    this.comparisonFilters.pavementType = value;
    // Just regenerate chart with new filter (no need to reload data)
    this.generateChainageComparisonChart();
  }

  onComparisonLaneChange(event: any) {
    const value = event?.target?.value ?? 'All';
    this.comparisonFilters.lane = value;
    // Just regenerate chart with new filter (no need to reload data)
    this.generateChainageComparisonChart();
  }

  // Update combined comparison data from all selected cards
  updateCombinedComparisonData() {
    const allData: ReportData[] = [];
    this.selectedCardsForComparison.forEach((cardTitle) => {
      const cardData = this.comparisonDataByCard[cardTitle] || [];
      allData.push(...cardData);
    });
    this.comparisonChartData = allData;
    
    console.log(`📊 Updated combined comparison data: ${allData.length} items from ${this.selectedCardsForComparison.size} cards`);
    
    // Update chainage range based on combined data
    if (allData.length > 0) {
      const minChainage = Math.floor(Math.min(...allData.map((item) => item.chainage_start || 0)));
      const maxChainage = Math.ceil(Math.max(...allData.map((item) => item.chainage_end || 0)));
      if (maxChainage > minChainage && maxChainage > 0) {
        // Always reset the comparison range to fully cover the loaded data
        this.comparisonChainageMin = minChainage;
        this.comparisonChainageMax = maxChainage;
        console.log(`📊 Updated chainage range from combined data: ${minChainage} - ${maxChainage} km`);
      }
    } else if (this.filters.chainageRange && 
               this.filters.chainageRange.min >= 0 && 
               this.filters.chainageRange.max > this.filters.chainageRange.min &&
               this.filters.chainageRange.max < 1381) {
      // Fallback to project-specific range if no data
      if (this.comparisonChainageMax <= this.comparisonChainageMin || 
          (this.comparisonChainageMin === 0 && this.comparisonChainageMax === 1)) {
        this.comparisonChainageMin = this.filters.chainageRange.min;
        this.comparisonChainageMax = this.filters.chainageRange.max;
        console.log(`📊 Using project chainage range: ${this.comparisonChainageMin} - ${this.comparisonChainageMax} km`);
      }
    }
    
    // Update comparison card assets
    this.updateComparisonCardAssets();
    
    // Extract filter options from loaded data (this will update availablePavementTypes and availableLanes)
    this.extractComparisonFilterOptions();
    
    // Regenerate chart with current filters
    this.generateChainageComparisonChart();
  }

  // Load data for a single card in comparison chart
  async loadComparisonChartDataForCard(cardTitle: string): Promise<void> {
    console.log(`🚀 Starting loadComparisonChartDataForCard for: ${cardTitle}`);
    console.log(`🔍 Browser check: ${this.isBrowser}, Project: ${this.filters.projectName}, Date: ${this.filters.date}`);
    
    if (!this.isBrowser) {
      console.error(`❌ Not in browser environment`);
      this.comparisonDataByCard[cardTitle] = [];
      return;
    }
    
    if (!this.filters.projectName || !this.filters.date) {
      console.error(`❌ Cannot load comparison data for ${cardTitle}: missing project (${this.filters.projectName}) or date (${this.filters.date})`);
      this.comparisonDataByCard[cardTitle] = [];
      return;
    }

    // Find the card and its API type
    const card = this.dashboardCards.find((c) => c.title === cardTitle);
    if (!card) {
      console.error(`❌ Card not found: ${cardTitle}. Available cards:`, this.dashboardCards.map(c => c.title));
      this.comparisonDataByCard[cardTitle] = [];
      return;
    }
    
    if (!card.apiType) {
      console.error(`❌ No API type found for card: ${cardTitle}`);
      this.comparisonDataByCard[cardTitle] = [];
      return;
    }

    const apiType = card.apiType;
    
    // Use comparisonFilters, fallback to main filters
    const projectName = this.comparisonFilters.projectName || this.filters.projectName;
    const date = this.comparisonFilters.date || this.filters.date;
    
    // Normalize project name for consistent cache key (same as used elsewhere)
    const normalizeProjectName = (name: string): string => {
      return name.toLowerCase().trim();
    };
    const normalizedProjectName = normalizeProjectName(projectName);
    
    // Create cache key: normalizedProjectName_date_apiType
    const cacheKey = `${normalizedProjectName}_${date}_${apiType}`;
    
    console.log(`🔍 Checking cache for ${cardTitle} (${apiType}) with key: ${cacheKey}`);
    console.log(`🔍 Current filters - Project: "${projectName}", Date: "${date}"`);
    
    // Check if data is already cached for this project/date/apiType combination
    if (this.comparisonDataCache[cacheKey]) {
      const cachedEntry = this.comparisonDataCache[cacheKey];
      const cachedProjectNormalized = normalizeProjectName(cachedEntry.projectName);
      
      // Verify cache entry matches current project/date (using normalized names)
      if (cachedProjectNormalized === normalizedProjectName && 
          cachedEntry.date === date) {
        console.log(`✅ Using cached data for ${cardTitle} (${apiType}) - Project: ${projectName}, Date: ${date}, Items: ${cachedEntry.data.length}`);
        this.comparisonDataByCard[cardTitle] = cachedEntry.data;
        return;
      } else {
        console.log(`⚠️ Cache key exists but project/date mismatch - clearing cache entry`);
        console.log(`   Cached: Project="${cachedEntry.projectName}" (normalized: "${cachedProjectNormalized}"), Date="${cachedEntry.date}"`);
        console.log(`   Current: Project="${projectName}" (normalized: "${normalizedProjectName}"), Date="${date}"`);
        // Remove invalid cache entry
        delete this.comparisonDataCache[cacheKey];
      }
    }
    
    // Check if data is already loaded in comparisonDataByCard for this card
    if (this.comparisonDataByCard[cardTitle] && this.comparisonDataByCard[cardTitle].length > 0) {
      // Verify the data matches current project/date by checking a sample item
      const sampleItem = this.comparisonDataByCard[cardTitle][0];
      if (sampleItem && 
          sampleItem.project_name === this.filters.projectName.trim() &&
          sampleItem.date === this.filters.date &&
          sampleItem.apiType === apiType) {
        console.log(`✅ Reusing existing data for ${cardTitle} (${apiType}) - Project: ${this.filters.projectName}, Date: ${this.filters.date}`);
        // Cache it for future use (use normalized cache key)
        this.comparisonDataCache[cacheKey] = {
          data: this.comparisonDataByCard[cardTitle],
          projectName: this.filters.projectName.trim(),
          date: this.filters.date
        };
        return;
      }
    }
    
    // Check if we can reuse data from rawData if it matches current filters
    if (this.rawData && this.rawData.length > 0) {
      const matchingRawData = this.rawData.filter(item => 
        item.apiType === apiType &&
        item.project_name === this.filters.projectName.trim() &&
        item.date === this.filters.date
      );
      
      if (matchingRawData.length > 0) {
        console.log(`✅ Reusing data from rawData for ${cardTitle} (${apiType}) - Found ${matchingRawData.length} items`);
        this.comparisonDataByCard[cardTitle] = matchingRawData;
        // Cache it for future use (use normalized cache key)
        this.comparisonDataCache[cacheKey] = {
          data: matchingRawData,
          projectName: this.filters.projectName.trim(),
          date: this.filters.date
        };
        return;
      }
    }
    
    console.log(`🔄 Loading comparison data for card: ${cardTitle} (${apiType}) - Fetching from API...`);

    // Get endpoint configuration for this API type
    // Endpoints match API specification:
    // - inventory_filter: requires asset_type
    // - distress_report_filter: requires distress_type
    // - distress_predic_filter: requires distress_type
    // - tis_filter, pms_filter, rwfis_filter, ais_filter: no additional fields
    const endpointConfigMap: { [key: string]: { endpoint: string; requestBody: any } } = {
      'inventory': {
        endpoint: 'https://fantastic-reportapi-production.up.railway.app/inventory_filter',
        requestBody: {
          chainage_start: 0,
          chainage_end:1381, // per API spec: 0 means full chainage range
          date: date,
          direction: ['All'],
          project_name: [projectName.trim()],
          asset_type: ['All'],
        }
      },
      'reported': {
        endpoint: 'https://fantastic-reportapi-production.up.railway.app/distress_report_filter',
        requestBody: {
          chainage_start: 0,
          chainage_end: 1381, // per API spec: 0 means full chainage range
          date: date,
          direction: ['All'],
          project_name: [projectName.trim()],
          distress_type: ['All'],
        }
      },
      'predicted': {
        endpoint: 'https://fantastic-reportapi-production.up.railway.app/distress_predic_filter',
        requestBody: {
          chainage_start: 0,
          chainage_end: 1381, // per API spec: 0 means full chainage range
          date: date,
          direction: ['All'],
          project_name: [projectName.trim()],
          distress_type: ['All'],
        }
      },
      'ais': {
        endpoint: 'https://fantastic-reportapi-production.up.railway.app/ais_filter',
        requestBody: {
          chainage_start: 0,
          chainage_end: 1381, // per API spec: 0 means full chainage range
          date: date,
          direction: ['All'],
          project_name: [projectName.trim()],
        }
      },
      'pms': {
        endpoint: 'https://fantastic-reportapi-production.up.railway.app/pms_filter',
        requestBody: {
          chainage_start: 0,
          chainage_end: 1381, // per API spec: 0 means full chainage range
          date: date,
          direction: ['All'],
          project_name: [projectName.trim()],
        }
      },
      'rwfis': {
        endpoint: 'https://fantastic-reportapi-production.up.railway.app/rwfis_filter',
        requestBody: {
          chainage_start: 0,
          chainage_end: 1381, // per API spec: 0 means full chainage range
          date: date,
          direction: ['All'],
          project_name: [projectName.trim()],
        }
      },
      'tis': {
        endpoint: 'https://fantastic-reportapi-production.up.railway.app/tis_filter',
        requestBody: {
          chainage_start: 0,
          chainage_end: 1381, // per API spec: 0 means full chainage range
          date: date,
          direction: ['All'],
          project_name: [projectName.trim()],
        }
      },
    };

    const config = endpointConfigMap[apiType];
    if (!config) {
      console.warn(`⚠️ No endpoint configuration for API type: ${apiType}`);
      this.comparisonDataByCard[cardTitle] = [];
      return;
    }

    try {
      // Helper to normalize (kept only to resolve exact project name casing)
      const normalizeProjectName = (name: string): string =>
        name.toLowerCase().trim();

      // Resolve exact project name for this API type, but DO NOT touch the date.
      let exactProjectName = projectName.trim();
      const normalizedProjectNameForLookup = projectName
        ? normalizeProjectName(projectName)
        : null;
      const originalNamesMap = this.originalProjectNamesByApiType?.[apiType];
      const rawProjectDates = this.rawProjectDatesByApiType?.[apiType];

      if (
        originalNamesMap &&
        normalizedProjectNameForLookup &&
        originalNamesMap[normalizedProjectNameForLookup]
      ) {
        exactProjectName = originalNamesMap[normalizedProjectNameForLookup];
        console.log(
          `✅ ${apiType}: Using exact project name: "${exactProjectName}" (normalized: "${normalizedProjectNameForLookup}")`
        );
      } else if (rawProjectDates && normalizedProjectNameForLookup) {
        const projectKeys = Object.keys(rawProjectDates);
        const matchingKey = projectKeys.find(
          (key) => normalizeProjectName(key) === normalizedProjectNameForLookup
        );
        if (matchingKey) {
          exactProjectName = matchingKey;
          console.log(
            `✅ ${apiType}: Found exact project name from raw response: "${exactProjectName}"`
          );
        } else {
          console.warn(
            `⚠️ ${apiType}: Could not find exact project name, using: "${exactProjectName}"`
          );
        }
      }

      // If we still don't have a per-endpoint exact name (e.g. this API type wasn't loaded on main dashboard),
      // fetch projects-dates for this API type so we use the exact casing this endpoint expects.
      if (
        normalizedProjectNameForLookup &&
        exactProjectName === projectName.trim() &&
        (!originalNamesMap || !originalNamesMap[normalizedProjectNameForLookup])
      ) {
        const projectsDatesEndpointMap: { [key: string]: string } = {
          inventory: 'https://fantastic-reportapi-production.up.railway.app/projects-dates/inventory',
          reported: 'https://fantastic-reportapi-production.up.railway.app/projects-dates/distress_reported',
          predicted: 'https://fantastic-reportapi-production.up.railway.app/projects-dates/distress_predicted',
          tis: 'https://fantastic-reportapi-production.up.railway.app/projects-dates/tis',
          ais: 'https://fantastic-reportapi-production.up.railway.app/projects-dates/ais',
          pms: 'https://fantastic-reportapi-production.up.railway.app/projects-dates/pms',
          rwfis: 'https://fantastic-reportapi-production.up.railway.app/projects-dates/rwfis',
        };
        const projectsDatesUrl = projectsDatesEndpointMap[apiType];
        if (projectsDatesUrl) {
          try {
            const pdResponse = await fetch(projectsDatesUrl, {
              method: 'GET',
              headers: { accept: 'application/json' },
            });
            if (pdResponse.ok) {
              const rawProjectDatesForType: ProjectDatesResponse = await pdResponse.json();
              const projectKeys = Object.keys(rawProjectDatesForType || {});
              const matchingKey = projectKeys.find(
                (key) => normalizeProjectName(key) === normalizedProjectNameForLookup
              );
              if (matchingKey) {
                exactProjectName = matchingKey;
                console.log(
                  `✅ ${apiType}: Using exact project name from projects-dates: "${exactProjectName}"`
                );
                // Cache for future use
                if (!this.rawProjectDatesByApiType) this.rawProjectDatesByApiType = {};
                this.rawProjectDatesByApiType[apiType] = rawProjectDatesForType;
                if (!this.originalProjectNamesByApiType) this.originalProjectNamesByApiType = {};
                const orig: { [norm: string]: string } = {};
                projectKeys.forEach((key) => {
                  orig[normalizeProjectName(key)] = key;
                });
                this.originalProjectNamesByApiType[apiType] = orig;
              }
            }
          } catch (e) {
            console.warn(`⚠️ ${apiType}: Could not fetch projects-dates for exact name:`, e);
          }
        }
      }

      // Create request body with the EXACT filters the user selected.
      // IMPORTANT: We do NOT modify the date here anymore.
      const requestBody = {
        ...config.requestBody,
        date, // use the exact date selected in filters
        project_name: [exactProjectName],
      };
      
      console.log(`📤 Fetching comparison data for ${cardTitle} (${apiType})`);
      console.log(`📤 Request details:`, {
        endpoint: config.endpoint,
        date,
        project_name: exactProjectName,
        fullRequestBody: requestBody,
      });

      console.log(`🌐 Making API call to: ${config.endpoint}`);
      console.log(`📦 Request body:`, JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log(`📡 Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HTTP error for ${cardTitle} (${apiType}):`, {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          endpoint: config.endpoint,
          requestBody: requestBody
        });
        this.comparisonDataByCard[cardTitle] = [];
        return;
      }

      const apiResponse = await response.json();
      console.log(`📥 API Response for ${cardTitle} (${apiType}):`, apiResponse);
      console.log(`📥 API Response type for ${apiType}:`, typeof apiResponse, Array.isArray(apiResponse) ? `Array[${apiResponse.length}]` : '');

      // Use the cache key that was defined earlier (based on user's selected date)
      // Note: We cache by user's selected date, not the dateToUse, so cache is consistent
      const finalCacheKey = cacheKey;

      // Handle "No match" response or empty array
      if (Array.isArray(apiResponse) && apiResponse.length === 0) {
        console.warn(`⚠️ ${cardTitle} (${apiType}) API returned empty array`);
        this.comparisonDataByCard[cardTitle] = [];
        // Cache empty result to avoid re-fetching (use normalized cache key)
        this.comparisonDataCache[finalCacheKey] = {
          data: [],
          projectName: projectName.trim(),
          date: date
        };
        return;
      }
      
      // Check if response is null or undefined
      if (!apiResponse) {
        console.warn(`⚠️ ${cardTitle} (${apiType}) API returned null or undefined`);
        this.comparisonDataByCard[cardTitle] = [];
        // Cache empty result to avoid re-fetching (use normalized cache key)
        this.comparisonDataCache[finalCacheKey] = {
          data: [],
          projectName: projectName.trim(),
          date: date
        };
        return;
      }

      // Flatten nested arrays (same logic as main loadData method)
      const flatData: any[] = [];
      
      // Special handling for AIS - use simpler flattening like the AIS dashboard
      if (apiType === 'ais') {
        if (Array.isArray(apiResponse)) {
          // Use flat() method like AIS dashboard does
          flatData.push(...apiResponse.flat());
        } else if (apiResponse && typeof apiResponse === 'object') {
          if (apiResponse.detail) {
            console.error(`API returned error for ${apiType}:`, apiResponse.detail);
            this.comparisonDataByCard[cardTitle] = [];
            return;
          }
          // Try to find data in common properties
          if (Array.isArray(apiResponse.data)) {
            flatData.push(...apiResponse.data.flat());
          } else if (Array.isArray(apiResponse.result)) {
            flatData.push(...apiResponse.result.flat());
          }
        }
      } else {
        // Standard flattening for other API types
        if (Array.isArray(apiResponse)) {
          apiResponse.forEach((group) => {
            if (Array.isArray(group)) {
              flatData.push(...group);
            } else if (group && typeof group === 'object') {
              flatData.push(group);
            }
          });
        } else if (apiResponse && typeof apiResponse === 'object') {
          // Handle "No match" or error messages BEFORE flattening
          if (apiResponse.message) {
            const message = apiResponse.message.toLowerCase();
            if (message === 'no match' || message.includes('no data') || message.includes('not found')) {
              console.warn(`⚠️ ${cardTitle} (${apiType}) API returned: ${apiResponse.message} for project: ${exactProjectName}, date: ${date}`);
              this.comparisonDataByCard[cardTitle] = [];
              // Cache empty result to avoid re-fetching (use normalized cache key)
              this.comparisonDataCache[finalCacheKey] = {
                data: [],
                projectName: this.filters.projectName.trim(),
                date: this.filters.date
              };
              return;
            }
          }
          if (apiResponse.detail) {
            console.error(`API returned error for ${apiType}:`, apiResponse.detail);
            this.comparisonDataByCard[cardTitle] = [];
            // Cache empty result to avoid re-fetching (use normalized cache key)
            this.comparisonDataCache[finalCacheKey] = {
              data: [],
              projectName: this.filters.projectName.trim(),
              date: this.filters.date
            };
            return;
          }
          if (Array.isArray(apiResponse.data)) {
            apiResponse.data.forEach((group: any) => {
              if (Array.isArray(group)) {
                flatData.push(...group);
              } else {
                flatData.push(group);
              }
            });
          } else if (Array.isArray(apiResponse.result)) {
            apiResponse.result.forEach((group: any) => {
              if (Array.isArray(group)) {
                flatData.push(...group);
              } else {
                flatData.push(group);
              }
            });
          }
        }
      }
      
      console.log(`📊 Flattened ${flatData.length} items for ${cardTitle} (${apiType})`);

      // Transform data
      console.log(`🔄 Transforming ${flatData.length} flat items for ${cardTitle} (${apiType})`);
      if (flatData.length === 0) {
        console.warn(`⚠️ ${cardTitle} (${apiType}): No flat data to transform. Check API response structure.`);
        this.comparisonDataByCard[cardTitle] = [];
        // Cache empty result to avoid re-fetching (use normalized cache key)
        this.comparisonDataCache[finalCacheKey] = {
          data: [],
          projectName: projectName.trim(),
          date: date
        };
        return;
      }
      
      const transformed = this.transformDataByApiType(flatData, apiType);
      this.comparisonDataByCard[cardTitle] = transformed;
      
      // Cache the fetched data for future use (use normalized cache key)
      this.comparisonDataCache[finalCacheKey] = {
        data: transformed,
        projectName: projectName.trim(),
        date: date
      };
      
      console.log(`✅ Successfully loaded ${transformed.length} transformed items for ${cardTitle} (${apiType})`);
      console.log(`✅ Stored in comparisonDataByCard['${cardTitle}'] and cached with key: ${cacheKey}`);
      
      if (transformed.length > 0) {
        console.log(`📊 Sample transformed item:`, transformed[0]);
      }
    } catch (error) {
      console.error(`❌ Error loading comparison data for ${cardTitle} (${apiType}):`, error);
      console.error(`❌ Error details:`, {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        cardTitle,
        apiType
      });
      this.comparisonDataByCard[cardTitle] = [];
    }
  }

  // Load data for comparison chart cards independently (legacy method - kept for backward compatibility)
  async loadComparisonChartData() {
    if (!this.isBrowser || !this.filters.projectName || !this.filters.date) {
      console.warn('⚠️ Cannot load comparison data: missing project or date');
      this.comparisonChartData = [];
      return;
    }

    if (this.selectedCardsForComparison.size === 0) {
      console.log('📊 No cards selected for comparison');
      this.comparisonChartData = [];
      return;
    }

    this.isLoadingComparisonData = true;
    console.log('🔄 Loading comparison chart data for cards:', Array.from(this.selectedCardsForComparison));

    try {
      // Get API types for selected comparison cards
      const apiTypesForComparison = new Set<string>();
      this.selectedCardsForComparison.forEach((cardTitle) => {
        const card = this.dashboardCards.find((c) => c.title === cardTitle);
        if (card && card.apiType) {
          apiTypesForComparison.add(card.apiType);
        }
      });

      if (apiTypesForComparison.size === 0) {
        console.warn('⚠️ No valid API types found for selected comparison cards');
        this.comparisonChartData = [];
        this.isLoadingComparisonData = false;
        return;
      }

      // Get endpoints and request bodies for selected API types (same as loadData)
      const endpointConfigMap: { [key: string]: { endpoint: string; requestBody: any } } = {
        'inventory': {
          endpoint: 'https://fantastic-reportapi-production.up.railway.app/inventory_filter',
          requestBody: {
            chainage_start: 0,
            chainage_end: 1381, // Fetch full range, filter client-side
            date: this.filters.date,
            direction: ['All'],
            project_name: [this.filters.projectName.trim()],
            asset_type: ['All'],
          }
        },
        'reported': {
          endpoint: 'https://fantastic-reportapi-production.up.railway.app/distress_report_filter',
          requestBody: {
            chainage_start: 0,
            chainage_end: 1381, // Fetch full range, filter client-side
            date: this.filters.date,
            direction: ['All'],
            project_name: [this.filters.projectName.trim()],
            distress_type: ['All'],
          }
        },
        'predicted': {
          endpoint: 'https://fantastic-reportapi-production.up.railway.app/distress_predic_filter',
          requestBody: {
            chainage_start: 0,
            chainage_end: 1381, // Fetch full range, filter client-side
            date: this.filters.date,
            direction: ['All'],
            project_name: [this.filters.projectName.trim()],
            distress_type: ['All'],
          }
        },
        'ais': {
          endpoint: 'https://fantastic-reportapi-production.up.railway.app/ais_filter',
          requestBody: {
            chainage_start: 0,
            chainage_end: 1381, // Fetch full range, filter client-side
            date: this.filters.date,
            direction: ['All'],
            project_name: [this.filters.projectName.trim()],
          }
        },
        'pms': {
          endpoint: 'https://fantastic-reportapi-production.up.railway.app/pms_filter',
          requestBody: {
            chainage_start: 0,
            chainage_end: 1381, // Fetch full range, filter client-side
            date: this.filters.date,
            direction: ['All'],
            project_name: [this.filters.projectName.trim()],
          }
        },
        'rwfis': {
          endpoint: 'https://fantastic-reportapi-production.up.railway.app/rwfis_filter',
          requestBody: {
            chainage_start: 0,
            chainage_end: 1381, // Fetch full range, filter client-side
            date: this.filters.date,
            direction: ['All'],
            project_name: [this.filters.projectName.trim()],
          }
        },
        'tis': {
          endpoint: 'https://fantastic-reportapi-production.up.railway.app/tis_filter',
          requestBody: {
            chainage_start: 0,
            chainage_end: 1381, // Fetch full range, filter client-side
            date: this.filters.date,
            direction: ['All'],
            project_name: [this.filters.projectName.trim()],
          }
        },
      };

      // Fetch data for all selected API types
      const fetchPromises = Array.from(apiTypesForComparison)
        .map(async (apiType) => {
          const config = endpointConfigMap[apiType];
          if (!config) {
            console.warn(`No endpoint configuration for API type: ${apiType}`);
            return { apiType, data: [], flatData: [] };
          }

          // Get exact project name for this API type (handle "Abu Road to Swaroopganj" vs "Abu Road to swaroopganj" etc.)
          let exactProjectName = this.filters.projectName.trim();
          const originalNamesMap = this.originalProjectNamesByApiType?.[apiType];
          const rawProjectDates = this.rawProjectDatesByApiType?.[apiType];
          const normalizedProjectName = this.filters.projectName ? this.filters.projectName.toLowerCase().trim() : null;
          
          if (originalNamesMap && normalizedProjectName && originalNamesMap[normalizedProjectName]) {
            exactProjectName = originalNamesMap[normalizedProjectName];
          } else if (rawProjectDates && normalizedProjectName) {
            const projectKeys = Object.keys(rawProjectDates);
            const matchingKey = projectKeys.find(key => key.toLowerCase().trim() === normalizedProjectName);
            if (matchingKey) {
              exactProjectName = matchingKey;
            }
          }

          // On-demand: if we still don't have per-endpoint name, fetch this API's projects-dates for exact casing
          if (normalizedProjectName && exactProjectName === this.filters.projectName.trim() && (!originalNamesMap || !originalNamesMap[normalizedProjectName])) {
            const projectsDatesEndpointMap: { [key: string]: string } = {
              inventory: 'https://fantastic-reportapi-production.up.railway.app/projects-dates/inventory',
              reported: 'https://fantastic-reportapi-production.up.railway.app/projects-dates/distress_reported',
              predicted: 'https://fantastic-reportapi-production.up.railway.app/projects-dates/distress_predicted',
              tis: 'https://fantastic-reportapi-production.up.railway.app/projects-dates/tis',
              ais: 'https://fantastic-reportapi-production.up.railway.app/projects-dates/ais',
              pms: 'https://fantastic-reportapi-production.up.railway.app/projects-dates/pms',
              rwfis: 'https://fantastic-reportapi-production.up.railway.app/projects-dates/rwfis',
            };
            const projectsDatesUrl = projectsDatesEndpointMap[apiType];
            if (projectsDatesUrl) {
              try {
                const pdResponse = await fetch(projectsDatesUrl, { method: 'GET', headers: { accept: 'application/json' } });
                if (pdResponse.ok) {
                  const rawProjectDatesForType: ProjectDatesResponse = await pdResponse.json();
                  const projectKeys = Object.keys(rawProjectDatesForType || {});
                  const matchingKey = projectKeys.find((key) => key.toLowerCase().trim() === normalizedProjectName);
                  if (matchingKey) {
                    exactProjectName = matchingKey;
                    if (!this.rawProjectDatesByApiType) this.rawProjectDatesByApiType = {};
                    this.rawProjectDatesByApiType[apiType] = rawProjectDatesForType;
                    if (!this.originalProjectNamesByApiType) this.originalProjectNamesByApiType = {};
                    const orig: { [norm: string]: string } = {};
                    projectKeys.forEach((key) => { orig[key.toLowerCase().trim()] = key; });
                    this.originalProjectNamesByApiType[apiType] = orig;
                  }
                }
              } catch (e) {
                console.warn(`⚠️ ${apiType}: Could not fetch projects-dates for exact name:`, e);
              }
            }
          }

          const requestBody = { ...config.requestBody, project_name: [exactProjectName] };

          try {
            const response = await fetch(config.endpoint, {
              method: 'POST',
              headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
              console.error(`❌ HTTP error for ${apiType} in comparison chart`);
              return { apiType, data: [], flatData: [] };
            }

            const apiResponse = await response.json();

            // Handle "No match" response
            if (apiResponse && typeof apiResponse === 'object' && apiResponse.message) {
              const message = apiResponse.message.toLowerCase();
              if (message === 'no match' || message.includes('no data') || message.includes('not found')) {
                console.warn(`⚠️ ${apiType} API returned: ${apiResponse.message}`);
                return { apiType, data: [], flatData: [] };
              }
            }

            // Flatten nested arrays
            const flatData: any[] = [];
            if (apiType === 'ais') {
              if (Array.isArray(apiResponse)) {
                flatData.push(...apiResponse.flat());
              } else if (apiResponse && typeof apiResponse === 'object') {
                if (Array.isArray(apiResponse.data)) {
                  flatData.push(...apiResponse.data.flat());
                } else if (Array.isArray(apiResponse.result)) {
                  flatData.push(...apiResponse.result.flat());
                }
              }
            } else {
              if (Array.isArray(apiResponse)) {
                apiResponse.forEach((group) => {
                  if (Array.isArray(group)) {
                    flatData.push(...group);
                  } else if (group && typeof group === 'object') {
                    flatData.push(group);
                  }
                });
              } else if (apiResponse && typeof apiResponse === 'object') {
                if (Array.isArray(apiResponse.data)) {
                  apiResponse.data.forEach((group: any) => {
                    if (Array.isArray(group)) {
                      flatData.push(...group);
                    } else {
                      flatData.push(group);
                    }
                  });
                } else if (Array.isArray(apiResponse.result)) {
                  apiResponse.result.forEach((group: any) => {
                    if (Array.isArray(group)) {
                      flatData.push(...group);
                    } else {
                      flatData.push(group);
                    }
                  });
                }
              }
            }

            console.log(`📊 Comparison chart: Loaded ${flatData.length} items for ${apiType}`);
            return { apiType, data: apiResponse, flatData };
          } catch (error) {
            console.error(`Error fetching ${apiType} for comparison chart:`, error);
            return { apiType, data: [], flatData: [] };
          }
        });

      const results = await Promise.all(fetchPromises);
      
      // Transform and combine all data
      const allTransformedData: ReportData[] = [];
      results.forEach(({ apiType, flatData }) => {
        if (flatData && flatData.length > 0) {
          const transformed = this.transformDataByApiType(flatData, apiType);
          allTransformedData.push(...transformed);
        }
      });

      this.comparisonChartData = allTransformedData;
      console.log(`✅ Comparison chart data loaded: ${allTransformedData.length} total items`);
      
      // Log breakdown by API type
      const dataByApiType: { [key: string]: number } = {};
      allTransformedData.forEach(item => {
        if (item.apiType) {
          dataByApiType[item.apiType] = (dataByApiType[item.apiType] || 0) + 1;
        }
      });
      console.log('📊 Comparison chart data by API type:', dataByApiType);
      
      // Initialize chainage range based on loaded data if it's still at default narrow range
      if (allTransformedData.length > 0 && 
          (this.comparisonChainageMin === 0 && this.comparisonChainageMax === 1)) {
        const minChainage = Math.floor(Math.min(...allTransformedData.map((item) => item.chainage_start || 0)));
        const maxChainage = Math.ceil(Math.max(...allTransformedData.map((item) => item.chainage_end || 0)));
        // Only set if we have valid chainage values
        if (maxChainage > minChainage && maxChainage > 0) {
          this.comparisonChainageMin = minChainage;
          this.comparisonChainageMax = maxChainage;
          console.log(`📊 Initialized chainage range from comparison data: ${minChainage} - ${maxChainage} km`);
        }
      } else if (allTransformedData.length === 0 && 
                 (this.comparisonChainageMin === 0 && this.comparisonChainageMax === 1)) {
        // No comparison data loaded - use project-specific range from filters
        if (this.filters.chainageRange && 
            this.filters.chainageRange.min >= 0 && 
            this.filters.chainageRange.max > this.filters.chainageRange.min &&
            this.filters.chainageRange.max < 1381) {
          this.comparisonChainageMin = this.filters.chainageRange.min;
          this.comparisonChainageMax = this.filters.chainageRange.max;
          console.log(`📊 Initialized chainage range from project filter: ${this.comparisonChainageMin} - ${this.comparisonChainageMax} km (Project: ${this.filters.projectName})`);
        }
      }
      
      // Update comparison card assets after data is loaded
      this.updateComparisonCardAssets();
    } catch (error) {
      console.error('❌ Error loading comparison chart data:', error);
      this.comparisonChartData = [];
      this.comparisonCardAssetsMap = {};
    } finally {
      this.isLoadingComparisonData = false;
    }
  }

  // Toggle card selection for comparison
  async toggleCardForComparison(cardTitle: string) {
    console.log(`🔄 Toggling card for comparison: ${cardTitle}`);
    
    if (this.selectedCardsForComparison.has(cardTitle)) {
      // Card is being deselected
      console.log(`❌ Deselecting card: ${cardTitle}`);
      this.selectedCardsForComparison.delete(cardTitle);
      // Clear selected assets for this card when card is deselected
      delete this.selectedAssetsForComparison[cardTitle];
      // Remove data for this card
      delete this.comparisonDataByCard[cardTitle];
      console.log(`✅ Removed data for ${cardTitle}`);
    } else {
      // Card is being selected
      if (this.selectedCardsForComparison.size < 5) {
        console.log(`✅ Selecting card: ${cardTitle}`);
        this.selectedCardsForComparison.add(cardTitle);
        // Initialize selected assets set for this card
        if (!this.selectedAssetsForComparison[cardTitle]) {
          this.selectedAssetsForComparison[cardTitle] = new Set();
        }
        // Load data for this specific card when clicked
        console.log(`📥 Loading data for ${cardTitle}...`);
        try {
          await this.loadComparisonChartDataForCard(cardTitle);
          const loadedData = this.comparisonDataByCard[cardTitle] || [];
          console.log(`✅ Data loading completed for ${cardTitle}. Items loaded: ${loadedData.length}`);
          if (loadedData.length === 0) {
            console.warn(`⚠️ Warning: ${cardTitle} loaded 0 items. Check console for API response details.`);
          }
        } catch (error) {
          console.error(`❌ Failed to load data for ${cardTitle}:`, error);
        }
      } else {
        console.warn('Maximum 5 cards can be selected for comparison');
        return;
      }
    }
    
    // Update combined comparison data (this will also regenerate the chart)
    this.updateCombinedComparisonData();
    
    console.log(`📊 Chart regenerated after toggling ${cardTitle}`);
  }

  // Toggle asset selection for comparison
  toggleAssetForComparison(cardTitle: string, assetName: string) {
    if (!this.selectedAssetsForComparison[cardTitle]) {
      this.selectedAssetsForComparison[cardTitle] = new Set();
    }

    if (this.selectedAssetsForComparison[cardTitle].has(assetName)) {
      this.selectedAssetsForComparison[cardTitle].delete(assetName);
    } else {
      this.selectedAssetsForComparison[cardTitle].add(assetName);
    }

    // Regenerate chart with asset filter
    this.generateChainageComparisonChart();
  }

  // Check if asset is selected for comparison
  isAssetSelectedForComparison(cardTitle: string, assetName: string): boolean {
    return this.selectedAssetsForComparison[cardTitle]?.has(assetName) || false;
  }

  // Filter data by selected assets for a card
  private filterDataByAsset(cardTitle: string, apiType: string, data: ReportData[]): ReportData[] {
    const selectedAssets = this.selectedAssetsForComparison[cardTitle];
    
    // If no assets selected, return all data for this card
    if (!selectedAssets || selectedAssets.size === 0) {
      return data;
    }

    // Special handling for Reported (distress_type matching)
    if (cardTitle === 'Reported') {
      return data.filter(item => {
        const distressType = item.distress_type || '';
        return selectedAssets.has(distressType);
      });
    }

    // Special handling for Predicted (distress_type or individual distress fields)
    if (cardTitle === 'Predicted') {
      const distressNameMap: { [key: string]: string } = {
        'Rough Spot': 'rough_spot',
        'Pothole': 'pothole',
        'Hotspots': 'hotspots',
        'Edge Break': 'edge_break',
        'Alligator Crack': 'alligator_crack',
        'Transverse Crack': 'transverse_crack',
        'Longitudinal Crack': 'longitudinal_crack',
        'Hairline Crack': 'hairline_crack',
        'Patchwork': 'patchwork',
        'Rutting': 'rutting',
        'Bleeding': 'bleeding',
        'Raveling': 'raveling'
      };

      return data.filter(item => {
        // Check distress_type first
        if (selectedAssets.has(item.distress_type || '')) {
          return true;
        }
        
        // Check individual distress fields
        for (const assetName of selectedAssets) {
          const fieldName = distressNameMap[assetName];
          if (fieldName) {
            const value = item[fieldName as keyof ReportData] as number;
            if (value != null && value !== undefined && value > 0) {
              return true;
            }
          }
        }
        
        return false;
      });
    }

    // Map asset display names to field names/values for filtering
    const assetNameToFieldMap: { [cardTitle: string]: { [assetName: string]: (item: ReportData) => boolean } } = {
      'Inventory': this.getInventoryAssetFilterMap(),
      'AIS': this.getAisAssetFilterMap(),
      'PMS': this.getPmsAssetFilterMap(),
      'TIS': {}, // TIS has single asset, no filtering needed
      'RWFIS': {}, // RWFIS has single asset, no filtering needed
    };

    const filterMap = assetNameToFieldMap[cardTitle] || {};
    
    return data.filter(item => {
      // Check if item matches any selected asset
      for (const assetName of selectedAssets) {
        const filterFn = filterMap[assetName];
        if (filterFn && filterFn(item)) {
          return true;
        }
      }
      return false;
    });
  }

  // Get inventory asset filter map
  private getInventoryAssetFilterMap(): { [assetName: string]: (item: ReportData) => boolean } {
    const assetNameMap: { [key: string]: string } = {
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
      'Manhole': 'manhole',
      'Chamber': 'chamber', // Special case - combines circular_chamber + rectangular_chamber
      'Drinking Water': 'drinking_water',
      'Storm Water': 'storm_water',
      'STP Sinkhole': 'stp_sinkhole',
      'Fire Hydrant': 'fire_hydrant'
    };

    const filterMap: { [assetName: string]: (item: ReportData) => boolean } = {};
    
    Object.keys(assetNameMap).forEach(assetName => {
      const fieldName = assetNameMap[assetName];
      if (fieldName === 'chamber') {
        // Special handling for Chamber (circular + rectangular)
        filterMap[assetName] = (item: ReportData) => {
          const rawItem = item._rawItem || {};
          return (rawItem['circular_chamber'] && rawItem['circular_chamber'] > 0) ||
                 (rawItem['rectangular_chamber'] && rawItem['rectangular_chamber'] > 0);
        };
      } else {
        filterMap[assetName] = (item: ReportData) => {
          const rawItem = item._rawItem || {};
          const value = rawItem[fieldName];
          return value != null && value !== undefined && value !== 0;
        };
      }
    });
    
    return filterMap;
  }

  // Get reported asset filter map (by distress_type)
  private getReportedAssetFilterMap(): { [assetName: string]: (item: ReportData) => boolean } {
    const filterMap: { [assetName: string]: (item: ReportData) => boolean } = {};
    
    // For Reported, assets are distress types - match directly by distress_type field
    // We'll build this dynamically based on available assets
    return filterMap;
  }

  // Get predicted asset filter map
  private getPredictedAssetFilterMap(): { [assetName: string]: (item: ReportData) => boolean } {
    const distressNameMap: { [key: string]: string } = {
      'Rough Spot': 'rough_spot',
      'Pothole': 'pothole',
      'Hotspots': 'hotspots',
      'Edge Break': 'edge_break',
      'Alligator Crack': 'alligator_crack',
      'Transverse Crack': 'transverse_crack',
      'Longitudinal Crack': 'longitudinal_crack',
      'Hairline Crack': 'hairline_crack',
      'Patchwork': 'patchwork',
      'Rutting': 'rutting',
      'Bleeding': 'bleeding',
      'Raveling': 'raveling'
    };

    const filterMap: { [assetName: string]: (item: ReportData) => boolean } = {};
    
    // First, handle distress_type matching
    filterMap['distress_type'] = (item: ReportData) => {
      // This will be handled separately
      return true;
    };
    
    // Handle individual distress fields
    Object.keys(distressNameMap).forEach(assetName => {
      const fieldName = distressNameMap[assetName];
      filterMap[assetName] = (item: ReportData) => {
        const value = item[fieldName as keyof ReportData] as number;
        return value != null && value !== undefined && value > 0;
      };
    });
    
    return filterMap;
  }

  // Get AIS asset filter map
  private getAisAssetFilterMap(): { [assetName: string]: (item: ReportData) => boolean } {
    const accidentNameMap: { [key: string]: string } = {
      'Fatal Accident': 'fatal_accident',
      'Major Accident': 'major_accident',
      'Minor Accident': 'minor_accident',
      'Grievous Accident': 'grievous_accident',
      'Non-Injured Accident': 'non-injured_accident',
      'Fatalities': 'fatalities',
      'Total Injury': 'total_injury',
      'Total Accident': 'total_accident'
    };

    const filterMap: { [assetName: string]: (item: ReportData) => boolean } = {};
    
    Object.keys(accidentNameMap).forEach(assetName => {
      const fieldName = accidentNameMap[assetName];
      filterMap[assetName] = (item: ReportData) => {
        const rawItem = item._rawItem || {};
        const value = rawItem[fieldName];
        return value != null && value !== undefined && value !== 0;
      };
    });
    
    return filterMap;
  }

  // Count asset occurrences in a bin for tooltip
  private countAssetInBin(cardTitle: string, assetName: string, binData: ReportData[]): number {
    if (binData.length === 0) return 0;
    
    const card = this.dashboardCards.find((c) => c.title === cardTitle);
    if (!card || !card.apiType) return 0;
    
    // For Reported - count by distress_type
    if (cardTitle === 'Reported') {
      return binData.filter(item => item.distress_type === assetName).length;
    }
    
    // For Predicted - count by distress_type or individual fields
    if (cardTitle === 'Predicted') {
      const distressNameMap: { [key: string]: string } = {
        'Rough Spot': 'rough_spot',
        'Pothole': 'pothole',
        'Hotspots': 'hotspots',
        'Edge Break': 'edge_break',
        'Alligator Crack': 'alligator_crack',
        'Transverse Crack': 'transverse_crack',
        'Longitudinal Crack': 'longitudinal_crack',
        'Hairline Crack': 'hairline_crack',
        'Patchwork': 'patchwork',
        'Rutting': 'rutting',
        'Bleeding': 'bleeding',
        'Raveling': 'raveling'
      };
      
      // Count by distress_type first
      let count = binData.filter(item => item.distress_type === assetName).length;
      
      // Also count by individual field if it exists
      const fieldName = distressNameMap[assetName];
      if (fieldName) {
        count += binData.filter(item => {
          const value = item[fieldName as keyof ReportData] as number;
          return value != null && value !== undefined && value > 0;
        }).length;
      }
      
      return count;
    }
    
    // For Inventory
    if (cardTitle === 'Inventory') {
      const assetNameMap: { [key: string]: string } = {
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
        'Manhole': 'manhole',
        'Chamber': 'chamber',
        'Drinking Water': 'drinking_water',
        'Storm Water': 'storm_water',
        'STP Sinkhole': 'stp_sinkhole',
        'Fire Hydrant': 'fire_hydrant'
      };
      
      const fieldName = assetNameMap[assetName];
      if (!fieldName) return 0;
      
      if (fieldName === 'chamber') {
        return binData.filter(item => {
          const rawItem = item._rawItem || {};
          return (rawItem['circular_chamber'] && rawItem['circular_chamber'] > 0) ||
                 (rawItem['rectangular_chamber'] && rawItem['rectangular_chamber'] > 0);
        }).length;
      }
      
      return binData.filter(item => {
        const rawItem = item._rawItem || {};
        const value = rawItem[fieldName];
        return value != null && value !== undefined && value !== 0;
      }).length;
    }
    
    // For AIS
    if (cardTitle === 'AIS') {
      const accidentNameMap: { [key: string]: string } = {
        'Fatal Accident': 'fatal_accident',
        'Major Accident': 'major_accident',
        'Minor Accident': 'minor_accident',
        'Grievous Accident': 'grievous_accident',
        'Non-Injured Accident': 'non-injured_accident',
        'Fatalities': 'fatalities',
        'Total Injury': 'total_injury',
        'Total Accident': 'total_accident'
      };
      
      const fieldName = accidentNameMap[assetName];
      if (!fieldName) return 0;
      
      return binData.filter(item => {
        const rawItem = item._rawItem || {};
        const value = rawItem[fieldName];
        return value != null && value !== undefined && value !== 0;
      }).length;
    }
    
    // For PMS
    if (cardTitle === 'PMS') {
      const metricsNameMap: { [key: string]: string } = {
        'PCS Score': 'pavement_condition_score_(pcs):',
        'Temperature': 'temperature_(°c):',
        'Rainfall': 'rainfall_(mm):',
        'IRI': 'international_roughness_index_(iri):',
        'IRI Index': 'iri_index'
      };
      
      const fieldName = metricsNameMap[assetName];
      if (!fieldName) return 0;
      
      return binData.filter(item => {
        const rawItem = item._rawItem || {};
        const value = rawItem[fieldName];
        return value != null && value !== undefined && value !== '' && value !== 'N/A';
      }).length;
    }
    
    return 0;
  }

  // Get PMS asset filter map
  private getPmsAssetFilterMap(): { [assetName: string]: (item: ReportData) => boolean } {
    const metricsNameMap: { [key: string]: string } = {
      'PCS Score': 'pavement_condition_score_(pcs):',
      'Temperature': 'temperature_(°c):',
      'Rainfall': 'rainfall_(mm):',
      'IRI': 'international_roughness_index_(iri):',
      'IRI Index': 'iri_index'
    };

    const filterMap: { [assetName: string]: (item: ReportData) => boolean } = {};
    
    Object.keys(metricsNameMap).forEach(assetName => {
      const fieldName = metricsNameMap[assetName];
      filterMap[assetName] = (item: ReportData) => {
        const rawItem = item._rawItem || {};
        const value = rawItem[fieldName];
        return value != null && value !== undefined && value !== '' && value !== 'N/A';
      };
    });
    
    return filterMap;
  }

  // Check if card is selected for comparison
  isCardSelectedForComparison(cardTitle: string): boolean {
    return this.selectedCardsForComparison.has(cardTitle);
  }

  // Get card color for comparison
  getCardColorForComparison(cardTitle: string): string {
    const card = this.dashboardCards.find((c) => c.title === cardTitle);
    if (card && card.apiType) {
      return this.getColorForApiType(card.apiType);
    }
    return '#9E9E9E';
  }

  // Get card chip background color
  getCardChipBackgroundColor(cardTitle: string): string {
    if (this.selectedCardsForComparison.has(cardTitle)) {
      const color = this.getCardColorForComparison(cardTitle);
      return color + '20'; // Add transparency
    }
    return 'transparent';
  }

  // Generate chainage comparison chart
  generateChainageComparisonChart() {
    if (this.selectedCardsForComparison.size === 0) {
      this.chainageComparisonChartOptions = {
        title: {
          text: 'Please Select Cards to Compare',
          left: 'center',
          top: 'middle',
          textStyle: {
            color: '#ffffff',
            fontSize: 18
          }
        }
      };
      return;
    }

    // For comparison chart, use comparisonChartData (data loaded specifically for comparison chart)
    // This data is independent of main dashboard selection
    const comparisonData = (this.comparisonChartData || []).filter((item) => {
      // Filter by chainage range
      const matchesChainage =
        item.chainage_start <= this.comparisonChainageMax &&
        item.chainage_end >= this.comparisonChainageMin;
      
      // Filter by selected comparison cards (check if this item's API type matches any selected comparison card)
      let matchesSelectedCard = false;
      this.selectedCardsForComparison.forEach((cardTitle) => {
        const card = this.dashboardCards.find((c) => c.title === cardTitle);
        if (card && card.apiType && item.apiType === card.apiType) {
          matchesSelectedCard = true;
        }
      });
      
      // Filter by direction
      const matchesDirection = 
        !this.comparisonFilters.direction || 
        this.comparisonFilters.direction === 'All' ||
        (item.direction && item.direction.trim() === this.comparisonFilters.direction.trim());
      
      // Filter by pavement type
      const matchesPavementType = 
        !this.comparisonFilters.pavementType || 
        this.comparisonFilters.pavementType === 'All' ||
        (item.pavement_type && item.pavement_type.trim() === this.comparisonFilters.pavementType.trim());
      
      // Filter by lane
      const matchesLane = 
        !this.comparisonFilters.lane || 
        this.comparisonFilters.lane === 'All' ||
        (item.lane && item.lane.trim() === this.comparisonFilters.lane.trim());
      
      const matches = matchesChainage && matchesSelectedCard && matchesDirection && matchesPavementType && matchesLane;
      
      // Debug logging for first few items
      if (this.comparisonChartData.indexOf(item) < 3) {
        console.log(`🔍 Filter check for item ${this.comparisonChartData.indexOf(item)}:`, {
          chainage: `${item.chainage_start}-${item.chainage_end}`,
          matchesChainage,
          matchesSelectedCard,
          direction: `${item.direction} vs ${this.comparisonFilters.direction} = ${matchesDirection}`,
          pavementType: `${item.pavement_type} vs ${this.comparisonFilters.pavementType} = ${matchesPavementType}`,
          lane: `${item.lane} vs ${this.comparisonFilters.lane} = ${matchesLane}`,
          matches
        });
      }
      
      return matches;
    });

    // Log detailed information about available data
    const comparisonDataByApiType: { [key: string]: number } = {};
    this.comparisonChartData.forEach(item => {
      if (item.apiType) {
        comparisonDataByApiType[item.apiType] = (comparisonDataByApiType[item.apiType] || 0) + 1;
      }
    });
    console.log('📊 Comparison chart data by API type (all data in comparisonChartData):', comparisonDataByApiType);
    console.log('📊 Selected comparison cards:', Array.from(this.selectedCardsForComparison));
    console.log('📊 Current comparison filters:', this.comparisonFilters);
    console.log('📊 Comparison data count before filtering:', this.comparisonChartData.length);
    console.log('📊 Comparison data count after filtering:', comparisonData.length);
    
    // Log sample of filtered data
    if (comparisonData.length > 0) {
      console.log('✅ Sample filtered data (first 3 items):', comparisonData.slice(0, 3).map(item => ({
        apiType: item.apiType,
        direction: item.direction,
        pavement_type: item.pavement_type,
        lane: item.lane,
        chainage: `${item.chainage_start}-${item.chainage_end}`
      })));
    }

    if (comparisonData.length === 0) {
      console.log('❌ No filtered data for chainage comparison chart');
      console.log('📊 Comparison chart data count:', this.comparisonChartData.length);
      console.log('📊 Filter breakdown:', {
        chainageRange: `${this.comparisonChainageMin}-${this.comparisonChainageMax}`,
        direction: this.comparisonFilters.direction,
        pavementType: this.comparisonFilters.pavementType,
        lane: this.comparisonFilters.lane,
        selectedCards: Array.from(this.selectedCardsForComparison)
      });
      
      // Log sample of unfiltered data to help debug
      if (this.comparisonChartData.length > 0) {
        console.log('📊 Sample unfiltered data (first 3 items):', this.comparisonChartData.slice(0, 3).map(item => ({
          apiType: item.apiType,
          direction: item.direction,
          pavement_type: item.pavement_type,
          lane: item.lane,
          chainage: `${item.chainage_start}-${item.chainage_end}`
        })));
      }
      this.chainageComparisonChartOptions = {
        title: {
          text: 'No Data for Selected Filters',
          left: 'center',
          top: 'middle',
          textStyle: {
            color: '#ffffff',
            fontSize: 18
          },
          subtext: 'Try adjusting your filters or selecting different cards',
          subtextStyle: {
            color: '#cccccc',
            fontSize: 14
          }
        }
      };
      return;
    }

    const isTabletOrSmaller = window.innerWidth <= 1024;

    const chainageMin = this.comparisonChainageMin;
    const chainageMax = this.comparisonChainageMax;
    const binCount = 20;
    const binSize = (chainageMax - chainageMin) / binCount;

    const chainageBins: number[] = [];
    for (let i = 0; i <= binCount; i++) {
      chainageBins.push(chainageMin + (i * binSize));
    }

    const series: any[] = [];
    
    // Store card data by card title for tooltip calculations
    const cardDataMap: { [cardTitle: string]: ReportData[] } = {};

    // Log data breakdown by API type for debugging
    const dataByApiType: { [key: string]: number } = {};
    comparisonData.forEach(item => {
      if (item.apiType) {
        dataByApiType[item.apiType] = (dataByApiType[item.apiType] || 0) + 1;
      }
    });
    console.log('📊 Comparison chart data by API type:', dataByApiType);
    console.log('📊 Selected comparison cards:', Array.from(this.selectedCardsForComparison));

    this.selectedCardsForComparison.forEach((cardTitle) => {
      const card = this.dashboardCards.find((c) => c.title === cardTitle);
      if (!card || !card.apiType) {
        console.warn(`⚠️ Card "${cardTitle}" not found or has no apiType`);
        return;
      }

      const apiType = card.apiType;
      const cardColor = this.getColorForApiType(apiType);

      // Filter data for this card's API type from comparisonData
      let cardData = comparisonData.filter(
        (item) => item.apiType === apiType
      );

      // Apply asset filtering if assets are selected
      cardData = this.filterDataByAsset(cardTitle, apiType, cardData);
      
      // Store card data for tooltip calculations
      cardDataMap[cardTitle] = cardData;

      console.log(`📊 Card "${cardTitle}" (${apiType}): ${cardData.length} items in comparison data (after asset filtering)`);

      // Calculate count for each chainage bin
      const binData: number[] = new Array(binCount).fill(0);

      cardData.forEach((item) => {
        const itemChainage = (item.chainage_start + item.chainage_end) / 2;
        const binIndex = Math.floor((itemChainage - chainageMin) / binSize);

        if (binIndex >= 0 && binIndex < binCount) {
          binData[binIndex] += 1;
        }
      });

      series.push({
        name: cardTitle,
        type: 'bar',
        data: binData,
        itemStyle: {
          color: cardColor,
          borderRadius: isTabletOrSmaller ? [0, 4, 4, 0] : [4, 4, 0, 0],
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.3)',
          shadowOffsetX: isTabletOrSmaller ? 3 : 0,
          shadowOffsetY: isTabletOrSmaller ? 0 : 3,
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            color: cardColor,
            shadowBlur: 20,
            shadowColor: cardColor,
            borderWidth: 2,
            borderColor: '#fff',
          },
        },
        barGap: '10%',
        barCategoryGap: '20%',
      });
    });

    const xAxisLabels = chainageBins
      .slice(0, binCount)
      .map((chainage) => chainage.toFixed(2));

    const insideDataZoom = isTabletOrSmaller
      ? {
          type: 'inside',
          yAxisIndex: 0,
          start: 0,
          end: 100,
          moveOnMouseWheel: true,
          moveOnMouseMove: true,
        }
      : {
          type: 'inside',
          xAxisIndex: 0,
          start: 0,
          end: 100,
          moveOnMouseWheel: true,
          moveOnMouseMove: true,
        };

    // Store cardDataMap in a variable accessible to the formatter
    const formatterCardDataMap = cardDataMap;
    
    this.chainageComparisonChartOptions = {
      backgroundColor: 'transparent',
      textStyle: {
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#666',
        borderWidth: 1,
        textStyle: {
          color: '#fff',
        },
        formatter: (params: any) => {
          const component = this;
          const chainageValue = parseFloat(params[0].axisValue);
          const binSize = (component.comparisonChainageMax - component.comparisonChainageMin) / 20;
          const binStart = component.comparisonChainageMin + (params[0].dataIndex * binSize);
          const binEnd = binStart + binSize;
          
          let result = `<div style="font-weight:bold;margin-bottom:5px;">Chainage: ${binStart.toFixed(2)} - ${binEnd.toFixed(2)} km</div>`;
          params.forEach((param: any) => {
            const cardTitle = param.seriesName;
            const selectedAssets = component.selectedAssetsForComparison[cardTitle];
            const cardData = formatterCardDataMap[cardTitle] || [];
            
            result += `<div style="margin:3px 0;">`;
            result += `<span style="display:inline-block;margin-right:8px;border-radius:50%;width:10px;height:10px;background-color:${param.color};vertical-align:middle;"></span>`;
            result += `<span style="font-weight:700 ;">${cardTitle}: ${param.value}</span>`;
            
            // Calculate asset counts for this bin
            if (selectedAssets && selectedAssets.size > 0 && cardData.length > 0) {
              const binData = cardData.filter((item: ReportData) => {
                const itemChainage = (item.chainage_start + item.chainage_end) / 2;
                return itemChainage >= binStart && itemChainage < binEnd;
              });
              
              const assetCounts: { [assetName: string]: number } = {};
              selectedAssets.forEach((assetName: string) => {
                const count = component.countAssetInBin(cardTitle, assetName, binData);
                if (count > 0) {
                  assetCounts[assetName] = count;
                }
              });
              
              if (Object.keys(assetCounts).length > 0) {
                const assetList = Object.keys(assetCounts)
                  .map(assetName => `${assetName}: ${assetCounts[assetName]}`)
                  .join(', ');
                result += `<div style="font-size:11px;color:#b0b0b0;margin-left:18px;margin-top:2px;">Assets: ${assetList}</div>`;
              }
            }
            
            result += `</div>`;
          });
          return result;
        },
      },
      legend: {
        data: Array.from(this.selectedCardsForComparison),
        textStyle: {
          color: '#ffffff',
        },
        top: 10,
        left: 'center',
      },
      grid: {
        left: isTabletOrSmaller ? '15%' : '5%',
        right: '5%',
        bottom: isTabletOrSmaller ? '20%' : '20%',
        top: '5%',
        containLabel: true,
      },
      xAxis: isTabletOrSmaller
        ? {
            type: 'value',
            name: 'Count',
            nameLocation: 'middle',
            nameGap: 30,
            nameTextStyle: {
              color: '#ffffff',
              fontSize: 12,
            },
            axisLabel: {
              color: '#ffffff',
              fontSize: 10,
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
          }
        : {
            type: 'category',
            data: xAxisLabels,
            name: 'Chainage (km)',
            nameLocation: 'middle',
            nameGap: 30,
            nameTextStyle: {
              color: '#ffffff',
              fontSize: 12,
            },
            axisLabel: {
              color: '#ffffff',
              fontSize: 10,
              rotate: 45,
            },
            axisLine: {
              lineStyle: {
                color: '#ffffff',
              },
            },
          },
      yAxis: isTabletOrSmaller
        ? {
            type: 'category',
            data: xAxisLabels,
            name: 'Chainage (km)',
            nameLocation: 'middle',
            nameGap: 50,
            nameTextStyle: {
              color: '#ffffff',
              fontSize: 12,
            },
            axisLabel: {
              color: '#ffffff',
              fontSize: 10,
            },
            axisLine: {
              lineStyle: {
                color: '#ffffff',
              },
            },
          }
        : {
            type: 'value',
            name: 'Count',
            nameLocation: 'middle',
            nameGap: 50,
            nameTextStyle: {
              color: '#ffffff',
              fontSize: 12,
            },
            axisLabel: {
              color: '#ffffff',
              fontSize: 10,
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
      dataZoom: [insideDataZoom],
      series: series,
    };
  }

  // Handle comparison chainage min slider change
  onComparisonChainageMinSliderChange(event: any) {
    const value = parseFloat(event.target.value);
    if (!isNaN(value)) {
      this.comparisonChainageMin = Math.max(
        this.getComparisonChainageMin(),
        Math.min(value, this.comparisonChainageMax - 0.1)
      );
      this.generateChainageComparisonChart();
    }
  }

  // Handle comparison chainage max slider change
  onComparisonChainageMaxSliderChange(event: any) {
    const value = parseFloat(event.target.value);
    if (!isNaN(value)) {
      this.comparisonChainageMax = Math.min(
        this.getComparisonChainageMax(),
        Math.max(value, this.comparisonChainageMin + 0.1)
      );
      this.generateChainageComparisonChart();
    }
  }
}

