import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TimePickerAndroid
} from "react-native";

export default class Alarma extends Component {
  constructor(props) {
    super(props);
    this.state = {
      textoAlarma: "22:30",
      respuestaParticle: "",
      valorAlarma: "2230"
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
        this.setState({ textoAlarma: hour + ' : ' + minute, valorAlarma:hour.toString()+minute.toString()});
        this.setAlarmaAsync();
      }
    } catch ({ code, message }) {
      console.warn("Cannot open time picker", message);
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.containerAlarma}>
          <Text style={styles.textAlarma}>{this.state.textoAlarma}</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={this.timePicker}>
          <Text>Configurar alarma</Text>
        </TouchableOpacity>
        <Text>{this.state.respuesta}</Text>
      </View>
    );
  }

  setAlarmaAsync() {

    fetch('https://api.particle.io/v1/devices/300037000347353137323334/setAlarma?access_token=19b2e3af727c4ad7b245755bce7fadb84ac44d74', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        arg: this.state.valorAlarma
      })      
    })
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({ respuesta: JSON.stringify(responseJson.return_value)});
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
    alignItems: "center",
    flexDirection: "row",

  },
  textAlarma: {
    fontSize: 60,
    textAlign: 'center',
    borderColor: "black",
    borderStyle: "solid",
    borderRadius: 10,
    borderWidth: 1,
    width:160
  }
});
