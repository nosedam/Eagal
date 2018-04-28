// This #include statement was automatically added by the Particle IDE.
#include <PietteTech_DHT.h>

// This #include statement was automatically added by the Particle IDE.
#include <Adafruit_DHT.h>

// This #include statement was automatically added by the Particle IDE.
#include "Pantalla.h"

// This #include statement was automatically added by the Particle IDE.

#define DHTTYPE DHT11
#define DHTPIN 5

DHT dht(DHTPIN, DHTTYPE);

int pFotoresistor = A0;

int fFotoresistor = A5; 

int vFotoresistor; 
String nivel_luz;
String nivel_luz_anterior;

uint32_t freemem;

String hora;
String fecha;
String fecha_anterior;

// AREA DE TIMERS

Timer tFechaHora(1000, actualizarFechaHora);
Timer tTemperaturaHumedad(30000, actualizarTemperaturaHumedad);

// FIN AREA DE TIMERS

void setup() {
    
    Particle.variable("fotoresistor", vFotoresistor);
    Particle.variable("nivel-luz", nivel_luz);
    Particle.variable("memoria", freemem);

    Time.zone(-3);

    Serial1.begin(9600);
    
    dht.begin();

    pinMode(pFotoresistor,INPUT);  
    pinMode(fFotoresistor,OUTPUT);
    
    digitalWrite(fFotoresistor,HIGH);
    
    actualizarFechaHora();
    actualizarTemperaturaHumedad();
    // ACTIVACION DE TIMERS
    tFechaHora.start();
    tTemperaturaHumedad.start();

}




void loop() {



}

void actualizarFechaHora(){
    time_t timenow = Time.now();
    String aux = Time.format(timenow, "%H:%M:%S");
    Pantalla::setTexto("reloj", aux);
    aux = Time.format(timenow, "%d-%m-%Y");
    if (!aux.equals(fecha_anterior)){ // evitar mandar la fecha cada segundo
        Pantalla::setTexto("calendario",aux);
        fecha_anterior = aux;
    }
    
    vFotoresistor = analogRead(pFotoresistor);
    nivel_luz = String((int)((((float)vFotoresistor/4096)*100)/2 + 50));
    if (!nivel_luz.equals(nivel_luz_anterior)){
        Pantalla::setBrillo(nivel_luz);
        nivel_luz_anterior = nivel_luz;
    }
    
}

void actualizarTemperaturaHumedad(){
    float aux = dht.getTempCelcius();
    if (!isnan(aux)){
        Particle.publish(String("Temperatura actualizada ")+aux);
        Pantalla::setTexto("temperatura", String((int)aux));
        Pantalla::setTexto("humedad", String((int)dht.getHumidity()));
    } else {
        Particle.publish("Temperatura no pudo ser leida");
    }
    freemem = System.freeMemory(); // actualiza la memoria disponible -- eliminar despues
}


