#include "application.h"
#include "Pantalla.h"
#include "Eeprom.h"

#define SKY_BLUE 34429
#define GREY 50712

#define DIR_HORA_ALARMA 0
#define DIR_LAT 5
#define DIR_LON 9
#define DIR_ALARMA_ACTIVA 13
#define DIR_CANCION 17

const String Eeprom::obtenerUbicacion(){
    float lat;
    EEPROM.get(DIR_LAT, lat);
    float lon;
    EEPROM.get(DIR_LON, lon);
    return String::format("{\"lat\":%f, \"lon\":%f}", lat, lon);
}
const String Eeprom::obtenerHoraAlarma(){
    char hora;
    EEPROM.get(DIR_HORA_ALARMA, hora);
    String alarma = String(hora);
    for (int i = 1; i<5; i++){
        EEPROM.get(DIR_HORA_ALARMA+i, hora);
        alarma+=String(hora);
    }
    return alarma;
}
const int Eeprom::obtenerCancion(){
    int cancion = 0;
    EEPROM.get(DIR_CANCION, cancion);
    return cancion;
}
const int Eeprom::obtenerEstadoAlarma(){
    int estado;
    EEPROM.get(DIR_ALARMA_ACTIVA, estado);
    if (estado) Pantalla::setColorReloj(String(SKY_BLUE));
    else Pantalla::setColorReloj(String(GREY));
    return estado;
}
void Eeprom::almacenarEstadoAlarma(const int estado){
    EEPROM.put(DIR_ALARMA_ACTIVA, estado);
}
void Eeprom::almacenarLatitud(const float lat){
    EEPROM.put(DIR_LAT, lat);
}
void Eeprom::almacenarLongitud(const float lon){
    EEPROM.put(DIR_LON, lon);
}
void Eeprom::almacenarCancion(const int cancion){
    EEPROM.put(DIR_CANCION, cancion);
}
void Eeprom::almacenarHoraAlarma(const String horaAlarma){
    //char aux;
    for (int i = 0; i<5; i++){
        //aux = ;
        EEPROM.put(DIR_HORA_ALARMA+i, (char)horaAlarma[i]);
    }
}