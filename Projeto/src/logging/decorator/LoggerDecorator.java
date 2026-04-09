package logging.decorator;

import logging.destination.LogDestino;
import logging.logger.Logger;
import logging.model.LogLevel;

public abstract class LoggerDecorator extends Logger {
    protected final Logger loggerBase;

    protected LoggerDecorator(Logger loggerBase) {
        super(validarLogger(loggerBase).getImplementador());
        this.loggerBase = loggerBase;
    }

    private static Logger validarLogger(Logger loggerBase) {
        if (loggerBase == null) {
            throw new IllegalArgumentException("O logger base não pode ser nulo.");
        }
        return loggerBase;
    }

    @Override
    public void definirImplementador(LogDestino implementador) {
        loggerBase.definirImplementador(implementador);
        this.implementador = loggerBase.getImplementador();
    }

    @Override
    public void log(LogLevel nivel, String mensagem) {
        loggerBase.log(nivel, mensagem);
    }

    @Override
    public void log(String categoria, LogLevel nivel, String mensagem) {
        loggerBase.log(categoria, nivel, mensagem);
    }
}
