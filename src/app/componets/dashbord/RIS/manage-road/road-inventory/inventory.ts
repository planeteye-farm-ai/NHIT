export interface Inventory {
  geometry_data_id: string,
  state_id: string,
  district_id: string,
  city_id: string,
  village: string,
  chainage_start: string,
  chainage_end: string,
  terrain: string,
  land_use_left: string,
  land_use_right: string,
  chainagewise_village: string,
  roadway_width: string,
  formation_width: string,
  carriageway_type: string,
  carriageway_width: string,
  shoulder_left_type: string,
  shoulder_right_type: string,
  shoulder_left_width: string,
  shoulder_right_width: string,
  submergence: string,
  embankment_height: string,
  }
  
  
  export interface InventoryEdit {
    state_id: string,
    district_id: string,
    city_id: string,
    village: string,
    chainage_start: string,
    chainage_end: string,
    terrain: string,
    land_use_left: string,
    land_use_right: string,
    chainagewise_village: string,
    roadway_width: string,
    formation_width: string,
    carriageway_type: string,
    carriageway_width: string,
    shoulder_left_type: string,
    shoulder_right_type: string,
    shoulder_left_width: string,
    shoulder_right_width: string,
    submergence: string,
    embankment_height: string,
    
    drainage_left: string,
    drainage_right: string,
  
    avenue_plantation_left: number,
    avenue_plantation_right: number,
  
    median_plants: string,
    median_plants_value: number,
  
    sign_board_left: number,
    sign_board_right: number,
    sign_board_middle: number,
  
    culverts_left: number,
    culverts_right: number,
  
    street_lights_left: number,
    street_lights_middle: number,
    street_lights_right: number,
  
    junctions: number,
    kilometer_stone_left: number,
    kilometer_stone_middle: number,
    kilometer_stone_right: number,
  
    bus_top_left: number,
    bus_top_right: number,
  
    truck_lay_bayes_left: number,
    truck_lay_bayes_right: number,
  
    toll_plaza: string,
  
    service_road_left: number,
    service_road_right: number,
    adjacent_roads_left: number,
    adjacent_roads_right: number,
    
    toilet_blocks_left: number,
    toilet_blocks_right: number,
  
    solar_blinkers: string,
    solar_blinkers_value: number,
  
    rest_area_left: number,
    rest_area_right: number,
    row_fencing_left: number,
    row_fencing_middle: number,
    row_fencing_right: number,
    fuel_station_left: number,
    fuel_station_right: number,
    emergency_call_box_left: number,
    emergency_call_box_right: number,
    footpath_left: string,
    footpath_right: string,
  
    divider_break: string,
    divider_break_value: number,
    remarks: string
    }
    