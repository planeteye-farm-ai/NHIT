# Environment configuration

## Google Maps API key (Street View, traffic, directions)

1. Open **`environment.ts`** (and **`environment.prod.ts`** for production).
2. Replace `'YOUR_GOOGLE_MAPS_API_KEY'` with your key in the **`GOOGLE_MAPS_API_KEY`** constant at the top of each file.

```ts
const GOOGLE_MAPS_API_KEY = 'AIzaSy...your-key-here';
```

- Get a key: [Google Cloud Console → APIs & Credentials](https://console.cloud.google.com/apis/credentials)
- Enable **Maps JavaScript API** (this includes Street View).

One key is used for: RIS Street View, TIS traffic/directions, and any other Google Maps features in the app.
