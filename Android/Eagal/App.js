/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';

import Alarma from './Alarma';
import Temperatura from './Temperatura';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};

export default class App extends Component<Props> {
  render() {
    return (
      <View style={{flex: 1}}>
        <View style={{flex: 0.5, backgroundColor: 'powderblue',borderBottomColor:'black',borderBottomWidth:1}}>
          <Text style={styles.welcome}>Eagal</Text>
        </View>
        <View style={{flex: 4, backgroundColor: 'skyblue'}}>
          <Alarma/>
          <Temperatura/>
        </View>
        <View style={{flex: 0.5, backgroundColor: 'steelblue', justifyContent: 'center'}}>
          <Text style={styles.footer}>S.O.A - 2018</Text>        
        </View>
      </View>
    );
  }
}

class Input extends Component{
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 50,
    textAlign: 'center',
    margin: 5,
    color: "steelblue",
  },
  footer: {
    color: '#333333',
    textAlign: 'center'
  },
});
