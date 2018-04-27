class Pantalla {
    public:
        static void setTexto(const String objeto, const String valor);
        static void setBrillo(String valor);
    private:
        static void enviarComando(const String comando, const String valor);
        static void enviarComando(const String comando);
};