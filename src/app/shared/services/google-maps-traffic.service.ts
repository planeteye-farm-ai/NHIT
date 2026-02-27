import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

export interface RouteSegment {
  segment_no: number;
  from_marker: string;
  to_marker: string;
  distance: string;
  time_required: string;
  duration_seconds: number;
}

export interface RouteData {
  route: string;
  total_kms: number;
  total_seconds: number;
  total_time: string;
  date_times: string;
  departure_time: string;
  segments: RouteSegment[];
  origin: string;
  destination: string;
}

@Injectable({
  providedIn: 'root',
})
export class GoogleMapsTrafficService {
  private googleMapsLoaded: boolean = false;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Returns true when the Maps JS core (google.maps.Map) is ready.
   * We no longer gate on DirectionsService because that class may not be
   * activated in the project (ApiNotActivatedMapError) and its absence
   * must not crash the readiness check.
   */
  private isMapsReady(): boolean {
    try {
      return (
        typeof google !== 'undefined' &&
        !!google.maps &&
        typeof google.maps.Map === 'function'
      );
    } catch {
      return false;
    }
  }

  /**
   * Load Google Maps API script dynamically
   */
  loadGoogleMaps(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isBrowser) {
        reject(new Error('Not in browser environment'));
        return;
      }

      if (this.isMapsReady()) {
        this.googleMapsLoaded = true;
        resolve();
        return;
      }

      if (this.googleMapsLoaded) {
        resolve();
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com/maps/api/js"]'
      ) as HTMLScriptElement;

      if (existingScript) {
        const existingKey = existingScript.src.match(/[?&]key=([^&]+)/)?.[1];
        const correctKey = environment.googleMapsApiKey;

        if (existingKey && existingKey !== correctKey) {
          console.warn('Removing existing Google Maps script with different API key');
          existingScript.remove();
          // Fall through to load with the correct key
        } else {
          // Same key (or unknown key) — wait for the existing script
          if (this.isMapsReady()) {
            this.googleMapsLoaded = true;
            resolve();
            return;
          }
          const waitForLoad = () => {
            const checkReady = () => {
              if (this.isMapsReady()) {
                this.googleMapsLoaded = true;
                resolve();
              } else {
                setTimeout(checkReady, 50);
              }
            };
            checkReady();
            setTimeout(() => {
              if (!this.googleMapsLoaded) {
                reject(new Error('Google Maps API failed to initialize within timeout period'));
              }
            }, 10000);
          };
          existingScript.addEventListener('load', waitForLoad);
          existingScript.addEventListener('error', () =>
            reject(new Error('Failed to load Google Maps API'))
          );
          return;
        }
      }

      // Validate API key
      if (!environment.googleMapsApiKey || environment.googleMapsApiKey.includes('YOUR_')) {
        reject(new Error('Google Maps API key is not configured. Please set GOOGLE_MAPS_API_KEY in environment.'));
        return;
      }

