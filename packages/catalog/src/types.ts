/** أنواع كتالوج المحاكاة — الهيكل الموحد لكل محاكاة في المنصة. */
export type Dimension = '2D' | '3D' | 'XR';
export type Level = 'ابتدائي' | 'متوسط' | 'ثانوي' | 'جامعي';

export interface SimulationEntry {
  /** معرف فريد: رمز الحقل + رقم تسلسلي (مثال PH-201). */
  id: string;
  nameAr: string;
  nameEn: string;
  field: string;
  subfield: string;
  level: Level;
  concepts: string[];
  dim: Dimension;
  boost: string;
}
