import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { School, FilterState, SchoolsApiResponse } from './types';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { SchoolCard } from './components/SchoolCard';
import { SchoolMap } from './components/SchoolMap';
import { SchoolDetailModal } from './components/SchoolDetailModal';
import { CompareModal } from './components/CompareModal';
import { ApiKeyGuide } from './components/ApiKeyGuide';
import {
  Map as MapIcon,
  List as ListIcon,
  RefreshCw,
  AlertCircle,
  SearchX,
  Star,
  Info
} from 'lucide-react';

const INITIAL_FILTER: FilterState = {
  district: '전체',
  schoolType: '전체',
  genderType: '전체',
  foundationType: '전체',
  searchQuery: '',
  onlyBookmarked: false
};

const BOOKMARKS_STORAGE_KEY = 'seoul_high_schools_bookmarks';

export function App() {
  // Data state
  const [schools, setSchools] = useState<School[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [failedDistricts, setFailedDistricts] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusType, setStatusType] = useState<'loading' | 'success' | 'partial' | 'error' | 'missing_key'>('loading');

  // Filter state
  const [filter, setFilter] = useState<FilterState>(INITIAL_FILTER);

  // Selected school & modals
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [detailModalSchool, setDetailModalSchool] = useState<School | null>(null);
  const [compareModalOpen, setCompareModalOpen] = useState<boolean>(false);
  const [comparisonCodes, setComparisonCodes] = useState<string[]>([]);

  // Bookmarks state (localStorage)
  const [bookmarkedCodes, setBookmarkedCodes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Mobile tab state: 'map' or 'list'
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map');

  // Unlocated notice toast
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // School cards container ref for scrolling
  const listContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Show toast notification
  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastNotice(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastNotice(null);
    }, 3500);
  }, []);

  // Sync bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarkedCodes));
    } catch (e) {
      console.warn('Failed to save bookmarks to localStorage', e);
    }
  }, [bookmarkedCodes]);

  // Fetch schools from server /api/schools
  const fetchSchools = useCallback(async (refresh = false) => {
    setLoading(true);
    setStatusType('loading');

    try {
      const res = await fetch(`/api/schools${refresh ? '?refresh=true' : ''}`);

      if (res.status === 503) {
        setStatusType('missing_key');
        setSchools([]);
        setTotalCount(0);
        return;
      }

      if (!res.ok) {
        setStatusType('error');
        return;
      }

      const data: SchoolsApiResponse = await res.json();

      if (data.error === 'SCHOOLINFO_API_KEY_MISSING') {
        setStatusType('missing_key');
        setSchools([]);
        setTotalCount(0);
        return;
      }

      const loadedSchools = Array.isArray(data.schools) ? data.schools : [];
      setSchools(loadedSchools);
      setTotalCount(loadedSchools.length);
      setFailedDistricts(data.failedDistricts || []);

      if (data.failedDistricts && data.failedDistricts.length > 0) {
        setStatusType('partial');
      } else {
        setStatusType('success');
      }
    } catch (err) {
      console.error('Fetch schools error:', err);
      setStatusType('error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  // Filter logic
  const filteredSchools = useMemo(() => {
    return schools.filter((school) => {
      // District filter
      if (filter.district !== '전체' && school.district !== filter.district) {
        return false;
      }

      // School type filter
      if (filter.schoolType !== '전체' && school.schoolType !== filter.schoolType) {
        return false;
      }

      // Gender filter
      if (filter.genderType !== '전체' && school.genderType !== filter.genderType) {
        return false;
      }

      // Foundation filter
      if (filter.foundationType !== '전체' && school.foundationType !== filter.foundationType) {
        return false;
      }

      // Search query filter
      if (filter.searchQuery.trim()) {
        const query = filter.searchQuery.trim().toLowerCase();
        const matchesName = school.schoolName.toLowerCase().includes(query);
        const matchesDistrict = school.district.toLowerCase().includes(query);
        const matchesType = school.schoolType.toLowerCase().includes(query);
        if (!matchesName && !matchesDistrict && !matchesType) {
          return false;
        }
      }

      // Only bookmarked filter
      if (filter.onlyBookmarked && !bookmarkedCodes.includes(school.schoolCode)) {
        return false;
      }

      return true;
    });
  }, [schools, filter, bookmarkedCodes]);

  // Bookmark toggle handler
  const handleToggleBookmark = useCallback((schoolCode: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setBookmarkedCodes((prev) =>
      prev.includes(schoolCode) ? prev.filter((c) => c !== schoolCode) : [...prev, schoolCode]
    );
  }, []);

  // Comparison toggle handler
  const handleToggleComparison = useCallback((schoolCode: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setComparisonCodes((prev) => {
      if (prev.includes(schoolCode)) {
        return prev.filter((c) => c !== schoolCode);
      }
      if (prev.length >= 4) {
        showToast('비교함에는 최대 4개 학교까지만 추가할 수 있습니다.');
        return prev;
      }
      return [...prev, schoolCode];
    });
  }, [showToast]);

  // Comparison list objects
  const comparisonSchools = useMemo(() => {
    return comparisonCodes
      .map((code) => schools.find((s) => s.schoolCode === code))
      .filter(Boolean) as School[];
  }, [comparisonCodes, schools]);

  // School card selection handler
  const handleCardClick = useCallback((school: School) => {
    setSelectedSchool(school);
    setDetailModalSchool(school);

    if (!school.hasLocation) {
      showToast('이 학교는 위치정보가 없어 지도에 표시되지 않습니다');
    }
  }, [showToast]);

  // Map marker click handler (Section 25)
  const handleMarkerClick = useCallback((school: School) => {
    setSelectedSchool(school);
    setDetailModalSchool(school);

    // If on mobile map tab, switch or open modal
    // Scroll card into view in list
    const cardEl = cardRefs.current.get(school.schoolCode);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 text-slate-800">
      {/* Toast Notice */}
      {toastNotice && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-60 bg-slate-900/90 text-white text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* Header */}
      <Header
        totalCount={totalCount}
        filteredCount={filteredSchools.length}
        loading={loading}
        statusType={statusType}
        failedDistricts={failedDistricts}
        searchQuery={filter.searchQuery}
        onSearchChange={(query) => setFilter({ ...filter, searchQuery: query })}
        onlyBookmarked={filter.onlyBookmarked}
        onToggleBookmarks={() => setFilter({ ...filter, onlyBookmarked: !filter.onlyBookmarked })}
        bookmarkCount={bookmarkedCodes.length}
        comparisonCount={comparisonCodes.length}
        onOpenComparison={() => setCompareModalOpen(true)}
        onRefresh={() => fetchSchools(true)}
      />

      {/* Filter Bar */}
      <FilterBar
        filter={filter}
        onFilterChange={setFilter}
        onReset={() => setFilter(INITIAL_FILTER)}
        allSchools={schools}
        filteredCount={filteredSchools.length}
      />

      {/* Mobile Tab Switcher */}
      <div className="md:hidden flex items-center justify-around bg-white border-b border-slate-200 py-1.5 px-4 text-xs font-semibold shrink-0">
        <button
          onClick={() => setMobileTab('map')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition cursor-pointer ${
            mobileTab === 'map' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MapIcon className="w-4 h-4" />
          <span>지도</span>
        </button>
        <button
          onClick={() => setMobileTab('list')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition cursor-pointer ${
            mobileTab === 'list' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ListIcon className="w-4 h-4" />
          <span>학교 목록 ({filteredSchools.length})</span>
        </button>
      </div>

      {/* Main Body (Split: List Left 35%, Map Right 65%) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left: School List Panel */}
        <div
          ref={listContainerRef}
          className={`w-full md:w-[35%] lg:w-[32%] xl:w-[30%] h-full flex flex-col bg-white border-r border-slate-200 overflow-hidden shrink-0 ${
            mobileTab === 'list' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
            {/* Condition 1: Missing API Key Guide (Section 6.3) */}
            {statusType === 'missing_key' && <ApiKeyGuide />}

            {/* Condition 2: Full API Error */}
            {statusType === 'error' && (
              <div className="p-8 text-center bg-rose-50/50 rounded-xl border border-rose-200 text-slate-700 space-y-3">
                <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                <h4 className="font-bold text-base text-slate-900">학교알리미 연결 실패</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  학교알리미 Open API 서버와 통신하는 중 문제가 발생했습니다. 일시적인 장애일 수 있으니 다시 시도해 주세요.
                </p>
                <button
                  onClick={() => fetchSchools(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>다시 시도</span>
                </button>
              </div>
            )}

            {/* Condition 3: Loading placeholder */}
            {statusType === 'loading' && (
              <div className="p-12 text-center text-slate-500 space-y-3">
                <div className="w-8 h-8 rounded-full border-3 border-blue-600 border-t-transparent animate-spin mx-auto" />
                <p className="font-semibold text-sm text-slate-800">서울 고등학교 조회 중…</p>
                <p className="text-xs text-slate-500">서울 25개 자치구 학교 공시데이터를 취합하고 있습니다.</p>
              </div>
            )}

            {/* Condition 4: No matching filter results (Section 6.7) */}
            {(statusType === 'success' || statusType === 'partial') && filteredSchools.length === 0 && (
              <div className="p-10 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-600 space-y-2">
                <SearchX className="w-10 h-10 text-slate-400 mx-auto mb-1" />
                <h4 className="font-semibold text-sm text-slate-900">조건에 맞는 학교가 없습니다</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  설정하신 지역, 학교유형 또는 검색 조건에 부합하는 학교가 없습니다. 필터를 줄이거나 초기화해 보세요.
                </p>
                <button
                  onClick={() => setFilter(INITIAL_FILTER)}
                  className="mt-2 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  필터 초기화
                </button>
              </div>
            )}

            {/* Condition 5: Normal list rendering */}
            {(statusType === 'success' || statusType === 'partial') &&
              filteredSchools.map((school) => {
                const isSelected = selectedSchool?.schoolCode === school.schoolCode;
                const isBookmarked = bookmarkedCodes.includes(school.schoolCode);
                const isInComparison = comparisonCodes.includes(school.schoolCode);

                return (
                  <div
                    key={school.schoolCode}
                    ref={(el) => {
                      if (el) cardRefs.current.set(school.schoolCode, el);
                      else cardRefs.current.delete(school.schoolCode);
                    }}
                  >
                    <SchoolCard
                      school={school}
                      isSelected={isSelected}
                      onSelect={() => handleCardClick(school)}
                      isBookmarked={isBookmarked}
                      onToggleBookmark={(e) => handleToggleBookmark(school.schoolCode, e)}
                      isInComparison={isInComparison}
                      onToggleComparison={(e) => handleToggleComparison(school.schoolCode, e)}
                      canAddToComparison={comparisonCodes.length < 4}
                    />
                  </div>
                );
              })}
          </div>
        </div>

        {/* Right: Leaflet Map Panel (Section 4 & 17) */}
        <div
          className={`w-full md:w-[65%] lg:w-[68%] xl:w-[70%] h-full relative ${
            mobileTab === 'map' ? 'block' : 'hidden md:block'
          }`}
        >
          <SchoolMap
            schools={filteredSchools}
            selectedSchool={selectedSchool}
            onSelectSchool={handleMarkerClick}
            selectedDistrict={filter.district}
            onSelectDistrict={(dist) => setFilter({ ...filter, district: dist })}
            onUnlocatedNotice={(name) =>
              showToast(`'${name}'은(는) 위치정보가 없어 지도에 표시되지 않습니다`)
            }
          />
        </div>
      </div>

      {/* School Detail Modal */}
      <SchoolDetailModal
        school={detailModalSchool}
        onClose={() => setDetailModalSchool(null)}
        isBookmarked={detailModalSchool ? bookmarkedCodes.includes(detailModalSchool.schoolCode) : false}
        onToggleBookmark={() => {
          if (detailModalSchool) handleToggleBookmark(detailModalSchool.schoolCode);
        }}
        isInComparison={detailModalSchool ? comparisonCodes.includes(detailModalSchool.schoolCode) : false}
        onToggleComparison={() => {
          if (detailModalSchool) handleToggleComparison(detailModalSchool.schoolCode);
        }}
        canAddToComparison={comparisonCodes.length < 4}
      />

      {/* Comparison Modal */}
      <CompareModal
        schools={comparisonSchools}
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        onRemoveSchool={(code) => setComparisonCodes((prev) => prev.filter((c) => c !== code))}
        onClearAll={() => setComparisonCodes([])}
      />
    </div>
  );
}

export default App;
