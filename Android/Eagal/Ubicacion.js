import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ToastAndroid
} from "react-native";

export default class Ubicacion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latitud: 0,
      longitud: 0,
      textoUbicacion: "-",
      cargandoUbicacion: true
    };   

    setInterval(() => {
      this.init();
    }, 60000);
  }

  componentWillMount(){
    this.init();
  }

  init (){
    navigator.geolocation.getCurrentPosition(      
      (position) => {
        //console.warn("lat: " + position.coords.latitude + " / long: "+ position.coords.longitude);
        this.setState({
          latitud: position.coords.latitude,
          longitud: position.coords.longitude,
        });
        this.setState({cargandoUbicacio: true}),
        this.setUbicacionAsync();
        this.getGoogleAddres();
    });
  }

  render() {
    return (
      <View>
        <View style={styles.containerUbicacion} >
          <ActivityIndicator size="small" color="steelblue" animating={this.state.cargandoUbicacion}/>
          { !this.state.cargandoUbicacion && <Text style={styles.textUbicacion}>{this.state.textoUbicacion}</Text> }
        </View>
      </View>
    );
  }

  setUbicacionAsync= async () =>  {
    fetch('https://api.particle.io/v1/devices/300037000347353137323334/setUbicacion?access_token=19b2e3af727c4ad7b245755bce7fadb84ac44d74', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        arg: this.state.latitud + ";" + this.state.longitud + ";"
      }) 
    })
    .then((response) => response.json())
    .then((responseJson) => {

    })
    .catch((error) => {
      console.error(error);
    });
  }

  getGoogleAddres = async() => {
    //console.warn('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + this.state.latitud + ',' + this.state.longitud +'&language=es&result_type=street_address&key=AIzaSyB4QwE0ZN6_hFTNMpRlH42DaYtnR28q9Bg');
    fetch('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + this.state.latitud + ',' + this.state.longitud +'&language=es&result_type=street_address&key=AIzaSyB4QwE0ZN6_hFTNMpRlH42DaYtnR28q9Bg', {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    })
    .then((response) => response.json())
    .then((responseJson) => {
        //console.warn(responseJson.results);
        this.setState({ textoUbicacion: responseJson.results[0].formatted_address, cargandoUbicacion: false});
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

  containerUbicacion: {
    justifyContent: "center",
    alignItems: "center",

  },
  textUbicacion: {
    fontSize: 11,    
    textAlign: 'center',
    width:400,       
  }
});
