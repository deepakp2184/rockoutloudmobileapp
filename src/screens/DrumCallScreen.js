import React, { Component } from 'react';
import { Platform, StyleSheet, Dimensions, View, TouchableOpacity, Text, ScrollView, Image, AsyncStorage, StatusBar } from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import JitsiMeet, { JitsiMeetView } from 'react-native-jitsi-meet';
import database from '@react-native-firebase/database';
import { captureRef } from "react-native-view-shot";
import ViewShot from "react-native-view-shot";
import { getStatusBarHeight } from 'react-native-status-bar-height';
import Pdf from 'react-native-pdf';
import URL from '../router/url';
import { _doShare } from '../router/helper';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

const STATUSBAR_HEIGHT = getStatusBarHeight(true);
const TABICON = [
    require('../assets/image/user-icon.png'),
    require('../assets/image/Drums.png'),
    require('../assets/image/sheetmusic.png')
];
const initialLayout = { width: WIDTH };

class DrumCallScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            index: 0,
            routes: [
                { key: 'Teacher', title: 'Teacher' },
                { key: 'Chords', title: 'Chords', chordsData: [] },
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
                songUrl = '';
                if (data[lessonID]) {
                    songUrl = data[lessonID].song;
                }
                this.setState({
                    routes:
                        [
                            { key: 'Teacher', title: 'Teacher' },
                            { key: 'Chords', title: 'Chords', chordsData: this.state.routes[1].chordsData },
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
                                chords.push(data[lessonID][key]);
                            }
                        }
                    }

                    roomTp = data[lessonID].type;

                    if (roomTp == 'Drum') {
                        this.setState({ data: { ...this.state.data, room_type: roomTp } });
                    } else {
                        var dataNew = {
                            name,
                            lessonID,
                            data: { ...this.state.data, room_type: roomTp }
                        };
                        if (roomTp == 'Guitar' || roomTp == 'Ukulele' || roomTp == 'Piano') {
                            JitsiMeet.endCall();
                            AsyncStorage.setItem('MeetingData', JSON.stringify(dataNew));
                            this.props.navigation.navigate('GuitarPianoCall');
                        } else if (roomTp == 'Bass' || roomTp == 'Voice') {
                            JitsiMeet.endCall();
                            AsyncStorage.setItem('MeetingData', JSON.stringify(dataNew));
                            this.props.navigation.navigate('BassVoiceCall');
                        } else if (roomTp == 'General') {
                            JitsiMeet.endCall();
                            AsyncStorage.setItem('MeetingData', JSON.stringify(dataNew));
                            this.props.navigation.navigate('GeneralCall');
                        }
                    }
                }

                console.log(chords);

                this.setState({
                    routes:
                        [
                            { key: 'Teacher', title: 'Teacher' },
                            { key: 'Chords', title: 'Chords', chordsData: chords },
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
                        { key: 'Chords', title: 'Chords', chordsData: this.state.routes[1].chordsData },
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
                        { key: 'Chords', title: 'Chords', chordsData: this.state.routes[1].chordsData },
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
        return (
            <View style={[styles.scene]}>
                <ScrollView>
                    <ViewShot ref={e => { this.webview = e }}>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                            {route.chordsData.map((item, index) => {
                                return (
                                    <View key={index} style={{ width: (WIDTH * 50 / 100) }}>
                                        <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '600', marginTop: 15, marginBottom: 5 }}>{item.name}</Text>
                                        <Image
                                            source={{ uri: URL.Base_URL + 'drums/' + item.dataVal }}
                                            style={{ height: (WIDTH * 50 / 100), width: '100%' }}
                                        />
                                    </View>
                                )
                            })}
                        </View>
                    </ViewShot>
                </ScrollView>
                {route.chordsData.length > 0 &&
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
    }

    MusicRoute = ({ route }) => {
        return (
            <View style={[styles.scene]}>
                <Pdf
                    source={{ uri: route.webUrl }}
                    onLoadComplete={(numberOfPages, filePath) => {
                        console.log(`number of pages: ${numberOfPages}`);
                        this.setState({
                            routes:
                                [
                                    { key: 'Teacher', title: 'Teacher' },
                                    { key: 'Chords', title: 'Chords', chordsData: this.state.routes[1].chordsData },
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
        if(nativeEvent.nativeEvent.error){
            console.log('onConferenceTerminated', nativeEvent);
        }else {
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
                                <Image
                                    source={TABICON[i]}
                                    style={{ height: 30, width: 30, tintColor: this.state.index == i ? 'white' : 'black' }}
                                    resizeMode='contain'
                                />
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
    scene: { flex: 1 },
    tabBar: { backgroundColor: 'black', flexDirection: 'row', justifyContent: 'center' },
    tabItem: { backgroundColor: 'transparent', flex: 1, alignItems: 'center', padding: 16, },
    tabBarTitle: { color: '#007bff' },
    activeTabSeparator: { padding: 2, borderRadius: 8, backgroundColor: '#007bff', marginTop: 5 },

});

export default DrumCallScreen;