import React, { Component } from 'react';
import { createAppContainer } from 'react-navigation';
import switchNavigator from './AppNavigators';

const App = createAppContainer(switchNavigator);

export default class Navigator extends Component {
    render() {
        return (
            <App ref={(ref) => { this.navigator = ref; }} />
        );
    }
}
