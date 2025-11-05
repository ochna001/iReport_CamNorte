-- Database Functions for iReport
--
-- This file contains helper functions to be created in your Supabase database.
-- Run this script in the SQL Editor AFTER running schema.sql.

-- Haversine distance function
-- Calculates the distance between two points on Earth in kilometers.
CREATE OR REPLACE FUNCTION public.calculate_distance(
    lat1 float, lon1 float, 
    lat2 float, lon2 float
) 
RETURNS float AS $$
DECLARE
    R integer = 6371; -- Earth's radius in kilometers
    dLat float;
    dLon float;
    a float;
    c float;
    distance float;
BEGIN
    dLat = radians(lat2 - lat1);
    dLon = radians(lon2 - lon1);
    a = sin(dLat / 2) * sin(dLat / 2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dLon / 2) * sin(dLon / 2);
    c = 2 * asin(sqrt(a));
    distance = R * c;
    RETURN distance;
END;
$$ LANGUAGE plpgsql;


-- Function to find the nearest station for an incident
-- This can be called from your application backend or an edge function.
CREATE OR REPLACE FUNCTION public.find_nearest_station(
    incident_lat float, 
    incident_lon float,
    target_agency_id int
) 
RETURNS TABLE (station_id int, station_name text, distance_km float) AS $$
BEGIN
    RETURN QUERY
    SELECT
        id,
        name,
        public.calculate_distance(incident_lat, incident_lon, latitude, longitude) as distance
    FROM
        public.agency_stations
    WHERE
        agency_id = target_agency_id
    ORDER BY
        distance
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;
