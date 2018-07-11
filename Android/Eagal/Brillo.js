import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  DeviceEventEmitter,
  ToastAndroid,
  CheckBox
} from "react-native";

import { SensorManager } from 'NativeModules';

var lights = [0] ;
var counter = 0;
const MAX_LIGHT = 1000;
const MAX_COUNT = 10;

export default class Brillo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      light: 0,
      eagalLight: 0,
      checked: false,
      avisamos: false
    };   
  }
  componentDidMount(){
    this.loadCheckedAsync();
    SensorManager.startLightSensor(80);
    DeviceEventEmitter.addListener('LightSensor', 
          (data) => this.refresh(data)
    );
  }

  render() {
    //console.warn("render: " + this.state.checked);
    return (
      <View style={styles.container}>
      <CheckBox
        value={this.state.checked}
        onValueChange={this.changeChecked}
        checkedColor='red'
      />
      <Text style={styles.text}>Actualizar brillo en Eagal</Text>
    </View>
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

      //Sacamos el % del brillo
      brilloEagal = parseInt((promedio * 100) / MAX_LIGHT);

      if (brilloEagal > 100)
        brilloEagal = 100;

      this.setState({eagalLight: brilloEagal});

      //console.warn("Sumadora: " + sumadora + " - Brillo android:" + promedio + " - Brillo calculado:" + brilloEagal);
      //ToastAndroid.show("Sumadora: " + sumadora + " - Brillo android:" + promedio + " - Brillo calculado:" + brilloEagal, 1800);
      
      counter = 0;
      lights = [0];

      if(this.state.checked)
        this.setBrilloAsync();
      else if(!this.state.avisamos){
        this.state.avisamos = true;
        ToastAndroid.show("No se enviará el brillo a Eagal porque está desactivado.", ToastAndroid.SHORT);
      }
    }
  }

  changeChecked = async () => {
    //console.warn("1 changeChecked: this.state.checked: " + this.state.checked);
    
    if(this.state.checked)
      this.state.checked = false;
    else
      this.state.checked = true;

    //console.warn("2 changeChecked: this.state.checked: " + this.state.checked);
    var s_state = "0";
    if(this.state.checked){
      ToastAndroid.show("Se activó la actualización de brillo en Eagal a partir del sensor del celular", ToastAndroid.SHORT);
      s_state = "0";
    } else {
      ToastAndroid.show("Se desactivó la actualización de brillo en Eagal a partir del sensor del celular; se tomará la medición del sensor de Eagal", ToastAndroid.SHORT);
      s_state = "1";
    }
    this.setToggleBrilloAsync(s_state);
  }

  
  loadCheckedAsync= async () =>  {
    fetch('https://api.particle.io/v1/devices/300037000347353137323334/brilloLDR?access_token=19b2e3af727c4ad7b245755bce7fadb84ac44d74', {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }    
    })
    .then((response) => response.json())
    .then((responseJson) => {
      //console.warn(responseJson);
      this.setState({ checked: responseJson.result != 1 });
    })
    .catch((error) => {
      console.error(error);
    });
  }

  setToggleBrilloAsync= async (s_state) =>  {
    //console.warn("s_state: " + s_state);

    fetch('https://api.particle.io/v1/devices/300037000347353137323334/toggleBrillo?access_token=19b2e3af727c4ad7b245755bce7fadb84ac44d74', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        arg: s_state
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
  
  setBrilloAsync= async () =>  {
    //console.warn("Le vamos a mandar a eagal: " + this.state.eagalLight.toString());
    //Primero setteo el brillo
    fetch('https://api.particle.io/v1/devices/300037000347353137323334/setBrillo?access_token=19b2e3af727c4ad7b245755bce7fadb84ac44d74', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        arg: this.state.eagalLight.toString()
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
  
  componentWillUnmount(){
    SensorManager.stopLightSensor();
  }
}  

const styles = StyleSheet.create({
  container: {
    flex: 0.5,
    /*
    borderTopColor:'grey',
    borderTopWidth:0.3,
    */
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingTop: 20,
    marginTop:10,
    flexDirection: 'row'
  },
  text: {
    fontSize: 20,
    margin:4
   }
});
