package logging.decorator;

import logging.logger.Logger;
import logging.model.LogLevel;

public class AdminAlertDecorator extends LoggerDecorator {

    public AdminAlertDecorator(Logger loggerBase) {
        super(loggerBase);
    }

    @Override
    public void log(LogLevel nivel, String mensagem) {
        log("Geral", nivel, mensagem);
    }

    @Override
    public void log(String categoria, LogLevel nivel, String mensagem) {
        loggerBase.log(categoria, nivel, mensagem);

        if (nivel == LogLevel.ERROR) {
            System.out.println("[ALERTA ADMIN] Erro detetado em " + categoria + ": " + mensagem);
        }
    }
}
