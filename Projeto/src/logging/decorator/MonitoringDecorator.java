package logging.decorator;

import logging.logger.Logger;
import logging.model.LogLevel;

public class MonitoringDecorator extends LoggerDecorator {

    public MonitoringDecorator(Logger loggerBase) {
        super(loggerBase);
    }

    @Override
    public void log(LogLevel nivel, String mensagem) {
        log("Geral", nivel, mensagem);
    }

    @Override
    public void log(String categoria, LogLevel nivel, String mensagem) {
        loggerBase.log(categoria, nivel, mensagem);
        System.out.println("[MONITORIZACAO] Categoria: " + categoria + " | Nivel: " + nivel + " | Mensagem: " + mensagem);
    }
}
