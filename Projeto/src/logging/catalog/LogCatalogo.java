package logging.catalog;

import logging.model.LogLevel;
import logging.model.LogRecord;

import java.time.LocalDateTime;
import java.util.List;

public class LogCatalogo {

    private static volatile LogCatalogo instancia;

    private final LogGrupo raiz;

    private LogCatalogo() {
        this.raiz = new LogGrupo("Sistema");
    }

    public static LogCatalogo getInstancia() {
        if (instancia == null) {
            synchronized (LogCatalogo.class) {
                if (instancia == null) {
                    instancia = new LogCatalogo();
                }
            }
        }
        return instancia;
    }

    public synchronized void registarLog(String categoria, LogRecord record) {
        if (record == null) {
            throw new IllegalArgumentException("O registo de log não pode ser nulo.");
        }

        if (categoria == null || categoria.isBlank()) {
            categoria = "Geral";
        }

        LogGrupo grupo = obterOuCriarGrupo(categoria);
        grupo.adicionar(record);
    }

    private LogGrupo obterOuCriarGrupo(String categoria) {
        for (LogComponente componente : raiz.getComponentes()) {
            if (componente instanceof LogGrupo grupo) {
                if (grupo.getNomeCategoria().equalsIgnoreCase(categoria)) {
                    return grupo;
                }
            }
        }

        LogGrupo novoGrupo = new LogGrupo(categoria);
        raiz.adicionar(novoGrupo);
        return novoGrupo;
    }

    public LogGrupo getRaiz() {
        return raiz;
    }

    public int contarLogs() {
        return raiz.contarLogs();
    }

    public List<LogRecord> obterLogsPorNivel(LogLevel nivel) {
        return raiz.obterLogsPorNivel(nivel);
    }

    public List<LogRecord> obterLogsEntreDatas(LocalDateTime inicio, LocalDateTime fim) {
        return raiz.obterLogsEntreDatas(inicio, fim);
    }

    public void mostrarEstrutura() {
        raiz.mostrar("");
    }
}
