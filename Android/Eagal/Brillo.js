import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  DeviceEventEmitter,
  ToastAndroid
} from "react-native";

import { SensorManager } from 'NativeModules';

var lights = [0] ;
var counter = 0;
const MAX_LIGHT = 1000;
const MAX_COUNT = 40;

export default class Brillo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      light: 0,
      eagalLight: 0
    };   
  }
  componentDidMount(){
    SensorManager.startLightSensor(100);
    DeviceEventEmitter.addListener('LightSensor', 
          (data) => this.refresh(data)
    );
  }

  refresh(data){
    this.setState({light: data.light});
    lights.push(data.light);
    counter = counter + 1;

    if(counter > MAX_COUNT){
      sumadora = 0;
      for (i = 0; i < MAX_COUNT; i++) {
        sumadora = sumadora + lights[i];
      }

      promedio = sumadora / MAX_COUNT;

      //El brillo en Android va de 0 a 30000 y Eagal acepta de 0 a 100 entonces mapeamos los numeros:
      //If your number X falls between A and B, and you would like Y to fall between C and D, you can apply the following linear transform:
      //Y = (X-A)/(B-A) * (D-C) + C
      brilloEagal = (promedio - 1) / (MAX_LIGHT - 1) * (100 - 0) + 0;

      if (brilloEagal > 100)
        brilloEagal = 100;

      this.setState({eagalLightlight: brilloEagal});

      //console.warn("Sumadora: " + sumadora + " - Brillo android:" + promedio + " - Brillo calculado:" + brilloEagal);
      //ToastAndroid.show("Sumadora: " + sumadora + " - Brillo android:" + promedio + " - Brillo calculado:" + brilloEagal, 1800);
      
      counter = 0;
      lights = [0];

      this.setBrilloAsync();
    }
  }

  render() {
    return (null);/*
      <View>
        <Text>{this.state.light}</Text>
      </View>
    );*/
  }

  componentWillUnmount(){
    SensorManager.stopLightSensor();
  }

  
  setBrilloAsync= async () =>  {
    //Primero setteo el brillo
    fetch('https://api.particle.io/v1/devices/300037000347353137323334/setBrillo?access_token=19b2e3af727c4ad7b245755bce7fadb84ac44d74', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        arg: this.state.eagalLight
      }) 
    })
    .then((response) => response.json())
    .then((responseJson) => {
      //console.warn(responseJson);
    })
    .catch((error) => {
      console.error(error);
    });

    //Ahora pongo el toggle brillo en 1
    fetch('https://api.particle.io/v1/devices/300037000347353137323334/toggleBrillo?access_token=19b2e3af727c4ad7b245755bce7fadb84ac44d74', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        arg: "1"
      }) 
    })
    .then((response) => response.json())
    .then((responseJson) => {
      //console.warn(responseJson);
    })
    .catch((error) => {
      console.error(error);
    });
  }
}
