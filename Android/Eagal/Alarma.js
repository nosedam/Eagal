import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TimePickerAndroid,
  ActivityIndicator,
  Vibration
} from "react-native";

export default class Alarma extends Component {
  constructor(props) {
    super(props);
    this.state = {
      textoAlarma: "22:30",
      respuestaParticle: "",
      cargandoAlarma: false      
    };
  }

  timePicker = async () => {
    try {
      const { action, hour, minute } = await TimePickerAndroid.open({
        //hour: 14,
        //minute: 0,
        is24Hour: true, // Will display '2 PM'
        mode: "spinner"
      });

      if (action == TimePickerAndroid.timeSetAction) {
        this.setState({ textoAlarma: hour + ':' + minute });
        this.setAlarmaAsync();
      }
    } catch ({ code, message }) {
      console.warn("Cannot open time picker", message);
    }
  };

  componentWillMount(){
    this.loadAlarmaAsync();
  }

  render() {


    return (
      <View style={styles.container}>
        <View style={styles.containerAlarma}>
          <ActivityIndicator size="large" color="#0000ff" animating={this.state.cargandoAlarma}/>
          {!this.state.cargandoAlarma && <Text style={styles.textAlarma}>{this.state.textoAlarma}</Text> }          
        </View>
        <TouchableOpacity style={styles.button} onPress={this.timePicker}>
          <Text>Configurar alarma</Text>
        </TouchableOpacity>
        <Text>{this.state.respuesta}</Text>
      </View>
    );
  }

  setAlarmaAsync() {

    this.setState({ cargandoAlarma: true}); 

    fetch('https://api.particle.io/v1/devices/300037000347353137323334/setAlarma?access_token=19b2e3af727c4ad7b245755bce7fadb84ac44d74', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        arg: this.state.textoAlarma
      })      
    })
    .then((response) => response.json())
    .then((responseJson) => {
      /*this.setState({ respuesta: JSON.stringify(responseJson.return_value)});*/
      var returnValue = responseJson.return_value;
      this.setState({cargandoAlarma: false});
      Vibration.vibrate(2000);

    })
    .catch((error) => {
      console.error(error);
    });
  }

  loadAlarmaAsync= async () =>  {
    this.setState({ cargandoAlarma: true});
    fetch('https://api.particle.io/v1/devices/300037000347353137323334/horaalarma?access_token=19b2e3af727c4ad7b245755bce7fadb84ac44d74', {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }    
    })
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({ textoAlarma: responseJson.result, cargandoAlarma: false});
    })
    .catch((error) => {
      console.error(error);
    });
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 100
  },
  button: {
    alignItems: "center",
    backgroundColor: "honeydew",
    padding: 10,
    marginTop:15
  },

  containerAlarma: {

    justifyContent: "center",
    alignItems: "center"

  },
  textAlarma: {
    fontSize: 59,
    textAlign: 'center',
    borderColor: "black",
    borderStyle: "solid",
    borderRadius: 10,
    borderWidth: 1,
    width:160
  }
});
