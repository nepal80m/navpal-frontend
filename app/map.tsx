import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

const MyMap = () => {
    const region = {
        latitude: 37.7749, // Example: San Francisco latitude
        longitude: -122.4194, // Example: San Francisco longitude
        latitudeDelta: 0.0922, // Controls the zoom level
        longitudeDelta: 0.0421,
    };

    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    useEffect(() => {
        let locationSubscription: Location.LocationSubscription | null = null;
        const startLiveLocationUpdates = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            // Start watching the position
            locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 60000, // Minimum time interval between updates (ms)
                    distanceInterval: 0, // Minimum distance interval between updates (meters)
                },
                (newLocation) => {
                    setLocation(newLocation);
                    sendLocationToBackend(newLocation.timestamp, newLocation.coords);
                }
            );
        };

        startLiveLocationUpdates();

        // Cleanup the subscription on component unmount
        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
        // async function getCurrentLocation() {

        //     let { status } = await Location.requestForegroundPermissionsAsync();
        //     if (status !== 'granted') {
        //         setErrorMsg('Permission to access location was denied');
        //         return;
        //     }

        //     let location = await Location.getCurrentPositionAsync({});
        //     setLocation(location);
        // }

        // getCurrentLocation();
    }, []);

    const sendLocationToBackend = async (timestamp: string, coords: Location.LocationObjectCoords) => {
        try {
            const spoofed_coords = {
                "accuracy": coords.accuracy,
                "altitude": coords.altitude,
                "altitudeAccuracy": coords.altitudeAccuracy,
                "heading": coords.heading,
                "latitude": coords.latitude + 3.4012,
                "longitude": coords.longitude + 0.769,
                "speed": coords.speed
            }
            // console.log('Sending location to backend:', spoofed_coords);
            // {"accuracy": 4.204871705781541, "altitude": 137.04268269240856, "altitudeAccuracy": 204.38778686523423, "heading": -1, "latitude": 44.04520730277783, "longitude": -123.07307712116307, "speed": 0}
            const backendUrl = process.env.EXPO_PUBLIC_BACKEND_HTTP_BASE + '/location-history/';
            // console.log('Backend URL:', backendUrl);
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    timestamp,
                    latitude: spoofed_coords.latitude,
                    longitude: spoofed_coords.longitude,

                }),
            });

            if (!response.ok) {
                console.error('Failed to send location to backend');
            }
        } catch (error) {
            console.error('Error sending location:', error);
        }
    };
    let text = 'Waiting...';
    if (errorMsg) {
        text = errorMsg;
    } else if (location) {
        text = JSON.stringify(location);
    }
    return (
        <View style={styles.container}>

            <MapView
                style={styles.map}
                provider={MapView.PROVIDER_GOOGLE} // Use Google Maps explicitly
                initialRegion={region}
            >
                {/* Add a marker */}
                <Marker
                    coordinate={{
                        latitude: 37.7749,
                        longitude: -122.4194,
                    }}
                    title="San Francisco"
                    description="This is a marker in San Francisco."
                />
            </MapView>
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    paragraph: {
        fontSize: 18,
        textAlign: 'center',
    },
    button: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#841584',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5, // For Android shadow
        shadowColor: '#000', // For iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
});

export default MyMap;