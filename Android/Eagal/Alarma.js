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
      valor: "22 30"
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

        this.setState({ valor: hour + ' ' + minute});
      }
    } catch ({ code, message }) {
      console.warn("Cannot open time picker", message);
    }
  };


  render() {
    return (
      <View style={styles.container}>
        <Text>{this.state.valor}</Text>

        <TouchableOpacity style={styles.button} onPress={this.timePicker}>
          <Text>Configurar alarma</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 10
  },
  button: {
    alignItems: "center",
    backgroundColor: "#DDDDDD",
    padding: 10
  },
  countContainer: {
    alignItems: "center",
    padding: 10
  },
  countText: {
    color: "#FF00FF"
  }
});
