import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default class Ubicacion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latitud: 0,
      longitud: 0
    };

   
  }

  componentWillMount(){
    navigator.geolocation.getCurrentPosition(      
      (position) => {
        this.setState({
          latitud: position.coords.latitude,
          longitud: position.coords.longitude,
        });
        this.setUbicacionAsync();
        this.getGoogleAddres();
    });


  }

  render() {


    return (null);
      /*<View>
        <Text>{this.state.latitud}</Text>
        <Text>{this.state.longitud}</Text>
      </View>
    );*/
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
    fetch('https://maps.googleapis.com/maps/api/geocode/json?latlng=-34.6752817,-58.5656971&language=es&result_type=street_address&key=AIzaSyB4QwE0ZN6_hFTNMpRlH42DaYtnR28q9Bg', {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    })
    .then((response) => response.json())
    .then((responseJson) => {
        console.warn(responseJson.results[0].formatted_address);
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

  containerTemp: {
    justifyContent: "center",
    alignItems: "center",

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
