export interface homogenousAdd {
  geometry_data_id: string; 
  state_id: string;
  district_id: string; 
  city_id: string; 
  road_code: string;
  chainage_start: string;
  chainage_end: string; 
  date_of_survey: string; 
  }
  
export interface homogenousEdit {
  geometry_data_id: string; 
  state_id: string;
  district_id: string; 
  city_id: string; 
  road_code: string;
  chainage_start: string;
  chainage_end: string; 
  date_of_survey: string; 
  carriageway_type: string; 
  carriageway_width: string;

  cracks: string; 
  potholes: string; 
  rutting: string; 
  patchwork: string; 
  edge_breaks: string; 
  severity_of_distress: string; 
  pavement_condition_score: string; 
  international_roughness_index: string; 
  aadt_data: string; 
  cvd_class: string; 
  axle_load_data: string; 
  temperature: string; 
  rainfall: string; 
  drainage_condition: string; 
  last_maintenance_date:string;
  type_of_last_maintenance:string;
  comments_observations:string;

  }