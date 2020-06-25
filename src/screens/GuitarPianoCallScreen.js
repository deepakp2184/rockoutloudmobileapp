import React, { Component } from 'react';
import { Platform, StyleSheet, Dimensions, View, TouchableOpacity, ScrollView, AsyncStorage, Image, StatusBar } from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import JitsiMeet, { JitsiMeetView } from 'react-native-jitsi-meet';
import { WebView } from 'react-native-webview';
import { captureRef } from "react-native-view-shot";
import ViewShot from "react-native-view-shot";
import database from '@react-native-firebase/database';
import Share from 'react-native-share';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import Pdf from 'react-native-pdf';
import URL from '../router/url';

import HTML_FILE from "../../resources/chords.html";
import TABLET_HTML_FILE from "../../resources/chordsTablet.html";

import PIANO_HTML_FILE from "../../resources/piano.html";
import PIANO_Tablet_HTML_FILE from "../../resources/pianoTablet.html";

import { _doShare } from '../router/helper';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

const STATUSBAR_HEIGHT = getStatusBarHeight(true);
const TABICON = [
    require('../assets/image/user-icon.png'),
    require('../assets/image/ChordIcon.png'),
    require('../assets/image/sheetmusic.png'),
    require('../assets/image/piano.png')
];
const initialLayout = { width: WIDTH };

class GuitarPianoCallScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            index: 0,
            routes: [
                { key: 'Teacher', title: 'Teacher' },
                { key: 'Chords', title: 'Chords', chordsData: '', roomType: '' },
                { key: 'SheetMusic', title: 'Sheet Music', webUrl: '', fileUri: '', OrientationStatus: '' }
            ],
            OrientationStatus: '',
            Height_Layout: '',
            Width_Layout: '',
        }
        this.onConferenceTerminated = this.onConferenceTerminated.bind(this);
        this.onConferenceJoined = this.onConferenceJoined.bind(this);
        this.onConferenceWillJoin = this.onConferenceWillJoin.bind(this);
    }

    componentDidMount() {
        let name = '';
        let lessonID = '';

        AsyncStorage.getItem('MeetingData').then((MeetingData) => {
            var MeetingDataParse = JSON.parse(MeetingData);

            this.setState({ data: MeetingDataParse.data });

            name = MeetingDataParse.name;
            lessonID = MeetingDataParse.lessonID;

            let url = URL.CallingURL + lessonID;
            let userInfo = { displayName: name, email: 'user@gmail.com', avatar: 'https:/gravatar.com/avatar/abc123' };
            JitsiMeet.call(url, userInfo);

            this.songsRef = database().ref('/songs');
            this.songsRef.on('value', snapshot => {
                const data = snapshot.val();
                var songUrl = '';
                if (data[lessonID]) {
                    songUrl = data[lessonID].song;
                }

                console.log('songUrl', songUrl);

                this.setState({
                    routes:
                        [
                            { key: 'Teacher', title: 'Teacher' },
                            { key: 'Chords', title: 'Chords', chordsData: this.state.routes[1].chordsData, roomType: this.state.routes[1].roomType },
                            { key: 'SheetMusic', title: 'Sheet Music', webUrl: songUrl, fileUri: this.state.routes[2].fileUri, OrientationStatus: this.state.routes[2].OrientationStatus }
                        ]
                });
            });

            this.multiRoomRef = database().ref('/multiRoom');
            this.multiRoomRef.on('value', snapshot => {
                const data = snapshot.val();
                var chords = [];

                var roomTp = '';
                if (data[lessonID]) {
                    for (var key in data[lessonID]) {
                        if (data[lessonID].hasOwnProperty(key)) {
                            if (key != 'type') {
                                if (data[lessonID][key].roomType == 'Piano') {
                                    chords.push(data[lessonID][key].chord + '&' + data[lessonID][key].start + '&' + data[lessonID][key].end + '&' + data[lessonID][key].name);
                                } else {
                                    chords.push(data[lessonID][key].dataVal);
                                }
                            }
                        }
                    }

                    roomTp = data[lessonID].type;

                    if (roomTp == 'Piano' || roomTp == 'Guitar' || roomTp == 'Ukulele') {
                        this.setState({ data: { ...this.state.data, room_type: roomTp } });
                    } else {
                        var dataNew = {
                            name,
                            lessonID,
                            data: { ...this.state.data, room_type: roomTp }
                        };
                        if (roomTp == 'Bass' || roomTp == 'Voice') {
                            JitsiMeet.endCall();
                            AsyncStorage.setItem('MeetingData', JSON.stringify(dataNew));
                            this.props.navigation.navigate('BassVoiceCall');
                        } else if (roomTp == 'General') {
                            JitsiMeet.endCall();
                            AsyncStorage.setItem('MeetingData', JSON.stringify(dataNew));
                            this.props.navigation.navigate('GeneralCall');
                        } else if (roomTp == 'Drum') {
                            JitsiMeet.endCall();
                            AsyncStorage.setItem('MeetingData', JSON.stringify(dataNew));
                            this.props.navigation.navigate('DrumCall');
                        }
                    }
                }
                console.log(data[lessonID]);
                this.setState({
                    routes:
                        [
                            { key: 'Teacher', title: 'Teacher' },
                            { key: 'Chords', title: 'Chords', chordsData: chords.join('@'), roomType: roomTp },
                            { key: 'SheetMusic', title: 'Sheet Music', webUrl: this.state.routes[2].webUrl, fileUri: this.state.routes[2].fileUri, OrientationStatus: this.state.routes[2].OrientationStatus }
                        ]
                });
            });
        });
    }

    componentWillUnmount() {
        this.songsRef.off('value');
        this.multiRoomRef.off('value');
    }

    DetectOrientation() {
        if (this.state.Width_Layout > this.state.Height_Layout) {
            this.setState({
                OrientationStatus: 'Landscape',
                routes:
                    [
                        { key: 'Teacher', title: 'Teacher' },
                        { key: 'Chords', title: 'Chords', chordsData: this.state.routes[1].chordsData, roomType: this.state.routes[1].roomType },
                        { key: 'SheetMusic', title: 'Sheet Music', webUrl: this.state.routes[2].webUrl, fileUri: this.state.routes[2].fileUri, OrientationStatus: 'Landscape' }
                    ]
            });
        }
        else {
            this.setState({
                OrientationStatus: 'Portrait',
                routes:
                    [
                        { key: 'Teacher', title: 'Teacher' },
                        { key: 'Chords', title: 'Chords', chordsData: this.state.routes[1].chordsData, roomType: this.state.routes[1].roomType },
                        { key: 'SheetMusic', title: 'Sheet Music', webUrl: this.state.routes[2].webUrl, fileUri: this.state.routes[2].fileUri, OrientationStatus: 'Portrait' }
                    ]
            });
        }
    }

    CallRoute = () => {
        return (
            <View style={{ backgroundColor: 'black', flex: 1 }}>
                <JitsiMeetView
                    onConferenceTerminated={this.onConferenceTerminated}
                    onConferenceJoined={this.onConferenceJoined}
                    onConferenceWillJoin={this.onConferenceWillJoin}
                    style={{ flex: 1, height: '100%', width: '100%' }}
                />
            </View>
        )
    }

    doScreenShot = () => {
        captureRef(this.webview, {
            quality: 0.8
        }).then(
            uri => {
                console.log("Image saved to", uri)
                _doShare(uri, 'png');
            },
            error => console.error("Oops, snapshot failed", error)
        );
    }

    ChordsRoute = ({ route }) => {
        var arrayChords = route.chordsData.split("@");

        if (Platform.OS == 'ios') {
            return (
                <View style={[styles.scene]}>
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                        {arrayChords.length == 0
                            ?
                            <View></View>
                            :
                            <ViewShot ref={e => { this.webview = e }}>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                    {arrayChords.map((item, index) => {
                                        var injectedScript = `show("${item}");true`;
                                        console.log('item', item);
                                        var randomValue = Math.random(100000);

                                        if (item == '') {
                                            return null
                                        } else {
                                            return (
                                                <View key={randomValue} style={{ width: route.roomType == 'Piano' ? (WIDTH * 50 / 100) : (WIDTH > 414) ? (WIDTH * 50 / 100) : (WIDTH * 45 / 100), height: route.roomType == 'Piano' ? (WIDTH * 30 / 100) : (WIDTH * 55 / 100) }}>
                                                    <WebView
                                                        ref={e => { this['webview' + index] = e }}
                                                        originWhitelist={['*']}
                                                        style={{ flex: 1 }}
                                                        source={route.roomType == 'Piano' ? (WIDTH > 414) ? PIANO_Tablet_HTML_FILE : PIANO_HTML_FILE : (WIDTH > 414) ? TABLET_HTML_FILE : HTML_FILE}
                                                        javaScriptEnabled={true}
                                                        domStorageEnabled={true}
                                                        scrollEnabled={false}
                                                        automaticallyAdjustContentInsets={true}
                                                        onLoadStart={e => {
                                                            // alreadyInjected = false;
                                                        }}
                                                        onLoadProgress={e => {
                                                            this['webview' + index].injectJavaScript(injectedScript);
                                                        }}
                                                    />
                                                </View>
                                            )
                                        }
                                    })}
                                </View>
                            </ViewShot>
                        }
                    </ScrollView>
                    {route.chordsData != '' &&
                        <TouchableOpacity onPress={() => this.doScreenShot()} style={{ position: 'absolute', bottom: (HEIGHT * 5 / 100), right: (WIDTH * 5 / 100) }}>
                            <View style={{ backgroundColor: 'lightgray', padding: 10, borderRadius: 50 }}>
                                <Image
                                    source={require('../assets/image/share.png')}
                                    style={{ height: 32, width: 32 }}
                                />
                            </View>
                        </TouchableOpacity>
                    }
                </View>
            )
        } else {
            if (route.roomType == 'Piano') {
                return (
                    <View style={[styles.scene]}>
                        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                            {arrayChords.length == 0
                                ?
                                <View></View>
                                :
                                <ViewShot ref={e => { this.webview = e }}>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                        {arrayChords.map((item, index) => {
                                            var injectedScript = `show("${item}");true`;
                                            var randomValue = Math.random(100000);

                                            if (item == '') {
                                                return null
                                            } else {
                                                return (
                                                    <View key={randomValue} style={{ width: (WIDTH * 48 / 100), height: (WIDTH * 30 / 100) }}>
                                                        <WebView
                                                            ref={e => { this['webview' + index] = e }}
                                                            originWhitelist={['*']}
                                                            style={{ flex: 1 }}
                                                            source={{ uri: (WIDTH > 414) ? `file:///android_asset/pianoTablet.html?chords=${item}` : `file:///android_asset/piano.html?chords=${item}` }}
                                                            javaScriptEnabled={true}
                                                            domStorageEnabled={true}
                                                            scalesPageToFit={true}
                                                            bounces={false}
                                                            scrollEnabled={false}
                                                            showsHorizontalScrollIndicator={false}
                                                            showsVerticalScrollIndicator={false}
                                                            automaticallyAdjustContentInsets={true}
                                                            onLoadStart={e => {
                                                                // alreadyInjected = false;
                                                            }}
                                                            onLoadProgress={e => {
                                                                this['webview' + index].injectJavaScript(injectedScript);
                                                            }}
                                                        />
                                                    </View>
                                                )
                                            }
                                        })}
                                    </View>
                                </ViewShot>
                            }
                        </ScrollView>
                        {route.chordsData != '' &&
                            <TouchableOpacity onPress={() => this.doScreenShot()} style={{ position: 'absolute', bottom: (HEIGHT * 5 / 100), right: (WIDTH * 5 / 100) }}>
                                <View style={{ backgroundColor: 'lightgray', padding: 10, borderRadius: 50 }}>
                                    <Image
                                        source={require('../assets/image/share.png')}
                                        style={{ height: 32, width: 32 }}
                                    />
                                </View>
                            </TouchableOpacity>
                        }
                    </View>
                )
            } else if (route.roomType == 'Guitar' || route.roomType == 'Ukulele') {
                return (
                    <View style={[styles.scene]}>
                        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                            {arrayChords.length == 0
                                ?
                                <View></View>
                                :
                                <ViewShot ref={e => { this.webview = e }}>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                        {arrayChords.map((item, index) => {
                                            var injectedScript = `show("${item}");true`;
                                            var randomValue = Math.random(100000);

                                            if (item == '') {
                                                return null
                                            } else {
                                                return (
                                                    <View key={randomValue} style={{ width: (WIDTH > 414) ? (WIDTH * 50 / 100) : (WIDTH * 45 / 100), height: (WIDTH * 55 / 100) }}>
                                                        <WebView
                                                            ref={e => { this['webview' + index] = e }}
                                                            originWhitelist={['*']}
                                                            style={{ flex: 1 }}
                                                            source={{ uri: (WIDTH > 414) ? `file:///android_asset/chordsTablet.html` : `file:///android_asset/chords.html?chords=${item}` }}
                                                            javaScriptEnabled={true}
                                                            domStorageEnabled={true}
                                                            scrollEnabled={false}
                                                            automaticallyAdjustContentInsets={true}
                                                            onLoadStart={e => {
                                                                // alreadyInjected = false;
                                                            }}
                                                            onLoadProgress={e => {
                                                                this['webview' + index].injectJavaScript(injectedScript);
                                                            }}
                                                        />
                                                    </View>
                                                )
                                            }
                                        })}
                                    </View>
                                </ViewShot>
                            }
                        </ScrollView>
                        {route.chordsData != '' &&
                            <TouchableOpacity onPress={() => this.doScreenShot()} style={{ position: 'absolute', bottom: (HEIGHT * 5 / 100), right: (WIDTH * 5 / 100) }}>
                                <View style={{ backgroundColor: 'lightgray', padding: 10, borderRadius: 50 }}>
                                    <Image
                                        source={require('../assets/image/share.png')}
                                        style={{ height: 32, width: 32 }}
                                    />
                                </View>
                            </TouchableOpacity>
                        }
                    </View>
                )
            } else {
                return (
                    <View></View>
                )
            }
        }
    }

    MusicRoute = ({ route }) => {
        return (
            <View style={[styles.scene]}>
                <Pdf
                    source={{ uri: route.webUrl }}
                    onLoadComplete={(numberOfPages, filePath) => {
                        console.log(`number of pages: ${filePath}`);
                        this.setState({
                            routes:
                                [
                                    { key: 'Teacher', title: 'Teacher' },
                                    { key: 'Chords', title: 'Chords', chordsData: this.state.routes[1].chordsData, roomType: this.state.routes[1].roomType },
                                    { key: 'SheetMusic', title: 'Sheet Music', webUrl: this.state.routes[2].webUrl, fileUri: filePath, OrientationStatus: this.state.routes[2].OrientationStatus }
                                ]
                        });
                    }}
                    onPageChanged={(page, numberOfPages) => {
                        console.log(`current page: ${page}`);
                    }}
                    onError={(error) => {
                        console.log(error);
                    }}
                    onPressLink={(uri) => {
                        console.log(`Link presse: ${uri}`)
                    }}
                    enablePaging={true}
                    scale={route.OrientationStatus == 'Portrait' ? 1.0 : 1.5}
                    style={[{ height: '100%', width: '100%' }]}
                />
                {route.fileUri != '' &&
                    <TouchableOpacity onPress={() => _doShare(route.fileUri, 'pdf')} style={{ position: 'absolute', bottom: (HEIGHT * 5 / 100), right: (WIDTH * 5 / 100) }}>
                        <View style={{ backgroundColor: 'lightgray', padding: 10, borderRadius: 50 }}>
                            <Image
                                source={require('../assets/image/share.png')}
                                style={{ height: 32, width: 32 }}
                            />
                        </View>
                    </TouchableOpacity>
                }
            </View>
        )
    }

    onConferenceTerminated(nativeEvent) {
        if (nativeEvent.nativeEvent.error) {
            console.log('onConferenceTerminated', nativeEvent);
        } else {
            this.props.navigation.navigate('Initial');
        }
    }

    onConferenceJoined(nativeEvent) {
        console.log('onConferenceJoined');
    }

    onConferenceWillJoin(nativeEvent) {
        console.log('onConferenceWillJoin');
    }

    onTabPress = async (i) => {
        this.setState({ index: i });
    }

    _renderTabBar = props => {
        return (
            <View style={[styles.tabBar, { paddingTop: this.state.OrientationStatus == 'Portrait' ? STATUSBAR_HEIGHT : 0 }]}>
                {props.navigationState.routes.map((route, i) => {
                    return (
                        <TouchableOpacity
                            key={i}
                            style={styles.tabItem}
                            onPress={() => this.onTabPress(i)}>
                            <View style={{ backgroundColor: this.state.index == i ? '#007bff' : 'white', padding: 10, borderRadius: 50 }}>
                                {(props.navigationState.routes[1].roomType == 'Piano' && i == 1) ?
                                    <Image
                                        source={TABICON[3]}
                                        style={{ height: 30, width: 30, backgroundColor: 'white' }}
                                    />
                                    :
                                    <Image
                                        source={TABICON[i]}
                                        style={{ height: 30, width: 30, tintColor: this.state.index == i ? 'white' : 'black' }}
                                        resizeMode='contain'
                                    />
                                }
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    render() {
        const { index, routes } = this.state;

        const renderScene = SceneMap({
            Teacher: this.CallRoute,
            Chords: this.ChordsRoute,
            SheetMusic: this.MusicRoute
        });

        return (
            <View style={{ backgroundColor: 'white', flex: 1 }}
                onLayout={(event) => this.setState({
                    Width_Layout: event.nativeEvent.layout.width,
                    Height_Layout: event.nativeEvent.layout.height
                }, () => this.DetectOrientation())}
            >
                <StatusBar
                    hidden={true}
                />
                <TabView
                    navigationState={{ index, routes }}
                    renderScene={renderScene}
                    renderTabBar={this._renderTabBar}
                    onIndexChange={(index) => this.onTabPress(index)}
                    initialLayout={initialLayout}
                />
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f2f4ff' },
    scene: { flex: 1, backgroundColor: 'white' },
    tabBar: { backgroundColor: 'black', flexDirection: 'row', justifyContent: 'center' },
    tabItem: { backgroundColor: 'transparent', flex: 1, alignItems: 'center', padding: 16, },
    tabBarTitle: { color: '#007bff' },
    activeTabSeparator: { padding: 2, borderRadius: 8, backgroundColor: '#007bff', marginTop: 5 },

});

export default GuitarPianoCallScreen;