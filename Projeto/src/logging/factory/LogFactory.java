package logging.factory;

import logging.model.DebugLog;
import logging.model.ErrorLog;
import logging.model.InfoLog;
import logging.model.LogLevel;
import logging.model.LogRecord;
import logging.model.WarningLog;

import java.util.EnumMap;
import java.util.Map;

public class LogFactory {

    @FunctionalInterface
    public interface LogCreator {
        LogRecord criar(String categoria, String mensagem);
    }

    private static final Map<LogLevel, LogCreator> creators = new EnumMap<>(LogLevel.class);

    static {
        registar(LogLevel.INFO, InfoLog::new);
        registar(LogLevel.WARNING, WarningLog::new);
        registar(LogLevel.ERROR, ErrorLog::new);
        registar(LogLevel.DEBUG, DebugLog::new);
    }

    private LogFactory() {
    }

    public static void registar(LogLevel nivel, LogCreator creator) {
        if (nivel == null || creator == null) {
            throw new IllegalArgumentException("O nível e o criador não podem ser nulos.");
        }
        creators.put(nivel, creator);
    }

    public static LogRecord criarLog(LogLevel nivel, String categoria, String mensagem) {
        LogCreator creator = creators.get(nivel);
        if (creator == null) {
            throw new IllegalArgumentException("Nível de log inválido ou não registado: " + nivel);
        }
        return creator.criar(categoria, mensagem);
    }
}
