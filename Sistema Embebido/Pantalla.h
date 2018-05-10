class Pantalla {
    public:
        void setControlBrillo(bool tipo);
        static void setTexto(const String objeto, const String valor);
        static void setBrillo(const String valor);
        static void cambiarPagina(const String valor);
        static void refrescarImagen(const String imagen);
    private:
        static void enviarComando(const String comando, const String valor);
        static void enviarComando(const String comando);
};