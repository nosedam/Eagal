import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  DeviceEventEmitter 
} from "react-native";

import { SensorManager } from 'NativeModules';

export default class Brillo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      light: 0
    };

   
  }

  componentDidMount(){
    SensorManager.startLightSensor(1000);
    DeviceEventEmitter.addListener('LightSensor', 
          (data) => 
            this.setState({light: data.light}) 
    );
  }

  render() {


    return (
      <View>
        <Text>{this.state.light}</Text>
      </View>
    );
  }

  componentWillUnmount(){
    SensorManager.stopLightSensor();
  }


  

}
