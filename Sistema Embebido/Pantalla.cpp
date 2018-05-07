#include "application.h"
#include "Pantalla.h""

void Pantalla::enviarComando(const String comando, const String valor){
    Serial1.print(comando);
    Serial1.print("\"");
    Serial1.print(valor);
    Serial1.print("\"");
    Serial1.write(0xff);
    Serial1.write(0xff);
    Serial1.write(0xff);
}

void Pantalla::enviarComando(const String comando){
    Serial1.print(comando);
    Serial1.write(0xff);
    Serial1.write(0xff);
    Serial1.write(0xff);
}

void Pantalla::refrescarImagen(const String imagen){
    enviarComando("ref "+imagen);
}

void Pantalla::cambiarPagina(const String valor){
    enviarComando("page "+valor);
}

void Pantalla::setTexto(const String objeto, const String valor){
    enviarComando(objeto+".txt=", valor);
}

void Pantalla::setBrillo(const String valor){
    enviarComando("dim="+valor);
}