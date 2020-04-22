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
            this.setState({
                exercises: state.exercises,
                version: state.version
            });
        } catch (e) {
            console.log(e);
        }
    }

    onSubmit = async () => {
        console.log('hit submit button');
        try {
            const response = await fetch('http://192.168.86.105:3000/operation', {
                method: 'POST',
                body: JSON.stringify({
                    id: this.state.exerciseInput,
                    version: this.state.version
                }),
                mode: 'cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            const state = await response.json();
            if (state.succeeded) {
                console.log('succeed');
                console.log('the state is successful');
                this.setState({
                    exercises: state.recordToSync.Attributes.exercises,
                    version: state.recordToSync.Attributes.version
                });
            } else {
                alert(`error submitting: ${JSON.stringify(state)}`);
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