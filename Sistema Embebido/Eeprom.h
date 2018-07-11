class Eeprom {
    public:
        static void almacenarLatitud(const float lat);
        static void almacenarLongitud(const float lon);
        static const String obtenerUbicacion();
        static void almacenarHoraAlarma(const String horaAlarma);
        static const String obtenerHoraAlarma();
        static void almacenarCancion(const int cancion);
        static const int obtenerCancion();
        static void almacenarEstadoAlarma(const int estado);
        static const int obtenerEstadoAlarma();
};