export type DriverCategoryCode =
  | 'A1'
  | 'A'
  | 'B1'
  | 'B'
  | 'C1'
  | 'C'
  | 'D1'
  | 'D'
  | 'BE'
  | 'C1E'
  | 'CE'
  | 'D1E'
  | 'DE'
  | 'T';

export type DriverCategoryGroup =
  | 'A1_A'
  | 'B1_B'
  | 'C1_C'
  | 'D1_D'
  | 'BE_CE_DE'
  | 'T';

export interface DriverCategoryInfo {
  code: DriverCategoryCode;
  group: DriverCategoryGroup;
  name: string;
  min_age: number;
  description: string;
  exam_sections: string[];
}
