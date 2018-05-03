// This #include statement was automatically added by the Particle IDE.
#include <PietteTech_DHT.h>

// This #include statement was automatically added by the Particle IDE.
#include "Pantalla.h"

// This #include statement was automatically added by the Particle IDE.

#define DHTTYPE DHT11
#define DHTPIN 5

PietteTech_DHT dht(DHTPIN, DHTTYPE);

int pFotoresistor = A0;

int fFotoresistor = A5;

int vFotoresistor; 

String nivel_luz;
String nivel_luz_anterior;

int estado = 0;

uint32_t freemem;

String hora;
String fecha;
String fecha_anterior;

// AREA DE TIMERS

Timer tFechaHora(1000, actualizarFechaHora);
Timer tTemperaturaHumedad(30000, actualizarTemperaturaHumedad);
Timer tAlarma(700, alarma);

int cont = 0;

// FIN AREA DE TIMERS

void setup() {
    
    Particle.variable("fotoresistor", vFotoresistor);
    Particle.variable("nivel-luz", nivel_luz);
    Particle.variable("memoria", freemem);
    Particle.variable("cont", cont);

    Time.zone(-3);

    Serial1.begin(9600);
    
    //dht.begin(); -- Adafruit DHT

    pinMode(pFotoresistor,INPUT);  
    pinMode(fFotoresistor,OUTPUT);
    
    digitalWrite(fFotoresistor,HIGH);
    
    actualizarFechaHora();
    //actualizarTemperaturaHumedad();
    alarma();
    // ACTIVACION DE TIMERS
    tFechaHora.start();
    tTemperaturaHumedad.start();
    tAlarma.start();

}




void loop() {

}

void actualizarFechaHora(){
    time_t timenow = Time.now();
    String aux = Time.format(timenow, "%H:%M:%S");
    Pantalla::setTexto("reloj", aux);
    aux = Time.format(timenow, "%d/%m/%Y");
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
    int respuesta = dht.acquireAndWait(1000);   
    tAlarma.stop();
    freemem = System.freeMemory(); // actualiza la memoria disponible -- eliminar despues
    switch (respuesta) {
        case DHTLIB_OK:
            Particle.publish(String("Temperatura actualizada"));
            Pantalla::setTexto("temperatura", String((int)dht.getCelsius()));
            Pantalla::setTexto("humedad", String((int)dht.getHumidity()));
            break;
        case DHTLIB_ERROR_CHECKSUM:
            Particle.publish(String("CHECKSUM"));
            break;
        case DHTLIB_ERROR_ISR_TIMEOUT:
            Particle.publish(String("ISR TIMEOUT"));
            break;
        case DHTLIB_ERROR_RESPONSE_TIMEOUT:
            Particle.publish(String("RESPONSE TIMEOUT"));
            break;
        case DHTLIB_ERROR_DATA_TIMEOUT:
            Particle.publish(String("DATA TIMEOUT"));
            break;
        case DHTLIB_ERROR_ACQUIRING:
            Particle.publish(String("ACQUIRING"));
            break;
        case DHTLIB_ERROR_DELTA:
            Particle.publish(String("DELTA TIME TOO SMALL"));
            break;
        case DHTLIB_ERROR_NOTSTARTED:
            Particle.publish(String("NOT STARTED"));
            break;
        default:
            Particle.publish(String("UNKNOWN"));
            break;
    }
}

void alarma(){
    cont++;
}
