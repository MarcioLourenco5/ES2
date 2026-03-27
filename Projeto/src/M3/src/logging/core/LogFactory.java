package logging.core;

import logging.config.LogConfig;
import logging.model.LogLevel;
import logging.model.LogRecord;

public class LogFactory {

    public static LogRecord criarLog(LogLevel nivel, String mensagem) {
        LogLevel nivelGlobal = LogConfig.getInstancia().getNivelMinimo();

        if (nivel.getPrioridade() < nivelGlobal.getPrioridade()) {
            System.out.println(
                "LOG BLOQUEADO: tentativa de criar log do tipo " + nivel
                    + ", mas o sistema está configurado para registar apenas logs a partir de "
                    + nivelGlobal
            );
            return null;
        }

        return new LogRecord(mensagem, nivel);
    }
}
