import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';

//Importamos todos los componentes definidos por nosotros para mostrar en pantalla.
import Alarma from './Alarma';
import Temperatura from './Temperatura';
import Humedad from './Humedad';
import Ubicacion from './Ubicacion';
import Brillo from './Brillo';


type Props = {};

//Componente principal. Renderiza todos los componentes devueltos por la funcion render(). Aca organizamos la interfaz
//mostrando los componentes con la disposicion definida y les aplicamos el estilo.
export default class App extends Component<Props> {
  render() {
    return (
      <View style={{flex: 1}}>
        <View style={{flex: 0.45, backgroundColor: 'powderblue',borderBottomColor:'black',borderBottomWidth:1}}>
          <Text style={styles.welcome}>Eagal</Text>
        </View>
        <View style={{flex: 4, backgroundColor: 'skyblue', paddingTop: 3}}>
          <Alarma/>
            <View style={{flex:1.5, flexDirection:'column', justifyContent:'center'}}>
              <View style={{flexDirection:'row'}}>
                <Temperatura/>
                <Humedad/>
            </View>
          </View>
          <Brillo/>
        </View>
        <View style={{flex: 0.5, backgroundColor: 'steelblue', justifyContent: 'center', height: 10,borderTopColor:'black',borderTopWidth:1}}>
          <Text style={styles.footer}>S.O.A - 2018</Text>      
          <Ubicacion/>  
        </View>
      </View>
    );
  }
}

class Input extends Component{
  
}

//Estilos 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 45,
    textAlign: 'center',
    margin: 1,
    color: "steelblue",
  },
  footer: {
    color: '#333333',
    textAlign: 'center'
  },
});
