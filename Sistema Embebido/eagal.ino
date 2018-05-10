#include <PietteTech_DHT.h>
#include "Pantalla.h"

#define DHTTYPE DHT11
#define DHTPIN 5

PietteTech_DHT dht(DHTPIN, DHTTYPE); // OBJETO DE LA LIBRERIA PARA USAR DHT11

int pFotoresistor = A0; // PIN DE ENTRADA DEL FOTORESISTOR (DEL CUAL SE LEE EL VALOR)

int fFotoresistor = A5; // PIN DE ENERGIA DEL FOTORESISTOR (ENTREGA CORRIENTE)

int vFotoresistor; // GLOBAL CON EL VALOR LEIDO EN EL PIN A0

int pBoton = D6; // PIN DE BOTON DE INTERRUPCION - DETECTA FLANCO DE BAJADA

String nivel_luz; // GLOBAL PARA EL NIVEL DE LUZ DE PANTALLA
String nivel_luz_anterior; // GLOBAL PARA EL NIVEL DE LUZ ANTERIOR (PARA NO ENVIAR DATOS INNECESARIOS A LA PANTALLA)

volatile int estado = 0; // GLOBAL DEL ESTADO DE LA MAQUINA DE ESTADOS.

uint32_t freemem; // GLOBAL DE MEMORIA DISPONIBLE

String hora; // GLOBAL DE HORA ACTUAL
String horaAlarma = "03:13"; // GLOBAL DE HORA DE ALARMA
String fecha; // GLOBAL DE FECHA ACTUAL
String fecha_anterior; // GLOBAL DE FECHA ANTERIOR EN EL LOOP (PARA NO ENVIAR DATOS INNECESARIOS A LA PANTALLA)

// AREA DE TIMERS

Timer tFechaHora(500, actualizarFechaHora); // TIMER QUE ACTUALIZA LA FECHA Y LA HORA CADA 500 ms
Timer tTemperaturaHumedad(30000, actualizarTemperaturaHumedad);
Timer tPronostico(3600000, obtenerPronostico);
Timer tNivelLuz(1000, actualizarNivelLuz);

// FIN AREA DE TIMERS

void setup() {
    
    // VARIBALES REGISTRADAS RESTFUL
    Particle.variable("fotoresistor", vFotoresistor);
    Particle.variable("nivel-luz", nivel_luz);
    Particle.variable("memoria", freemem);
    //
    
    // EVENTOS SUSCRIPTOS DE WEBHOOK PARA OBTENER DATOS DE LOS WEBSERVICES
    Particle.subscribe("hook-response/pronostico", actualizarPronostico, MY_DEVICES);
    Particle.subscribe("hook-response/cotizacion", actualizarCotizacion, MY_DEVICES);
    
    // FUNCIONES DISPONIBLES RESTFUL
    Particle.function("setAlarma", setAlarma);
    //
    
    Time.zone(-3); // HUSO HORARIO PARA RTC INTERNO

    Serial1.begin(9600); // INICIO DE COMUNICACION SERIAL PARA PANTALLA

    // INICIALIZACION DE MODO DE PINES (ENTRADAS Y SALIDAS)
    pinMode(pFotoresistor,INPUT);  
    pinMode(fFotoresistor,OUTPUT);
    pinMode(pBoton, INPUT);
    //
    
    digitalWrite(fFotoresistor,HIGH); // ACTIVAR ALIMENTACION DEL LDR
    
    // ACTUALIZACIONES DE INICIO
    actualizarFechaHora();
    actualizarTemperaturaHumedad();
    actualizarNivelLuz();
    obtenerPronostico();
    obtenerCotizacion();
    //

    // INICIO DE TIMERS
    tFechaHora.start();
    tTemperaturaHumedad.start();
    tPronostico.start();
    tNivelLuz.start();
    //

    attachInterrupt(pBoton, interrupcionBotonAlarma, FALLING); // CREACION DE LA INTERRUPCION PARA EL BOTON QUE PARA LA ALARMA
    
    delay(2000); // ESPERA 2 SEGUNDOS A QUE ACTUALICEN LOS DATOS
    
    Pantalla::cambiarPagina("1"); // CAMBIA LA PANTALLA AL RELOJ
}

void loop() {
    
    switch (estado) {
        case 0: // ESTADO 0
            estadoEspera();
            break;
        case 1: // ESTADO 1
            estadoAlarma();
            break;
        case 2: // ESTADO 2
            estadoDurmiendo();
            break;
    }
    
}

