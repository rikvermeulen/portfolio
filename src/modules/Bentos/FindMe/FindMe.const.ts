export const FIND_ME_LOCATION = {
  label: "Rotterdam, The Netherlands",
  latitude: 51.9142533,
  longitude: 4.4170646,
} as const;

export const FIND_ME_CENTER = [
  FIND_ME_LOCATION.longitude,
  FIND_ME_LOCATION.latitude,
] as const;

export const FIND_ME_MAP = {
  primaryStyle: "mapbox://styles/mapbox/streets-v12",
  fallbackStyle: "mapbox://styles/mapbox/outdoors-v12",
  initialZoom: 12,
  maxZoom: 16,
  minZoom: 2,
  zoomStep: 3,
} as const;
