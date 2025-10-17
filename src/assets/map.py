import streamlit as st
import googlemaps
from datetime import datetime, timedelta
import folium
from streamlit_folium import st_folium
import warnings

# Initialize Google Maps client with your API key
API_KEY = 'AIzaSyCRoO3Vw8nD8j9u6FMG0tyut-9ZALX7T70'
gmaps = googlemaps.Client(key=API_KEY)

# Define a function to get the route and traffic information
def get_route_and_traffic(origin, destination):
    now = datetime.now()
    
    # Fetch traffic data for the current time
    directions_now = gmaps.directions(origin, destination, mode="driving", departure_time=now, traffic_model="best_guess")
    if directions_now:
        current_traffic_data = {
            'distance': directions_now[0]['legs'][0]['distance']['text'],
            'duration_in_traffic_now': directions_now[0]['legs'][0]['duration_in_traffic']['text'],
            'start_address': directions_now[0]['legs'][0]['start_address'],
            'end_address': directions_now[0]['legs'][0]['end_address']
        }
    else:
        current_traffic_data = None
    
    # Find shortest traffic time over the next 24 hours at hourly intervals
    min_duration = None
    min_duration_time = None
    for hour in range(1, 25):  # Check each hour for the next 24 hours
        future_time = now + timedelta(hours=hour)
        directions_future = gmaps.directions(origin, destination, mode="driving", departure_time=future_time, traffic_model="best_guess")
        if directions_future:
            future_duration = directions_future[0]['legs'][0]['duration_in_traffic']['value']  # In seconds
            if min_duration is None or future_duration < min_duration:
                min_duration = future_duration
                min_duration_time = future_time
    
    # Convert the minimum duration to hours and minutes format
    if min_duration is not None:
        min_duration_hours, min_duration_minutes = divmod(min_duration // 60, 60)
        shortest_time_in_traffic = f"{min_duration_hours}h {min_duration_minutes}m"
    else:
        shortest_time_in_traffic = None
    
    # Combine both traffic data results
    traffic_data = {
        'current_traffic': current_traffic_data,
        'shortest_traffic_time': shortest_time_in_traffic,
        'shortest_traffic_time_at': min_duration_time.strftime('%Y-%m-%d %H:%M') if min_duration_time else None
    }
    
    return traffic_data


# Streamlit layout and inputs
st.set_page_config(layout="wide")
st.title("Live Traffic Route Planner")
st.write("Click on the map to select your origin and destination.")

# Initialize session state for origin and destination coordinates
if 'origin' not in st.session_state:
    st.session_state['origin'] = None
if 'destination' not in st.session_state:
    st.session_state['destination'] = None

col1, col2, col3 = st.columns([3, 3, 2])

with col1:
    # Create a folium map for selecting origin and destination points
    map_center = [22.6923, 75.8379]  # Set map center coordinates
    select_map = folium.Map(location=map_center, zoom_start=12)

    # Display previously selected origin and destination markers
    if st.session_state['origin']:
        folium.Marker(location=st.session_state['origin'], popup="Origin", icon=folium.Icon(color="green")).add_to(select_map)
    if st.session_state['destination']:
        folium.Marker(location=st.session_state['destination'], popup="Destination", icon=folium.Icon(color="red")).add_to(select_map)
    map_data = st_folium(select_map, width=1200, height=500)

    # Update the selected location based on user's click on the map
    if map_data and map_data['last_clicked']:
        clicked_location = map_data['last_clicked']
        st.write(f"Selected Location: {clicked_location}")

        # Buttons to confirm the selected location as origin or destination
        if st.button("Set as Origin"):
            st.session_state['origin'] = (clicked_location['lat'], clicked_location['lng'])
            st.experimental_rerun()

        if st.button("Set as Destination"):
            st.session_state['destination'] = (clicked_location['lat'], clicked_location['lng'])
            st.experimental_rerun()

# Display route information in the third column if both origin and destination are set
with col3:
    if st.session_state['origin'] and st.session_state['destination']:
        origin_coords = f"{st.session_state['origin'][0]},{st.session_state['origin'][1]}"
        destination_coords = f"{st.session_state['destination'][0]},{st.session_state['destination'][1]}"
        
        if st.button("Get Route"):
            traffic_data = get_route_and_traffic(origin_coords, destination_coords)
            
            if traffic_data:
                current_traffic = traffic_data['current_traffic']
                st.write(f"Route from {current_traffic['start_address']} to {current_traffic['end_address']}:")
                st.write(f"Distance: {current_traffic['distance']}")
                st.write(f"Estimated travel time: {current_traffic['duration_in_traffic_now']}")
                st.write(f"Shortest travel time: {traffic_data['shortest_traffic_time']} at {traffic_data['shortest_traffic_time_at']}")
                
                # Display map with route
            else:
                st.write("No route found.")