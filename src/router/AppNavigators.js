import React from 'react';
import { createStackNavigator } from 'react-navigation-stack';
import { createSwitchNavigator } from 'react-navigation';

import InitialScreen from '../screens/InitialScreen';
import GeneralCallScreen from '../screens/GeneralCallScreen';
import GuitarPianoCallScreen from '../screens/GuitarPianoCallScreen';
import BassVoiceCallScreen from '../screens/BassVoiceCallScreen';
import DrumCallScreen from '../screens/DrumCallScreen';

const InitialStack = createStackNavigator({
    Initial: {
        screen: InitialScreen,
    }
}, {
    headerMode: 'none',
    defaultNavigationOptions: {
        gesturesEnabled: false,
    }
});

const GeneralCallStack = createStackNavigator({
    GeneralCall: {
        screen: GeneralCallScreen
    }
}, {
    headerMode: 'none',
    defaultNavigationOptions: {
        gesturesEnabled: false,
    }
});

const GuitarPianoCallStack = createStackNavigator({
    GuitarPianoCall: {
        screen: GuitarPianoCallScreen
    },
}, {
    headerMode: 'none',
    defaultNavigationOptions: {
        gesturesEnabled: false,
    }
});

const BassVoiceCallStack = createStackNavigator({
    BassVoiceCall: {
        screen: BassVoiceCallScreen
    },
}, {
    headerMode: 'none',
    defaultNavigationOptions: {
        gesturesEnabled: false,
    }
});

const DrumCallStack = createStackNavigator({
    DrumCall: {
        screen: DrumCallScreen
    }
}, {
    headerMode: 'none',
    defaultNavigationOptions: {
        gesturesEnabled: false,
    }
});

const switchNavigator = createSwitchNavigator({
    Initial: {
        screen: InitialStack
    },
    GeneralCall: {
        screen: GeneralCallStack
    },
    GuitarPianoCall: {
        screen: GuitarPianoCallStack
    },
    BassVoiceCall: {
        screen: BassVoiceCallStack
    },
    DrumCall: {
        screen: DrumCallStack
    }
}, {
    initialRouteName: 'Initial'
});

export default switchNavigator;