import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";

export default class Humedad extends Component {
  constructor(props) {
    super(props);
    this.state = {
      textoHumedad: "1%",
      cargandoHumedad: false
    };

    setInterval(() => {
      this.loadHumedadAsync();
    }, 60000);
  }

  componentWillMount(){
    this.loadHumedadAsync();
  }

  render() {


    return (
      <View style={styles.container}>
        <View style={styles.containerHumedad} >
          <ActivityIndicator size="large" color="steelblue" animating={this.state.cargandoHumedad}/>
          { !this.state.cargandoHumedad && <Text style={styles.textHum}>{this.state.textoHumedad}</Text> }
        </View>
        <TouchableOpacity style={styles.button} onPress={this.loadHumedadAsync}>
          <Text>Actualizar Humedad</Text>
        </TouchableOpacity>
      </View>
    );
  }

  loadHumedadAsync= async () =>  {
    this.setState({ cargandoHumedad: true});
    fetch('https://api.particle.io/v1/devices/300037000347353137323334/humedad?access_token=19b2e3af727c4ad7b245755bce7fadb84ac44d74', {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }    
    })
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({ textoHumedad: responseJson.result + '%', cargandoHumedad: false});
    })
    .catch((error) => {
      console.error(error);
    });
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1.5,
    borderLeftColor:'grey',
    borderLeftWidth:0.3,
    alignItems: "center",
    borderBottomColor:'grey',
    borderBottomWidth:0.3,
    marginTop:9
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

  containerHumedad: {
    justifyContent: "center",
    alignItems: "center",

  },
  textHum: {
    borderColor: "black",
    borderStyle: "solid",
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 60,
    textAlign: 'center',
    width:160,
    
    
  }
});
