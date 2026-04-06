package logging.logger;

import logging.destination.LogDestino;
import logging.model.LogLevel;

public abstract class Logger {
    public abstract void log(LogLevel nivel, String mensagem);
    public abstract void log(String categoria, LogLevel nivel, String mensagem);
    public abstract void adicionarDestino(LogDestino destino);
}
