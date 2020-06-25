// import React, { useEffect } from 'react';
// import JitsiMeet, { JitsiMeetView } from 'react-native-jitsi-meet';

// function App() {

//   useEffect(() => {
//     setTimeout(() => {
//       const url = 'https://j.rockoutloud.live/435-308-703';
//       const userInfo = {
//         displayName: 'User',
//         email: 'user@example.com',
//         avatar: 'https:/gravatar.com/avatar/abc123',
//       };
//       JitsiMeet.call(url, userInfo);
//       /* Você também pode usar o JitsiMeet.audioCall (url) para chamadas apenas de áudio */
//       /* Você pode terminar programaticamente a chamada com JitsiMeet.endCall () */
//     }, 1000);
//   }, [])

//   useEffect(() => {
//     return () => {
//       JitsiMeet.endCall();
//     };
//   });

//   function onConferenceTerminated(nativeEvent) {
//     /* Conference terminated event */
//     console.log(nativeEvent)
//   }

//   function onConferenceJoined(nativeEvent) {
//     /* Conference joined event */
//     console.log(nativeEvent)
//   }

//   function onConferenceWillJoin(nativeEvent) {
//     /* Conference will join event */
//     console.log(nativeEvent)
//   }
//   return (
//     <JitsiMeetView
//       onConferenceTerminated={e => onConferenceTerminated(e)}
//       onConferenceJoined={e => onConferenceJoined(e)}
//       onConferenceWillJoin={e => onConferenceWillJoin(e)}
//       style={{
//         flex: 1,
//         height: '100%',
//         width: '100%',
//       }}
//     />
//   )
// }
// export default App;

import React, { Component } from 'react';
import { createAppContainer } from 'react-navigation';
import SplashScreen from 'react-native-splash-screen';
import switchNavigator from './src/router/AppNavigators';

const App = createAppContainer(switchNavigator);

export default class Navigator extends Component {
  componentDidMount() {
    SplashScreen.hide()
  }

  render() {
    return (
      <App ref={(ref) => { this.navigator = ref; }} />
    );
  }
}