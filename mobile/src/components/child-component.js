import React, { Component } from 'react';
import Constants from 'expo-constants';
import { View, Text, Button, TextInput,  Modal, TouchableHighlight, Alert } from 'react-native';
export default class ChildComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            exercises: {},
            exerciseInput: 'placeholder',
            modalVisible: false
        };
    }
    render() {
        return (
            <View>
                <Text>current exercises: {JSON.stringify(this.state.exercises)}</Text>
                <Button
                    onPress={this.onSyncUp}
                    title="sync up"
                    color="#841584"
                />

                <Text>Add exercise to be finished below</Text>
                <TextInput
                    onChangeText={text => this.setState({
                        exerciseInput: text
                    })}
                    style={{
                        marginTop: 20,
                        marginBottom: 40,
                        fontSize: 25
                    }}
                    value={this.state.exerciseInput} />
                <Button
                    onPress={this.onSubmit}
                    title="submit new exercise"
                    color="#841584"
                />

                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {
                    Alert.alert('Modal has been closed.');
                    }}>
                    <View style={{ marginTop: 60 }}>
                        <Text style={{ fontWeight: 'bold' }}>You seemed to have another active device in use before, do you want to switch to current one? Notice you might lose unsynced progress on the first device</Text>

                        <TouchableHighlight
                          style={{ marginTop: 40 }}
                          onPress={this.switch}
                        >
                            <Text>Yes! I want to switch</Text>
                        </TouchableHighlight>

                        <TouchableHighlight
                          style={{ marginTop: 40 }}
                          onPress={this.noSwitch}
                        >
                            <Text>No! I want to keep using the previous one</Text>
                        </TouchableHighlight>
                    </View>
                </Modal>
            </View>
        );
    }

    switch = async () => {
        try {
            await fetch('http://192.168.86.105:3000/swap_device', {
                method: 'POST',
                body: JSON.stringify({
                    exercise: this.state.exerciseInput,
                    deviceId: Constants.installationId
                }),
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            this.onSyncUp();
            this.setState({
                modalVisible: false
            });
        } catch (e) {
            console.log(e);
        }
    }

    noSwitch = () => {
        this.setModalVisible(!this.state.modalVisible);
    }

    setModalVisible = (modalVisible) => {
        this.setState({
            modalVisible
        })
    }

    onSyncUp = async () => {
        try {
            const response = await fetch('http://192.168.86.105:3000/current_state');
            const state = await response.json();
            const serverExercises = {};
            Object.keys(state.exercises).forEach((item) => {
                serverExercises[item] = true
            });
            this.setState({
                exercises: serverExercises
            });
        } catch (e) {
            console.log(e);
        }
    }

    onSubmit = async () => {
        await this._postExercisesToServer.call(this, this.state.exerciseInput);
    }

    _postExercisesToServer = async (exerciseNumber) => {
        try {
            const response = await fetch('http://192.168.86.105:3000/operation', {
                method: 'POST',
                body: JSON.stringify({
                    exercise: exerciseNumber,
                    deviceId: Constants.installationId
                }),
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            const state = await response.json();

            if (state.succeeded) {
                // same device, able to post progress to backend
                this.onSyncUp();
                const latestExercises = Object.assign({}, this.state.exercises);
                latestExercises[this.state.exerciseInput] = true
                this.setState({
                    exercises: latestExercises
                });
            } else {
                console.log('different device, show pop up to confirm');
                this.setState({
                    modalVisible: true
                });
            }
        } catch (e) {
            console.log(e);
            console.log('error submitting new exercise');
        }
    }

    async componentDidMount() {
        // this.onSyncUp();
    }
}