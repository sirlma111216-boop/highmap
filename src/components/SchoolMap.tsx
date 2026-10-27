import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { School } from '../types';
import { TILE_CONFIG, SEOUL_BOUNDS } from '../map/tileConfig';
import { RefreshCw, MapPin, Eye, EyeOff, Layers, AlertCircle } from 'lucide-react';

interface SchoolMapProps {
  schools: School[];
  selectedSchool: School | null;
  onSelectSchool: (school: School) => void;
  selectedDistrict: string;
  onSelectDistrict?: (district: string) => void;
  onUnlocatedNotice?: (schoolName: string) => void;
}

// Helper to escape HTML characters safely
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const SchoolMap: React.FC<SchoolMapProps> = ({
  schools,
  selectedSchool,
  onSelectSchool,
  selectedDistrict,
  onSelectDistrict,
  onUnlocatedNotice
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());
  const activeSelectedMarkerRef = useRef<L.Marker | null>(null);

  // Boundary layers
  const districtLayerRef = useRef<L.GeoJSON | null>(null);
  const eduOfficeLayerRef = useRef<L.GeoJSON | null>(null);
  const districtPolygonsMapRef = useRef<Map<string, L.Polygon>>(new Map());

  // UI state
  const [mapReady, setMapReady] = useState(false);
  const [tileError, setTileError] = useState(false);
  const [showDistricts, setShowDistricts] = useState(true);
  const [showEduOffices, setShowEduOffices] = useState(true);
  const [boundaryLoaded, setBoundaryLoaded] = useState(false);
  const [boundaryError, setBoundaryError] = useState(false);
  const [showLegend, setShowLegend] = useState(true);

  // 1. Helper to create pin icon
  const createPinIcon = useCallback((school: School, isSelected = false) => {
    let letter = '공';
    if (school.genderType === '남학교') letter = '남';
    else if (school.genderType === '여학교') letter = '여';

    const selectedClass = isSelected ? 'is-selected' : '';
    const typeClass = `type-${school.schoolType}`;
    const fondClass = `fond-${school.foundationType}`;

    return L.divIcon({
      className: 'school-pin-container',
      html: `<div class="school-pin ${typeClass} ${fondClass} ${selectedClass}" title="${escapeHtml(school.schoolName)}">${letter}</div>`,
      iconSize: isSelected ? [38, 38] : [32, 32],
      iconAnchor: isSelected ? [19, 19] : [16, 16],
      popupAnchor: [0, -18]
    });
  }, []);

  // 2. Initialize Leaflet Map (PHASE 1)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create map instance
    const map = L.map(mapContainerRef.current, {
      center: SEOUL_BOUNDS.defaultCenter,
      zoom: SEOUL_BOUNDS.defaultZoom,
      minZoom: SEOUL_BOUNDS.minZoom,
      maxBounds: [SEOUL_BOUNDS.maxSouthWest, SEOUL_BOUNDS.maxNorthEast],
      attributionControl: true
    });

    mapInstanceRef.current = map;

    // Set initial bounds to fit Seoul
    map.fitBounds([SEOUL_BOUNDS.southWest, SEOUL_BOUNDS.northEast], {
      padding: [20, 20]
    });

    // Create Tile Layer with error tracking (Section 6.2)
    let consecutiveTileErrors = 0;
    let anyTileLoaded = false;

    const tileLayer = L.tileLayer(TILE_CONFIG.url, {
      attribution: TILE_CONFIG.attribution,
      maxZoom: TILE_CONFIG.maxZoom
    });

    tileLayer.on('tileload', () => {
      anyTileLoaded = true;
      consecutiveTileErrors = 0;
      setTileError(false);
    });

    tileLayer.on('tileerror', () => {
      consecutiveTileErrors++;
      if (!anyTileLoaded && consecutiveTileErrors >= 3) {
        setTileError(true);
      }
    });

    tileLayer.addTo(map);
    tileLayerRef.current = tileLayer;

    // Create marker cluster group with chunked loading
    const clusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      removeOutsideVisibleBounds: true,
      maxClusterRadius: 45,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false
    });

    map.addLayer(clusterGroup);
    clusterGroupRef.current = clusterGroup;

    setMapReady(true);

    // ResizeObserver to handle pane expansion / responsive layout
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    // Cleanup on unmount
    return () => {
      resizeObserver.disconnect();
      if (clusterGroupRef.current) {
        clusterGroupRef.current.clearLayers();
      }
      map.remove();
      mapInstanceRef.current = null;
      clusterGroupRef.current = null;
      tileLayerRef.current = null;
      setMapReady(false);
    };
  }, []);

  // 3. Load Boundaries (PHASE 9)
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    let isMounted = true;

    async function loadGeoJson() {
      let geoData: any = null;

      // Attempt 1: /data/seoul-gu.geojson
      try {
        const res = await fetch('/data/seoul-gu.geojson');
        if (res.ok) {
          const json = await res.json();
          if (
            json &&
            json.type === 'FeatureCollection' &&
            Array.isArray(json.features) &&
            json.features.filter((f: any) => f.properties?.kind === 'district').length === 25
          ) {
            geoData = json;
          }
        }
      } catch (e) {
        console.warn('Local seoul-gu.geojson failed, attempting remote fallback', e);
      }

      // Attempt 2: Remote fallback
      if (!geoData) {
        try {
          const res = await fetch('https://highmap.labbitory.com/data/seoul-gu.geojson');
          if (res.ok) {
            const json = await res.json();
            if (
              json &&
              json.type === 'FeatureCollection' &&
              Array.isArray(json.features) &&
              json.features.filter((f: any) => f.properties?.kind === 'district').length === 25
            ) {
              geoData = json;
            }
          }
        } catch (e) {
          console.warn('Remote seoul-gu.geojson fallback also failed', e);
        }
      }

      if (!isMounted) return;

      if (!geoData) {
        setBoundaryError(true);
        return;
      }

      try {
        // District Polygons (kind === "district")
        const districtFeatures = geoData.features.filter(
          (f: any) => f.properties?.kind === 'district'
        );

        const districtLayer = L.geoJSON(districtFeatures, {
          style: {
            color: '#94a3b8',
            weight: 1.2,
            opacity: 0.8,
            fillColor: '#f8fafc',
            fillOpacity: 0.05
          },
          onEachFeature: (feature, layer) => {
            const districtName = feature.properties?.name;
            if (districtName) {
              districtPolygonsMapRef.current.set(districtName, layer as any);

              // Center label
              layer.bindTooltip(districtName, {
                permanent: true,
                direction: 'center',
                className: 'district-map-label',
                interactive: false
              });

              // Click to filter by district
              layer.on('click', () => {
                if (onSelectDistrict) {
                  onSelectDistrict(districtName);
                }
              });
            }
          }
        });

        // EduOffice Boundaries (kind === "eduOffice")
        const eduOfficeFeatures = geoData.features.filter(
          (f: any) => f.properties?.kind === 'eduOffice'
        );

        const eduOfficeLayer = L.geoJSON(eduOfficeFeatures, {
          style: {
            color: '#1d4ed8',
            weight: 2.6,
            opacity: 0.85,
            dashArray: '4, 4'
          },
          interactive: false
        });

        // Add to map in lower z-index pane or layer order
        if (showDistricts) {
          districtLayer.addTo(map);
        }
        if (showEduOffices) {
          eduOfficeLayer.addTo(map);
        }

        districtLayerRef.current = districtLayer;
        eduOfficeLayerRef.current = eduOfficeLayer;
        setBoundaryLoaded(true);
      } catch (err) {
        console.warn('Error rendering boundary layers:', err);
        setBoundaryError(true);
      }
    }

    loadGeoJson();

    return () => {
      isMounted = false;
      if (districtLayerRef.current && map) {
        map.removeLayer(districtLayerRef.current);
      }
      if (eduOfficeLayerRef.current && map) {
        map.removeLayer(eduOfficeLayerRef.current);
      }
    };
  }, [mapReady, onSelectDistrict]);

  // 4. Toggle boundary layers visibility
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (districtLayerRef.current) {
      if (showDistricts && !map.hasLayer(districtLayerRef.current)) {
        districtLayerRef.current.addTo(map);
      } else if (!showDistricts && map.hasLayer(districtLayerRef.current)) {
        map.removeLayer(districtLayerRef.current);
      }
    }

    if (eduOfficeLayerRef.current) {
      if (showEduOffices && !map.hasLayer(eduOfficeLayerRef.current)) {
        eduOfficeLayerRef.current.addTo(map);
      } else if (!showEduOffices && map.hasLayer(eduOfficeLayerRef.current)) {
        map.removeLayer(eduOfficeLayerRef.current);
      }
    }
  }, [showDistricts, showEduOffices]);

  // 5. Update School Markers when filtered list changes (PHASE 6 & 7)
  useEffect(() => {
    if (!mapReady || !clusterGroupRef.current) return;

    const clusterGroup = clusterGroupRef.current;
    clusterGroup.clearLayers();
    markersMapRef.current.clear();
    activeSelectedMarkerRef.current = null;

    const newMarkers: L.Marker[] = [];

    // Filter only schools that have valid location
    const locatedSchools = schools.filter((s) => s.hasLocation && s.latitude && s.longitude);

    locatedSchools.forEach((school) => {
      const isSelected = selectedSchool?.schoolCode === school.schoolCode;
      const icon = createPinIcon(school, isSelected);

      const marker = L.marker([school.latitude!, school.longitude!], {
        icon,
        title: school.schoolName
      });

      // Safely construct popup DOM element to prevent HTML injection (Section 24)
      const popupContainer = document.createElement('div');
      popupContainer.className = 'p-3 text-slate-800 text-sm min-w-[210px] max-w-[280px]';

      const headerDiv = document.createElement('div');
      headerDiv.className = 'font-bold text-base text-slate-900 border-b border-slate-100 pb-1.5 mb-2';
      headerDiv.textContent = school.schoolName;

      const badgeRow = document.createElement('div');
      badgeRow.className = 'flex flex-wrap gap-1 mb-2';

      const typeBadge = document.createElement('span');
      typeBadge.className = 'px-1.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700';
      typeBadge.textContent = school.schoolType;

      const distBadge = document.createElement('span');
      distBadge.className = 'px-1.5 py-0.5 rounded text-xs bg-slate-100 text-slate-600';
      distBadge.textContent = school.district;

      const genderBadge = document.createElement('span');
      genderBadge.className = 'px-1.5 py-0.5 rounded text-xs bg-slate-100 text-slate-600';
      genderBadge.textContent = school.genderType;

      const fondBadge = document.createElement('span');
      fondBadge.className = 'px-1.5 py-0.5 rounded text-xs bg-slate-100 text-slate-600';
      fondBadge.textContent = school.foundationType;

      badgeRow.appendChild(typeBadge);
      badgeRow.appendChild(distBadge);
      badgeRow.appendChild(genderBadge);
      badgeRow.appendChild(fondBadge);

      const addrDiv = document.createElement('div');
      addrDiv.className = 'text-xs text-slate-500 mb-2 truncate';
      addrDiv.textContent = school.address || '주소 정보 없음';

      const detailBtn = document.createElement('button');
      detailBtn.className = 'w-full py-1 px-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded transition-colors shadow-sm cursor-pointer';
      detailBtn.textContent = '학교 상세정보 보기';
      detailBtn.onclick = (e) => {
        e.stopPropagation();
        onSelectSchool(school);
      };

      popupContainer.appendChild(headerDiv);
      popupContainer.appendChild(badgeRow);
      popupContainer.appendChild(addrDiv);
      popupContainer.appendChild(detailBtn);

      marker.bindPopup(popupContainer, { maxWidth: 300 });

      marker.on('click', () => {
        onSelectSchool(school);
      });

      markersMapRef.current.set(school.schoolCode, marker);
      newMarkers.push(marker);

      if (isSelected) {
        activeSelectedMarkerRef.current = marker;
      }
    });

    clusterGroup.addLayers(newMarkers);
  }, [schools, mapReady, createPinIcon, onSelectSchool, selectedSchool?.schoolCode]);

  // 6. Synchronize Selected School from Card Click (PHASE 8 & 25)
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !clusterGroupRef.current) return;

    // Reset previous selected marker icon if exists
    if (activeSelectedMarkerRef.current) {
      const prevCode = Array.from(markersMapRef.current.entries()).find(
        ([, m]) => m === activeSelectedMarkerRef.current
      )?.[0];
      const prevSchool = schools.find((s) => s.schoolCode === prevCode);
      if (prevSchool) {
        activeSelectedMarkerRef.current.setIcon(createPinIcon(prevSchool, false));
        activeSelectedMarkerRef.current.setZIndexOffset(0);
      }
      activeSelectedMarkerRef.current = null;
    }

    if (!selectedSchool) return;

    // If school has no location, do not move map and trigger toast notice
    if (!selectedSchool.hasLocation || !selectedSchool.latitude || !selectedSchool.longitude) {
      if (onUnlocatedNotice) {
        onUnlocatedNotice(selectedSchool.schoolName);
      }
      return;
    }

    const marker = markersMapRef.current.get(selectedSchool.schoolCode);
    if (!marker) return;

    activeSelectedMarkerRef.current = marker;
    marker.setIcon(createPinIcon(selectedSchool, true));
    marker.setZIndexOffset(1000);

    const clusterGroup = clusterGroupRef.current;

    // Zoom to show layer and open popup
    clusterGroup.zoomToShowLayer(marker, () => {
      marker.openPopup();
    });
  }, [selectedSchool, mapReady, createPinIcon, onUnlocatedNotice, schools]);

  // 7. Pan / Fit to Selected District (Section 21)
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (selectedDistrict === '전체') {
      map.fitBounds([SEOUL_BOUNDS.southWest, SEOUL_BOUNDS.northEast], {
        padding: [20, 20]
      });
      return;
    }

    // If district polygon exists, fit bounds to that polygon
    const polygon = districtPolygonsMapRef.current.get(selectedDistrict);
    if (polygon) {
      map.fitBounds(polygon.getBounds(), {
        padding: [30, 30],
        maxZoom: 14
      });
    } else {
      // Fallback: fit to located schools in this district
      const districtSchools = schools.filter(
        (s) => s.district === selectedDistrict && s.hasLocation && s.latitude && s.longitude
      );
      if (districtSchools.length > 0) {
        const bounds = L.latLngBounds(
          districtSchools.map((s) => [s.latitude!, s.longitude!] as [number, number])
        );
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    }
  }, [selectedDistrict, mapReady, schools]);

  // Manual retry handler for tile error
  const handleRetryTile = () => {
    if (tileLayerRef.current) {
      tileLayerRef.current.redraw();
      setTileError(false);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[380px] bg-slate-100 overflow-hidden">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Preparation Overlay */}
      {!mapReady && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-50/90 backdrop-blur-xs">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-600 border-t-transparent mb-3" />
          <p className="text-sm font-medium text-slate-700">지도를 준비하고 있습니다…</p>
        </div>
      )}

      {/* Tile Loading Error Banner (Section 6.2) */}
      {tileError && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 max-w-md w-11/12 bg-amber-50 border border-amber-300 text-amber-900 rounded-lg shadow-lg px-3.5 py-2.5 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>배경지도를 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.</span>
          </div>
          <button
            onClick={handleRetryTile}
            className="shrink-0 ml-2 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded transition flex items-center gap-1 text-xs cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            다시 시도
          </button>
        </div>
      )}

      {/* Boundary Layer Toggles (Top Right Controls) */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 bg-white/95 backdrop-blur-xs p-2 rounded-lg shadow-md border border-slate-200 text-xs">
        <div className="font-semibold text-slate-700 mb-0.5 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span>경계선 설정</span>
        </div>
        <button
          onClick={() => setShowDistricts(!showDistricts)}
          disabled={!boundaryLoaded && !boundaryError}
          className={`flex items-center justify-between gap-2 px-2 py-1 rounded text-left transition cursor-pointer ${
            showDistricts ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>구 경계</span>
          {showDistricts ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        <button
          onClick={() => setShowEduOffices(!showEduOffices)}
          disabled={!boundaryLoaded && !boundaryError}
          className={`flex items-center justify-between gap-2 px-2 py-1 rounded text-left transition cursor-pointer ${
            showEduOffices ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>교육지원청 경계</span>
          {showEduOffices ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {boundaryError && (
          <span className="text-[10px] text-amber-600">구 경계 데이터를 불러오지 못했습니다</span>
        )}
      </div>

      {/* Legend (Bottom Left Controls - careful not to obscure OSM attribution at bottom right) */}
      <div className="absolute bottom-6 left-3 z-10 bg-white/95 backdrop-blur-xs p-2.5 rounded-lg shadow-md border border-slate-200 text-xs max-w-[260px]">
        <div
          onClick={() => setShowLegend(!showLegend)}
          className="flex items-center justify-between font-semibold text-slate-800 cursor-pointer select-none"
        >
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            범례 (마커 안내)
          </span>
          <span className="text-slate-400 text-[10px]">{showLegend ? '접기' : '펼치기'}</span>
        </div>

        {showLegend && (
          <div className="mt-2 space-y-2 border-t border-slate-100 pt-2 text-[11px] text-slate-600">
            <div>
              <p className="font-medium text-slate-700 mb-1">학교 유형 (색상)</p>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                  <span>일반고</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-600 inline-block" />
                  <span>자사고</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span>특목고</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
                  <span>영재고</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                  <span>특성화고</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" />
                  <span>기타/학력인정</span>
                </div>
              </div>
            </div>

            <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px]">
              <div>
                <span className="font-medium text-slate-700">남녀구분: </span>
                <span className="font-semibold text-slate-800">남 / 여 / 공</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                <span>사립 표시</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
