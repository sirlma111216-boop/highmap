export interface School {
  schoolCode: string;
  schoolName: string;
  district: string;
  sggCode: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  hasLocation: boolean;
  phone: string;
  homepage: string;
  genderType: "남학교" | "여학교" | "남녀공학" | "기타";
  foundationType: "공립" | "사립" | "국립" | "기타";
  schoolType: "일반고" | "자사고" | "특목고" | "영재고" | "특성화고" | "학력인정고" | "기타";
  studentCount?: number;
  maleStudentCount?: number;
  femaleStudentCount?: number;
  classCount?: number;
  teacherCount?: number;
  eduOffice?: string;
  disclosureYear?: string;
  zipCode?: string;
  fax?: string;
  foundDate?: string;
  raw?: any;
  detail?: any;
}

export const SEOUL_DISTRICTS = [
  { name: "종로구", code: "11110" },
  { name: "중구", code: "11140" },
  { name: "용산구", code: "11170" },
  { name: "성동구", code: "11200" },
  { name: "광진구", code: "11215" },
  { name: "동대문구", code: "11230" },
  { name: "중랑구", code: "11260" },
  { name: "성북구", code: "11290" },
  { name: "강북구", code: "11305" },
  { name: "도봉구", code: "11320" },
  { name: "노원구", code: "11350" },
  { name: "은평구", code: "11380" },
  { name: "서대문구", code: "11410" },
  { name: "마포구", code: "11440" },
  { name: "양천구", code: "11470" },
  { name: "강서구", code: "11500" },
  { name: "구로구", code: "11530" },
  { name: "금천구", code: "11545" },
  { name: "영등포구", code: "11560" },
  { name: "동작구", code: "11590" },
  { name: "관악구", code: "11620" },
  { name: "서초구", code: "11650" },
  { name: "강남구", code: "11680" },
  { name: "송파구", code: "11710" },
  { name: "강동구", code: "11740" }
];

// District to Education Office Mapping (11 Offices)
export const DISTRICT_TO_EDU_OFFICE: Record<string, string> = {
  "동대문구": "동부교육지원청",
  "중랑구": "동부교육지원청",
  "은평구": "서부교육지원청",
  "서대문구": "서부교육지원청",
  "마포구": "서부교육지원청",
  "영등포구": "남부교육지원청",
  "구로구": "남부교육지원청",
  "금천구": "남부교육지원청",
  "노원구": "북부교육지원청",
  "도봉구": "북부교육지원청",
  "종로구": "중부교육지원청",
  "중구": "중부교육지원청",
  "용산구": "중부교육지원청",
  "강동구": "강동송파교육지원청",
  "송파구": "강동송파교육지원청",
  "강서구": "강서양천교육지원청",
  "양천구": "강서양천교육지원청",
  "강남구": "강남서초교육지원청",
  "서초구": "강남서초교육지원청",
  "동작구": "동작관악교육지원청",
  "관악구": "동작관악교육지원청",
  "성동구": "성동광진교육지원청",
  "광진구": "성동광진교육지원청",
  "성북구": "성북강북교육지원청",
  "강북구": "성북강북교육지원청"
};

/**
 * Normalizes Foundation Type: 공립, 사립, 국립, 기타
 */
function normalizeFoundationType(rawVal: any): "공립" | "사립" | "국립" | "기타" {
  const str = String(rawVal || "").trim();
  if (str.includes("공립")) return "공립";
  if (str.includes("사립")) return "사립";
  if (str.includes("국립")) return "국립";
  return "기타";
}

/**
 * Normalizes Gender Type: 남학교, 여학교, 남녀공학, 기타
 */
function normalizeGenderType(rawVal: any): "남학교" | "여학교" | "남녀공학" | "기타" {
  const str = String(rawVal || "").trim();
  if (str.includes("남녀") || str.includes("남여") || str.includes("공학")) return "남녀공학";
  if (str === "남" || str.includes("남학교")) return "남학교";
  if (str === "여" || str.includes("여학교")) return "여학교";
  return "남녀공학"; // standard fallback if coed
}

/**
 * Normalizes School Type based ONLY on official classification fields
 * 일반고, 자사고, 특목고, 영재고, 특성화고, 학력인정고, 기타
 */
