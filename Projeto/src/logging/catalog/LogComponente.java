package logging.catalog;

import logging.model.LogLevel;
import logging.model.LogRecord;

import java.time.LocalDateTime;
import java.util.List;

public interface LogComponente {
    void mostrar(String prefixo);
    int contarLogs();
    List<LogRecord> obterLogsPorNivel(LogLevel nivel);
    List<LogRecord> obterLogsEntreDatas(LocalDateTime inicio, LocalDateTime fim);
}
