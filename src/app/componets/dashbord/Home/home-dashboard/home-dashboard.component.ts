import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgbDropdownModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { RouterLink } from '@angular/router';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexLegend,
  ApexResponsive,
  NgApexchartsModule,
  ApexFill,
  ApexPlotOptions,
  ApexTooltip,
} from 'ng-apexcharts';
import { SharedModule } from '../../../../shared/common/sharedmodule';
export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
  labels: string[];
  legend: ApexLegend;
  subtitle: ApexTitleSubtitle;
  tooltip: ApexTooltip;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  fill: ApexFill;
  grid: any; //ApexGrid;
  colors: any;
  toolbar: any;
  curve: string;
};

@Component({
  selector: 'app-home-dashboard',
  standalone: true,
  imports: [
    NgApexchartsModule,
    SharedModule,
    NgbTooltipModule,
    RouterLink,
    NgbDropdownModule,
    CommonModule,
  ],
  templateUrl: './home-dashboard.component.html',
  styleUrl: './home-dashboard.component.scss',
})
export class HomeDashboardComponent implements OnInit {
  chartOptions: any = {
    series: [
      {
        data: [0, 32, 18, 58],
      },
    ],
    chart: {
      height: 115,
      width: 180,
      type: 'area',
      fontFamily: 'Poppins, Arial, sans-serif',
      foreColor: '#5d6162',
      zoom: {
        enabled: false,
      },
      sparkline: {
        enabled: true,
      },
    },
    tooltip: {
      enabled: true,
      x: {
        show: false,
      },
      y: {
        title: {
          formatter: function (seriesName: any) {
            return '';
          },
        },
      },
      marker: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: [1],
    },
    title: {
      text: undefined,
    },
    grid: {
      borderColor: 'transparent',
    },
    xaxis: {
      crosshairs: {
        show: false,
      },
    },
    colors: ['var(--primary-color)'],

    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.5,
        opacityTo: 0.2,
        stops: [0, 60],
        colorStops: [
          [
            {
              offset: 0,
              color: 'var(--primary02)',
              opacity: 1,
            },
            {
              offset: 60,
              color: 'var(--primary02)',
              opacity: 0.1,
            },
          ],
        ],
      },
    },
  };
  chartOptions1: any = {
    series: [
      {
        data: [0, 32, 18, 58],
      },
    ],
    chart: {
      height: 115,
      width: 180,
      type: 'area',
      fontFamily: 'Roboto, Arial, sans-serif',
      foreColor: '#5d6162',
      zoom: {
        enabled: false,
      },
      sparkline: {
        enabled: true,
      },
    },
    tooltip: {
      enabled: true,
      x: {
        show: false,
      },
      y: {
        title: {
          formatter: function (seriesName: any) {
            return '';
          },
        },
      },
      marker: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: [1],
    },
    title: {
      text: undefined,
    },
    grid: {
      borderColor: 'transparent',
    },
    xaxis: {
      crosshairs: {
        show: false,
      },
    },
    colors: ['rgb(231, 76, 60)'],

    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.5,
        opacityTo: 0.2,
        stops: [0, 60],
        colorStops: [
          [
            {
              offset: 0,
              color: 'rgba(231, 76, 60, 0.2)',
              opacity: 1,
            },
            {
              offset: 60,
              color: 'rgba(231, 76, 60, 0.2)',
              opacity: 0.1,
            },
          ],
        ],
      },
    },
  };
  chartOptions2: any = {
    series: [
      {
        data: [0, 32, 18, 58],
      },
    ],
    chart: {
      height: 115,
      width: 180,
      type: 'area',
      fontFamily: 'Roboto, Arial, sans-serif',
      foreColor: '#5d6162',
      zoom: {
        enabled: false,
      },
      sparkline: {
        enabled: true,
      },
    },
    tooltip: {
      enabled: true,
      x: {
        show: false,
      },
      y: {
        title: {
          formatter: function (seriesName: any) {
            return '';
          },
        },
      },
      marker: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: [1],
    },
    title: {
      text: undefined,
    },
    grid: {
      borderColor: 'transparent',
    },
    xaxis: {
      crosshairs: {
        show: false,
      },
    },
    colors: ['rgb(69, 214, 91)'],

    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.5,
        opacityTo: 0.2,
        stops: [0, 60],
      },
    },
  };
  chartOptions3: any = {
    series: [
      {
        data: [0, 32, 18, 58],
      },
    ],
    chart: {
      height: 115,
      width: 180,
      type: 'area',
      fontFamily: 'Roboto, Arial, sans-serif',
      foreColor: '#5d6162',
      zoom: {
        enabled: false,
      },
      sparkline: {
        enabled: true,
      },
    },
    tooltip: {
      enabled: true,
      x: {
        show: false,
      },
      y: {
        title: {
          formatter: function (seriesName: any) {
            return '';
          },
        },
      },
      marker: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: [1],
    },
    title: {
      text: undefined,
    },
    grid: {
      borderColor: 'transparent',
    },
    xaxis: {
      crosshairs: {
        show: false,
      },
    },
    colors: ['rgb(52, 152, 219)'],

    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.5,
        opacityTo: 0.2,
        stops: [0, 60],
      },
    },
  };

  chartOptions4: any = {
    series: [
      {
        data: [0, 32, 18, 58],
      },
    ],
    chart: {
      height: 115,
      width: 180,
      type: 'area',
      fontFamily: 'Roboto, Arial, sans-serif',
      foreColor: '#5d6162',
      zoom: {
        enabled: false,
      },
      sparkline: {
        enabled: true,
      },
    },
    tooltip: {
      enabled: true,
      x: {
        show: false,
      },
      y: {
        title: {
          formatter: function (seriesName: any) {
            return '';
          },
        },
      },
      marker: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: [1],
    },
    title: {
      text: undefined,
    },
    grid: {
      borderColor: 'transparent',
    },
    xaxis: {
      crosshairs: {
        show: false,
      },
    },
    colors: ['rgb(231, 76, 60)'],

    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.5,
        opacityTo: 0.2,
        stops: [0, 60],
        colorStops: [
          [
            {
              offset: 0,
              color: 'rgba(231, 76, 60, 0.2)',
              opacity: 1,
            },
            {
              offset: 60,
              color: 'rgba(231, 76, 60, 0.2)',
              opacity: 0.1,
            },
          ],
        ],
      },
    },
  };
  chartOptions5: any = {
    series: [
      {
        data: [0, 32, 18, 58],
      },
    ],
    chart: {
      height: 115,
      width: 180,
      type: 'area',
      fontFamily: 'Roboto, Arial, sans-serif',
      foreColor: '#5d6162',
      zoom: {
        enabled: false,
      },
      sparkline: {
        enabled: true,
      },
    },
    tooltip: {
      enabled: true,
      x: {
        show: false,
      },
      y: {
        title: {
          formatter: function (seriesName: any) {
            return '';
          },
        },
      },
      marker: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: [1],
    },
    title: {
      text: undefined,
    },
    grid: {
      borderColor: 'transparent',
    },
    xaxis: {
      crosshairs: {
        show: false,
      },
    },
    colors: ['rgb(52, 152, 219)'],

    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.5,
        opacityTo: 0.2,
        stops: [0, 60],
      },
    },
  };

  chartOptions6: any = {
    series: [
      {
        data: [0, 32, 18, 58],
      },
    ],
    chart: {
      height: 115,
      width: 180,
      type: 'area',
      fontFamily: 'Poppins, Arial, sans-serif',
      foreColor: '#5d6162',
      zoom: {
        enabled: false,
      },
      sparkline: {
        enabled: true,
      },
    },
    tooltip: {
      enabled: true,
      x: {
        show: false,
      },
      y: {
        title: {
          formatter: function (seriesName: any) {
            return '';
          },
        },
      },
      marker: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: [1],
    },
    title: {
      text: undefined,
    },
    grid: {
      borderColor: 'transparent',
    },
    xaxis: {
      crosshairs: {
        show: false,
      },
    },
    colors: ['var(--primary-color)'],

    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.5,
        opacityTo: 0.2,
        stops: [0, 60],
        colorStops: [
          [
            {
              offset: 0,
              color: 'var(--primary02)',
              opacity: 1,
            },
            {
              offset: 60,
              color: 'var(--primary02)',
              opacity: 0.1,
            },
          ],
        ],
      },
    },
  };

  private readonly PIS_CACHE_KEY = 'home_dashboard_pis_summary';
  private readonly RIS_CACHE_KEY = 'home_dashboard_ris_summary';
  private readonly BIS_CACHE_KEY = 'home_dashboard_bis_summary';
  private readonly TIS_CACHE_KEY = 'home_dashboard_tis_summary';
  private readonly AIS_CACHE_KEY = 'home_dashboard_ais_summary';
  private readonly PMS_CACHE_KEY = 'home_dashboard_pms_summary';
  private readonly RWFIS_CACHE_KEY = 'home_dashboard_rwfis_summary';
  private readonly SUMMARY_CACHE_TTL_MS = 1000 * 60 * 30;
  private readonly API_BASE =
    'https://fantastic-reportapi-production.up.railway.app';

  totalPisProjects = 0;
  totalPisRoadLengthKm = 0;
  pisSummaryLoading = false;
  pisSummaryError = '';
  private readonly isBrowser = typeof window !== 'undefined';

  risSummary = {
    totalInventory: 0,
    totalDistressReported: 0,
    totalDistressPredicted: 0,
  };
  risSummaryLoading = false;
  risSummaryError = '';

  bisSummary = {
    totalBridges: 0,
  };
  bisSummaryLoading = false;
  bisSummaryError = '';

  tisSummary = {
    averageAadt: 0,
  };
  tisSummaryLoading = false;
  tisSummaryError = '';

  aisSummary = {
    totalAccidents: 0,
    totalInjuries: 0,
  };
  aisSummaryLoading = false;
  aisSummaryError = '';

  pmsSummary = {
    averageBituminousRi: 0,
    averageConcreteRi: 0,
    averageRiIndex: 0,
    totalBituminousLength: 0,
    totalConcreteLength: 0,
  };
  pmsSummaryLoading = false;
  pmsSummaryError = '';

  rwfisSummary = {
    averageOffset: 0,
    featureCount: 0,
  };
  rwfisSummaryLoading = false;
  rwfisSummaryError = '';

  reportSummary = {
    inventoryReports: 0,
    distressReports: 0,
  };

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }
    this.loadPisSummary();
    this.loadRisSummary();
    this.loadBisSummary();
    this.loadTisSummary();
    this.loadAisSummary();
    this.loadPmsSummary();
    this.loadRwfisSummary();
    this.loadReportSummary();
  }

  private getCachedValue<T>(
    key: string
  ): { value: T; timestamp: number } | null {
    if (!this.isBrowser) {
      return null;
    }
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed.timestamp === 'number' &&
        parsed.value !== undefined
      ) {
        return parsed;
      }
      return null;
    } catch (error) {
      console.warn('Failed to parse cached value', key, error);
      return null;
    }
  }

  private setCachedValue<T>(key: string, value: T): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      const payload = {
        value,
        timestamp: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(payload));
    } catch (error) {
      console.warn('Failed to cache value', key, error);
    }
  }

  private isCacheFresh(entry: { timestamp: number } | null): boolean {
    if (!entry) {
      return false;
    }
    return Date.now() - entry.timestamp < this.SUMMARY_CACHE_TTL_MS;
  }

  private async fetchProjectDateMap(
    path: string
  ): Promise<Record<string, string[]>> {
    const response = await fetch(`${this.API_BASE}/${path}`, {
      method: 'GET',
      headers: { accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Failed to load ${path}: ${response.status}`);
    }
    return response.json();
  }

  private async postAndFlatten(path: string, body: any): Promise<any[]> {
    const response = await fetch(`${this.API_BASE}/${path}`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`Failed to post ${path}: ${response.status}`);
    }
    const payload = await response.json();
    return this.flattenApiPayload(payload);
  }

  private flattenApiPayload(payload: any): any[] {
    const flattened: any[] = [];
    const walk = (input: any) => {
      if (Array.isArray(input)) {
        input.forEach((child) => walk(child));
      } else if (input !== null && input !== undefined) {
        flattened.push(input);
      }
    };
    walk(payload);
    return flattened;
  }

  private normalizeNumber(value: any): number {
    if (value === null || value === undefined) {
      return 0;
    }
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0;
    }
    if (typeof value === 'string') {
      const cleaned = value.replace(/,/g, '').trim();
      const parsed = parseFloat(cleaned);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  }

  private async loadPisSummary(): Promise<void> {
    this.pisSummaryLoading = true;
    this.pisSummaryError = '';

    const cached = this.getCachedValue<{
      totalProjects: number;
      totalRoadLengthKm: number;
    }>(this.PIS_CACHE_KEY);
    if (cached) {
      this.totalPisProjects = cached.value.totalProjects;
      this.totalPisRoadLengthKm = cached.value.totalRoadLengthKm;
      if (this.isCacheFresh(cached)) {
        this.pisSummaryLoading = false;
        return;
      }
    }

    try {
      const projectDates = await this.fetchProjectDateMap('projects-dates/pis');
      const projectEntries = Object.entries(projectDates || {});

      this.totalPisProjects = projectEntries.length;

      if (projectEntries.length === 0) {
        this.totalPisRoadLengthKm = 0;
        this.setCachedValue(this.PIS_CACHE_KEY, {
          totalProjects: this.totalPisProjects,
          totalRoadLengthKm: this.totalPisRoadLengthKm,
        });
        return;
      }

      const lengthPromises = projectEntries.map(
        async ([projectName, dates]) => {
          const availableDates = Array.isArray(dates) ? dates : [];
          const selectedDate =
            availableDates.length > 0 ? availableDates[0] : null;

          if (!selectedDate) {
            return 0;
          }

          try {
            const flatData = await this.postAndFlatten('pis_filter', {
              chainage_start: 0,
              chainage_end: 1381,
              date: selectedDate,
              direction: ['All'],
              project_name: [projectName.trim()],
            });

            const lengthItem = flatData.find(
              (item: any) => this.extractLengthValue(item) > 0
            );
            return lengthItem ? this.extractLengthValue(lengthItem) : 0;
          } catch (error) {
            console.error(`Failed to load length for ${projectName}`, error);
            return 0;
          }
        }
      );

      const lengths = await Promise.all(lengthPromises);
      const totalLength = lengths.reduce(
        (sum: number, value: number) =>
          sum + (Number.isFinite(value) ? value : 0),
        0
      );

      this.totalPisRoadLengthKm = totalLength > 0 ? Math.round(totalLength) : 0;
      this.setCachedValue(this.PIS_CACHE_KEY, {
        totalProjects: this.totalPisProjects,
        totalRoadLengthKm: this.totalPisRoadLengthKm,
      });
    } catch (error) {
      console.error('Failed to load PIS summary metrics', error);
      this.pisSummaryError = 'Unable to load PIS summary.';
      if (!cached) {
        this.totalPisProjects = 0;
        this.totalPisRoadLengthKm = 0;
      }
    } finally {
      this.pisSummaryLoading = false;
    }
  }

  private extractLengthValue(entry: any): number {
    if (!entry) {
      return 0;
    }

    const candidates = [
      entry.length,
      entry.Length,
      entry.project_length,
      entry.total_length,
      entry.road_length,
      entry?.length_km,
      entry?._rawItem?.length,
      entry?._rawItem?.Length,
      entry?._rawItem?.project_length,
      entry?._rawItem?.total_length,
      entry?._rawItem?.road_length,
    ];

    for (const candidate of candidates) {
      const numericValue = this.normalizeNumber(candidate);
      if (numericValue > 0) {
        return numericValue;
      }
    }

    return 0;
  }

  private async loadRisSummary(): Promise<void> {
    this.risSummaryLoading = true;
    this.risSummaryError = '';

    const cached = this.getCachedValue<typeof this.risSummary>(
      this.RIS_CACHE_KEY
    );
    if (cached) {
      this.risSummary = cached.value;
      if (this.isCacheFresh(cached)) {
        this.risSummaryLoading = false;
        return;
      }
    }

    try {
      const [inventoryTotal, distressReportedTotal, distressPredictedTotal] =
        await Promise.all([
          this.fetchTotalInventoryCount(),
          this.fetchDistressTotal('distress_reported'),
          this.fetchDistressTotal('distress_predicted'),
        ]);

      this.risSummary = {
        totalInventory: inventoryTotal,
        totalDistressReported: distressReportedTotal,
        totalDistressPredicted: distressPredictedTotal,
      };
      this.setCachedValue(this.RIS_CACHE_KEY, this.risSummary);
    } catch (error) {
      console.error('Failed to load RIS summary', error);
      this.risSummaryError = 'Unable to load RIS summary.';
      if (!cached) {
        this.risSummary = {
          totalInventory: 0,
          totalDistressReported: 0,
          totalDistressPredicted: 0,
        };
      }
    } finally {
      this.risSummaryLoading = false;
    }
  }

  private async loadBisSummary(): Promise<void> {
    this.bisSummaryLoading = true;
    this.bisSummaryError = '';

    const cached = this.getCachedValue<typeof this.bisSummary>(
      this.BIS_CACHE_KEY
    );
    if (cached) {
      this.bisSummary = cached.value;
      if (this.isCacheFresh(cached)) {
        this.bisSummaryLoading = false;
        return;
      }
    }

    try {
      const totalBridges = await this.fetchTotalBridges();
      this.bisSummary = { totalBridges };
      this.setCachedValue(this.BIS_CACHE_KEY, this.bisSummary);
    } catch (error) {
      console.error('Failed to load BIS summary', error);
      this.bisSummaryError = 'Unable to load BIS summary.';
      if (!cached) {
        this.bisSummary = { totalBridges: 0 };
      }
    } finally {
      this.bisSummaryLoading = false;
    }
  }

  private async loadTisSummary(): Promise<void> {
    this.tisSummaryLoading = true;
    this.tisSummaryError = '';

    const cached = this.getCachedValue<typeof this.tisSummary>(
      this.TIS_CACHE_KEY
    );
    if (cached) {
      this.tisSummary = cached.value;
      if (this.isCacheFresh(cached)) {
        this.tisSummaryLoading = false;
        return;
      }
    }

    try {
      const averageAadt = await this.fetchAverageAadt();
      this.tisSummary = { averageAadt };
      this.setCachedValue(this.TIS_CACHE_KEY, this.tisSummary);
    } catch (error) {
      console.error('Failed to load TIS summary', error);
      this.tisSummaryError = 'Unable to load TIS summary.';
      if (!cached) {
        this.tisSummary = { averageAadt: 0 };
      }
    } finally {
      this.tisSummaryLoading = false;
    }
  }

  private async loadAisSummary(): Promise<void> {
    this.aisSummaryLoading = true;
    this.aisSummaryError = '';

    const cached = this.getCachedValue<typeof this.aisSummary>(
      this.AIS_CACHE_KEY
    );
    if (cached) {
      this.aisSummary = cached.value;
      if (this.isCacheFresh(cached)) {
        this.aisSummaryLoading = false;
        return;
      }
    }

    try {
      const { totalAccidents, totalInjuries } =
        await this.fetchAccidentTotals();
      this.aisSummary = { totalAccidents, totalInjuries };
      this.setCachedValue(this.AIS_CACHE_KEY, this.aisSummary);
    } catch (error) {
      console.error('Failed to load AIS summary', error);
      this.aisSummaryError = 'Unable to load AIS summary.';
      if (!cached) {
        this.aisSummary = { totalAccidents: 0, totalInjuries: 0 };
      }
    } finally {
      this.aisSummaryLoading = false;
    }
  }

  private async loadPmsSummary(): Promise<void> {
    this.pmsSummaryLoading = true;
    this.pmsSummaryError = '';

    const cached = this.getCachedValue<typeof this.pmsSummary>(
      this.PMS_CACHE_KEY
    );
    if (cached) {
      this.pmsSummary = cached.value;
      if (this.isCacheFresh(cached)) {
        this.pmsSummaryLoading = false;
        return;
      }
    }

    try {
      const summary = await this.fetchPmsAverages();
      this.pmsSummary = summary;
      this.setCachedValue(this.PMS_CACHE_KEY, this.pmsSummary);
    } catch (error) {
      console.error('Failed to load PMS summary', error);
      this.pmsSummaryError = 'Unable to load PMS summary.';
      if (!cached) {
        this.pmsSummary = {
          averageBituminousRi: 0,
          averageConcreteRi: 0,
          averageRiIndex: 0,
          totalBituminousLength: 0,
          totalConcreteLength: 0,
        };
      }
    } finally {
      this.pmsSummaryLoading = false;
    }
  }

  private async loadRwfisSummary(): Promise<void> {
    this.rwfisSummaryLoading = true;
    this.rwfisSummaryError = '';

    const cached = this.getCachedValue<typeof this.rwfisSummary>(
      this.RWFIS_CACHE_KEY
    );
    if (cached) {
      this.rwfisSummary = cached.value;
      if (this.isCacheFresh(cached)) {
        this.rwfisSummaryLoading = false;
        return;
      }
    }

    try {
      const summary = await this.fetchRwfisSummary();
      this.rwfisSummary = summary;
      this.setCachedValue(this.RWFIS_CACHE_KEY, this.rwfisSummary);
    } catch (error) {
      console.error('Failed to load RWFIS summary', error);
      this.rwfisSummaryError = 'Unable to load RWFIS summary.';
      if (!cached) {
        this.rwfisSummary = { averageOffset: 0, featureCount: 0 };
      }
    } finally {
      this.rwfisSummaryLoading = false;
    }
  }

  private loadReportSummary(): void {
    if (!this.isBrowser) {
      this.reportSummary = {
        inventoryReports: 0,
        distressReports: 0,
      };
      return;
    }

    const inventoryReports = this.getLocalStorageArrayLength('test_inventory');
    const rigidDistress = this.getLocalStorageArrayLength(
      'test_rigid_distress'
    );
    const flexibleDistress = this.getLocalStorageArrayLength(
      'test_flexible_distress'
    );

    this.reportSummary = {
      inventoryReports,
      distressReports: rigidDistress + flexibleDistress,
    };
  }

  private getLocalStorageArrayLength(key: string): number {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        return 0;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.length;
      }
      return 0;
    } catch (error) {
      console.warn(`Failed to parse localStorage key ${key}`, error);
      return 0;
    }
  }

  private async fetchTotalInventoryCount(): Promise<number> {
    const projectDates = await this.fetchProjectDateMap(
      'projects-dates/inventory'
    );
    const entries = Object.entries(projectDates);
    if (entries.length === 0) {
      return 0;
    }

    const inventoryFields = [
      'trees',
      'adjacent_road',
      'sign_boards',
      'culvert',
      'toll_plaza',
      'bus_stop',
      'crash_barrier',
      'emergency_call_box',
      'km_stones',
      'street_lights',
      'truck_layby',
      'service_road',
      'junction',
      'fuel_station',
      'toilet_blocks',
      'rcc_drain',
      'solar_blinker',
      'median_opening',
      'bridges',
      'footpath',
      'tunnels',
      'median_plants',
      'rest_area',
    ];

    const totals = await Promise.all(
      entries.map(async ([projectName, dates]) => {
        const date = Array.isArray(dates) && dates.length > 0 ? dates[0] : null;
        if (!date) {
          return 0;
        }
        const body = {
          chainage_start: 0,
          chainage_end: 1381,
          date,
          direction: ['All'],
          project_name: [projectName.trim()],
          asset_type: ['All'],
        };
        try {
          const data = await this.postAndFlatten('inventory_filter', body);
          return data.reduce((sum, item) => {
            return (
              sum +
              inventoryFields.reduce((acc, field) => {
                const value = this.normalizeNumber(item[field]);
                return acc + value;
              }, 0)
            );
          }, 0);
        } catch (error) {
          console.warn(`Failed to load inventory for ${projectName}`, error);
          return 0;
        }
      })
    );

    return totals.reduce((sum, value) => sum + value, 0);
  }

  private async fetchDistressTotal(
    type: 'distress_reported' | 'distress_predicted'
  ): Promise<number> {
    const projectEndpoint = `projects-dates/${type}`;
    const filterEndpoint =
      type === 'distress_reported'
        ? 'distress_report_filter'
        : 'distress_predic_filter';

    const projectDates = await this.fetchProjectDateMap(projectEndpoint);
    const entries = Object.entries(projectDates);
    if (entries.length === 0) {
      return 0;
    }

    const totals = await Promise.all(
      entries.map(async ([projectName, dates]) => {
        const date = Array.isArray(dates) && dates.length > 0 ? dates[0] : null;
        if (!date) {
          return 0;
        }
        const body = {
          chainage_start: 0,
          chainage_end: 1381,
          date: this.ensureIsoDate(date),
          direction: ['All'],
          project_name: [projectName.trim()],
          distress_type: ['All'],
        };
        try {
          const data = await this.postAndFlatten(filterEndpoint, body);
          return data.length;
        } catch (error) {
          console.warn(
            `Failed to load distress (${type}) for ${projectName}`,
            error
          );
          return 0;
        }
      })
    );

    return totals.reduce((sum, value) => sum + value, 0);
  }

  private ensureIsoDate(dateString: string): string {
    if (!dateString) {
      return dateString;
    }
    if (dateString.includes('-') && dateString.length === 10) {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          return dateString;
        }
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    return dateString;
  }

  private async fetchTotalBridges(): Promise<number> {
    const projectDates = await this.fetchProjectDateMap(
      'projects-dates/inventory'
    );
    const entries = Object.entries(projectDates);
    if (entries.length === 0) {
      return 0;
    }

    const totals = await Promise.all(
      entries.map(async ([projectName, dates]) => {
        const date = Array.isArray(dates) && dates.length > 0 ? dates[0] : null;
        if (!date) {
          return 0;
        }
        const body = {
          chainage_start: 0,
          chainage_end: 1381,
          date,
          direction: ['All'],
          project_name: [projectName.trim()],
          asset_type: ['All'],
        };
        try {
          const data = await this.postAndFlatten('inventory_filter', body);
          return data.reduce(
            (sum, item) => sum + this.normalizeNumber(item.bridges),
            0
          );
        } catch (error) {
          console.warn(`Failed to load bridges for ${projectName}`, error);
          return 0;
        }
      })
    );

    return totals.reduce((sum, value) => sum + value, 0);
  }

  private async fetchAverageAadt(): Promise<number> {
    const projectDates = await this.fetchProjectDateMap('projects-dates/tis');
    const entries = Object.entries(projectDates);
    if (entries.length === 0) {
      return 0;
    }

    const totals = await Promise.all(
      entries.map(async ([projectName, dates]) => {
        const date = Array.isArray(dates) && dates.length > 0 ? dates[0] : null;
        if (!date) {
          return { sum: 0, count: 0 };
        }
        const body = {
          chainage_start: 0,
          chainage_end: 1381,
          date,
          direction: ['All'],
          project_name: [projectName.trim()],
        };
        try {
          const data = await this.postAndFlatten('tis_filter', body);
          let sum = 0;
          let count = 0;
          data.forEach((item) => {
            const raw = item._rawItem || item;
            const value = this.normalizeNumber(
              raw?.aadt_in_vehicles ?? raw?.aadt ?? raw?.AADT
            );
            if (value > 0) {
              sum += value;
              count += 1;
            }
          });
          return { sum, count };
        } catch (error) {
          console.warn(`Failed to load TIS data for ${projectName}`, error);
          return { sum: 0, count: 0 };
        }
      })
    );

    const totalSum = totals.reduce((sum, entry) => sum + entry.sum, 0);
    const totalCount = totals.reduce((sum, entry) => sum + entry.count, 0);
    return totalCount > 0 ? totalSum / totalCount : 0;
  }

  private async fetchAccidentTotals(): Promise<{
    totalAccidents: number;
    totalInjuries: number;
  }> {
    const projectDates = await this.fetchProjectDateMap('projects-dates/ais');
    const entries = Object.entries(projectDates);
    if (entries.length === 0) {
      return { totalAccidents: 0, totalInjuries: 0 };
    }

    const totals = await Promise.all(
      entries.map(async ([projectName, dates]) => {
        const date = Array.isArray(dates) && dates.length > 0 ? dates[0] : null;
        if (!date) {
          return { accidents: 0, injuries: 0 };
        }
        const body = {
          chainage_start: 0,
          chainage_end: 1381,
          date,
          direction: ['All'],
          project_name: [projectName.trim()],
        };
        try {
          const data = await this.postAndFlatten('ais_filter', body);
          return data.reduce(
            (acc, item) => {
              const stats = item.accident_statistics || item;
              return {
                accidents:
                  acc.accidents + this.normalizeNumber(stats?.total_accident),
                injuries:
                  acc.injuries + this.normalizeNumber(stats?.total_injury),
              };
            },
            { accidents: 0, injuries: 0 }
          );
        } catch (error) {
          console.warn(`Failed to load AIS data for ${projectName}`, error);
          return { accidents: 0, injuries: 0 };
        }
      })
    );

    const totalAccidents = totals.reduce(
      (sum, entry) => sum + entry.accidents,
      0
    );
    const totalInjuries = totals.reduce(
      (sum, entry) => sum + entry.injuries,
      0
    );
    return { totalAccidents, totalInjuries };
  }

  private async fetchPmsAverages(): Promise<{
    averageBituminousRi: number;
    averageConcreteRi: number;
    averageRiIndex: number;
    totalBituminousLength: number;
    totalConcreteLength: number;
  }> {
    const projectDates = await this.fetchProjectDateMap('projects-dates/pms');
    const entries = Object.entries(projectDates);
    if (entries.length === 0) {
      return {
        averageBituminousRi: 0,
        averageConcreteRi: 0,
        averageRiIndex: 0,
        totalBituminousLength: 0,
        totalConcreteLength: 0,
      };
    }

    const aggregates = await Promise.all(
      entries.map(async ([projectName, dates]) => {
        const date = Array.isArray(dates) && dates.length > 0 ? dates[0] : null;
        if (!date) {
          return {
            bituminous: { sum: 0, count: 0 },
            concrete: { sum: 0, count: 0 },
            riIndex: { sum: 0, count: 0 },
            lengths: { bituminous: 0, concrete: 0 },
          };
        }
        const body = {
          chainage_start: 0,
          chainage_end: 1381,
          date,
          direction: ['All'],
          project_name: [projectName.trim()],
          distress_type: ['All'],
        };
        try {
          const data = await this.postAndFlatten('pms_filter', body);
          let bituminousSum = 0;
          let bituminousCount = 0;
          let concreteSum = 0;
          let concreteCount = 0;
          let riIndexSum = 0;
          let riIndexCount = 0;
          let bituminousLength = 0;
          let concreteLength = 0;

          data.forEach((item) => {
            const raw = item._rawItem || item;
            const bituminousValue = this.extractNumericByKeywords(raw, [
              'bituminous',
              'ri',
            ]);
            if (bituminousValue !== null) {
              bituminousSum += bituminousValue;
              bituminousCount += 1;
            }
            const concreteValue = this.extractNumericByKeywords(raw, [
              'concrete',
              'ri',
            ]);
            if (concreteValue !== null) {
              concreteSum += concreteValue;
              concreteCount += 1;
            }

            const riIndexValue = this.extractNumericByKeywords(raw, [
              'ri',
              'index',
            ]);
            if (riIndexValue !== null) {
              riIndexSum += riIndexValue;
              riIndexCount += 1;
            }

            const pavementType = (raw.pavement_type || '')
              .toString()
              .toLowerCase();
            const segmentLength = this.normalizeNumber(
              (raw.chainage_end || item.chainage_end || 0) -
                (raw.chainage_start || item.chainage_start || 0)
            );
            if (segmentLength > 0) {
              if (
                pavementType.includes('bituminous') ||
                pavementType.includes('flexible')
              ) {
                bituminousLength += segmentLength;
              } else if (
                pavementType.includes('concrete') ||
                pavementType.includes('rigid')
              ) {
                concreteLength += segmentLength;
              }
            }
          });

          return {
            bituminous: { sum: bituminousSum, count: bituminousCount },
            concrete: { sum: concreteSum, count: concreteCount },
            riIndex: { sum: riIndexSum, count: riIndexCount },
            lengths: { bituminous: bituminousLength, concrete: concreteLength },
          };
        } catch (error) {
          console.warn(`Failed to load PMS data for ${projectName}`, error);
          return {
            bituminous: { sum: 0, count: 0 },
            concrete: { sum: 0, count: 0 },
            riIndex: { sum: 0, count: 0 },
            lengths: { bituminous: 0, concrete: 0 },
          };
        }
      })
    );

    const totalBituminous = aggregates.reduce(
      (acc, entry) => ({
        sum: acc.sum + entry.bituminous.sum,
        count: acc.count + entry.bituminous.count,
      }),
      { sum: 0, count: 0 }
    );

    const totalConcrete = aggregates.reduce(
      (acc, entry) => ({
        sum: acc.sum + entry.concrete.sum,
        count: acc.count + entry.concrete.count,
      }),
      { sum: 0, count: 0 }
    );

    const totalRiIndex = aggregates.reduce(
      (acc, entry) => ({
        sum: acc.sum + entry.riIndex.sum,
        count: acc.count + entry.riIndex.count,
      }),
      { sum: 0, count: 0 }
    );

    const totalLengths = aggregates.reduce(
      (acc, entry) => ({
        bituminous: acc.bituminous + entry.lengths.bituminous,
        concrete: acc.concrete + entry.lengths.concrete,
      }),
      { bituminous: 0, concrete: 0 }
    );

    return {
      averageBituminousRi:
        totalBituminous.count > 0
          ? totalBituminous.sum / totalBituminous.count
          : 0,
      averageConcreteRi:
        totalConcrete.count > 0 ? totalConcrete.sum / totalConcrete.count : 0,
      averageRiIndex:
        totalRiIndex.count > 0 ? totalRiIndex.sum / totalRiIndex.count : 0,
      totalBituminousLength: totalLengths.bituminous,
      totalConcreteLength: totalLengths.concrete,
    };
  }

  private extractNumericByKeywords(
    raw: any,
    keywords: string[]
  ): number | null {
    if (!raw || typeof raw !== 'object') {
      return null;
    }
    const loweredKeywords = keywords.map((k) => k.toLowerCase());
    for (const [key, value] of Object.entries(raw)) {
      const lowerKey = key.toLowerCase();
      const matches = loweredKeywords.every((kw) => lowerKey.includes(kw));
      if (matches) {
        const numericValue = this.normalizeNumber(value);
        if (Number.isFinite(numericValue)) {
          return numericValue;
        }
      }
    }
    return null;
  }

  private async fetchRwfisSummary(): Promise<{
    averageOffset: number;
    featureCount: number;
  }> {
    const projectDates = await this.fetchProjectDateMap('projects-dates/rwfis');
    const entries = Object.entries(projectDates);
    if (entries.length === 0) {
      return { averageOffset: 0, featureCount: 0 };
    }

    const aggregates = await Promise.all(
      entries.map(async ([projectName, dates]) => {
        const date = Array.isArray(dates) && dates.length > 0 ? dates[0] : null;
        if (!date) {
          return { offsetSum: 0, offsetCount: 0, count: 0 };
        }
        const body = {
          chainage_start: 0,
          chainage_end: 1381,
          date,
          direction: ['All'],
          project_name: [projectName.trim()],
        };
        try {
          const data = await this.postAndFlatten('rwfis_filter', body);
          let offsetSum = 0;
          let offsetCount = 0;
          data.forEach((item) => {
            const raw = item._rawItem || item;
            const offsetValue = this.extractNumericByKeywords(raw, ['offset']);
            if (offsetValue !== null) {
              offsetSum += offsetValue;
              offsetCount += 1;
            }
          });
          return { offsetSum, offsetCount, count: data.length };
        } catch (error) {
          console.warn(`Failed to load RWFIS data for ${projectName}`, error);
          return { offsetSum: 0, offsetCount: 0, count: 0 };
        }
      })
    );

    const totalOffset = aggregates.reduce(
      (acc, entry) => ({
        sum: acc.sum + entry.offsetSum,
        count: acc.count + entry.offsetCount,
        featureCount: acc.featureCount + entry.count,
      }),
      { sum: 0, count: 0, featureCount: 0 }
    );

    return {
      averageOffset:
        totalOffset.count > 0 ? totalOffset.sum / totalOffset.count : 0,
      featureCount: totalOffset.featureCount,
    };
  }
}
