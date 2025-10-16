import L from "leaflet";

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const isValidVietnamCoordinates = ({ latitude, longitude }) => {
  const lat = Number.parseFloat(latitude);
  const lon = Number.parseFloat(longitude);
  return (
    lat >= 8.18 &&
    lat <= 23.39 &&
    lon >= 102.14 &&
    lon <= 109.47 &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lon)
  );
};

export const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});