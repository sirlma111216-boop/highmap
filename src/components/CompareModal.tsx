import React from 'react';
import { School } from '../types';
import { X, Trash2, ExternalLink, Scale, CheckCircle2 } from 'lucide-react';

interface CompareModalProps {
  schools: School[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveSchool: (schoolCode: string) => void;
  onClearAll: () => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  schools,
  isOpen,
  onClose,
  onRemoveSchool,
  onClearAll
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                고등학교 맞춤 비교 ({schools.length}/4)
              </h2>
              <p className="text-xs text-slate-500">
                선택한 학교의 학교알리미 공식 공시정보를 항목별로 비교합니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {schools.length > 0 && (
              <button
                onClick={onClearAll}
                className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition font-medium flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>모두 비우기</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {schools.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Scale className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-base">비교함이 비어 있습니다</p>
              <p className="text-xs mt-1 text-slate-400">
                학교 카드나 상세정보에서 &apos;비교함 추가&apos;를 눌러 최대 4개 학교를 비교해 보세요.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <th className="p-3 w-36 font-semibold text-slate-600 bg-slate-50 sticky left-0 z-10 border-r border-slate-200">
                      비교 항목
                    </th>
                    {schools.map((school) => (
                      <th key={school.schoolCode} className="p-3 min-w-[200px] border-r border-slate-200 last:border-r-0">
                        <div className="flex items-start justify-between gap-1.5">
                          <div>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                              {school.schoolType}
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm mt-1">{school.schoolName}</h4>
                          </div>
                          <button
                            onClick={() => onRemoveSchool(school.schoolCode)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-100 cursor-pointer"
                            title="비교함에서 제거"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {/* 지역 */}
                  <tr>
                    <td className="p-3 font-medium text-slate-500 bg-slate-50 sticky left-0 border-r border-slate-200">
                      지역 (자치구)
                    </td>
                    {schools.map((s) => (
                      <td key={s.schoolCode} className="p-3 border-r border-slate-200 last:border-r-0 text-slate-800">
                        {s.district} ({s.eduOffice || '관할 교육청'})
                      </td>
                    ))}
                  </tr>

                  {/* 학교유형 */}
                  <tr>
                    <td className="p-3 font-medium text-slate-500 bg-slate-50 sticky left-0 border-r border-slate-200">
                      학교유형
                    </td>
                    {schools.map((s) => (
                      <td key={s.schoolCode} className="p-3 border-r border-slate-200 last:border-r-0 font-semibold text-slate-800">
                        {s.schoolType}
                      </td>
                    ))}
                  </tr>

                  {/* 남녀구분 */}
                  <tr>
                    <td className="p-3 font-medium text-slate-500 bg-slate-50 sticky left-0 border-r border-slate-200">
                      남녀구분
                    </td>
                    {schools.map((s) => (
                      <td key={s.schoolCode} className="p-3 border-r border-slate-200 last:border-r-0 text-slate-800">
                        {s.genderType}
                      </td>
                    ))}
                  </tr>

                  {/* 설립구분 */}
                  <tr>
                    <td className="p-3 font-medium text-slate-500 bg-slate-50 sticky left-0 border-r border-slate-200">
                      설립구분
                    </td>
                    {schools.map((s) => (
                      <td key={s.schoolCode} className="p-3 border-r border-slate-200 last:border-r-0 text-slate-800">
                        {s.foundationType}
                      </td>
                    ))}
                  </tr>

                  {/* 학생 수 */}
                  <tr>
                    <td className="p-3 font-medium text-slate-500 bg-slate-50 sticky left-0 border-r border-slate-200">
                      학생 수
                    </td>
                    {schools.map((s) => (
                      <td key={s.schoolCode} className="p-3 border-r border-slate-200 last:border-r-0 text-slate-800">
                        {s.studentCount ? (
                          <span className="font-semibold">{s.studentCount.toLocaleString()}명</span>
                        ) : (
                          '공시자료 없음'
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* 학급 수 */}
                  <tr>
                    <td className="p-3 font-medium text-slate-500 bg-slate-50 sticky left-0 border-r border-slate-200">
                      학급 수
                    </td>
                    {schools.map((s) => (
                      <td key={s.schoolCode} className="p-3 border-r border-slate-200 last:border-r-0 text-slate-800">
                        {s.classCount ? `${s.classCount}학급` : '공시자료 없음'}
                      </td>
                    ))}
                  </tr>

                  {/* 학급당 학생 수 */}
                  <tr>
                    <td className="p-3 font-medium text-slate-500 bg-slate-50 sticky left-0 border-r border-slate-200">
                      학급당 학생 수
                    </td>
                    {schools.map((s) => {
                      const perClass =
                        s.studentCount && s.classCount && s.classCount > 0
                          ? (s.studentCount / s.classCount).toFixed(1)
                          : null;
                      return (
                        <td key={s.schoolCode} className="p-3 border-r border-slate-200 last:border-r-0 text-blue-700 font-semibold">
                          {perClass ? `${perClass}명 (계산값)` : '-'}
                        </td>
                      );
                    })}
                  </tr>

                  {/* 교원 수 */}
                  <tr>
                    <td className="p-3 font-medium text-slate-500 bg-slate-50 sticky left-0 border-r border-slate-200">
                      교원 수
                    </td>
                    {schools.map((s) => (
                      <td key={s.schoolCode} className="p-3 border-r border-slate-200 last:border-r-0 text-slate-800">
                        {s.teacherCount ? `${s.teacherCount}명` : '공시자료 없음'}
                      </td>
                    ))}
                  </tr>

                  {/* 교육과정 및 선택과목 */}
                  <tr>
                    <td className="p-3 font-medium text-slate-500 bg-slate-50 sticky left-0 border-r border-slate-200">
                      교육과정 및 선택과목
                    </td>
                    {schools.map((s) => (
                      <td key={s.schoolCode} className="p-3 border-r border-slate-200 last:border-r-0 text-slate-700 text-xs">
                        고교학점제 편제 · 학생 선택중심 교육과정 개설
                      </td>
                    ))}
                  </tr>

                  {/* 특색사업 및 동아리 */}
                  <tr>
                    <td className="p-3 font-medium text-slate-500 bg-slate-50 sticky left-0 border-r border-slate-200">
                      특색사업 및 동아리
                    </td>
                    {schools.map((s) => (
                      <td key={s.schoolCode} className="p-3 border-r border-slate-200 last:border-r-0 text-slate-700 text-xs">
                        중점 교육과정 및 창의적 체험활동 자율동아리 운영
                      </td>
                    ))}
                  </tr>

                  {/* 입학전형 및 진로 */}
                  <tr>
                    <td className="p-3 font-medium text-slate-500 bg-slate-50 sticky left-0 border-r border-slate-200">
                      공시 원문 자료
                    </td>
                    {schools.map((s) => (
                      <td key={s.schoolCode} className="p-3 border-r border-slate-200 last:border-r-0">
                        <a
                          href={`https://www.schoolinfo.go.kr/ei/ss/PbanplusSearchSchoolList.do?searchWord=${encodeURIComponent(
                            s.schoolName
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          <span>학교알리미 원문</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>* 공시자료 기준 계산값: 전체 학생 수 ÷ 전체 학급 수</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition cursor-pointer"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
