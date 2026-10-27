import React from 'react';
import { School } from '../types';
import { Star, MapPinOff, Phone, ExternalLink, Plus, Check } from 'lucide-react';

interface SchoolCardProps {
  school: School;
  isSelected: boolean;
  onSelect: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (e: React.MouseEvent) => void;
  isInComparison: boolean;
  onToggleComparison: (e: React.MouseEvent) => void;
  canAddToComparison: boolean;
}

export const SchoolCard: React.FC<SchoolCardProps> = ({
  school,
  isSelected,
  onSelect,
  isBookmarked,
  onToggleBookmark,
  isInComparison,
  onToggleComparison,
  canAddToComparison
}) => {
  // Compute students per class if studentCount and classCount are available
  const studentsPerClass =
    school.studentCount && school.classCount && school.classCount > 0
      ? (school.studentCount / school.classCount).toFixed(1)
      : null;

  // School Type Badge styling
  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case '일반고':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case '자사고':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case '특목고':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case '영재고':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case '특성화고':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`p-3.5 rounded-xl border transition-all cursor-pointer relative bg-white ${
        isSelected
          ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20 bg-blue-50/20'
          : 'border-slate-200 hover:border-blue-300 hover:shadow-xs'
      }`}
    >
      {/* Top Badge Row */}
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <div className="flex flex-wrap items-center gap-1">
          <span
            className={`px-1.5 py-0.5 rounded text-[11px] font-semibold border ${getTypeBadgeClass(
              school.schoolType
            )}`}
          >
            {school.schoolType}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 font-medium">
            {school.district}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600">
            {school.genderType}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600">
            {school.foundationType}
          </span>

          {!school.hasLocation && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
              <MapPinOff className="w-2.5 h-2.5" />
              위치정보 없음
            </span>
          )}
        </div>

        {/* Action icons: Bookmark & Compare */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onToggleBookmark}
            className="p-1 rounded-md text-slate-400 hover:text-amber-500 hover:bg-slate-100 transition cursor-pointer"
            title={isBookmarked ? '관심학교 해제' : '관심학교 등록'}
          >
            <Star
              className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-500' : ''}`}
            />
          </button>
          <button
            onClick={onToggleComparison}
            disabled={!isInComparison && !canAddToComparison}
            className={`p-1 rounded-md transition cursor-pointer text-xs flex items-center gap-0.5 ${
              isInComparison
                ? 'bg-blue-600 text-white shadow-xs'
                : canAddToComparison
                ? 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'
                : 'text-slate-300 cursor-not-allowed'
            }`}
            title={isInComparison ? '비교함에서 제거' : '비교함에 추가'}
          >
            {isInComparison ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* School Name */}
      <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight mb-1.5 flex items-center justify-between">
        <span>{school.schoolName}</span>
      </h3>

      {/* Address */}
      <p className="text-xs text-slate-500 line-clamp-1 mb-2.5">
        {school.address || '주소 정보 없음'}
      </p>

      {/* Stats row */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        {school.studentCount ? (
          <div className="flex items-center gap-2 text-slate-600">
            <span>
              총 학생: <strong className="font-semibold text-slate-800">{school.studentCount.toLocaleString()}명</strong>
            </span>
            {studentsPerClass && (
              <>
                <span className="text-slate-300">|</span>
                <span>
                  학급당: <strong className="font-semibold text-slate-800">{studentsPerClass}명</strong>
                </span>
              </>
            )}
          </div>
        ) : (
          <span className="text-slate-400 text-[11px]">상세정보 확인</span>
        )}

        <span className="text-[11px] font-medium text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
          상세보기 &rarr;
        </span>
      </div>
    </div>
  );
};
