import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import api from "../constant/api";

// Import marker icons
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const LocationTracker = ({ deliveryId, isWorker }) => {
  const [position, setPosition] = useState(null);
  const [watchId, setWatchId] = useState(null);

  useEffect(() => {
    if (isWorker) {
      // Start tracking worker's location
      const id = navigator.geolocation.watchPosition(
        async (position) => {
          const newPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setPosition(newPosition);

          // Update location in backend
          try {
            await api.post(`deliveries/${deliveryId}/update-location/`, {
              latitude: newPosition.lat,
              longitude: newPosition.lng,
            });
          } catch (error) {
            console.error("Error updating location:", error);
          }
        },
        (error) => console.error("Error getting location:", error),
        { enableHighAccuracy: true }
      );
      setWatchId(id);
    } else {
      // Client: poll for worker's location
      const interval = setInterval(async () => {
        try {
          const response = await api.get(`deliveries/${deliveryId}/location/`);
          if (response.data.status === "success") {
            setPosition({
              lat: response.data.data.latitude,
              lng: response.data.data.longitude,
            });
          }
        } catch (error) {
          console.error("Error fetching worker location:", error);
        }
      }, 10000); // Poll every 10 seconds

      return () => clearInterval(interval);
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [deliveryId, isWorker]);

  if (!position) return <div>Loading location...</div>;

  return (
    <MapContainer
      center={position}
      zoom={15}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={position}>
        <Popup>
          {isWorker ? "Your current location" : "Worker's location"}
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default LocationTracker;
