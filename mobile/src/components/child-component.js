import React, { Component } from 'react';
import { View, Text } from 'react-native';
export default class ChildComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            posts: null
        };
    }

    render() {
        return (
            <View>
                <Text>{this.state.posts && this.state.posts.toString()}</Text>
            </View>
        );
    }

    async componentDidMount() {
        try {
            const response = await fetch('http://127.0.0.1:3000')
            const posts = await response.text()
            this.setState({loading: false, posts})
        } catch (e) {
            console.log(e)
            this.setState({loading: false})
        }
    }
}