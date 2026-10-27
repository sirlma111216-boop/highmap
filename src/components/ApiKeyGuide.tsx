import React, { useState } from 'react';
import { KeyRound, ExternalLink, Copy, Check, Info } from 'lucide-react';

export const ApiKeyGuide: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyKeyName = () => {
    navigator.clipboard.writeText('SCHOOLINFO_API_KEY');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-5 bg-white rounded-xl border border-amber-200 shadow-xs space-y-4 text-slate-800">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
          <KeyRound className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            학교알리미 인증키 설정 안내
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            학교알리미 인증키(SCHOOLINFO_API_KEY)가 설정되지 않았습니다.
            AI Studio의 Settings &gt; Secrets(또는 배포 사이트의 환경변수)에 키를 추가하면 학교 목록이 나타납니다.
          </p>
        </div>
      </div>

      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-700">필요한 환경변수 이름:</span>
          <button
            onClick={handleCopyKeyName}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium transition cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? '복사됨' : '복사'}</span>
          </button>
        </div>
        <code className="block p-2 bg-white rounded border border-slate-200 text-blue-700 font-mono font-semibold text-xs select-all">
          SCHOOLINFO_API_KEY
        </code>
      </div>

      <div className="space-y-2 text-xs text-slate-600">
        <div className="flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
          <p>
            인증키는 <strong>학교알리미(schoolinfo.go.kr)</strong> Open API 서비스에서 무료로 즉시 발급받으실 수 있습니다.
          </p>
        </div>

        <a
          href="https://www.schoolinfo.go.kr/openApiGuide.do"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium pt-1"
        >
          <span>학교알리미 Open API 발급 안내 바로가기</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
        * 지도는 API 키가 없어도 정상적으로 탐색할 수 있으며, 키가 등록되면 서울 고등학교 실제 공시 데이터가 지도와 목록에 자동으로 연결됩니다.
      </div>
    </div>
  );
};
