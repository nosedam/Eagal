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

int pBoton = D6;

String nivel_luz;
String nivel_luz_anterior;

volatile int estado = 0;

uint32_t freemem;

String hora;
String horaAlarma = "03:13";
String fecha;
String fecha_anterior;

// AREA DE TIMERS

Timer tFechaHora(1000, actualizarFechaHora);
Timer tTemperaturaHumedad(30000, actualizarTemperaturaHumedad);
Timer tPronostico(3600000, obtenerPronostico);

// FIN AREA DE TIMERS

void setup() {
    
    Pantalla::cambiarPagina("1");
    
    Particle.variable("fotoresistor", vFotoresistor);
    Particle.variable("nivel-luz", nivel_luz);
    Particle.variable("memoria", freemem);
    
    Particle.subscribe("hook-response/pronostico", actualizarPronostico, MY_DEVICES);
    
    Particle.function("setAlarma", setAlarma);

    Time.zone(-3);

    Serial1.begin(9600);

    pinMode(pFotoresistor,INPUT);  
    pinMode(fFotoresistor,OUTPUT);
    pinMode(pBoton, INPUT);
    
    digitalWrite(fFotoresistor,HIGH);
    
    actualizarFechaHora();
    actualizarTemperaturaHumedad();
    obtenerPronostico();

    tFechaHora.start();
    tTemperaturaHumedad.start();
    tPronostico.start();

    attachInterrupt(pBoton, interrupcionBotonAlarma, FALLING);
}

void loop() {
    
    switch (estado) {
        case 0:
            estadoEspera();
            break;
        case 1:
            estadoAlarma();
            break;
        case 2:
            estadoDurmiendo();
            break;
    }
    
}

void estadoEspera(){
    if (horaAlarma.equals(Time.format(Time.now(), "%H:%M"))){
        estado = 1;
        return;
    }
    delay(1000);
}

void actualizarPronostico(const char *event, const char *data){
    // temp - min - max - estado
    String str = String(data);
    char buffer[100];
    str.toCharArray(buffer, 100);
    char *token = strtok(buffer, "-");
    Pantalla::setTexto("pclima.d1t", token);
    token = strtok(NULL, "-");
    Pantalla::setTexto("pclima.d1tmi", token);
    token = strtok(NULL, "-");
    Pantalla::setTexto("pclima.d1tma", token);
    token = strtok(NULL, "-");
    Pantalla::setTexto("pclima.d1estado", token);
    Pantalla::refrescarImagen("pclima.d1"+String(token));
    
    token = strtok(NULL, "-");
    Pantalla::setTexto("pclima.d2t", token);
    token = strtok(NULL, "-");
    Pantalla::setTexto("pclima.d2tmi", token);
    token = strtok(NULL, "-");
    Pantalla::setTexto("pclima.d2tma", token);
    token = strtok(NULL, "-");
    Pantalla::setTexto("pclima.d2estado", token);
    Pantalla::refrescarImagen("pclima.d2"+String(token));
    
    token = strtok(NULL, "-");
    Pantalla::setTexto("pclima.d3t", token);
    token = strtok(NULL, "-");
    Pantalla::setTexto("pclima.d3tmi", token);
    token = strtok(NULL, "-");
    Pantalla::setTexto("pclima.d3tma", token);
    token = strtok(NULL, "-");
    Pantalla::setTexto("pclima.d3estado", token);
    Pantalla::refrescarImagen("pclima.d3"+String(token));
    
}

void obtenerPronostico(){
    Particle.publish("pronostico");
}

void estadoAlarma(){
    Particle.publish("ALARMA ACTIVADA");
    delay(3000);
    //Canciones.siguienteNota();
}

void estadoDurmiendo(){
    if (!horaAlarma.equals(Time.format(Time.now(), "%H:%M"))){
        estado = 0;
    }
    delay(1000);
}

void interrupcionBotonAlarma(){
    estado = 2;
}

int setAlarma(String a){
    horaAlarma = a;
    estado = 0;
    return 1;
}

void actualizarFechaHora(){
    time_t timenow = Time.now();
    String aux = Time.format(timenow, "%H:%M:%S");
    Pantalla::setTexto("preloj.reloj", aux);
    aux = Time.format(timenow, "%d/%m/%Y");
    if (!aux.equals(fecha_anterior)){ // evitar mandar la fecha cada segundo
        Pantalla::setTexto("preloj.calendario",aux);
        fecha_anterior = aux;
    }
    
    vFotoresistor = analogRead(pFotoresistor);
    //nivel_luz = String((int)((((float)vFotoresistor/4096)*100)/2 + 50));
    
    int aux_luz = (int)(((float)vFotoresistor/1024)*100) + 5;
    if (aux_luz > 100) {
        aux_luz = 100;
    }
    nivel_luz = String(aux_luz);
    if (!nivel_luz.equals(nivel_luz_anterior)){
        Pantalla::setBrillo(nivel_luz);
        nivel_luz_anterior = nivel_luz;
    }
    
}

void actualizarTemperaturaHumedad(){
    int respuesta = dht.acquireAndWait(1000);   
    freemem = System.freeMemory(); // actualiza la memoria disponible -- eliminar despues
    switch (respuesta) {
        case DHTLIB_OK:
            Particle.publish(String("Temperatura actualizada"));
            Pantalla::setTexto("preloj.temperatura", String((int)dht.getCelsius()));
            Pantalla::setTexto("preloj.humedad", String((int)dht.getHumidity()));
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


