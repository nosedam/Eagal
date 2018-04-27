// This #include statement was automatically added by the Particle IDE.
#include <Adafruit_DHT.h>

// This #include statement was automatically added by the Particle IDE.
#include "Pantalla.h"

// This #include statement was automatically added by the Particle IDE.

#define DHTTYPE DHT11
#define DHTPIN 5

DHT dht(DHTPIN, DHTTYPE);

int photoresistor = A0;

int power = A5; 

int analogvalue; 
String nivel_luz;
String nivel_luz_anterior;

uint32_t freemem;

String hora;
String fecha;

// Next we go into the setup function.

void setup() {
    
    Particle.variable("hora", hora);
    Particle.variable("fotoresistor", analogvalue);
    Particle.variable("nivel-luz", nivel_luz);
    Particle.variable("memoria", freemem);

    Time.zone(-3);

    Serial1.begin(9600);
    dht.begin();

    pinMode(photoresistor,INPUT);  
    pinMode(power,OUTPUT);

    
    digitalWrite(power,HIGH);

}




void loop() {

    analogvalue = analogRead(photoresistor);
    
    nivel_luz = String((int)((((float)analogvalue/4096)*100)/2 + 50));
    
    if (!nivel_luz.equals(nivel_luz_anterior)){
        Pantalla::setBrillo(nivel_luz);
        nivel_luz_anterior = nivel_luz;
    }

    time_t timenow = Time.now();
    hora = Time.format(timenow, "%H:%M:%S");
    fecha = Time.format(timenow, "%d-%m-%Y");
    
    Pantalla::setTexto("calendario",fecha);
    Pantalla::setTexto("reloj", hora);
    Pantalla::setTexto("temperatura", String((int)dht.getTempCelcius()));
    Pantalla::setTexto("humedad", String((int)dht.getHumidity()));
    freemem = System.freeMemory();

    

    delay(1000);
    
}

void actualizarSegundos(){
    String hora = Time.format(Time.now(), "%H:%M:%S");
    
}
