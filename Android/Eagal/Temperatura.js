import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";

export default class Temperatura extends Component {
  constructor(props) {
    super(props);
    this.state = {
      textoTemp: "1ºC",
      respuestaParticle: "",
      cargandoTemp: false
    };

    setInterval(() => {
      this.loadTemperaturaAsync();
    }, 60000);
  }

  componentWillMount(){
    this.loadTemperaturaAsync();
  }

  render() {


    return (
      <View style={styles.container}>
        <View style={styles.containerTemp} >
          <ActivityIndicator size="large"  color="steelblue" animating={this.state.cargandoTemp}/>
          { !this.state.cargandoTemp && <Text style={styles.textTemp}>{this.state.textoTemp}</Text> }
        </View>
        <TouchableOpacity style={styles.button} onPress={this.loadTemperaturaAsync}>
          <Text>Actualizar temperatura</Text>
        </TouchableOpacity>
      </View>
    );
  }

  loadTemperaturaAsync= async () =>  {
    this.setState({ cargandoTemp: true});
    fetch('https://api.particle.io/v1/devices/300037000347353137323334/temperatura?access_token=19b2e3af727c4ad7b245755bce7fadb84ac44d74', {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }    
    })
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({ textoTemp: responseJson.result + '°C', cargandoTemp: false});
    })
    .catch((error) => {
      console.error(error);
    });
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1.5,
    borderBottomColor:'grey',
    borderBottomWidth:0.3,
    marginTop:9,
    alignItems: "center",
  },
  button: {
    backgroundColor: "#ff6666",
    padding: 5,
    width: 160,
    alignItems: "center",
    marginTop:8,
    marginBottom:8,
    borderColor: "transparent",
    borderWidth: 0,
    borderRadius: 5,   
    
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation : 1 
  },

  containerTemp: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 0
  },
  textTemp: {
    borderColor: "black",
    borderStyle: "solid",
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 60,
    textAlign: 'center',
    width:160,
    
    
  }
});
