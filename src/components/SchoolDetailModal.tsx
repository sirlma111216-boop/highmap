import React, { useState, useEffect } from 'react';
import { School } from '../types';
import {
  X,
  Phone,
  Globe,
  MapPin,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  Award,
  Calendar,
  Star,
  Scale,
  ExternalLink,
  FileText,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Info
} from 'lucide-react';

interface SchoolDetailModalProps {
  school: School | null;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  isInComparison: boolean;
  onToggleComparison: () => void;
  canAddToComparison: boolean;
}

export const SchoolDetailModal: React.FC<SchoolDetailModalProps> = ({
  school,
  onClose,
  isBookmarked,
  onToggleBookmark,
  isInComparison,
  onToggleComparison,
  canAddToComparison
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'student' | 'admission' | 'curriculum' | 'features' | 'career'>('basic');
  const [detailData, setDetailData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch detailed disclosure data when school opens
  useEffect(() => {
    if (!school) {
      setDetailData(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    async function loadDetail() {
      try {
        const res = await fetch(`/api/schools/${encodeURIComponent(school!.schoolCode)}`);
        if (!res.ok) {
          if (res.status === 503) {
            throw new Error('SCHOOLINFO_API_KEY_MISSING');
          }
          throw new Error(`HTTP ${res.status}`);
        }
        const json = await res.json();
        if (isMounted) {
          setDetailData(json.detail || null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || '자료를 불러오지 못했습니다');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDetail();

    return () => {
      isMounted = false;
    };
  }, [school?.schoolCode]);

  if (!school) return null;

  // Compute calculated metrics
  const studentsPerClass =
    school.studentCount && school.classCount && school.classCount > 0
      ? (school.studentCount / school.classCount).toFixed(1)
      : null;

  const studentsPerTeacher =
    school.studentCount && school.teacherCount && school.teacherCount > 0
      ? (school.studentCount / school.teacherCount).toFixed(1)
      : null;

  // SchoolInfo official page URL for this school
  const schoolInfoWebUrl = `https://www.schoolinfo.go.kr/ei/ss/PbanplusSearchSchoolList.do?searchWord=${encodeURIComponent(
    school.schoolName
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between gap-3 shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                {school.schoolType}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-700">
                {school.district}
              </span>
              <span className="px-2 py-0.5 rounded text-xs bg-slate-200 text-slate-700">
                {school.genderType}
              </span>
              <span className="px-2 py-0.5 rounded text-xs bg-slate-200 text-slate-700">
                {school.foundationType}
              </span>
              {school.eduOffice && (
                <span className="px-2 py-0.5 rounded text-xs bg-indigo-50 text-indigo-700 font-medium border border-indigo-100">
                  {school.eduOffice}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{school.schoolName}</span>
              {school.hasLocation ? (
                <span className="text-xs font-normal text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> 지도 등록교
                </span>
              ) : (
                <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  위치정보 없음
                </span>
              )}
            </h2>
          </div>

          {/* Action buttons & Close */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onToggleBookmark}
              className={`p-2 rounded-lg border text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                isBookmarked
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title="관심학교 등록"
            >
              <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-500' : ''}`} />
              <span className="hidden sm:inline">관심</span>
            </button>

            <button
              onClick={onToggleComparison}
              disabled={!isInComparison && !canAddToComparison}
              className={`p-2 rounded-lg border text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                isInComparison
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : canAddToComparison
                  ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              title="비교함 추가"
            >
              <Scale className="w-4 h-4" />
              <span className="hidden sm:inline">비교</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-5 border-b border-slate-200 bg-white overflow-x-auto text-xs sm:text-sm font-medium text-slate-600 shrink-0 gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('basic')}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'basic'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            기본정보
          </button>
          <button
            onClick={() => setActiveTab('student')}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'student'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            학생 현황
          </button>
          <button
            onClick={() => setActiveTab('admission')}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'admission'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            입학 정보
          </button>
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'curriculum'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            교육과정
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'features'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            학교 특색
          </button>
          <button
            onClick={() => setActiveTab('career')}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'career'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            졸업 후 진로
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-sm">
          {/* TAB 1: 기본정보 (Section 28) */}
          {activeTab === 'basic' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center gap-2 text-slate-500 font-semibold text-xs">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>위치 및 주소</span>
                  </div>
                  <p className="text-slate-900 font-medium">
                    {school.address || '주소 정보 없음'}
                    {school.zipCode && <span className="text-slate-500 text-xs ml-1.5">(우: {school.zipCode})</span>}
                  </p>
                  <p className="text-xs text-slate-500">
                    관할 행정구역: {school.district} ({school.sggCode})
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center gap-2 text-slate-500 font-semibold text-xs">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>관할 및 설립</span>
                  </div>
                  <p className="text-slate-900 font-medium">
                    관할청: {school.eduOffice || '서울특별시교육청'}
                  </p>
                  <p className="text-xs text-slate-500">
                    설립유형: {school.foundationType} · {school.genderType}
                    {school.foundDate && ` (설립일: ${school.foundDate})`}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center gap-2 text-slate-500 font-semibold text-xs">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span>연락처</span>
                  </div>
                  <p className="text-slate-900 font-medium flex items-center gap-2">
                    <span>전화: {school.phone || '공시자료 없음'}</span>
                  </p>
                  {school.fax && <p className="text-xs text-slate-500">팩스: {school.fax}</p>}
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center gap-2 text-slate-500 font-semibold text-xs">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span>홈페이지</span>
                  </div>
                  {school.homepage ? (
                    <a
                      href={school.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium truncate flex items-center gap-1.5 group"
                    >
                      <span className="truncate">{school.homepage}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  ) : (
                    <p className="text-slate-500 text-xs">홈페이지 정보 없음</p>
                  )}
                </div>
              </div>

              {/* High-level statistics summary */}
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50">
                <h4 className="font-semibold text-blue-900 text-xs sm:text-sm mb-3 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>학교 규모 요약 (공시 기준)</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-white p-2.5 rounded-lg border border-blue-100">
                    <p className="text-xs text-slate-500 mb-0.5">총 학생수</p>
                    <p className="text-base sm:text-lg font-bold text-slate-900">
                      {school.studentCount ? `${school.studentCount.toLocaleString()}명` : '공시자료 없음'}
                    </p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-blue-100">
                    <p className="text-xs text-slate-500 mb-0.5">총 학급수</p>
                    <p className="text-base sm:text-lg font-bold text-slate-900">
                      {school.classCount ? `${school.classCount}학급` : '공시자료 없음'}
                    </p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-blue-100">
                    <p className="text-xs text-slate-500 mb-0.5">학급당 학생수</p>
                    <p className="text-base sm:text-lg font-bold text-blue-700">
                      {studentsPerClass ? `${studentsPerClass}명` : '-'}
                    </p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-blue-100">
                    <p className="text-xs text-slate-500 mb-0.5">교원수</p>
                    <p className="text-base sm:text-lg font-bold text-slate-900">
                      {school.teacherCount ? `${school.teacherCount}명` : '공시자료 없음'}
                    </p>
                  </div>
                </div>
                {studentsPerClass && (
                  <p className="text-[11px] text-slate-400 mt-2 text-right">
                    * 학급당 학생수는 공시자료 기준 계산값입니다 (전체 학생 수 ÷ 전체 학급 수).
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: 학생 현황 (Section 29) */}
          {activeTab === 'student' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">학생 및 학급 편성 현황</h3>
                <span className="text-xs text-slate-500">공시연도: {school.disclosureYear || '2025'}년</span>
              </div>

              {school.studentCount ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-xs text-slate-500">총 학생수</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        {school.studentCount.toLocaleString()}명
                      </p>
                      {(school.maleStudentCount || school.femaleStudentCount) && (
                        <p className="text-xs text-slate-600 mt-1.5">
                          남학생 {school.maleStudentCount || 0}명 / 여학생 {school.femaleStudentCount || 0}명
                        </p>
                      )}
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-xs text-slate-500">총 학급수</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        {school.classCount || '-'}학급
                      </p>
                      {studentsPerClass && (
                        <p className="text-xs text-blue-600 font-medium mt-1.5">
                          학급당 {studentsPerClass}명 (계산값)
                        </p>
                      )}
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-xs text-slate-500">교원 현황</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        {school.teacherCount ? `${school.teacherCount}명` : '공시자료 없음'}
                      </p>
                      {studentsPerTeacher && (
                        <p className="text-xs text-slate-600 mt-1.5">
                          교원 1인당 학생 {studentsPerTeacher}명
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <h4 className="font-semibold text-slate-800 text-xs mb-2">공시자료 산출 안내</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      학교알리미 초·중등 교육정보공시 데이터 기준입니다. 세부 학년별 분반 현황 및 성비는 학교알리미 공식 홈페이지의 상세 공시 보고서에서 연도별 열람이 가능합니다.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500">
                  <p className="font-medium">공시자료 없음</p>
                  <p className="text-xs mt-1">해당 학교의 학생 수 상세 공시자료가 등록되어 있지 않습니다.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: 입학 정보 (Section 30) */}
          {activeTab === 'admission' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">고등학교 입학전형 및 모집 안내</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  {school.schoolType} 전형
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">입학전형 기본 사항</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {school.schoolType === '일반고' &&
                        '서울특별시 교육감 선발 후기 일반고등학교 전형(고교선택제) 대상 학교입니다. 1단계(단일학교군) 및 2단계(일반학교군) 지망을 통해 지원합니다.'}
                      {school.schoolType === '자사고' &&
                        '자율형 사립고등학교 입학전형에 따르며, 자기주도학습전형(1단계 추첨 및 2단계 면접 등)을 통해 신입생을 선발합니다.'}
                      {school.schoolType === '특목고' &&
                        '특수목적고등학교(과학고/외고/국제고/예술고/체육고/마이스터고) 입학전형 요강에 따르며 전기고 또는 후기 세부 모집요강이 적용됩니다.'}
                      {school.schoolType === '특성화고' &&
                        '특성화고등학교 특별전형(미래인재 등) 및 일반전형으로 학과별 신입생을 선발합니다.'}
                      {school.schoolType === '영재고' &&
                        '영재교육진흥법에 따라 전국 단위 입학전형을 실시합니다.'}
                      {school.schoolType === '학력인정고' || school.schoolType === '기타' ?
                        '학교 자체 입학전형 요강에 따라 신입생을 선발합니다.' : ''}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex flex-wrap gap-2">
                  <a
                    href={schoolInfoWebUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>학교알리미 입학전형 공시자료 확인</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>

                  {school.homepage && (
                    <a
                      href={school.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
                    >
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                      <span>학교 공식 입학안내 바로가기</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 text-xs text-amber-900 leading-relaxed">
                <div className="flex items-center gap-1.5 font-semibold text-amber-800 mb-1">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>진로진학상담 유의사항</span>
                </div>
                고등학교 입학전형 일정 및 세부 요강(모집인원, 원서접수 일정, 전형료, 사회통합전형 등)은 매년 서울특별시교육청 고입전형 기본계획 및 학교별 확정 요강에 따라 변경될 수 있으므로, 반드시 지원 전 공식 모집요강을 확인하시기 바랍니다.
              </div>
            </div>
          )}

          {/* TAB 4: 교육과정 (Section 31) */}
          {activeTab === 'curriculum' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">학교교육과정 편성 및 운영</h3>
                <span className="text-xs text-slate-500">고교학점제 및 교과 이수</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>개설 교과목 및 학생 선택중심 교육과정</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  2022 개정 교육과정 및 고교학점제 기반으로 공통과목, 일반선택, 진로선택, 융합선택 과목이 개설됩니다. {school.schoolName}의 학년별 교육과정 편성표와 단위 배당 기준은 학교알리미 공시 원문에서 열람할 수 있습니다.
                </p>

                <div className="pt-2">
                  <a
                    href={schoolInfoWebUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>교육과정 편성·운영 원문 보기</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: 학교 특색 (Section 32) */}
          {activeTab === 'features' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">교육운영 특색사업 및 동아리 활동</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span>학교 특색 교육활동</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    교과중점과정, AI·디지털 선도학교, 국제교류 프로그램, 인성교육, 독서토론 등 학교별 중점 특색사업이 공시자료에 등록되어 운영됩니다.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>동아리 및 자율활동</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    학술, 문화예술, 스포츠, 봉사 등 창의적 체험활동 동아리 및 학생 자율동아리 개설 현황과 참여 인원이 공시자료로 제공됩니다.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={schoolInfoWebUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer border border-slate-300"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>특색사업 및 동아리 현황 공시자료 열람</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </div>
            </div>
          )}

          {/* TAB 6: 졸업 후 진로 (Section 33) */}
          {activeTab === 'career' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">졸업생 진로 현황</h3>
                <span className="text-xs text-slate-500">기준연도: 2025학년도 (공시)</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-semibold text-slate-900 text-sm">진학 및 취업 현황 안내</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  대학교(4년제), 전문대학, 국외대학 진학 및 취업자, 기타 진로 비율은 학교알리미 공식 공시 지표 항목(졸업생의 진로 현황)으로 매년 정기 공시됩니다.
                </p>

                <div className="pt-2">
                  <a
                    href={schoolInfoWebUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>2025학년도 졸업생 진로 현황 원문 보기</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>출처: 학교알리미(학교정보공시) 공식 Open API</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg transition cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
