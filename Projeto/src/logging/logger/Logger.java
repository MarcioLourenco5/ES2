package logging.logger;

import logging.destination.LogDestino;
import logging.model.LogLevel;

public abstract class Logger {
    protected LogDestino implementador;

    protected Logger(LogDestino implementador) {
        this.implementador = implementador;
    }

    public void definirImplementador(LogDestino implementador) {
        if (implementador == null) {
            throw new IllegalArgumentException("O implementador do logger não pode ser nulo.");
        }
        this.implementador = implementador;
    }

    public LogDestino getImplementador() {
        return implementador;
    }

    public abstract void log(LogLevel nivel, String mensagem);
    public abstract void log(String categoria, LogLevel nivel, String mensagem);
}
