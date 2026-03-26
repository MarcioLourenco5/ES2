package M4;

import M2.LogLevel;
import M2.LogRecord;

import java.time.LocalDateTime;
import java.util.List;

public interface LogComponente {
    void mostrar(String prefixo);
    int contarLogs();
    List<LogRecord> obterLogsPorNivel(LogLevel nivel);
    List<LogRecord> obterLogsEntreDatas(LocalDateTime inicio, LocalDateTime fim);
}
