import React, { useState } from 'react';
import { Search, MapPin, Scale, Star, AlertTriangle, ChevronDown, ChevronUp, RefreshCw, X } from 'lucide-react';

interface HeaderProps {
  totalCount: number;
  filteredCount: number;
  loading: boolean;
  statusType: 'loading' | 'success' | 'partial' | 'error' | 'missing_key';
  failedDistricts: string[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onlyBookmarked: boolean;
  onToggleBookmarks: () => void;
  bookmarkCount: number;
  comparisonCount: number;
  onOpenComparison: () => void;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalCount,
  filteredCount,
  loading,
  statusType,
  failedDistricts,
  searchQuery,
  onSearchChange,
  onlyBookmarked,
  onToggleBookmarks,
  bookmarkCount,
  comparisonCount,
  onOpenComparison,
  onRefresh
}) => {
  const [showFailedDropdown, setShowFailedDropdown] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 shadow-xs z-30 shrink-0">
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Title & Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                서울 고교 지도
              </h1>

              {/* Status Badge */}
              {statusType === 'loading' && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  서울 고등학교 조회 중
                </span>
              )}

              {statusType === 'success' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  서울 고등학교 {totalCount}개교
                </span>
              )}

              {statusType === 'partial' && (
                <div className="relative inline-block">
                  <button
                    onClick={() => setShowFailedDropdown(!showFailedDropdown)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 cursor-pointer"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    <span>서울 고등학교 {totalCount}개교 · 일부 지역 조회 실패</span>
                    {showFailedDropdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  {showFailedDropdown && (
                    <div className="absolute left-0 mt-1 w-56 p-2 bg-white rounded-lg shadow-lg border border-slate-200 z-50 text-xs">
                      <p className="font-semibold text-slate-700 mb-1">조회 실패 자치구 ({failedDistricts.length}개):</p>
                      <p className="text-slate-600">{failedDistricts.join(', ')}</p>
                    </div>
                  )}
                </div>
              )}

              {statusType === 'error' && (
                <button
                  onClick={onRefresh}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer"
                >
                  <AlertTriangle className="w-3 h-3" />
                  학교알리미 연결 실패 [다시 시도]
                </button>
              )}

              {statusType === 'missing_key' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                  학교알리미 인증키 설정 필요
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              지도에서 찾고, 공시정보로 비교하는 서울 고등학교 안내
            </p>
          </div>
        </div>

        {/* Search Bar & Action Buttons */}
        <div className="flex items-center gap-2 flex-1 md:max-w-md justify-end">
          {/* Search Input */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="학교명 검색 (예: 대원외고, 서울고)"
              className="w-full pl-8 pr-7 py-1.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Bookmarks Toggle Button */}
          <button
            onClick={onToggleBookmarks}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer shrink-0 ${
              onlyBookmarked
                ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="관심학교 즐겨찾기 목록 보기"
          >
            <Star className={`w-3.5 h-3.5 ${onlyBookmarked ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">관심</span>
            {bookmarkCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                {bookmarkCount}
              </span>
            )}
          </button>

          {/* Compare Button */}
          <button
            onClick={onOpenComparison}
            disabled={comparisonCount === 0}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer shrink-0 ${
              comparisonCount > 0
                ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-70'
            }`}
            title="학교 비교하기 (최대 4개)"
          >
            <Scale className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">비교</span>
            {comparisonCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                {comparisonCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
