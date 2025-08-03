import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { config } from '../../utils/config';

const Map = ({
  center = { lat: 40.7128, lng: -74.0060 }, // Default to NYC
  zoom = 12,
  markers = [],
  onMapClick,
  onMarkerClick,
  className = '',
  height = '400px',
  ...props
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const loader = new Loader({
          apiKey: config.googleMapsApiKey,
          version: 'weekly',
          libraries: ['places', 'geometry']
        });

        const google = await loader.load();
        
        if (mapRef.current) {
          const map = new google.maps.Map(mapRef.current, {
            center,
            zoom,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          });

          mapInstanceRef.current = map;

          // Add click listener
          if (onMapClick) {
            map.addListener('click', (event) => {
              onMapClick({
                lat: event.latLng.lat(),
                lng: event.latLng.lng()
              });
            });
          }

          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load map');
        setIsLoading(false);
      }
    };

    if (config.googleMapsApiKey) {
      loadMap();
    } else {
      setError('Google Maps API key not configured');
      setIsLoading(false);
    }

    return () => {
      // Cleanup markers
      markersRef.current.forEach(marker => {
        if (marker && marker.setMap) {
          marker.setMap(null);
        }
      });
      markersRef.current = [];
    };
  }, [center, zoom, onMapClick]);

  // Update markers when markers prop changes
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      if (marker && marker.setMap) {
        marker.setMap(null);
      }
    });
    markersRef.current = [];

    // Add new markers
    markers.forEach((markerData, index) => {
      const marker = new window.google.maps.Marker({
        position: { lat: markerData.lat, lng: markerData.lng },
        map: mapInstanceRef.current,
        title: markerData.title || `Marker ${index + 1}`,
        icon: markerData.icon,
        animation: markerData.animation || window.google.maps.Animation.DROP
      });

      if (onMarkerClick) {
        marker.addListener('click', () => {
          onMarkerClick(markerData, index);
        });
      }

      markersRef.current.push(marker);
    });
  }, [markers, onMarkerClick]);

  if (error) {
    return (
      <div className={`bg-secondary-100 dark:bg-secondary-800 rounded-lg flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center">
          <p className="text-secondary-600 dark:text-secondary-400 mb-2">{error}</p>
          <p className="text-sm text-secondary-500">Please check your API key configuration</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className} {...props}>
      {isLoading && (
        <div className="bg-secondary-100 dark:bg-secondary-800 rounded-lg flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
            <p className="text-secondary-600 dark:text-secondary-400">Loading map...</p>
          </div>
        </div>
      )}
      
      <div
        ref={mapRef}
        className="w-full rounded-lg"
        style={{ height, display: isLoading ? 'none' : 'block' }}
      />
    </div>
  );
};

export default Map; 