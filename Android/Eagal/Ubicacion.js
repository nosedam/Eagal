import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ActivityIndicator
} from "react-native";

//Este componente utiliza el GPS para obtener la geolocalizacion del dispositivo y utilizar la latitud y longitud de la misma para 
//enviar al embebido. Luego, este utilizara esas coordenadas para consultar con el servicio de clima y actualizar en pantalla.
//Adicionalmente, utilizamos la latitud y longitud para consultar a una API de Google y asi mostrar en pantalla la direccion fisica aproximada
//correspondiente a las coordenadas enviadas.
export default class Ubicacion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latitud: 0,
      longitud: 0,
      textoUbicacion: "-",
      cargandoUbicacion: true
    };   

    //Cada 60k ms actualiza la lectura de geolocation y obtiene las coordenadas correspondientes.
    setInterval(() => {
      this.init();
    }, 60000);
  }

  //Al iniciar, obtiene la primer lectura
  componentWillMount(){
    this.init();
  }

  //Consulta la posicion al GPS y al obtenerlas en el handler actualiza las coordenadas, envía al embebido y consulta la API de Google.
  init (){
    navigator.geolocation.getCurrentPosition(      
      (position) => {
        this.setState({
          latitud: position.coords.latitude,
          longitud: position.coords.longitude,
        });
        this.setState({cargandoUbicacion: true}),
        this.setUbicacionAsync();
        this.getGoogleAddres();
    });
  }

  //Muestra la direccion aproximada que responde la API de Google en pantalla
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

  //Actualiza en el embebido las coordenadas leidas desde el GPS por medio de la API
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

  //Consulta a través de la API de Google la dirección aproximada correspondiente a las coordenadas leidas
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

//Estilos
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
