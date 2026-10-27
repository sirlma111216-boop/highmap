export const TILE_CONFIG = {
  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
  maxZoom: 19
};

// Seoul geographic boundaries
export const SEOUL_BOUNDS = {
  // Approximate corner coordinates for Seoul
  southWest: [37.413, 126.734] as [number, number],
  northEast: [37.715, 127.269] as [number, number],
  // Max bounds with generous margin (~0.15 deg) so edge markers aren't clipped
  maxSouthWest: [37.25, 126.55] as [number, number],
  maxNorthEast: [37.85, 127.45] as [number, number],
  defaultCenter: [37.5665, 126.9780] as [number, number], // Seoul City Hall
  minZoom: 10,
  defaultZoom: 11
};
