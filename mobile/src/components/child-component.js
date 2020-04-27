import React, { Component } from 'react';
import { View, Text, Button, TextInput } from 'react-native';
export default class ChildComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            exercises: {},
            exerciseInput: 'placeholder'
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
            </View>
        );
    }

    onSyncUp = async () => {
        try {
            const response = await fetch('http://192.168.86.105:3000/current_state');
            const state = await response.json();
            const serverExercises = {};
            Object.keys(state.exercises).forEach((item) => {
                serverExercises[item] = {
                    completed: true,
                    version: state.versions.exercises[item]
                }
            });
            this.setState({
                exercises: serverExercises
            });
        } catch (e) {
            console.log(e);
        }
    }

    onSubmit = async () => {
        const latestExercises = Object.assign({}, this.state.exercises);
        if (this.state.exercises[this.state.exerciseInput]) {
            latestExercises[this.state.exerciseInput].version = this.state.exercises[this.state.exerciseInput].version + 1
        } else {
            latestExercises[this.state.exerciseInput] = {
                version: 1,
                completed: true
            };
        }
        const newVersion = latestExercises[this.state.exerciseInput].version;
        await this._postExercisesToServer.call(this, this.state.exerciseInput, newVersion, latestExercises);
    }

    _postExercisesToServer = async (exerciseNumber, newVersion, latestExercises) => {
        try {
            const response = await fetch('http://192.168.86.105:3000/operation', {
                method: 'POST',
                body: JSON.stringify({
                    exercise: exerciseNumber,
                    version: newVersion
                }),
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            const state = await response.json();
            const serverExercises = state.recordToSync.exercises;
            const serverExercisesVersions = state.recordToSync.versions.exercises;
            const newUpdatedExercises = this.mergeServerClientExercises(serverExercises, serverExercisesVersions);

            if (state.succeeded) {
                this.setState({
                    exercises: newUpdatedExercises
                });
            } else {
                newUpdatedExercises[exerciseNumber].version += 1
                const updatedVersion = newUpdatedExercises[exerciseNumber].version;
                await this._postExercisesToServer.call(this, exerciseNumber, updatedVersion, newUpdatedExercises);
            }
        } catch (e) {
            console.log(e);
            console.log('error submitting new exercise');
        }
    }

    mergeServerClientExercises = (serverExercises, serverExercisesVersions) => {
        const newUpdatedExercises = {};

        // sync server exercises
        Object.keys(serverExercises).forEach((item) => {
            newUpdatedExercises[item] = {
                completed: true,
                version: serverExercisesVersions[item]
            };
        });

        // sync client exercises
        const clientExercises = this.state.exercises;
        Object.keys(clientExercises).forEach((item) => {
            if (!newUpdatedExercises[item]) {
                newUpdatedExercises[item] = {
                    completed: true,
                    version: item.version
                }
            }
        });

        // sync new exercise to be submitted
        const newExercise = this.state.exerciseInput;
        if (!newUpdatedExercises[newExercise]) {
            newUpdatedExercises[newExercise] = {
                completed: true,
                version: 0
            }
        }

        return newUpdatedExercises;
    }

    async componentDidMount() {
        // this.onSyncUp();
    }
}