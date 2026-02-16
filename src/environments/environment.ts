// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// ─── Google Maps API Key (Street View, Directions, Traffic, etc.) ───
// Paste your key from: https://console.cloud.google.com/apis/credentials
// Enable: Maps JavaScript API (includes Street View)
const GOOGLE_MAPS_API_KEY = 'AIzaSyBIulIk9GjlhZ1p5SwPZJ3O19mbAki9lPY';

export const environment = {
  production: true,
  firebase: {
    apiKey: '***************************************',
    authDomain: '************************',
    projectId: '***********************************',
    storageBucket: '************************',
    messagingSenderId: '*********************',
    appId: '*******************************************',
    measurementId: '*********************',
  },
  googleMapsApiKey: GOOGLE_MAPS_API_KEY,
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
