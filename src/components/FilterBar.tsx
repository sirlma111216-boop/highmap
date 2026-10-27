import React from 'react';
import { FilterState, SchoolTypeOption, GenderTypeOption, FoundationTypeOption, School } from '../types';
import { SEOUL_DISTRICTS } from '../../server/schoolinfo';
import { RotateCcw, X, Filter } from 'lucide-react';

interface FilterBarProps {
  filter: FilterState;
  onFilterChange: (newFilter: FilterState) => void;
  onReset: () => void;
  allSchools: School[];
  filteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onFilterChange,
  onReset,
  allSchools,
  filteredCount
}) => {
  // Compute school counts per district dynamically from real data (Section 21)
  const districtCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const d of SEOUL_DISTRICTS) {
      counts[d.name] = 0;
    }
    for (const s of allSchools) {
      if (s.district && counts[s.district] !== undefined) {
        counts[s.district]++;
      }
    }
    return counts;
  }, [allSchools]);

  const schoolTypes: SchoolTypeOption[] = [
    '전체',
    '일반고',
    '자사고',
    '특목고',
    '영재고',
    '특성화고',
    '학력인정고',
    '기타'
  ];

  const genderTypes: GenderTypeOption[] = [
    '전체',
    '남학교',
    '여학교',
    '남녀공학'
  ];

  const foundationTypes: FoundationTypeOption[] = [
    '전체',
    '공립',
    '사립',
    '국립',
    '기타'
  ];

  const hasActiveFilters =
    filter.district !== '전체' ||
    filter.schoolType !== '전체' ||
    filter.genderType !== '전체' ||
    filter.foundationType !== '전체' ||
    filter.searchQuery.trim() !== '' ||
    filter.onlyBookmarked;

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-2.5 text-xs text-slate-700 shadow-2xs shrink-0">
      <div className="max-w-7xl mx-auto flex flex-col gap-2">
        {/* Main Selects Row */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>필터:</span>
          </div>

          {/* District Select */}
          <div className="flex items-center gap-1">
            <label htmlFor="district-select" className="sr-only">자치구</label>
            <select
              id="district-select"
              value={filter.district}
              onChange={(e) => onFilterChange({ ...filter, district: e.target.value })}
              className="py-1 px-2 bg-slate-50 border border-slate-300 rounded-md text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:bg-white cursor-pointer"
            >
              <option value="전체">서울 전체 (25개 자치구)</option>
              {SEOUL_DISTRICTS.map((d) => (
                <option key={d.code} value={d.name}>
                  {d.name} {allSchools.length > 0 ? `(${districtCounts[d.name] || 0}개교)` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* School Type Select */}
          <div className="flex items-center gap-1">
            <label htmlFor="type-select" className="sr-only">학교유형</label>
            <select
              id="type-select"
              value={filter.schoolType}
              onChange={(e) => onFilterChange({ ...filter, schoolType: e.target.value as SchoolTypeOption })}
              className="py-1 px-2 bg-slate-50 border border-slate-300 rounded-md text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:bg-white cursor-pointer"
            >
              <option value="전체">학교유형: 전체</option>
              {schoolTypes.filter((t) => t !== '전체').map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Type Select */}
          <div className="flex items-center gap-1">
            <label htmlFor="gender-select" className="sr-only">남녀구분</label>
            <select
              id="gender-select"
              value={filter.genderType}
              onChange={(e) => onFilterChange({ ...filter, genderType: e.target.value as GenderTypeOption })}
              className="py-1 px-2 bg-slate-50 border border-slate-300 rounded-md text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:bg-white cursor-pointer"
            >
              <option value="전체">남녀: 전체</option>
              {genderTypes.filter((g) => g !== '전체').map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Foundation Type Select */}
          <div className="flex items-center gap-1">
            <label htmlFor="fond-select" className="sr-only">설립구분</label>
            <select
              id="fond-select"
              value={filter.foundationType}
              onChange={(e) => onFilterChange({ ...filter, foundationType: e.target.value as FoundationTypeOption })}
              className="py-1 px-2 bg-slate-50 border border-slate-300 rounded-md text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:bg-white cursor-pointer"
            >
              <option value="전체">설립: 전체</option>
              {foundationTypes.filter((f) => f !== '전체').map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Button */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer font-medium ml-auto"
              title="필터 초기화"
            >
              <RotateCcw className="w-3 h-3" />
              <span>초기화</span>
            </button>
          )}
        </div>

        {/* Results summary and active tags */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-1.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">
              조건에 맞는 학교 <span className="text-blue-600">{filteredCount}</span>개
            </span>

            {/* Filter Tags */}
            <div className="flex flex-wrap items-center gap-1">
              {filter.district !== '전체' && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-medium border border-blue-200">
                  {filter.district}
                  <button
                    onClick={() => onFilterChange({ ...filter, district: '전체' })}
                    className="hover:text-blue-900 cursor-pointer"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}

              {filter.schoolType !== '전체' && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-medium border border-blue-200">
                  {filter.schoolType}
                  <button
                    onClick={() => onFilterChange({ ...filter, schoolType: '전체' })}
                    className="hover:text-blue-900 cursor-pointer"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}

              {filter.genderType !== '전체' && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-medium border border-blue-200">
                  {filter.genderType}
                  <button
                    onClick={() => onFilterChange({ ...filter, genderType: '전체' })}
                    className="hover:text-blue-900 cursor-pointer"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}

              {filter.foundationType !== '전체' && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-medium border border-blue-200">
                  {filter.foundationType}
                  <button
                    onClick={() => onFilterChange({ ...filter, foundationType: '전체' })}
                    className="hover:text-blue-900 cursor-pointer"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}

              {filter.searchQuery.trim() !== '' && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                  검색: &quot;{filter.searchQuery}&quot;
                  <button
                    onClick={() => onFilterChange({ ...filter, searchQuery: '' })}
                    className="hover:text-slate-900 cursor-pointer"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}

              {filter.onlyBookmarked && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[11px] font-medium border border-amber-200">
                  관심학교만
                  <button
                    onClick={() => onFilterChange({ ...filter, onlyBookmarked: false })}
                    className="hover:text-amber-900 cursor-pointer"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
