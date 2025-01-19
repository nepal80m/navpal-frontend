import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Text,
    Button,
    Alert,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av'; // Install via `expo install expo-av`
import * as Speech from 'expo-speech';
import MyMap from './map';
import WebSocketAudioPlayer from './voice_assistant';


export default function VoiceRecording() {
    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState(null);
    // const [isSpeaking, setIsSpeaking] = useState(false);
    // const romanNepaliText = "Tapai tya bata baya tira janu hola";




    const handlePress = async () => {
        if (isRecording) {
            // Stop Recording
            stopRecording();
        } else {
            // Start Recording
            startRecording();
        }
    };


    // const startSpeaking = () => {
    //     if (!romanNepaliText) {
    //         Alert.alert('Error', 'No text available to speak.');
    //         return;
    //     }



    //     setIsSpeaking(true);
    //     // Speak the text
    //     Speech.speak(romanNepaliText, {
    //         language: 'ne-NP', // Nepali language code
    //         onDone: () => setIsSpeaking(false),
    //         onStopped: () => setIsSpeaking(false),
    //         pitch: 1.0,
    //         rate: 1.0,
    //     });
    // };

    // const stopSpeaking = () => {
    //     Speech.stop();
    //     setIsSpeaking(false);
    // };

    const startRecording = async () => {
        try {
            // Set Audio Mode
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            // Prepare and start recording
            const { recording } = await Audio.Recording.createAsync(
                Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
            );
            setRecording(recording);
            setIsRecording(true);
        } catch (error) {
            console.error('Error starting recording:', error);
            Alert.alert('Error', 'Unable to start recording. Please try again.');
        }
    };

    const stopRecording = async () => {
        try {
            if (recording) {
                await recording.stopAndUnloadAsync();
                const uri = recording.getURI(); // Get the file's URI
                console.log('Recording stopped. File saved at:', uri);

                setRecording(null);
                setIsRecording(false);

                // Optionally, send the file to the API
                sendToApi(uri);
            }
        } catch (error) {
            console.error('Error stopping recording:', error);
        }
    };

    const sendToApi = async (uri) => {
        try {
            const formData = new FormData();
            formData.append('file', {
                uri,
                name: 'audio_recording.m4a',
                type: 'audio/m4a',
            });

            const response = await fetch(process.env.EXPO_PUBLIC_BACKEND_HTTP_BASE + '/audio/', {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.ok) {
                Alert.alert('Success', 'Audio file uploaded successfully!');
            } else {
                Alert.alert('Error', 'Failed to upload the audio file.');
            }
        } catch (error) {
            console.error('Error uploading audio:', error);
            Alert.alert('Error', 'Something went wrong!');
        }
    };

    return (

        <View style={styles.buttonHolder}>
            <WebSocketAudioPlayer />
            <TouchableOpacity style={styles.micButton} onPress={handlePress}>
                {isRecording ? (
                    <Ionicons name="exit-outline" size={24} color="white" />
                ) : (
                    <MaterialIcons name="mic" size={24} color="white" />
                )}
            </TouchableOpacity>

        </View>


    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: '#f0f0f0',
    },
    mapPlaceholder: {
        flex: 1,
        backgroundColor: '#d3d3d3', // Gray background for map placeholder
        justifyContent: 'center',
    },
    mapText: {
        fontSize: 20,
        color: '#555',
    },
    micButton: {
        backgroundColor: 'red', // Purple color
        width: 80,
        height: 80,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        // alignSelf: 'center',
        marginBottom: 20, // Space from the bottom
        elevation: 5, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    buttonHolder: {
        width: '100%',
        position: 'absolute',
        bottom: 0,
        right: 0,
        borderRadius: 30,
        // backgroundColor: '#841584',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5, // For Android shadow
        shadowColor: '#000', // For iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
});
