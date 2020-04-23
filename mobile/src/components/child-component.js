import React, { Component } from 'react';
import { View, Text, Button, TextInput } from 'react-native';
export default class ChildComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            exercises: {},
            version: 0,
            exerciseInput: 'placeholder'
        };
    }
    render() {
        return (
            <View>
                <Text>current version: {this.state.version}</Text>
                <Text>current exercises: {JSON.stringify(this.state.exercises)}</Text>
                <Button
                    onPress={this.onSyncUp}
                    title="sync up"
                    color="#841584"
                />

                <Text>Mock exercise to be completed</Text>
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
            state.exercises.forEach((item) => {
                serverExercises[item] = 'completed'
            })
            this.setState({
                exercises: serverExercises,
                version: state.version
            });
        } catch (e) {
            console.log(e);
        }
    }

    onSubmit = async () => {
        console.log('hit submit button');
        const newVersion = this.state.version + 1;
        const updatedExercises = Object.assign({}, this.state.exercises, {[this.state.exerciseInput]: 'completed'});
        await this._postExercisesToServer.call(this, updatedExercises, newVersion);
    }

    _postExercisesToServer = async (updatedExercises, newVersion) => {
        try {
            const response = await fetch('http://192.168.86.105:3000/operation', {
                method: 'POST',
                body: JSON.stringify({
                    exercises: Object.keys(updatedExercises),
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
            if (state.succeeded) {
                console.log('succeed');
                console.log('the state is successful');
                const newExercises = {};
                state.recordToSync.Attributes.exercises.forEach((item) => {
                    newExercises[item] = 'completed';
                });
                this.setState({
                    exercises: newExercises,
                    version: state.recordToSync.Attributes.version
                });
            } else {
                const serverVersion = state.recordToSync.Item.version;
                const serverExercises = state.recordToSync.Item.exercises;
                const newUpdatedExercises = {};
                serverExercises.forEach((item) => {
                    newUpdatedExercises[item] = 'completed';
                });
                const clientExercises = this.state.exercises;
                Object.keys(clientExercises).forEach((item) => {
                    if (!newUpdatedExercises[item]) {
                        newUpdatedExercises[item] = 'completed';
                    }
                });

                const newExercise = this.state.exerciseInput;
                if (!newUpdatedExercises[newExercise]) {
                    newUpdatedExercises[newExercise] = 'completed';
                }
                const updatedVersion = serverVersion + 1;
                await this._postExercisesToServer.call(this, newUpdatedExercises, updatedVersion);
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