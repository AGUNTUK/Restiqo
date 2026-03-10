'use client'

import { useCallback, useState, useMemo } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '16px',
}

const defaultCenter = {
  lat: 23.8103,
  lng: 90.4125,
}

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
}

interface GoogleMapProps {
  center?: { lat: number; lng: number }
  zoom?: number
  markers?: Array<{
    position: { lat: number; lng: number }
    title?: string
    info?: string
  }>
  onMapClick?: (lat: number, lng: number) => void
  height?: string
  showInfoWindow?: boolean
}

function resolveGoogleMapsApiKey() {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? ''
  if (!key) return ''
  if (key.toLowerCase().includes('your_google_maps_api_key')) return ''
  return key
}

function MapsUnavailable({ height, message }: { height: string; message: string }) {
  return (
    <div
      className="flex items-center justify-center bg-gray-200 rounded-2xl"
      style={{ height }}
    >
      <p className="text-gray-500">{message}</p>
    </div>
  )
}

function GoogleMapInner({
  center = defaultCenter,
  zoom = 12,
  markers = [],
  onMapClick,
  height = '400px',
  showInfoWindow = true,
  googleMapsApiKey,
}: GoogleMapProps & { googleMapsApiKey: string }) {
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null)

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey,
  })

  const mapCenter = useMemo(() => center, [center])

  const onMapClickHandler = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (onMapClick && e.latLng) {
        const lat = e.latLng.lat()
        const lng = e.latLng.lng()
        onMapClick(lat, lng)
      }
    },
    [onMapClick]
  )

  if (loadError) {
    return <MapsUnavailable height={height} message="Error loading maps" />
  }

  if (!isLoaded) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 rounded-2xl animate-pulse"
        style={{ height }}
      >
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <GoogleMap
      mapContainerStyle={{ ...mapContainerStyle, height }}
      center={mapCenter}
      zoom={zoom}
      options={mapOptions}
      onClick={onMapClickHandler}
    >
      {markers.map((marker, index) => (
        <Marker
          key={index}
          position={marker.position}
          title={marker.title}
          onClick={() => setSelectedMarker(index)}
        />
      ))}

      {showInfoWindow &&
        selectedMarker !== null &&
        markers[selectedMarker] && (
          <InfoWindow
            position={markers[selectedMarker].position}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="p-2 max-w-xs">
              {markers[selectedMarker].title && (
                <h3 className="font-semibold text-gray-900">
                  {markers[selectedMarker].title}
                </h3>
              )}
              {markers[selectedMarker].info && (
                <p className="text-sm text-gray-600 mt-1">
                  {markers[selectedMarker].info}
                </p>
              )}
            </div>
          </InfoWindow>
        )}
    </GoogleMap>
  )
}

export default function GoogleMapComponent({
  center = defaultCenter,
  zoom = 12,
  markers = [],
  onMapClick,
  height = '400px',
  showInfoWindow = true,
}: GoogleMapProps) {
  const googleMapsApiKey = resolveGoogleMapsApiKey()

  if (!googleMapsApiKey) {
    return <MapsUnavailable height={height} message="Google Maps API key is missing or invalid" />
  }

  return (
    <GoogleMapInner
      center={center}
      zoom={zoom}
      markers={markers}
      onMapClick={onMapClick}
      height={height}
      showInfoWindow={showInfoWindow}
      googleMapsApiKey={googleMapsApiKey}
    />
  )
}

function LocationPickerInner({
  center = defaultCenter,
  onLocationSelect,
  height = '400px',
  googleMapsApiKey,
}: {
  center?: { lat: number; lng: number }
  onLocationSelect?: (lat: number, lng: number) => void
  height?: string
  googleMapsApiKey: string
}) {
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null)

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey,
  })

  const onMapClickHandler = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat()
        const lng = e.latLng.lng()
        setMarkerPosition({ lat, lng })
        onLocationSelect?.(lat, lng)
      }
    },
    [onLocationSelect]
  )

  const onMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat()
        const lng = e.latLng.lng()
        setMarkerPosition({ lat, lng })
        onLocationSelect?.(lat, lng)
      }
    },
    [onLocationSelect]
  )

  if (loadError) {
    return <MapsUnavailable height={height} message="Error loading maps" />
  }

  if (!isLoaded) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 rounded-2xl animate-pulse"
        style={{ height }}
      >
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <GoogleMap
      mapContainerStyle={{ ...mapContainerStyle, height }}
      center={center}
      zoom={14}
      options={mapOptions}
      onClick={onMapClickHandler}
    >
      {markerPosition && (
        <Marker
          position={markerPosition}
          draggable
          onDragEnd={onMarkerDragEnd}
        />
      )}
    </GoogleMap>
  )
}

export function LocationPicker({
  center = defaultCenter,
  onLocationSelect,
  height = '400px',
}: {
  center?: { lat: number; lng: number }
  onLocationSelect?: (lat: number, lng: number) => void
  height?: string
}) {
  const googleMapsApiKey = resolveGoogleMapsApiKey()

  if (!googleMapsApiKey) {
    return <MapsUnavailable height={height} message="Google Maps API key is missing or invalid" />
  }

  return (
    <LocationPickerInner
      center={center}
      onLocationSelect={onLocationSelect}
      height={height}
      googleMapsApiKey={googleMapsApiKey}
    />
  )
}
