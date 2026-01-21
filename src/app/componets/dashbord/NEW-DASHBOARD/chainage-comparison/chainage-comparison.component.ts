import {
  Component,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEchartsModule, provideEcharts } from 'ngx-echarts';

interface ReportData {
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
  apiType?: string;
  _rawItem?: any;
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

interface DashboardCard {
  title: string;
  path: string;
  icon: string;
  apiType?: string;
}

@Component({
  selector: 'app-chainage-comparison',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEchartsModule],
  providers: [provideEcharts()],
  templateUrl: './chainage-comparison.component.html',
  styleUrl: './chainage-comparison.component.scss',
})
export class ChainageComparisonComponent implements OnInit, OnDestroy {
  rawData: ReportData[] = [];
  filters: FilterData = {
    date: '',
    projectName: '',
    direction: 'Increasing',
    chainageRange: { min: 0, max: 1380.387 },
    pavementType: 'All',
    lane: 'All',
    distressType: 'All',
  };
  dashboardCards: DashboardCard[] = [];
  selectedCards: string[] = [];

  selectedCardsForComparison: Set<string> = new Set();
  chainageComparisonChartOptions: any = {};
  comparisonChainageMin: number = 0;
  comparisonChainageMax: number = 1380.387;

  public isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      // Load data from sessionStorage
      const storedData = sessionStorage.getItem('chainageComparisonData');
      if (storedData) {
        try {
          const comparisonData = JSON.parse(storedData);
          this.rawData = comparisonData.rawData || [];
          this.filters = comparisonData.filters || this.filters;
          this.selectedCards = comparisonData.selectedCards || [];
          this.dashboardCards = comparisonData.dashboardCards || [];

          // Initialize comparison chainage range
          this.comparisonChainageMin = this.filters.chainageRange.min;
          this.comparisonChainageMax = this.filters.chainageRange.max;

          // Auto-select first 3 cards if available
          if (this.selectedCards.length > 0) {
            this.selectedCardsForComparison = new Set(
              this.selectedCards.slice(0, 3)
            );
          } else if (this.dashboardCards.length > 0) {
            this.selectedCardsForComparison = new Set(
              this.dashboardCards.slice(0, 3).map((c) => c.title)
            );
          }

          // Generate chart after a short delay
          setTimeout(() => {
            this.generateChainageComparisonChart();
          }, 100);
        } catch (error) {
          console.error('Error loading comparison data:', error);
        }
      }
    }
  }

  ngOnDestroy() {
    // Clean up sessionStorage
    if (this.isBrowser) {
      sessionStorage.removeItem('chainageComparisonData');
    }
  }

  getFilteredData(): ReportData[] {
    return this.rawData.filter((item) => {
      const matchesDirection =
        this.filters.direction === 'All' ||
        item.direction === this.filters.direction;
      const matchesChainage =
        item.chainage_start <= this.filters.chainageRange.max &&
        item.chainage_end >= this.filters.chainageRange.min;
      const matchesPavement =
        this.filters.pavementType === 'All' ||
        item.pavement_type === this.filters.pavementType;
      const matchesLane =
        this.filters.lane === 'All' || item.lane === this.filters.lane;

      return (
        matchesDirection && matchesChainage && matchesPavement && matchesLane
      );
    });
  }

  getColorForApiType(apiType: string): string {
    const colorMap: { [key: string]: string } = {
      inventory: '#4CAF50',
      reported: '#FF5722',
      predicted: '#9C27B0',
      tis: '#FF9800',
      ais: '#F44336',
      pms: '#2196F3',
      rwfis: '#00BCD4',
    };
    return colorMap[apiType] || '#9E9E9E';
  }

  isCardSelectedForComparison(cardTitle: string): boolean {
    return this.selectedCardsForComparison.has(cardTitle);
  }

  toggleCardForComparison(cardTitle: string) {
    if (this.selectedCardsForComparison.has(cardTitle)) {
      this.selectedCardsForComparison.delete(cardTitle);
    } else {
      if (this.selectedCardsForComparison.size < 5) {
        this.selectedCardsForComparison.add(cardTitle);
      } else {
        console.warn('Maximum 5 cards can be selected for comparison');
        return;
      }
    }
    this.generateChainageComparisonChart();
  }

  getCardColor(apiType: string): string {
    return this.getColorForApiType(apiType);
  }

  getCardChipBackgroundColor(cardTitle: string): string {
    if (this.selectedCardsForComparison.has(cardTitle)) {
      const card = this.dashboardCards.find((c) => c.title === cardTitle);
      if (card && card.apiType) {
        const color = this.getColorForApiType(card.apiType);
        return color + '20';
      }
    }
    return 'transparent';
  }

  generateChainageComparisonChart() {
    if (!this.rawData || this.rawData.length === 0) {
      console.log('No data available for chainage comparison chart');
      this.chainageComparisonChartOptions = {};
      return;
    }

    if (this.selectedCardsForComparison.size === 0) {
      this.chainageComparisonChartOptions = {};
      return;
    }

    const filteredData = this.getFilteredData();

    if (filteredData.length === 0) {
      console.log('No filtered data for chainage comparison chart');
      this.chainageComparisonChartOptions = {};
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

    this.selectedCardsForComparison.forEach((cardTitle) => {
      const card = this.dashboardCards.find((c) => c.title === cardTitle);
      if (!card || !card.apiType) return;

      const apiType = card.apiType;
      const cardColor = this.getColorForApiType(apiType);

      const cardData = filteredData.filter(
        (item) => item.apiType === apiType
      );

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
          let result = `Chainage: ${params[0].axisValue} km<br/>`;
          params.forEach((param: any) => {
            result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></span>`;
            result += `${param.seriesName}: ${param.value}<br/>`;
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
        left: isTabletOrSmaller ? '15%' : '10%',
        right: '10%',
        bottom: isTabletOrSmaller ? '20%' : '15%',
        top: '20%',
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

  onChainageMinChange(event: any) {
    const value = parseFloat(event.target.value);
    if (!isNaN(value)) {
      this.comparisonChainageMin = Math.max(
        this.filters.chainageRange.min,
        Math.min(value, this.comparisonChainageMax - 0.1)
      );
      this.generateChainageComparisonChart();
    }
  }

  onChainageMaxChange(event: any) {
    const value = parseFloat(event.target.value);
    if (!isNaN(value)) {
      this.comparisonChainageMax = Math.min(
        this.filters.chainageRange.max,
        Math.max(value, this.comparisonChainageMin + 0.1)
      );
      this.generateChainageComparisonChart();
    }
  }

  closeWindow() {
    if (this.isBrowser && window.opener) {
      window.close();
    }
  }
}

