export interface RWFIS {
  state_id:string;
  district_id: string; 
  city_id: string; 
  road_name: string; 
  road_code: string; 
  total_length_km: string; 
  survey_year: string; 
  survey_date: string; 

}

export interface EditRWFIS{
  state_id:string;
  district_id: string; 
  city_id: string; 
  road_name: string; 
  road_code: string; 
  total_length_km: string; 
  survey_year: string; 
  survey_date: string; 
  direction: string; 
  chainage_start: string; 
  chainage_end: string; 
  chainage: string; 
  cross_section_location: string; 
  offset_from_center_line: string; 
  feature_type: string; 
  material_type: string; 
  feature_condition: string; 
  safety_hazard: string; 
  land_use: string; 
  terrain: string; 
  latitude: string; 
  longitude: string; 
  altitude: string; 
  remarks: string; 
  
}