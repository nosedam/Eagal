class Pantalla {
    public:
        static void setTexto(const String objeto, const String valor);
        static void setBrillo(const String valor);
        static void cambiarPagina(const String valor);
        static void refrescarImagen(const String imagen);
        static void setColorReloj(const String color);
    private:
        static void enviarComando(const String comando, const String valor);
        static void enviarComando(const String comando);
};