/* 
FUNCION EJECUTADA POR EL WEBHOOK. RECIBE LOS DATOS DEL WEBSERVICE DE PRONOSTICO
Se obtienen los datos en formato:
TemperaturaPromedio-TemperaturaMinima-TemperaturaMaxima-Estado(Lluvia-Despejado-etc)
El STRTOK se utiliza para separar los distintos datos y poder enviarlos a la pantalla con las funciones de la clase Pantalla.
*/
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
    Pantalla::refrescarImagen("pclima.d1"+String(token)); // PONE ENCIMA DE LAS DEMAS IMÁGENES A LA DEL CLIMA DEL DIA.
    
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

/* 
FUNCION EJECUTADA POR EL WEBHOOK. RECIBE LOS DATOS DEL WEBSERVICE DE COTIZACION
Se obtienen los datos en formato JSON:
{"USD_ARS": VALOR}
Siempre tiene el mismo formato asi que se corta directamente los valores con substrings y con la busqueda del punto se toman solo 2 decimales.
*/
void actualizarCotizacion(const char *event, const char *data){
    String cot = String(data);
    String cambio = cot.substring(2,5);
    String precio = cot.substring(11, cot.indexOf(".")+3);
    Pantalla::setTexto("pcambio."+cambio, precio);
}

// EFUNCION QUE PIDE AL WEBSERVICE PEDIR LOS DATOS DEL PRONONOSTICO
void obtenerPronostico(){
    Particle.publish("pronostico", "Buenos Aires");
}

// EFUNCION QUE PIDE AL WEBSERVICE PEDIR LOS DATOS DE COTIZACAION. SON 3 LLAMADAS PORQUE LA VERSION GRATUITA SOLO PERMITE 1 COTIZACION POR PEDIDO.
void obtenerCotizacion(){
    Particle.publish("cotizacion", "USD_ARS");
    Particle.publish("cotizacion", "EUR_ARS");
    Particle.publish("cotizacion", "BTC_ARS");
}

void estadoEspera(){ // ESTADO 0 - VERIFICA SI LA HORA ACTUAL ES LA HORA DE ALARMA
    if (horaAlarma.equals(Time.format(Time.now(), "%H:%M"))){
        estado = 1;
        return;
    }
    delay(1000);
}

void estadoAlarma(){ // ESTADO 1 - LA ALARMA SUENA Y TOCA LA CANCION.
    tone(D0, 440, 100);
    delay(1000);
    //Canciones.siguienteNota(); <- ESTA ES LA PROXIMA IMPLEMENTACION
}

void estadoDurmiendo(){ // ESTADO 2 - LA ALARMA DUERME HASTA QUE LA HORA ES DISTINTA A LA DE LA ALARMA (PARA QUE NO SUENE DE VUELTA).
    if (!horaAlarma.equals(Time.format(Time.now(), "%H:%M"))){
        estado = 0;
    }
    delay(1000);
}

void interrupcionBotonAlarma(){ // RUTINA DE INTERRUPCION QUE EJECUTA AL PRESIONAR EL BOTON PARA PARAR ALARMA.
    estado = 2;
}

int setAlarma(String a){ // CAMBIA LA HORA DE ALARMA
    horaAlarma = a;
    estado = 0;
    return 1;
}

// FUNCION QUE ACTUALIZA LA FECHA Y LA HORA CON EL RELOJ INTERNO.
void actualizarFechaHora(){ 
    time_t timenow = Time.now();
    String aux = Time.format(timenow, "%H:%M:%S");
    Pantalla::setTexto("preloj.reloj", aux);
    aux = Time.format(timenow, "%d/%m/%Y");
    if (!aux.equals(fecha_anterior)){ // evitar mandar la fecha cada segundo
        Pantalla::setTexto("preloj.calendario",aux);
        fecha_anterior = aux;
    }
}

// FUNCION QUE ACTUALIZA EL NIVEL DE LUZ DE LA PANTALLA SEGUN EL VALOR DEL LDR
void actualizarNivelLuz(){
    
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

/* 
FUNCION QUE ACTUALIZA LOS VALORES DE TEMPERATURA Y HUMEDAD EN LA PANTALLA EN BASE A LOS VALORES RECIBIDOS POR EL DHT11
*/
void actualizarTemperaturaHumedad(){
    int respuesta = dht.acquireAndWait(1000);   
    freemem = System.freeMemory(); // actualiza la memoria disponible -- eliminar despues
    switch (respuesta) {
        case DHTLIB_OK:
            //Particle.publish(String("Temperatura actualizada"));
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


