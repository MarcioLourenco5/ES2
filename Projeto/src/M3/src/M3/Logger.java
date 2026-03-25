package M3;

import M2.LogLevel;

public abstract class Logger {
    public abstract void log(LogLevel nivel, String mensagem);
    public abstract void log(String categoria, LogLevel nivel, String mensagem);
    public abstract void adicionarDestino(LogDestino destino);
}