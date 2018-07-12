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

//Componente que utilizamos para definir los listeners y handlers de los sensores. En este caso al de Luz
import { SensorManager } from 'NativeModules';


var lights = [0]; //Array para almacenar las lecturas del sensor de luz
var counter = 0; //Contador
const MAX_LIGHT = 600; //Rango máximo de luz para reducir los valores posibles ya que el sensor lee hasta 30000 en condiciones mas extremas.
const MAX_COUNT = 7;//Conteo de lecturas para calcular valor a enviar al embebido

export default class Brillo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      light: 0, //Valor de luz leido
      eagalLight: 0, //Valor calculado que se le envia al embebido
      checked: false, //Establece si lee los valores del sensor del celular o del embebido
      avisamos: false, //Flag para determinar si se envia la luz o no
      loadingCheck: false
    };   
  }

  //Antes del render del componente, consultamos si esta configurado para usar el sensor del celular o del embebido
  componentWillMount(){
    this.loadCheckedAsync();
  }

  //Una vez que se montó el componente, empezamos a detectar las lecturas del sensor de luz y configuramos el handler
  componentDidMount(){
    
    SensorManager.startLightSensor(100);
    DeviceEventEmitter.addListener('LightSensor', 
          (data) => this.refresh(data)
    );
  }

  //Muestra el checkbox en pantalla
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

  //Handler de lectura del sensor. Actualiza el array y realiza los calculos correspondientes.
  //Al obtener la cantidad de lecturas definidas, se calcula el promedio y se define un valor entre 0 y 100 relativo
  //para enviar al embebido y actualizar el brillo de la pantalla
  refresh(data){
    if (this.state.loadingCheck) return;

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

  //Actualiza el estado segun se modifique el checkbox
  changeChecked = async () => {
    
    if(this.state.checked)
      this.state.checked = false;
    else
      this.state.checked = true;

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

  //Carga el valor configurado en el embebido para actualizar el checkbox
  loadCheckedAsync= async () =>  {
    this.setState({loadingCheck: true});
    fetch('https://api.particle.io/v1/devices/300037000347353137323334/brilloLDR?access_token=19b2e3af727c4ad7b245755bce7fadb84ac44d74', {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }    
    })
    .then((response) => response.json())
    .then((responseJson) => {
      //console.warn(responseJson);
      this.setState({ checked: responseJson.result != 1, loadingCheck: false });
    })
    .catch((error) => {
      console.error(error);
    });
  }

  //Envia al embebido el valor del checkbox, para que sepa si tiene que procesar las lecturas de su sensor o esperar
  //los valores que recibe de la aplicacion
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
  
  //Envia al embebido el valor de brillo calculado segun las lecturas tomadas
  setBrilloAsync= async () =>  {
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

  //Dejamos de capturar las lecturas del sensor de luz
  componentWillUnmount(){
    SensorManager.stopLightSensor();
  }
}  

//Estilo
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
