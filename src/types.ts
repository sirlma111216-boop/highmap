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
}

export type SchoolTypeOption = "전체" | "일반고" | "자사고" | "특목고" | "영재고" | "특성화고" | "학력인정고" | "기타";
export type GenderTypeOption = "전체" | "남학교" | "여학교" | "남녀공학";
export type FoundationTypeOption = "전체" | "공립" | "사립" | "국립" | "기타";

export interface FilterState {
  district: string; // "전체" or district name e.g. "동대문구"
  schoolType: SchoolTypeOption;
  genderType: GenderTypeOption;
  foundationType: FoundationTypeOption;
  searchQuery: string;
  onlyBookmarked: boolean;
}

export interface SchoolsApiResponse {
  schools: School[];
  totalDistricts: number;
  successCount: number;
  failedDistricts: string[];
  totalCount: number;
  locatedCount: number;
  unlocatedCount: number;
  error?: string;
}
