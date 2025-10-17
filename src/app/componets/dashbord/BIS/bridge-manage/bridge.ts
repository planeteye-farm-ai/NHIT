export interface Bridge {
  bridge_no: string;
  state_id: string;
  zone: string;
  road_type: string;
  highway_no: string;
  chainage: string;
  direction_of_inventory: string,
  latitude: string,
  longitude:string,
  consultant_name: string;
  popular_name_of_bridge: string;
  administration_name_of_bridge:string
  custodian: string;
  engineer_designation: string;
  contact_details: string;
  email_id: string;
  departmental_chainage: string;
  departmental_bridge_number: string;
  total_no_of_span: number;
  span_arrangement: number[];
  length_of_bridge: string;
  width_of_bridge: string;
  traffic_lane_on_bridge: string;
  type_of_bridge: string;
  age_of_bridge: string;
  structural_form: string;
  loading_as_per_IRC: string;
  bridge_crossing_feature: string;
  rating_of_desk_geometry: string;
  rating_of_waterway_adequacy: string;
  rating_of_average_daily_traffic: string;
  rating_for_social_importance: string;
  rating_for_economic_growth_potential: string;
  rating_alternate_route: string;
  rating_environmental_impact:string;
  year_of_construction: string;
  height_of_bridge: string;
  soffit_level_of_bridge: string;
  material_foundation: string;
  material_substructure: string;
  material_superstructure: string;
  ground_level: string;
  design_discharge: string;
  design_hfl: string;
  lowest_water_level: string;
  scour_level_at_pier: string;
  scour_level_at_abutment: string;
  scour_level_of_superstructure: string;
  highway_width: string;
  highway_carriageway_width: string;
  highway_shoulder_width_appr: string;
  highway_footpath_width: string;
  highway_footpath_width_value: string;
  highway_median_width: string;
  highway_median_width_value: string;
  width_of_approach: string;
  safety_kerb_width: string;
  bridge_in_skew: string;
  bridge_skew_angle: string;
  approaches_structure: string;
  approaches_no_of_structure: string;
  type_of_wall: string;
  project_name:string;
  project_id:string;  
}
