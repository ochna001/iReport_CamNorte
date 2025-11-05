# OpenStreetMap Integration

## ✅ No Setup Required!

The app now uses **OpenStreetMap (OSM)** for maps, which is:
- 🆓 **Completely FREE**
- 🔓 **No API keys needed**
- 🌍 **Open source and community-driven**
- 📍 **Works out of the box**

## How It Works

The app uses `react-native-maps` with **OSM France HOT (Humanitarian OpenStreetMap Team)** tile server:
- Tile URL: `https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png`
- Maximum zoom level: 19
- Already integrated in `LocationCard.tsx`

### Why OSM France HOT?

We use the Humanitarian OpenStreetMap Team tile server because:
- ✅ **Mobile-friendly**: Designed for app usage
- ✅ **Compliant**: Follows OSM tile usage policy
- ✅ **Humanitarian focus**: Perfect for emergency/incident reporting apps
- ✅ **No User-Agent issues**: More permissive than main OSM tiles
- ✅ **Reliable**: Maintained by OSM France community

## Features

- ✅ Interactive map display
- ✅ Draggable marker for location editing
- ✅ Tap to change location
- ✅ Zoom and pan controls
- ✅ Shows current location with marker
- ✅ Displays address on marker

## Usage in App

1. Go to any screen with location (e.g., incident form)
2. Expand the location card by tapping the chevron
3. Map will display with a marker at the current location
4. If editable, you can:
   - Tap anywhere on the map to change location
   - Drag the marker to a new position
   - Zoom in/out with pinch gestures

## OSM Tile Usage Policy Compliance

We comply with OSM's tile usage policy by:
- ✅ **Using HOT tile server**: Designed for humanitarian/emergency apps
- ✅ **Caching tiles**: react-native-maps automatically caches tiles locally
- ✅ **Reasonable usage**: Only loads tiles when user expands map
- ✅ **No bulk downloads**: Only loads visible tiles
- ✅ **Proper attribution**: OpenStreetMap data is credited

### Important Notes

The main OSM tile server (`tile.openstreetmap.org`) has strict policies:
- ❌ Requires proper User-Agent headers
- ❌ Not recommended for mobile apps
- ❌ Can block apps that don't comply

**We use `tile.openstreetmap.fr/hot` instead**, which:
- ✅ Is designed for humanitarian and emergency response apps
- ✅ Is more permissive for mobile applications
- ✅ Supports the same data quality
- ✅ Is maintained by the OSM France community

## Alternative Tile Servers

If you need different map styles, you can change the `urlTemplate` in `LocationCard.tsx`:

### Humanitarian Style
```typescript
urlTemplate="https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
```

### Dark Mode
```typescript
urlTemplate="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png"
```

### Satellite (requires Mapbox token)
```typescript
urlTemplate="https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png?access_token=YOUR_TOKEN"
```

## Troubleshooting

### Map shows blank
- Check internet connection
- Verify location permissions are granted
- Try zooming out
- Check if OSM tile server is accessible

### Map loads slowly
- Normal on first load (tiles are being downloaded)
- Subsequent loads will be faster (tiles are cached)
- Consider reducing initial zoom level

### Map not showing after build
- Ensure you rebuilt the app after enabling maps
- Check if `react-native-maps` is properly linked
- Run: `npx expo prebuild --clean` then rebuild

## Benefits Over Google Maps

| Feature | OpenStreetMap | Google Maps |
|---------|--------------|-------------|
| Cost | Free | $200/month free, then paid |
| API Key | Not required | Required |
| Setup | Zero config | Complex setup |
| Data | Open source | Proprietary |
| Restrictions | Minimal | Usage limits |

## Learn More

- [OpenStreetMap](https://www.openstreetmap.org/)
- [OSM Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/)
- [react-native-maps Documentation](https://github.com/react-native-maps/react-native-maps)
