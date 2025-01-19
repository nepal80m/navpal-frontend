import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Button, Text } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
// import { useAudioPlayer } from 'expo-audio';

const WebSocketAudioPlayer = () => {
    const [status, setStatus] = useState('Connecting...');
    const [isPlaying, setIsPlaying] = useState(false);
    const soundRef = useRef<Audio.Sound | null>(null);
    const webSocketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Establish WebSocket connection
        const wsUrl = process.env.EXPO_PUBLIC_BACKEND_WS_BASE + '/voice-assistant/';
        console.log('Connecting to WebSocket:', wsUrl);
        const ws = new WebSocket(wsUrl);
        ws.binaryType = 'blob';
        webSocketRef.current = ws;

        ws.onopen = () => {
            setStatus('Connected');
            console.log('WebSocket connected');
        };

        ws.onmessage = async (event) => {
            console.log('Receiving audio file...');
            console.log(event);
            const audioBlob = event.data;

            if (audioBlob instanceof Blob) {
                try {
                    // Convert Blob to Base64
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                        const base64Audio = reader.result.split(',')[1]; // Remove the data URI prefix
                        const audioFilePath = `${FileSystem.cacheDirectory}tempAudio.mp4`;

                        // Write Base64 to file
                        await FileSystem.writeAsStringAsync(audioFilePath, base64Audio, {
                            encoding: FileSystem.EncodingType.Base64,
                        });

                        // Play the audio
                        const { sound } = await Audio.Sound.createAsync({ uri: audioFilePath });
                        soundRef.current = sound;
                        await sound.playAsync();
                        console.log('Audio played successfully!');
                    };

                    reader.onerror = (error) => {
                        console.error('Error reading Blob as Base64:', error);
                    };

                    reader.readAsDataURL(audioBlob); // Read the Blob as a data URL
                } catch (error) {
                    console.error('Error processing audio file:', error);
                }
            } else {
                console.log('Received non-Blob message:', audioBlob);
            }

        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setStatus('Error');
        };

        ws.onclose = () => {
            console.log('WebSocket closed');
            setStatus('Disconnected');
        };

        // Clean up WebSocket on unmount
        return () => {
            ws.close();
        };
    }, []);

    const playAudio = async (fileUri: string) => {
        // if (soundRef.current) {
        //     await soundRef.current.unloadAsync();
        //     soundRef.current = null;
        // }

        const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
        // soundRef.current = sound;

        // sound.setOnPlaybackStatusUpdate((status) => {
        //     if (status.isLoaded && !status.isPlaying) {
        //         setIsPlaying(false);
        //     }
        // });

        await sound.playAsync();
        // setIsPlaying(true);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.status}>Status: {status}</Text>
            {isPlaying && <Text style={styles.playing}>Playing audio...</Text>}
            <Button
                title="Stop Audio"
                onPress={async () => {
                    if (soundRef.current) {
                        await soundRef.current.stopAsync();
                        setIsPlaying(false);
                    }
                }}
                disabled={!isPlaying}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    status: {
        fontSize: 18,
        marginBottom: 10,
    },
    playing: {
        fontSize: 16,
        marginVertical: 10,
        color: 'green',
    },
});

export default WebSocketAudioPlayer;
