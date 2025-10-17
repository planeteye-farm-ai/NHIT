export interface Traffic {
  data_collection_year: string; 
  state_id: string;
  district_id: string; 
  city_id: string; 
  road_code: string;
  road_name: string;
  direction: string; 
  total_length_km: string; 
  }
  
  export interface TrafficEdit {
    data_collection_year: string; 
    state_id: string;
    district_id: string; 
    city_id: string; 
    road_code: string;
    road_name: string;
    direction: string; 
    total_length_km: string; 
    chainage_start: string; 
    chainage_end: string;
    scooter_motor_cycle: string; 
    three_wheeler_auto: string;
    car_jeep_van_taxi: string; 
    mini_bus: string;
    standard_bus: string;
    tempo: string;
    lcv: string;
    two_axle_trucks: string;
    three_axle_trucks: string;
    multi_axle_truck: string;
    tractor_without_trailer: string;
    tractor_with_trailer: string;
    cycle: string; 
    cycle_rickshaw: string;
    animal_drawn_vehicle: string;
    other_non_motorized_traffic: string;
  
    }
    