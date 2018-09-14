/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {   AppRegistry,
    StyleSheet,
    Text,
    WebView,
    View,
    Button,
    NetInfo,
    Linking,
    Platform,
    StatusBar,
    Dimensions,
    Alert,
    TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/dist/FontAwesome';

import firebase from 'react-native-firebase';
import type { RemoteMessage } from 'react-native-firebase';
import type { Notification, NotificationOpen } from 'react-native-firebase';


const dimen = Dimensions.get('window');
const isIphoneX = () => Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    (dimen.height === 812 || dimen.width === 812)

const HOME_URL = "https://www.lumido.ch/";

type Props = {};
export default class App extends Component<Props> {

    componentDidMount() {
        firebase.auth()
            .signInAnonymouslyAndRetrieveData()
            .then(credential => {
                if (credential) {
                    console.log('default app user ->', credential.user.toJSON());
                }
            });


        firebase.messaging().getToken().then(token => {
            console.log("deviceToken",token)
        });
        firebase.messaging().hasPermission()
            .then(async enabled => {
                if (enabled) {
                    // user has permissions
                } else {
                    // user doesn't have permission
                    try {
                        await firebase.messaging().requestPermission();
                        // User has authorised
                    } catch (error) {
                        // User has rejected permissions
                    }
                }
            });


        this.messageListener = firebase.messaging().onMessage((message: RemoteMessage) => {
            // Process your message as required
            console.log("RemoteMessage",message)
        });
        //
        this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen: NotificationOpen) => {
            // Get the action triggered by the notification being opened
            const action = notificationOpen.action;
            // Get information about the notification that was opened
            const notification: Notification = notificationOpen.notification;

            Alert.alert('notification', 'ok')
        });


        NetInfo.isConnected.fetch().done(isConnected => this.setState({isConnected}))
    }

    componentWillUnmount() {
        this.messageListener();
        this.notificationOpenedListener();

    }
    reload() {
        this._bridge.reload()
    }
    renderError() {
        return (
            <View style={{flex: 1, backgroundColor: '#ffff'}}>
                <Text style={styles.instructions}>
                    Check your connection and try again
                </Text>
                <Button title="RETRY" onPress={() => this.reload()}/>
            </View>
        )
    }
    _onNavigationStateChange(navState) {
        console.log('navState',navState, this._bridge)
        if (navState.url == HOME_URL) {
            this.setState({
                loggedIn: true,
                canGoHome: false,
            });
        }else{
            this.setState({
                canGoHome: navState.canGoBack,
            });
        }
        this.setState({
            canGoBack: navState.canGoBack,
            canGoForward: navState.canGoForward,
        });
    }

    render() {
      return (
          <View style={{
              flex: 1, backgroundColor: 'white'
              // flex: 1, backgroundColor: 'rgb(254, 143, 29)'
          }}>
              <StatusBar
                  barStyle="light-content"
              />
              <WebView
                  mixedContentMode='always'
                  source={{
                      uri: 'https://www.lumido.ch/',
                  }}
                  javaScriptEnabled = {true}
                  ref={(b) => this._bridge = b}
                  style={styles.webView}//568 iPhone 5s 667 iPhone 6s
                  onError={() => NetInfo.isConnected.fetch().done(isConnected => this.setState({isConnected}))}
                  renderError={() => this.renderError()}
                  onNavigationStateChange={this._onNavigationStateChange.bind(this)}
              />
              <View style={{height:50, backgroundColor:'rgb(254, 143, 29)', flexDirection:'row'}}>
                  <TouchableOpacity
                      onPress={()=> this._bridge.goBack()}
                      style={styles.btnClickContain}
                      disabled ={!this.state.canGoBack}
                  >
                      <View
                          style={styles.btnContainer}>
                          <Icon
                              name="angle-left"
                              size={25}
                              color={!this.state.canGoBack?"#ffffff":"#A52A2A"}
                              style={styles.btnIcon}/>
                      </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                      onPress={()=> {this._bridge.injectJavaScript("window.location.href='https://my.serverscheck.com/home.php'");}}
                      style={styles.btnClickContain}
                      disabled ={!this.state.canGoHome}
                  >
                      <View
                          style={styles.btnContainer}>
                          <Icon
                              name="home"
                              size={25}
                              color={!this.state.canGoHome?"#ffffff":"#A52A2A"}
                              style={styles.btnIcon}/>
                      </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                      onPress={()=>this._bridge.goForward()}
                      style={styles.btnClickContain}
                      disabled ={!this.state.canGoForward}
                  >
                      <View
                          style={styles.btnContainer}>
                          <Icon
                              name="angle-right"
                              size={25}
                              color={!this.state.canGoForward?"#ffffff":"#A52A2A"}
                              style={styles.btnIcon}/>
                      </View>
                  </TouchableOpacity>
              </View>

          </View>
      );
  }
}

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: 'white'
        // flex: 1, backgroundColor: 'rgb(254, 143, 29)'
    },

    webView:{
        // Platform.OS === 'ios' && ((dimen.height ===812)||(dimen.height < 568))?{flex: 1, marginTop:45}:{flex: 1, marginTop:25}
        flex: 1,
        marginTop:Platform.OS === 'ios' && ((dimen.height ===812)||(dimen.height < 568))?45:25
    },
    instructions: {
        textAlign: 'center',
        fontSize: 17,
        color: 'rgb(254, 143, 29)',
        marginBottom: 5,
        marginTop:dimen.height*0.3
    },
    btnClickContain: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'stretch',
        alignSelf: 'stretch',
        backgroundColor: 'rgb(254, 143, 29)',
    },
    btnContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    btnIcon: {
        height: 25,
        width: 25,
    },
});