function normalizeSchoolType(raw: any): "일반고" | "자사고" | "특목고" | "영재고" | "특성화고" | "학력인정고" | "기타" {
  const typeField = String(
    raw.HS_SC_NM ||
    raw.schulKndScNm ||
    raw.SCHUL_KND_SC_NM ||
    raw.SCHUL_KND_NM ||
    raw.schulKndNm ||
    raw.DG_SC_NM ||
    ""
  ).trim();

  if (typeField.includes("자율형사립고") || typeField.includes("자사고")) return "자사고";
  if (typeField.includes("영재")) return "영재고";
  if (
    typeField.includes("특수목적고") ||
    typeField.includes("특목고") ||
    typeField.includes("과학고") ||
    typeField.includes("외국어고") ||
    typeField.includes("국제고") ||
    typeField.includes("예술고") ||
    typeField.includes("체육고") ||
    typeField.includes("마이스터고")
  ) {
    return "특목고";
  }
  if (typeField.includes("특성화고") || typeField.includes("직업")) return "특성화고";
  if (typeField.includes("학력인정") || typeField.includes("각종")) return "학력인정고";
  if (typeField.includes("일반고")) return "일반고";

  // Check additional code/name fields before defaulting
  const etcField = String(raw.SCHUL_SE_NM || raw.schulSeNm || raw.INDST_SPECL_CCCC_EXST_YN || "").trim();
  if (etcField.includes("자율형사립")) return "자사고";
  if (etcField.includes("일반")) return "일반고";

  return "기타";
}

/**
 * Normalizes a raw SchoolInfo list item into the School interface
 */
export function normalizeSchoolItem(item: any, districtName: string, sggCode: string): School {
  const schoolCode = String(
    item.SCHUL_CODE || item.schulCode || item.schoolCode || item.SCHUL_ID || item.schulId || ""
  ).trim();

  const schoolName = String(
    item.SCHUL_NM || item.schulNm || item.schoolName || ""
  ).trim();

  // Coordinates validation (Section 16)
  const rawLat = item.LAT || item.LTTUD || item.latitude || item.lat || item.REFINE_WGS84_LAT;
  const rawLon = item.LOT || item.LGTUD || item.longitude || item.lon || item.lng || item.REFINE_WGS84_LOGT;

  const latNum = Number(rawLat);
  const lonNum = Number(rawLon);

  const isValidLat = Number.isFinite(latNum) && latNum !== 0 && latNum >= 37.3 && latNum <= 37.8;
  const isValidLon = Number.isFinite(lonNum) && lonNum !== 0 && lonNum >= 126.6 && lonNum <= 127.4;
  const hasLocation = isValidLat && isValidLon;

  const address = String(
    item.ORG_RDNMA ||
    item.orgRdnma ||
    item.ADRCD_NM ||
    item.adrcdNm ||
    item.ADDRESS ||
    item.address ||
    ""
  ).trim();

  const phone = String(
    item.USER_TELNO || item.userTelno || item.TEL_NO || item.telNo || item.phone || ""
  ).trim();

  const rawHomepage = String(
    item.HMPG_ADRES || item.hmpgAdres || item.HOMEPAGE_URL || item.homepage || ""
  ).trim();
  let homepage = rawHomepage;
  if (homepage && !homepage.startsWith("http://") && !homepage.startsWith("https://")) {
    homepage = `http://${homepage}`;
  }

  const foundationRaw = item.FOND_SC_NM || item.fondScNm || item.FOND_SC_CODE || item.foundationType;
  const foundationType = normalizeFoundationType(foundationRaw);

  const genderRaw = item.COEDU_SC_NM || item.coeduScNm || item.GENDER_NM || item.genderType;
  const genderType = normalizeGenderType(genderRaw);

  const schoolType = normalizeSchoolType(item);

  const studentCount = Number(item.TOTAL_STUDENT || item.totalStudent || item.STDNT_CNT || item.stdntCnt) || undefined;
  const maleStudentCount = Number(item.MALE_STUDENT || item.maleStudent || item.COL_1) || undefined;
  const femaleStudentCount = Number(item.FEMALE_STUDENT || item.femaleStudent || item.COL_2) || undefined;
  const classCount = Number(item.TOTAL_CLASS || item.totalClass || item.CLRM_CNT || item.clrmCnt) || undefined;
  const teacherCount = Number(item.TOTAL_TEACHER || item.totalTeacher || item.TCHR_CNT || item.tchrcnt) || undefined;

  const eduOffice = DISTRICT_TO_EDU_OFFICE[districtName] || String(item.JU_ORG_NM || item.juOrgNm || "");

  const disclosureYear = String(item.COLLECT_YEAR || item.collectYear || item.YEAR || item.year || "2025");
  const zipCode = String(item.ZIP_CODE || item.zipCode || item.ORG_RDNZP || "").trim();
  const fax = String(item.PERM_FAX_NO || item.faxNo || "").trim();
  const foundDate = String(item.FOND_DE || item.fondDe || "").trim();

  return {
    schoolCode,
    schoolName,
    district: districtName,
    sggCode,
    address,
    latitude: hasLocation ? latNum : null,
    longitude: hasLocation ? lonNum : null,
    hasLocation,
    phone,
    homepage,
    genderType,
    foundationType,
    schoolType,
    studentCount,
    maleStudentCount,
    femaleStudentCount,
    classCount,
    teacherCount,
    eduOffice,
    disclosureYear,
    zipCode,
    fax,
    foundDate,
    raw: item
  };
}