      const script = document.createElement('script');
      // Include the Routes library for the modern Routes API alongside legacy libraries
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=geometry,marker,routes&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        const checkReady = () => {
          if (this.isMapsReady()) {
            this.googleMapsLoaded = true;
            resolve();
          } else {
            setTimeout(checkReady, 50);
          }
        };
        checkReady();
        setTimeout(() => {
          if (!this.googleMapsLoaded) {
            reject(new Error('Google Maps API failed to initialize within timeout period'));
          }
        }, 10000);
      };
      script.onerror = () => {
        reject(new Error('Failed to load Google Maps API. Please check your API key.'));
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  haversineDistance(point1: google.maps.LatLng, point2: google.maps.LatLng): number {
    const R = 6371000; // Earth radius in meters
    const lat1 = (point1.lat() * Math.PI) / 180;
    const lat2 = (point2.lat() * Math.PI) / 180;
    const deltaLat = ((point2.lat() - point1.lat()) * Math.PI) / 180;
    const deltaLng = ((point2.lng() - point1.lng()) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLng / 2) *
        Math.sin(deltaLng / 2);
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  /**
   * Get marker coordinates every intervalMeters along the path
   */
  getMarkerCoordinatesFromPath(
    path: google.maps.LatLng[],
    intervalMeters: number
  ): google.maps.LatLng[] {
    const markers = [path[0]];
    let accumulated = 0;

    for (let i = 1; i < path.length; i++) {
      const dist = this.haversineDistance(path[i - 1], path[i]);
      accumulated += dist;
      if (accumulated >= intervalMeters) {
        markers.push(path[i]);
        accumulated = 0;
      }
    }
    markers.push(path[path.length - 1]);
    return markers;
  }

  /**
   * Fetch route data using Google Directions API
   */
  fetchRouteData(
    origin: string | google.maps.LatLng,
    destination: string | google.maps.LatLng,
    departureTime: Date
  ): Promise<google.maps.DirectionsResult> {
    return new Promise((resolve, reject) => {
      if (!this.isBrowser || !this.isMapsReady()) {
        reject(new Error('Google Maps API not loaded'));
        return;
      }

      if (!google.maps.DirectionsService) {
        reject(new Error(
          'Google Maps DirectionsService is not available. ' +
          'Please enable the Directions API in the Google Cloud Console for your project.'
        ));
        return;
      }

      const directionsService = new google.maps.DirectionsService();
      const request: google.maps.DirectionsRequest = {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: departureTime,
          trafficModel: google.maps.TrafficModel.BEST_GUESS,
        },
      };

      directionsService.route(request, (result, status) => {
        if (status === 'OK' && result) {
          resolve(result);
        } else {
          reject(new Error('Directions request failed: ' + status));
        }
      });
    });
  }

  /**
   * Fetch route without traffic (no departure time). Used when request with traffic fails (e.g. INVALID_REQUEST).
   */
  private fetchRouteDataWithoutTraffic(
    origin: string | google.maps.LatLng,
    destination: string | google.maps.LatLng
  ): Promise<google.maps.DirectionsResult> {
    return new Promise((resolve, reject) => {
      if (!this.isBrowser || !this.isMapsReady()) {
        reject(new Error('Google Maps API not loaded'));
        return;
      }
      if (!google.maps.DirectionsService) {
        reject(new Error(
          'Google Maps DirectionsService is not available. ' +
          'Please enable the Directions API in the Google Cloud Console.'
        ));
        return;
      }
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin,
          destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK' && result) resolve(result);
          else reject(new Error('Directions request failed: ' + status));
        }
      );
    });
  }

  /**
   * Fetch segment traffic data using Distance Matrix API
   */
  fetchSegmentTraffic(
    origin: google.maps.LatLng,
    destination: google.maps.LatLng,
    departureTime: Date
  ): Promise<google.maps.DistanceMatrixResponse> {
    return new Promise((resolve, reject) => {
      if (!this.isBrowser || typeof google === 'undefined' || !google.maps) {
        reject(new Error('Google Maps API not loaded'));
        return;
      }

      const distanceMatrixService = new google.maps.DistanceMatrixService();
      distanceMatrixService.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: google.maps.TravelMode.DRIVING,
          drivingOptions: {
            departureTime: departureTime,
            trafficModel: google.maps.TrafficModel.BEST_GUESS,
          },
        },
        (response, status) => {
          if (status === 'OK' && response) {
            resolve(response);
          } else {
            reject(new Error('Distance Matrix request failed: ' + status));
          }
        }
      );
    });
  }

  /**
   * Get route for immediate display (Directions API only, no per-segment traffic).
   * Use this to show the road on the map instantly; optional: run processRouteWithTraffic in background for traffic colors.
   */
  async getRouteForDisplay(
    origin: string | google.maps.LatLng,
    destination: string | google.maps.LatLng,
    departureTime: Date
  ): Promise<{ routeData: RouteData; directionsResult: google.maps.DirectionsResult }> {
    if (!this.isBrowser) throw new Error('Not in browser environment');

    const nowMs = Date.now();
    const minDeparture = nowMs + 60 * 1000;
    if (departureTime.getTime() < minDeparture) departureTime = new Date(minDeparture);

    await this.loadGoogleMaps();
    if (!this.isMapsReady()) throw new Error('Google Maps API is not available');

    let directionsResult: google.maps.DirectionsResult;
    try {
      directionsResult = await this.fetchRouteData(origin, destination, departureTime);
    } catch (err) {
      directionsResult = await this.fetchRouteDataWithoutTraffic(origin, destination);
    }
    const route = directionsResult.routes[0];
    const leg = route.legs[0];
    const legDuration = leg.duration?.value ?? 0;
    const legDistance = leg.distance?.value ?? 0;
    const hours = Math.floor(legDuration / 3600);
    const minutes = Math.floor((legDuration % 3600) / 60);
    const seconds = Math.floor(legDuration % 60);
    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const now = new Date();
    const originStr = typeof origin === 'string' ? origin : `${origin.lat()},${origin.lng()}`;
    const destinationStr = typeof destination === 'string' ? destination : `${destination.lat()},${destination.lng()}`;

    const routeData: RouteData = {
      route: `${leg.start_address} → ${leg.end_address}`,
      total_kms: Math.round(legDistance / 1000) || 1,
      total_seconds: legDuration,
      total_time: timeStr,
      date_times: now.toISOString().slice(0, 16).replace('T', ' '),
      departure_time: departureTime.toISOString(),
      segments: [
        {
          segment_no: 1,
          from_marker: 'Source',
          to_marker: 'Destination',
          distance: leg.distance?.text ?? `${Math.round(legDistance / 1000)} km`,
          time_required: leg.duration?.text ?? timeStr,
          duration_seconds: legDuration,
        },
      ],
      origin: originStr,
      destination: destinationStr,
    };
    return { routeData, directionsResult };
  }

  /**
   * Process route with traffic data - main function
   */
  async processRouteWithTraffic(
    origin: string | google.maps.LatLng,
    destination: string | google.maps.LatLng,
    departureTime: Date
  ): Promise<RouteData> {
    if (!this.isBrowser) {
      throw new Error('Not in browser environment');
    }

    // Traffic API requires departure_time to be now or in the future; clamp to avoid INVALID_REQUEST
    const nowMs = Date.now();
    const minDeparture = nowMs + 60 * 1000; // 1 minute from now
    if (departureTime.getTime() < minDeparture) {
      departureTime = new Date(minDeparture);
    }

    // Ensure Google Maps is loaded
    await this.loadGoogleMaps();
    if (!this.isMapsReady()) {
      throw new Error('Google Maps API is not available. Please check your API key and enabled APIs.');
    }

    // Step 1: Get route from Directions API (with traffic). If that fails (e.g. departure_time in past), get route without traffic.
    let directionsResult: google.maps.DirectionsResult;
    try {
      directionsResult = await this.fetchRouteData(origin, destination, departureTime);
    } catch (err) {
      console.warn('Directions with traffic failed, falling back to route without traffic:', (err as Error)?.message);
      directionsResult = await this.fetchRouteDataWithoutTraffic(origin, destination);
    }
    const route = directionsResult.routes[0];
    const leg = route.legs[0];
    const legDurationSeconds = leg.duration?.value ?? 0;

    // Step 2: Decode polyline to get detailed path
    let detailedPath: google.maps.LatLng[] = [];
    leg.steps.forEach((step) => {
      // Access polyline property with proper type casting
      const stepPolyline = (step as any).polyline;
      if (stepPolyline && stepPolyline.points) {
        const stepPath = google.maps.geometry.encoding.decodePath(
          stepPolyline.points
        );
        detailedPath = detailedPath.concat(stepPath);
      }
    });
    if (detailedPath.length === 0) {
      // Access overview_polyline with proper type handling
      const overviewPolyline = (route as any).overview_polyline;
      if (overviewPolyline) {
        const polylineString = typeof overviewPolyline === 'string' 
          ? overviewPolyline 
          : overviewPolyline.points || overviewPolyline;
        detailedPath = google.maps.geometry.encoding.decodePath(
          polylineString
        );
      }
    }

    // Step 3: Get 1km markers along the path
    const markers = this.getMarkerCoordinatesFromPath(detailedPath, 1000);
    const numSegments = Math.max(1, markers.length - 1);
    const fallbackSegmentSeconds = legDurationSeconds > 0 ? Math.round(legDurationSeconds / numSegments) : 60;

    // Step 4: Fetch traffic data for each segment (failures use estimated duration so route still completes)
    const segments: RouteSegment[] = [];
    let totalSeconds = 0;

    for (let i = 0; i < markers.length - 1; i++) {
      const originPoint = markers[i];
      const destPoint = markers[i + 1];

      try {
        const dmResult = await this.fetchSegmentTraffic(
          originPoint,
          destPoint,
          departureTime
        );
        const element = dmResult.rows[0].elements[0];

        if (element.status === 'OK') {
          const durationInTraffic = element.duration_in_traffic
            ? element.duration_in_traffic.value
            : element.duration.value;

          totalSeconds += durationInTraffic;

          segments.push({
            segment_no: i + 1,
            from_marker: i === 0 ? 'Source' : `${i} km`,
            to_marker:
              i + 1 === markers.length - 1 ? 'Destination' : `${i + 1} km`,
            distance: element.distance.text,
            time_required: element.duration_in_traffic
              ? element.duration_in_traffic.text
              : element.duration.text,
            duration_seconds: durationInTraffic,
          });
        } else {
          totalSeconds += fallbackSegmentSeconds;
          segments.push({
            segment_no: i + 1,
            from_marker: i === 0 ? 'Source' : `${i} km`,
            to_marker: i + 1 === markers.length - 1 ? 'Destination' : `${i + 1} km`,
            distance: '~1 km',
            time_required: `${Math.round(fallbackSegmentSeconds / 60)} min`,
            duration_seconds: fallbackSegmentSeconds,
          });
        }

        // Small delay to respect API rate limits
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.warn(`Segment ${i + 1} failed:`, (error as Error)?.message);
        totalSeconds += fallbackSegmentSeconds;
        segments.push({
          segment_no: i + 1,
          from_marker: i === 0 ? 'Source' : `${i} km`,
          to_marker: i + 1 === markers.length - 1 ? 'Destination' : `${i + 1} km`,
          distance: '~1 km',
          time_required: `${Math.round(fallbackSegmentSeconds / 60)} min`,
          duration_seconds: fallbackSegmentSeconds,
        });
      }
    }

    // Step 5: Create route entry
    const now = new Date();
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const timeStr = `${String(hours).padStart(2, '0')}:${String(
      minutes
    ).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const originStr =
      typeof origin === 'string'
        ? origin
        : `${origin.lat()},${origin.lng()}`;
    const destinationStr =
      typeof destination === 'string'
        ? destination
        : `${destination.lat()},${destination.lng()}`;

    return {
      route: `${leg.start_address} → ${leg.end_address}`,
      total_kms: segments.length,
      total_seconds: totalSeconds,
      total_time: timeStr,
      date_times: now.toISOString().slice(0, 16).replace('T', ' '),
      departure_time: departureTime.toISOString(),
      segments: segments,
      origin: originStr,
      destination: destinationStr,
    };
  }

  /**
   * Get traffic color based on duration
   */
  getTrafficColor(
    durationSeconds: number,
    baseDurationSeconds: number
  ): string {
    if (!baseDurationSeconds || baseDurationSeconds === 0) {
      return '#00BFFF'; // Sky blue by default
    }

    const ratio = durationSeconds / baseDurationSeconds;

    if (ratio <= 1.1) return '#00BFFF'; // Sky blue - Free flow
    if (ratio <= 1.3) return '#FFEB3B'; // Yellow - Light traffic
    if (ratio <= 1.6) return '#FF9800'; // Orange - Moderate traffic
    if (ratio <= 2.0) return '#F44336'; // Red - Heavy traffic
    return '#D32F2F'; // Dark red - Severe traffic
  }

  /**
   * Get traffic status text
   */
  getTrafficStatus(
    durationSeconds: number,
    baseDurationSeconds: number
  ): { text: string; class: string } {
    if (!baseDurationSeconds || baseDurationSeconds === 0) {
    return { text: 'Free Flow', class: 'traffic-green' };
    }

    const ratio = durationSeconds / baseDurationSeconds;

    if (ratio <= 1.1)
      return { text: 'Free Flow', class: 'traffic-green' };
    if (ratio <= 1.3)
      return { text: 'Light Traffic', class: 'traffic-yellow' };
    if (ratio <= 1.6)
      return { text: 'Moderate Traffic', class: 'traffic-orange' };
    if (ratio <= 2.0)
      return { text: 'Heavy Traffic', class: 'traffic-red' };
    return { text: 'Severe Traffic', class: 'traffic-dark-red' };
  }
}

