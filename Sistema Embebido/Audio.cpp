#include "application.h"
#include "Audio.h""

Audio::Audio(int p){
    pin = p;
    pos = 0;
    cancionElegida = 0;
}

void Audio::siguienteNota(){
    if (melodias[cancionElegida][pos] == -1){
        delay(500);
        pos = 0;
    }
    tone(pin, melodias[cancionElegida][pos], duraciones[cancionElegida][pos]);
    delay(duraciones[cancionElegida][pos]);
    pos++;
}

void Audio::setCancion(const int c){
    cancionElegida = c;
    reiniciar();
}
void Audio::reiniciar(){
    pos = 0;
}