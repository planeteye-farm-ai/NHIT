export interface Accident {
  road_code: string; 
  start_chainage: string;
  direction: string; 
  date_of_accident: string; 
  day_of_week: string;
  time: string; 
  section_name: string; 
  police_station: string; 
  fir_no: string; 
  }
  
  export interface AccidentEdit {
    road_code: string; 
    start_chainage: string;
    direction: string; 
    date_of_accident: string; 
    day_of_week: string;
    time: string; 
    section_name: string; 
    police_station: string; 
    fir_no: string;
    name_of_place: string;
    accident_spot: string;
    longitude: string; 
    latitude: string; 
    area: string;
    accident_category: string; 

    vehicle_involved_no: string; 
    vehicleInvolved: string;
    collision_type: string; 
    collisionTypeNo: string;

    killed_if_any: string; 
    injured_if_any: string; 
    cause_one: string;
    cause_two: string;
    cause_three: string;
    remarks: string;
    }
    