/**
 * Fetch a single district from SchoolInfo API
 */
async function fetchDistrictSchools(
  apiKey: string,
  district: { name: string; code: string },
  timeoutMs = 15000
): Promise<{ success: boolean; schools: School[]; error?: string }> {
  const url = `https://www.schoolinfo.go.kr/openApi.do?apiKey=${encodeURIComponent(apiKey)}&apiType=0&sidoCode=11&sggCode=${district.code}&schulKndCode=04`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "Accept": "application/json"
      }
    });

    clearTimeout(timer);

    if (!res.ok) {
      return { success: false, schools: [], error: `HTTP ${res.status}` };
    }

    const data = await res.json() as any;

    if (!data || !Array.isArray(data.list)) {
      // Some API responses have resultCode or error
      return { success: false, schools: [], error: data?.resultMsg || "Invalid list format" };
    }

    const schools = data.list.map((item: any) =>
      normalizeSchoolItem(item, district.name, district.code)
    );

    return { success: true, schools };
  } catch (err: any) {
    clearTimeout(timer);
    return { success: false, schools: [], error: err?.message || "Network error" };
  }
}

/**
 * Fetch all Seoul 25 districts with Promise.allSettled in batches
 */
export async function fetchSeoulSchools(apiKey: string): Promise<{
  schools: School[];
  totalDistricts: number;
  successCount: number;
  failedDistricts: string[];
  totalCount: number;
  locatedCount: number;
  unlocatedCount: number;
}> {
  const allSchoolsMap = new Map<string, School>();
  const failedList: string[] = [];
  let successCount = 0;

  // Process in batches of 5 to avoid overwhelming the server
  const batchSize = 5;
  for (let i = 0; i < SEOUL_DISTRICTS.length; i += batchSize) {
    const batch = SEOUL_DISTRICTS.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(district => fetchDistrictSchools(apiKey, district))
    );

    for (let j = 0; j < batch.length; j++) {
      const district = batch[j];
      const res = results[j];

      if (res.status === "fulfilled" && res.value.success) {
        successCount++;
        const list = res.value.schools;
        console.log(`${district.name}: ${list.length}개`);
        for (const school of list) {
          if (school.schoolCode) {
            allSchoolsMap.set(school.schoolCode, school);
          }
        }
      } else {
        const errorMsg = res.status === "fulfilled" ? res.value.error : (res as PromiseRejectedResult).reason?.message;
        console.warn(`${district.name}: 조회 실패 (${errorMsg})`);
        failedList.push(district.name);
      }
    }
  }

  const schools = Array.from(allSchoolsMap.values());
  const locatedCount = schools.filter(s => s.hasLocation).length;
  const unlocatedCount = schools.length - locatedCount;

  console.log(`성공 지역: ${successCount}/25`);
  console.log(`실패 지역: ${failedList.length}/25`);
  console.log(`전체 학교: ${schools.length}개`);
  console.log(`좌표 있는 학교: ${locatedCount}개`);
  console.log(`좌표 없는 학교: ${unlocatedCount}개`);

  return {
    schools,
    totalDistricts: SEOUL_DISTRICTS.length,
    successCount,
    failedDistricts: failedList,
    totalCount: schools.length,
    locatedCount,
    unlocatedCount
  };
}

/**
 * Fetch detailed school disclosure info from SchoolInfo API
 */
export async function fetchSchoolDetail(schoolCode: string, apiKey: string): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    // SchoolInfo provides multiple apiType endpoints for details
    // apiType=0 with schulCode for single school basic profile
    const url = `https://www.schoolinfo.go.kr/openApi.do?apiKey=${encodeURIComponent(apiKey)}&apiType=0&schulCode=${encodeURIComponent(schoolCode)}`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json() as any;
    return data;
  } catch (err: any) {
    clearTimeout(timer);
    throw err;
  }
}
