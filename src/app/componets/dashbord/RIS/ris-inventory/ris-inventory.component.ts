import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';

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
}

interface ProjectDatesResponse {
  [projectName: string]: string[];
}

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
  median_opening: number | string;
  latitude: number;
  longitude: number;
  date: string;
  sub_asset_type: string | null;
}

@Component({
  selector: 'app-ris-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEchartsModule],
  templateUrl: './ris-inventory.component.html',
  styleUrl: './ris-inventory.component.css'
})
export class RisInventoryComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainerRef!: ElementRef;

  rawData: InfrastructureData[] = [];

  filters: FilterData = {
    date: '',
    projectName: '',
    direction: '',
    chainageRange: { min: 0, max: 100 },
    assetType: 'All',
    subAssetType: 'All'
  };

  availableProjects: string[] = [];
  availableDirections: string[] = [];
  availableDates: string[] = [];

  projectDatesMap: ProjectDatesResponse = {};
  selectedAssetType: string | null = null;
  isLoading: boolean = false;
  private isProjectChanging: boolean = false;

  assetSummary: AssetData[] = [];
  chainageData: any[] = [];
  chartOptions: any = {};
  dateComparisonData: any[] = [];
  dateComparisonChartOptions: any = {};
  isLoadingComparisonChart: boolean = false;

  isSubAssetModalOpen: boolean = false;
  selectedAssetForSubAssets: string = '';
  subAssetsList: { name: string; count: number }[] = [];

  private map: any;
  public isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.loadProjectsAndDates();
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', () => {
          this.onWindowResize();
        });
        window.addEventListener('orientationchange', () => {
          setTimeout(() => {
            if (this.map) {
              this.map.invalidateSize();
            }
          }, 200);
        });
      }
    }
  }

  async ngAfterViewInit() {
    if (this.isBrowser) {
      // Map container is created conditionally in template; initialize after data
    }
  }

  private async initializeMapAfterViewInit() {
    setTimeout(async () => {
      await this.initMap();
      this.ensureChartRenders();
      setTimeout(async () => {
        if (this.rawData.length > 0) {
          await this.addInfrastructureMarkers();
        }
      }, 500);
    }, 100);
  }

  private async initializeMapAfterDataLoad() {
    let attempts = 0;
    const maxAttempts = 50;

    const waitForContainer = () => {
      if (this.mapContainerRef && this.mapContainerRef.nativeElement) {
        this.initializeMapAfterViewInit();
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(waitForContainer, 100);
      } else {
        const mapDiv = document.querySelector('#mapContainer') || document.querySelector('.map');
        if (mapDiv) {
          this.mapContainerRef = { nativeElement: mapDiv as HTMLDivElement } as ElementRef;
          this.initializeMapAfterViewInit();
        }
      }
    };

    waitForContainer();
  }

  private createMapContainerManually() {
    const dashboardContent = document.querySelector('.dashboard-content') ||
                             document.querySelector('.main-dashboard-container') ||
                             document.querySelector('.left-panel') ||
                             document.body;

    if (dashboardContent) {
      const mapContainer = document.createElement('div');
      mapContainer.id = 'mapContainer';
      mapContainer.className = 'map';
      mapContainer.style.width = '100%';
      mapContainer.style.height = '400px';
      mapContainer.style.backgroundColor = '#1a1a1a';
      mapContainer.style.border = '1px solid #333';
      mapContainer.style.borderRadius = '8px';
      dashboardContent.appendChild(mapContainer);
      this.mapContainerRef = { nativeElement: mapContainer } as ElementRef;
      this.initializeMapAfterViewInit();
    }
  }

  private async loadProjectsAndDates() {
    try {
      const response = await fetch('https://fantastic-reportapi-production.up.railway.app/projects-dates/inventory', {
        method: 'GET',
        headers: { 'accept': 'application/json' }
      });
      const projectDates: ProjectDatesResponse = await response.json();
      this.projectDatesMap = projectDates;
      this.availableProjects = Object.keys(projectDates);
      if (this.availableProjects.length > 0) {
        this.filters.projectName = this.availableProjects[0];
        this.availableDates = this.projectDatesMap[this.filters.projectName] || [];
        if (this.availableDates.length > 0) {
          this.filters.date = this.availableDates[0];
        }
      }
      if (this.filters.date && this.filters.projectName) {
        await this.loadData();
      }
    } catch (_error) {
      this.availableProjects = [];
      this.availableDates = [];
    }
  }

  private async loadData() {
    if (!this.filters.date || !this.filters.projectName) return;
    this.isLoading = true;
    try {
      const requestBody = {
        chainage_start: 0,
        chainage_end: 1381,
        date: this.filters.date,
        direction: ['All'],
        project_name: [this.filters.projectName.trim()],
        asset_type: ['All']
      };
      const response = await fetch('https://fantastic-reportapi-production.up.railway.app/inventory_filter', {
        method: 'POST',
        headers: { 'accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      const apiResponse = await response.json();
      if (apiResponse?.detail === 'Not Found') {
        this.rawData = [];
        return;
      }
      this.rawData = Array.isArray(apiResponse) ? apiResponse.flat() : [];
      this.extractFilterOptions();
      this.calculateAssetSummary();
      this.generateChainageData();
      this.initChartOptions();
      if (this.isBrowser) this.initializeMapAfterDataLoad();
    } catch (_error) {
      this.rawData = [];
    } finally {
      this.isLoading = false;
    }
  }

  private extractFilterOptions() {
    if (!Array.isArray(this.rawData) || this.rawData.length === 0) {
      this.availableDirections = ['Increasing', 'Decreasing', 'Median'];
      if (!this.filters.direction && this.availableDirections.length > 0) {
        this.filters.direction = this.availableDirections[0];
      }
      return;
    }
    const uniqueDirections = [...new Set(this.rawData.map(item => item.direction))];
    if (!uniqueDirections.includes('Decreasing')) uniqueDirections.push('Decreasing');
    if (!uniqueDirections.includes('Median')) uniqueDirections.push('Median');
    this.availableDirections = uniqueDirections;
    if (!this.filters.direction && this.availableDirections.length > 0) {
      this.filters.direction = this.availableDirections[0];
    }
    const chainages = this.rawData.flatMap(item => [item.chainage_start, item.chainage_end]);
    if (chainages.length > 0) {
      this.filters.chainageRange.min = Math.min(...chainages);
      this.filters.chainageRange.max = Math.max(...chainages);
    }
  }

  async onDateChange(event: any) {
    this.filters.date = event.target.value;
    if (this.isProjectChanging) return;
    if (this.filters.date) await this.loadData();
  }

  async onProjectChange(event: any) {
    this.isProjectChanging = true;
    this.filters.projectName = event.target.value;
    this.availableDates = this.projectDatesMap[this.filters.projectName] || [];
    this.filters.date = this.availableDates.length > 0 ? this.availableDates[0] : '';
    await new Promise(r => setTimeout(r, 10));
    if (this.filters.date) await this.loadData();
    this.isProjectChanging = false;
    if (this.isBrowser) this.prepareDateComparisonData();
  }

  async onDirectionChange(event: any) {
    this.filters.direction = event.target.value;
    await this.updateDashboard(true);
  }

  async onChainageMinChange(event: any) {
    const newMin = parseFloat(event.target.value);
    if (newMin < this.filters.chainageRange.max) {
      this.filters.chainageRange.min = newMin;
      await this.updateDashboard(true);
    }
  }

  async onChainageMaxChange(event: any) {
    const newMax = parseFloat(event.target.value);
    if (newMax > this.filters.chainageRange.min) {
      this.filters.chainageRange.max = newMax;
      await this.updateDashboard(true);
    }
  }

  async onChainageMinSliderChange(event: any) { await this.onChainageMinChange(event); }
  async onChainageMaxSliderChange(event: any) { await this.onChainageMaxChange(event); }

  async onAssetTypeChange(event: any) {
    this.filters.assetType = event.target.value;
    await this.updateDashboard(true);
  }

  async onAssetCardClick(assetType: string) {
    this.openSubAssetModal(assetType);
    this.selectedAssetType = this.selectedAssetType === assetType ? null : assetType;
    this.updateDashboard(true);
  }

  async onSubAssetTypeChange(event: any) {
    this.filters.subAssetType = event.target.value;
    await this.updateDashboard(true);
  }

  private getFilteredData(): InfrastructureData[] {
    let filteredData = [...this.rawData];
    if (this.filters.direction) {
      filteredData = filteredData.filter(item => item.direction === this.filters.direction);
    }
    if (this.filters.assetType && this.filters.assetType !== 'All') {
      filteredData = filteredData.filter(item => item.asset_type === this.filters.assetType);
    }
    if (this.filters.chainageRange.min !== undefined && this.filters.chainageRange.max !== undefined) {
      filteredData = filteredData.filter(item =>
        item.chainage_start >= this.filters.chainageRange.min &&
        item.chainage_end <= this.filters.chainageRange.max
      );
    }
    if (this.filters.subAssetType && this.filters.subAssetType !== 'All') {
      filteredData = filteredData.filter(item => item.sub_asset_type === this.filters.subAssetType);
    }
    return filteredData;
  }

  private calculateAssetSummary() {
    const filteredData = this.getFilteredData();
    const assetTotals: { [key: string]: number } = {};
    const allAssetTypes = [
      'Trees', 'Adjacent Road', 'Sign Boards', 'Culvert', 'Toll Plaza', 'Bus Stop',
      'Crash Barrier', 'Emergency Call', 'KM Stones', 'Street Lights', 'Truck Layby',
      'Service Road', 'Junction', 'Fuel Station', 'Toilet Block', 'RCC Drain',
      'Solar Blinker', 'Median Opening'
    ];
    allAssetTypes.forEach(type => { assetTotals[type] = 0; });
    filteredData.forEach(item => {
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
      const medianOpeningValue = typeof item.median_opening === 'string' ? parseFloat(item.median_opening) || 0 : (item.median_opening || 0);
      assetTotals['Median Opening'] += medianOpeningValue;
    });
    const assetColors: any = {
      'Trees': '#4CAF50', 'Adjacent Road': '#2196F3', 'Sign Boards': '#FF9800',
      'Culvert': '#9C27B0', 'Toll Plaza': '#F44336', 'Bus Stop': '#00BCD4',
      'Crash Barrier': '#FF9800', 'Emergency Call': '#E91E63', 'KM Stones': '#607D8B',
      'Street Lights': '#FFC107', 'Truck Layby': '#8BC34A', 'Service Road': '#FF5722',
      'Junction': '#9E9E9E', 'Fuel Station': '#3F51B5', 'Toilet Block': '#009688',
      'RCC Drain': '#673AB7', 'Solar Blinker': '#FFEB3B', 'Median Opening': '#CDDC39'
    };
    this.assetSummary = allAssetTypes.map(name => ({
      name,
      count: assetTotals[name] || 0,
      color: assetColors[name] || '#9E9E9E',
      unit: name.includes('Road') || name.includes('Barrier') ? 'KM' : undefined
    })).sort((a, b) => b.count - a.count);
  }

  private generateChainageData() {
    let filteredData = this.getFilteredData();
    if (this.selectedAssetType) {
      const key = this.selectedAssetType.toLowerCase().replace(' ', '_');
      filteredData = filteredData.filter(item => (item as any)[key] > 0);
    }
    filteredData.sort((a, b) => a.chainage_start - b.chainage_start);
    const segmentSize = 10;
    const grouped: { [key: string]: any } = {};
    filteredData.forEach(item => {
      const segmentStart = Math.floor(item.chainage_start / segmentSize) * segmentSize;
      const segmentKey = `${segmentStart}-${segmentStart + segmentSize}`;
      if (!grouped[segmentKey]) {
        grouped[segmentKey] = {
          name: `${segmentStart}-${segmentStart + segmentSize}`,
          xAxisPosition: segmentStart / segmentSize,
          chainage_start: segmentStart,
          chainage_end: segmentStart + segmentSize,
          Trees: 0, Culvert: 0, StreetLights: 0, Bridges: 0, TrafficSignals: 0, BusStop: 0,
          TruckLayby: 0, TollPlaza: 0, AdjacentRoad: 0, ToiletBlocks: 0, RestArea: 0, RCCDrain: 0,
          FuelStation: 0, EmergencyCall: 0, Tunnels: 0, Footpath: 0, Junction: 0, SignBoards: 0,
          SolarBlinker: 0, MedianPlants: 0, ServiceRoad: 0, KMStones: 0, CrashBarrier: 0, MedianOpening: 0,
          project_name: '', direction: '', asset_type: ''
        };
      }
      const s = grouped[segmentKey];
      s.Trees += item.trees > 0 ? 1 : 0;
      s.Culvert += item.culvert > 0 ? 1 : 0;
      s.StreetLights += item.street_lights > 0 ? 1 : 0;
      s.Bridges += item.bridges > 0 ? 1 : 0;
      s.TrafficSignals += item.traffic_signals > 0 ? 1 : 0;
      s.BusStop += item.bus_stop > 0 ? 1 : 0;
      s.TruckLayby += item.truck_layby > 0 ? 1 : 0;
      s.TollPlaza += item.toll_plaza > 0 ? 1 : 0;
      s.AdjacentRoad += item.adjacent_road > 0 ? 1 : 0;
      s.ToiletBlocks += item.toilet_blocks > 0 ? 1 : 0;
      s.RestArea += item.rest_area > 0 ? 1 : 0;
      s.RCCDrain += item.rcc_drain > 0 ? 1 : 0;
      s.FuelStation += item.fuel_station > 0 ? 1 : 0;
      s.EmergencyCall += item.emergency_call_box > 0 ? 1 : 0;
      s.Tunnels += item.tunnels > 0 ? 1 : 0;
      s.Footpath += item.footpath > 0 ? 1 : 0;
      s.Junction += item.junction > 0 ? 1 : 0;
      s.SignBoards += item.sign_boards > 0 ? 1 : 0;
      s.SolarBlinker += item.solar_blinker > 0 ? 1 : 0;
      s.MedianPlants += item.median_plants > 0 ? 1 : 0;
      s.ServiceRoad += item.service_road > 0 ? 1 : 0;
      s.KMStones += item.km_stones > 0 ? 1 : 0;
      s.CrashBarrier += item.crash_barrier > 0 ? 1 : 0;
      s.MedianOpening += (typeof item.median_opening === 'number' ? item.median_opening : parseFloat(item.median_opening as string) || 0) > 0 ? 1 : 0;
    });
    this.chainageData = Object.values(grouped).sort((a: any, b: any) => a.xAxisPosition - b.xAxisPosition);
  }

  public initChartOptions() {
    if (this.isBrowser) {
      const isMobile = this.isBrowser && typeof window !== 'undefined' && window.innerWidth <= 768;
      const isSmallMobile = this.isBrowser && typeof window !== 'undefined' && window.innerWidth <= 480;
      this.chartOptions = {
        title: { left: 'center', textStyle: { color: '#ffffff', fontSize: isSmallMobile ? 12 : isMobile ? 14 : 16, fontWeight: 'bold' } },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          borderColor: 'rgba(255, 255, 255, 0.3)',
          borderWidth: 2,
          textStyle: { color: '#ffffff', fontSize: isSmallMobile ? 10 : isMobile ? 11 : 12, fontWeight: '500' },
          padding: [12, 16],
          extraCssText: 'border-radius: 8px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5); z-index: 99999 !important; max-width: 300px;',
          transitionDuration: 0,
          hideDelay: 0,
          showDelay: 0,
          formatter: (params: any) => {
            if (Array.isArray(params) && params.length > 0) {
              const dataIndex = params[0].dataIndex;
              const chainageItem = this.chainageData[dataIndex];
              let chainageRange = 'Unknown Range';
              if (chainageItem) {
                chainageRange = `${chainageItem.chainage_start.toFixed(0)} - ${chainageItem.chainage_end.toFixed(0)} KM`;
              } else {
                const segmentSize = 10;
                const startRange = dataIndex * segmentSize;
                const endRange = startRange + segmentSize;
                chainageRange = `${startRange} - ${endRange} KM`;
              }
              let result = `<div style="margin-bottom: 10px; font-weight: 600; color: #ffffff; font-size: 15px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 8px;">Chainage: ${chainageRange}</div>`;
              result += `<div style=\"margin-bottom: 8px; font-weight: 500; color: #cccccc; font-size: 13px;\">Asset Distribution:</div>`;
              let totalAssets = 0; const presentAssets: any[] = [];
              params.forEach((param: any) => { if (param.data && param.data[1] > 0) { totalAssets += param.data[1]; presentAssets.push(param); }});
              result += `<div style=\"margin-bottom: 8px; font-weight: 500; color: #4CAF50; font-size: 13px;\">Total Assets: ${totalAssets}</div>`;
              if (presentAssets.length > 0) {
                presentAssets.forEach((param: any) => {
                  result += `<div style=\"display: flex; align-items: center; margin: 4px 0; padding: 2px 0;\">\n                    <span style=\"display: inline-block; width: 14px; height: 14px; background-color: ${param.color}; border-radius: 3px; margin-right: 12px; border: 1px solid rgba(255,255,255,0.3);\"></span>\n                    <span style=\"color: #ffffff; font-size: 13px; flex: 1;\">${param.seriesName}:</span>\n                    <span style=\"color: #4CAF50; font-size: 14px; font-weight: 600; margin-left: 8px;\">${param.data[1]}</span>\n                  </div>`;
                });
              } else {
                result += `<div style=\"color: #666666; font-size: 13px; text-align: center; padding: 10px;\">No assets in this segment</div>`;
              }
              return result;
            }
            return `${params.seriesName}: ${params.data ? params.data[1] : params.value}`;
          }
        },
        legend: { data: [], top: isSmallMobile ? 20 : isMobile ? 25 : 30, right: '10%', textStyle: { color: '#ffffff', fontSize: isSmallMobile ? 7 : isMobile ? 8 : 10 }, itemGap: isSmallMobile ? 8 : isMobile ? 10 : 12, itemWidth: isSmallMobile ? 8 : isMobile ? 10 : 12, itemHeight: isSmallMobile ? 6 : isMobile ? 8 : 10, type: 'scroll', orient: 'horizontal', backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: 6, padding: [8, 12] },
        grid: { top: isSmallMobile ? '25%' : isMobile ? '20%' : '15%', left: isSmallMobile ? '12%' : isMobile ? '10%' : '8%', right: isSmallMobile ? '12%' : isMobile ? '10%' : '8%', bottom: isSmallMobile ? '15%' : isMobile ? '12%' : '8%', containLabel: true },
        xAxis: { type: 'value', min: this.getXAxisMin(), max: this.getXAxisMax(), axisLabel: { color: '#ffffff', fontSize: isSmallMobile ? 7 : isMobile ? 8 : 10, interval: 1, rotate: 0, formatter: (value: number) => { const item = this.chainageData.find((i: any) => Math.abs(i.xAxisPosition - value) < 0.1); if (item) return `${item.chainage_start}-${item.chainage_end}`; const segmentSize = 10; const startRange = Math.round(value * segmentSize); const endRange = startRange + segmentSize; return `${startRange}-${endRange}`; } }, axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } }, boundaryGap: [0.1, 0.1] },
        yAxis: { type: 'value', min: 0, max: 1, interval: 0.5, axisLabel: { color: '#ffffff', fontSize: isSmallMobile ? 7 : isMobile ? 8 : 10 }, axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } }, splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)', type: 'dashed' } } },
        series: this.generateChartSeries(isSmallMobile, isMobile)
      };
    }
  }

  // Exposed helpers for template bindings
  getChainageMin(): number {
    if (this.filters.projectName === 'All') {
      return 0;
    }
    const projectData = this.rawData.filter(item => item.project_name === this.filters.projectName);
    if (projectData.length > 0) {
      return Math.floor(Math.min(...projectData.map(item => item.chainage_start)));
    }
    return 0;
  }

  getChainageMax(): number {
    if (this.filters.projectName === 'All') {
      if (this.rawData.length > 0) {
        const maxChainage = Math.max(...this.rawData.map(item => item.chainage_end));
        return Math.ceil(maxChainage);
      }
      return 1000;
    }
    const projectData = this.rawData.filter(item => item.project_name === this.filters.projectName);
    if (projectData.length > 0) {
      return Math.ceil(Math.max(...projectData.map(item => item.chainage_end)));
    }
    return 100;
  }

  formatAssetCount(asset: AssetData): string {
    const count = typeof asset.count === 'number' ? asset.count : Number(asset.count) || 0;
    if (asset.unit === 'KM') {
      return count.toFixed(2);
    }
    return count.toLocaleString();
  }

  private getXAxisMin(): number { if (this.chainageData.length === 0) return 0; const minPosition = Math.min(...this.chainageData.map((i: any) => i.xAxisPosition)); return Math.max(0, minPosition - 0.1); }
  private getXAxisMax(): number { if (this.chainageData.length === 0) return 10; const maxPosition = Math.max(...this.chainageData.map((i: any) => i.xAxisPosition)); return maxPosition + 0.1; }

  private generateChartSeries(_isSmallMobile: boolean, _isMobile: boolean) {
    const allSeries = [
      { name: 'Trees', type: 'bar', data: this.chainageData.map((i: any) => [i.xAxisPosition, i.Trees > 0 ? 1 : 0]), itemStyle: { color: '#4CAF50' }, barWidth: '8%', barGap: '10%' },
      { name: 'Culvert', type: 'bar', data: this.chainageData.map((i: any) => [i.xAxisPosition, i.Culvert > 0 ? 1 : 0]), itemStyle: { color: '#9C27B0' }, barWidth: '8%', barGap: '10%' },
      { name: 'Street Lights', type: 'bar', data: this.chainageData.map((i: any) => [i.xAxisPosition, i.StreetLights > 0 ? 1 : 0]), itemStyle: { color: '#FFC107' }, barWidth: '8%', barGap: '10%' },
      { name: 'Bridges', type: 'bar', data: this.chainageData.map((i: any) => [i.xAxisPosition, i.Bridges > 0 ? 1 : 0]), itemStyle: { color: '#2196F3' }, barWidth: '8%', barGap: '10%' },
      { name: 'Traffic Signals', type: 'bar', data: this.chainageData.map((i: any) => [i.xAxisPosition, i.TrafficSignals > 0 ? 1 : 0]), itemStyle: { color: '#F44336' }, barWidth: '8%', barGap: '10%' },
      { name: 'Bus Stop', type: 'bar', data: this.chainageData.map((i: any) => [i.xAxisPosition, i.BusStop > 0 ? 1 : 0]), itemStyle: { color: '#00BCD4' }, barWidth: '8%', barGap: '10%' },
      { name: 'Crash Barrier', type: 'bar', data: this.chainageData.map((i: any) => [i.xAxisPosition, i.CrashBarrier > 0 ? 1 : 0]), itemStyle: { color: '#FF9800' }, barWidth: '8%', barGap: '10%' },
      { name: 'Emergency Call', type: 'bar', data: this.chainageData.map((i: any) => [i.xAxisPosition, i.EmergencyCall > 0 ? 1 : 0]), itemStyle: { color: '#E91E63' }, barWidth: '8%', barGap: '10%' },
      { name: 'Sign Boards', type: 'bar', data: this.chainageData.map((i: any) => [i.xAxisPosition, i.SignBoards > 0 ? 1 : 0]), itemStyle: { color: '#FF9800' }, barWidth: '8%', barGap: '10%' },
      { name: 'KM Stones', type: 'bar', data: this.chainageData.map((i: any) => [i.xAxisPosition, i.KMStones > 0 ? 1 : 0]), itemStyle: { color: '#607D8B' }, barWidth: '8%', barGap: '10%' }
    ];
    if (this.selectedAssetType) return allSeries.filter(s => s.name === this.selectedAssetType);
    return allSeries;
  }

  private async initMap() {
    if (!this.isBrowser) return;
    if (!this.mapContainerRef) {
      const mapDiv = document.querySelector('#mapContainer') || document.querySelector('.map');
      if (mapDiv) {
        this.mapContainerRef = { nativeElement: mapDiv as HTMLDivElement } as ElementRef;
      } else { return; }
    }
    const container = this.mapContainerRef.nativeElement;
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) { setTimeout(() => this.initMap(), 500); return; }
    try {
      const L = await import('leaflet');
      this.map = L.map(this.mapContainerRef.nativeElement, {
        zoomControl: true,
        preferCanvas: true
      }).setView([23.5937, 78.9629], 5);
      // Reliable HTTPS satellite tiles
      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 25,
        // attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      });
      satelliteLayer.addTo(this.map);
      await this.addInfrastructureMarkers();
      // Multiple invalidates to fix black tiles/layout on first render
      setTimeout(() => { if (this.map) this.map.invalidateSize(true); }, 100);
      setTimeout(() => { if (this.map) this.map.invalidateSize(true); }, 500);
      setTimeout(() => { if (this.map) this.map.invalidateSize(true); }, 1000);
    } catch (_error) {
      try {
        const L = await import('leaflet');
        this.map = L.map(this.mapContainerRef.nativeElement, {
          zoomControl: true,
          preferCanvas: true
        }).setView([23.5937, 78.9629], 5);
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 25,
          // attribution: 'Tiles © Esri'
        });
        satelliteLayer.addTo(this.map);
      } catch (_fallbackError) {}
    }
  }

  private async addInfrastructureMarkers() {
    if (!this.map || !this.rawData || this.rawData.length === 0) return;
    try {
      const L = await import('leaflet');
      await this.clearMapMarkers();
      const filteredData = this.getFilteredData();
      filteredData.forEach(item => {
        if (item.latitude && item.longitude) {
          const assetTypes = [
            'trees','culvert','street_lights','bridges','traffic_signals','bus_stop','truck_layby','toll_plaza','adjacent_road','toilet_blocks','rest_area','rcc_drain','fuel_station','emergency_call_box','tunnels','footpath','junction','sign_boards','solar_blinker','median_plants','service_road','km_stones','crash_barrier','median_opening'
          ];
          let primaryAsset = 'General'; let maxCount = 0;
          assetTypes.forEach(assetType => {
            const count = (item as any)[assetType] as number;
            if (count > maxCount) { maxCount = count; primaryAsset = assetType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()); }
          });
          if (this.selectedAssetType) {
            const selectedKey = this.selectedAssetType.toLowerCase().replace(' ', '_');
            const selectedCount = (item as any)[selectedKey] as number;
            if (selectedCount === 0) return;
            primaryAsset = this.selectedAssetType;
            maxCount = selectedCount;
          }
          const assetSummaryItem = this.assetSummary.find(a => a.name.toLowerCase().includes(primaryAsset.toLowerCase().split(' ')[0]));
          const color = assetSummaryItem ? assetSummaryItem.color : '#4CAF50';
          const marker = L.circleMarker([item.latitude, item.longitude], { radius: Math.max(2, Math.min(6, 3 + (maxCount * 0.5))), fillColor: color, color: '#ffffff', weight: 1, opacity: 1, fillOpacity: 0.8 });
          const popupContent = `
            <div style="font-family: 'Segoe UI', sans-serif; min-width: 200px;">
              <h4 style="margin: 0 0 8px 0; color: #333; font-size: 14px;">${item.project_name}</h4>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Chainage:</strong> ${item.chainage_start} - ${item.chainage_end} KM</p>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Direction:</strong> ${item.direction}</p>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Asset Type:</strong> ${item.asset_type}</p>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Primary Asset:</strong> ${primaryAsset} (${maxCount})</p>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Date:</strong> ${item.date}</p>
            </div>
          `;
          marker.bindPopup(popupContent);
          marker.addTo(this.map);
        }
      });
      if (filteredData.length > 0) {
        const group = L.featureGroup();
        filteredData.forEach(item => { if (item.latitude && item.longitude) group.addLayer(L.marker([item.latitude, item.longitude])); });
        this.map.fitBounds(group.getBounds().pad(0.1));
      }
    } catch (_error) {}
  }

  private async clearMapMarkers() {
    if (!this.map) return;
    try {
      const L = await import('leaflet');
      this.map.eachLayer((layer: any) => { if (layer instanceof L.CircleMarker) { this.map.removeLayer(layer); } });
    } catch (_error) {}
  }

  private isMobile(): boolean { return this.isBrowser && typeof window !== 'undefined' ? window.innerWidth <= 768 : false; }
  private isSmallMobile(): boolean { return this.isBrowser && typeof window !== 'undefined' ? window.innerWidth <= 480 : false; }

  private onWindowResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      if (this.isBrowser && this.chartOptions) {
        this.initChartOptions();
        this.refreshChart();
        if ((window as any).echarts) {
          setTimeout(() => {
            const chartElements = document.querySelectorAll('.echarts-chart');
            chartElements.forEach((element: any) => {
              const echartsInstance = element.__echarts_instance__;
              if (echartsInstance) echartsInstance.resize();
            });
          }, 100);
        }
      }
      if (this.map) this.map.invalidateSize();
    }, 250);
  }

  private resizeTimeout: any;

  private ensureChartRenders() {
    if (this.isBrowser && this.isMobile()) {
      setTimeout(() => { if (this.chartOptions) this.initChartOptions(); }, 500);
    }
  }

  async prepareDateComparisonData() {
    if (!this.filters.projectName || !this.projectDatesMap[this.filters.projectName]) {
      this.dateComparisonData = []; this.isLoadingComparisonChart = false; this.initDateComparisonChartOptions(); return;
    }
    const projectDates = this.projectDatesMap[this.filters.projectName];
    this.isLoadingComparisonChart = true;
    const assetFieldMap: { [key: string]: string } = {
      'trees': 'Trees', 'culvert': 'Culvert', 'street_lights': 'Street Lights', 'bridges': 'Bridges', 'traffic_signals': 'Traffic Signals', 'bus_stop': 'Bus Stop',
      'truck_layby': 'Truck Layby', 'toll_plaza': 'Toll Plaza', 'adjacent_road': 'Adjacent Road', 'toilet_blocks': 'Toilet Blocks', 'rest_area': 'Rest Area', 'rcc_drain': 'RCC Drain',
      'fuel_station': 'Fuel Station', 'emergency_call_box': 'Emergency Call Box', 'tunnels': 'Tunnels', 'footpath': 'Footpath', 'junction': 'Junction', 'sign_boards': 'Sign Boards',
      'solar_blinker': 'Solar Blinker', 'median_plants': 'Median Plants', 'service_road': 'Service Road', 'km_stones': 'KM Stones', 'crash_barrier': 'Crash Barrier', 'median_opening': 'Median Opening'
    };
    const fetchPromises = projectDates.map(async (date) => {
      try {
        const body = { chainage_start: 0, chainage_end: 1381, date, direction: ['All'], project_name: [this.filters.projectName.trim()], asset_type: ['All'] };
        const response = await fetch('https://fantastic-reportapi-production.up.railway.app/inventory_filter', { method: 'POST', headers: { 'accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (response.ok) {
          let data = await response.json();
          if (data.length > 0 && Array.isArray(data[0])) data = data.flat();
          const totals: { [key: string]: number } = {}; Object.values(assetFieldMap).forEach(n => totals[n] = 0);
          data.forEach((item: any) => { Object.entries(assetFieldMap).forEach(([field, display]) => { totals[display] += (item[field] || 0); }); });
          return { date, assetTotals: totals };
        } else { return { date, assetTotals: {} }; }
      } catch { return { date, assetTotals: {} }; }
    });
    const results = await Promise.all(fetchPromises);
    const dateWise: { [date: string]: { [asset: string]: number } } = {};
    results.forEach(({ date, assetTotals }) => { dateWise[date] = assetTotals; });
    this.dateComparisonData = projectDates.map(d => ({ date: d, assets: dateWise[d] || {} }));
    this.isLoadingComparisonChart = false;
    this.initDateComparisonChartOptions();
  }

  private initDateComparisonChartOptions() {
    if (!this.dateComparisonData || this.dateComparisonData.length === 0) { this.dateComparisonChartOptions = {}; return; }
    const isMobile = this.isMobile(); const isSmallMobile = this.isSmallMobile();
    const assetTypesSet = new Set<string>();
    this.dateComparisonData.forEach(d => { Object.keys(d.assets).forEach(a => assetTypesSet.add(a)); });
    const assetTypes = Array.from(assetTypesSet).sort();
    const dateColors = ['#4CAF50','#2196F3','#FF9800','#E91E63','#9C27B0','#00BCD4','#FFC107','#FF5722','#8BC34A','#3F51B5','#CDDC39','#009688'];
    const series = this.dateComparisonData.map((d, idx) => ({ name: d.date, type: 'bar', data: assetTypes.map(a => d.assets[a] || 0), barGap: '10%', barCategoryGap: '20%', itemStyle: { color: dateColors[idx % dateColors.length], borderRadius: [4,4,0,0] }, emphasis: { focus: 'series', itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } } }));
    this.dateComparisonChartOptions = {
      title: { text: 'Date-wise Asset Comparison', left: 'center', textStyle: { color: '#ffffff', fontSize: isSmallMobile ? 14 : isMobile ? 16 : 18, fontWeight: 'bold' } },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(255,255,255,0.1)' } }, backgroundColor: 'rgba(0,0,0,0.9)', borderColor: 'rgba(255,255,255,0.3)', borderWidth: 2, textStyle: { color: '#ffffff', fontSize: isSmallMobile ? 11 : isMobile ? 12 : 13 }, formatter: (params: any) => { if (Array.isArray(params) && params.length > 0) { const assetName = assetTypes[params[0].dataIndex]; let result = `<div style="font-weight:600;margin-bottom:8px;color:#fff;border-bottom:1px solid rgba(255,255,255,.2);padding-bottom:6px;">Asset: ${assetName}</div>`; let total = 0; params.forEach((p: any) => { total += p.value || 0; result += `<div style=\"display:flex;align-items:center;margin:4px 0;\"><span style=\"display:inline-block;width:12px;height:12px;background-color:${p.color};border-radius:2px;margin-right:8px;\"></span><span style=\"color:#fff;flex:1;\">${p.seriesName}:</span><span style=\"color:#4CAF50;font-weight:600;margin-left:8px;\">${p.value}</span></div>`; }); if (params.length > 1) { result += `<div style=\"margin-top:8px;padding-top:6px;border-top:1px solid rgba(255,255,255,.2);font-weight:600;color:#4CAF50;\">Total: ${total}</div>`; } return result; } return ''; } },
      legend: { data: this.dateComparisonData.map(d => d.date), top: isSmallMobile ? 30 : isMobile ? 35 : 40, textStyle: { color: '#ffffff', fontSize: isSmallMobile ? 9 : isMobile ? 10 : 11 }, itemWidth: isSmallMobile ? 18 : isMobile ? 20 : 25, itemHeight: isSmallMobile ? 10 : isMobile ? 12 : 14, type: 'scroll' },
      grid: { top: isSmallMobile ? '25%' : isMobile ? '22%' : '18%', left: isSmallMobile ? '12%' : isMobile ? '10%' : '8%', right: isSmallMobile ? '8%' : isMobile ? '6%' : '5%', bottom: assetTypes.length > 15 ? '18%' : (isSmallMobile ? '15%' : isMobile ? '12%' : '10%'), containLabel: true },
      xAxis: { type: 'category', data: assetTypes, name: 'Asset Types', nameLocation: 'middle', nameGap: isSmallMobile ? 35 : isMobile ? 40 : 45, nameTextStyle: { color: '#ffffff', fontSize: isSmallMobile ? 10 : isMobile ? 11 : 12, fontWeight: 'bold' }, axisLabel: { color: '#ffffff', fontSize: isSmallMobile ? 8 : isMobile ? 9 : 10, rotate: assetTypes.length > 10 ? 45 : (isMobile ? 25 : 0), interval: 0 }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } } },
      dataZoom: assetTypes.length > 15 ? [{ type: 'slider', show: true, xAxisIndex: 0, start: 0, end: (15 / assetTypes.length) * 100, bottom: 0, height: 20, handleSize: '80%', textStyle: { color: '#ffffff', fontSize: 10 }, borderColor: 'rgba(255,255,255,0.3)', fillerColor: 'rgba(76,175,80,0.3)', handleStyle: { color: '#4CAF50', borderColor: '#4CAF50' }, moveHandleStyle: { color: '#4CAF50' } }] : undefined,
      yAxis: { type: 'value', name: 'Count', nameTextStyle: { color: '#ffffff', fontSize: isSmallMobile ? 10 : isMobile ? 11 : 12, fontWeight: 'bold' }, axisLabel: { color: '#ffffff', fontSize: isSmallMobile ? 8 : isMobile ? 9 : 10, formatter: (v: number) => v >= 1000 ? (v/1000).toFixed(1)+'k' : v.toString() }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }, minInterval: 1 },
      series
    };
  }

  openSubAssetModal(assetName: string) {
    this.selectedAssetForSubAssets = assetName;
    const assetFieldMap: { [key: string]: string } = {
      'Trees': 'trees', 'Culvert': 'culvert', 'Street Lights': 'street_lights', 'Bridges': 'bridges', 'Traffic Signals': 'traffic_signals', 'Bus Stop': 'bus_stop', 'Truck Layby': 'truck_layby', 'Toll Plaza': 'toll_plaza', 'Adjacent Road': 'adjacent_road', 'Toilet Blocks': 'toilet_blocks', 'Rest Area': 'rest_area', 'RCC Drain': 'rcc_drain', 'Fuel Station': 'fuel_station', 'Emergency Call Box': 'emergency_call_box', 'Tunnels': 'tunnels', 'Footpath': 'footpath', 'Junction': 'junction', 'Sign Boards': 'sign_boards', 'Solar Blinker': 'solar_blinker', 'Median Plants': 'median_plants', 'Service Road': 'service_road', 'KM Stones': 'km_stones', 'Crash Barrier': 'crash_barrier', 'Median Opening': 'median_opening'
    };
    const apiFieldName = assetFieldMap[assetName];
    const filteredData = this.getFilteredData();
    const subAssetMap: { [key: string]: number } = {};
    filteredData.forEach((item: any) => {
      if (item[apiFieldName] && item[apiFieldName] > 0) {
        const subAssetType = item.sub_asset_type?.trim();
        const count = item[apiFieldName] || 0;
        if (!subAssetType || subAssetType === '' || subAssetType === 'Not Specified') return;
        subAssetMap[subAssetType] = (subAssetMap[subAssetType] || 0) + count;
      }
    });
    this.subAssetsList = Object.entries(subAssetMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    if (this.subAssetsList.length > 0) this.isSubAssetModalOpen = true;
  }

  closeSubAssetModal() {
    this.isSubAssetModalOpen = false;
    this.selectedAssetForSubAssets = '';
    this.subAssetsList = [];
  }

  private async updateDashboard(skipComparisonChart: boolean = false) {
    this.calculateAssetSummary();
    this.generateChainageData();
    this.initChartOptions();
    this.refreshChart();
    if (this.map) await this.addInfrastructureMarkers();
    if (this.isBrowser && !skipComparisonChart) await this.prepareDateComparisonData();
  }

  private refreshChart() {
    if (this.isBrowser && typeof window !== 'undefined') {
    setTimeout(() => {
        const chartElements = document.querySelectorAll('.echarts-chart');
        chartElements.forEach((element: any) => {
          const echartsInstance = element.__echarts_instance__;
          if (echartsInstance) echartsInstance.setOption(this.chartOptions, true);
        });
      }, 100);
    }
  }

  ngOnDestroy() {
    if (this.isBrowser && typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onWindowResize as any);
      if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
    }
  }
}
