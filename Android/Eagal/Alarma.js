import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TimePickerAndroid,
  ActivityIndicator,
  ToastAndroid
} from "react-native";

import RNShakeEvent from 'react-native-shake-event';

export default class Alarma extends Component {
  constructor(props) {
    super(props);
    this.state = {
      horaAlarma: "22:30",
      cargandoAlarma: false,
      hora: 22,
      miuntos: 30,
      alarmaActiva: true,
      sonando: false
    };

    setInterval(() => {
      this.loadAlarmaSonandoAsync();
    }, 5000);
  }

  timePicker = async () => {
    try {
      const { action, hour, minute } = await TimePickerAndroid.open({
        hour: this.state.hora,
        minute: this.state.minutos,
        is24Hour: true, // Will display '2 PM'
        mode: "clock"
      });

      if (action == TimePickerAndroid.timeSetAction) {
        this.setState({ horaAlarma: hour + ':' + ('00'+minute).slice(-2), hora: hour, minutos: minute });
        this.setAlarmaAsync();
      }
    } catch ({ code, message }) {
      console.warn("Cannot open time picker", message);
    }
  };

  componentWillMount(){
    this.loadAlarmaAsync();
    this.loadAlarmaActivaAsync();
    RNShakeEvent.addEventListener('shake', () => {
      if (this.state.sonando)
        this.apagarAlarmaAsync();
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.containerAlarma}>
          <ActivityIndicator size="large" color="steelblue" animating={this.state.cargandoAlarma}/>
          {!this.state.cargandoAlarma && 
            <Text style={[styles.textAlarma, !this.state.alarmaActiva && styles.alarmaDesactivada, this.state.sonando && styles.alarmaSonando]}>
              {this.state.horaAlarma}
            </Text> 
          }
        </View>
        <TouchableOpacity style={styles.button} onPress={this.timePicker}>
          <Text>Configurar alarma</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={this.toggleAlarmaAsync}>
          {!this.state.alarmaActiva && <Text>Activar alarma</Text>}
          {this.state.alarmaActiva && <Text>Desactivar alarma</Text>}
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
        arg: this.state.horaAlarma
      })      
    })
    .then((responseJson) => {
      /*this.setState({ respuesta: JSON.stringify(responseJson.return_value)});*/
      var returnValue = responseJson.return_value;
      this.setState({cargandoAlarma: false});
      ToastAndroid.show("Alarma configurada correctamente" , ToastAndroid.SHORT);      
    })
    .catch((error) => {
      ToastAndroid.show("Ocurrio un error actualizando la alarma" , ToastAndroid.SHORT);
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
      var arrAlarma  = responseJson.result.split(":");
      var strAlarma = ('00'+arrAlarma[0]).slice(-2) + ":" + ('00'+arrAlarma[1]).slice(-2);
      this.setState({ horaAlarma: strAlarma, cargandoAlarma: false, hora: parseFloat(arrAlarma[0]), minutos: parseFloat(arrAlarma[1])});
      ToastAndroid.show("Se actualizo la alarma", ToastAndroid.SHORT);

    })
    .catch((error) => {
      console.error(error);
    });
  }

  loadAlarmaActivaAsync= async () =>  {
    fetch('https://api.particle.io/v1/devices/300037000347353137323334/alarmaActiva?access_token=19b2e3af727c4ad7b245755bce7fadb84ac44d74', {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }    
    })
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({ alarmaActiva: responseJson.result == 1 });
    })
    .catch((error) => {
      console.error(error);
    });
  }

  loadAlarmaSonandoAsync= async () =>  {
    if (this.state.sonando) return;

    fetch('https://api.particle.io/v1/devices/300037000347353137323334/sonando?access_token=19b2e3af727c4ad7b245755bce7fadb84ac44d74', {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }    
    })
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({ sonando: responseJson.result == 1 });
    })
    .catch((error) => {
      console.error(error);
    });
  }


  toggleAlarmaAsync = async () =>  {

    this.setState({ cargandoAlarma: true}); 
    var boolActiva = !this.state.alarmaActiva;
    var toggle = boolActiva ? "1" : "0";
    fetch('https://api.particle.io/v1/devices/300037000347353137323334/toggleAlarma?access_token=19b2e3af727c4ad7b245755bce7fadb84ac44d74', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        arg: toggle
      })      
    })
    .then((responseJson) => {
      this.setState({cargandoAlarma: false, alarmaActiva: boolActiva});
      ToastAndroid.show("Alarma configurada correctamente" , ToastAndroid.SHORT);      
    })
    .catch((error) => {
      ToastAndroid.show("Ocurrio un error actualizando la alarma" , ToastAndroid.SHORT);
      console.error(error);
    });
  }  


  apagarAlarmaAsync = async () =>  {

    this.setState({ cargandoAlarma: true}); 

    fetch('https://api.particle.io/v1/devices/300037000347353137323334/apagarAlarma?access_token=19b2e3af727c4ad7b245755bce7fadb84ac44d74', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        arg: 0
      })      
    })
    .then((responseJson) => {
      this.setState({cargandoAlarma: false, sonando: false});
      ToastAndroid.show("Alarma detenida correctamente" , ToastAndroid.SHORT);      
    })
    .catch((error) => {
      ToastAndroid.show("Ocurrio un error deteniendo la alarma" , ToastAndroid.SHORT);
      console.error(error);
    });
  }  

  componentWillUnmount() {
    RNShakeEvent.removeEventListener('shake');
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 100,
    borderBottomColor:'grey',
    borderBottomWidth:0.3,
    paddingBottom:25
  },
  button: {
    alignItems: "center",
    backgroundColor: "honeydew",
    padding: 5,
    marginTop:8
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
    width:160,
  },
  alarmaDesactivada: {
    backgroundColor: "lightgrey"
  },
  alarmaSonando: {
    color: "red"
  }
});
