package logging.catalog;

import logging.model.LogLevel;
import logging.model.LogRecord;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class LogCatalogo {

    private static volatile LogCatalogo instancia;

    private final LogGrupo raiz;
    private final Map<String, LogGrupo> gruposPorCategoria;

    private LogCatalogo() {
        this.raiz = new LogGrupo("ROOT");
        this.gruposPorCategoria = new LinkedHashMap<>();
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

    public synchronized void registarLog(LogRecord record) {
        if (record == null) {
            throw new IllegalArgumentException("O registo de log não pode ser nulo.");
        }

        LogGrupo grupo = obterOuCriarGrupo(record.getCategoria());
        grupo.adicionar(record);
    }

    private LogGrupo obterOuCriarGrupo(String categoria) {
        String nomeCategoria = (categoria == null || categoria.isBlank()) ? "Geral" : categoria;
        LogGrupo grupo = gruposPorCategoria.get(nomeCategoria.toLowerCase());
        if (grupo != null) {
            return grupo;
        }

        LogGrupo novoGrupo = new LogGrupo(nomeCategoria);
        gruposPorCategoria.put(nomeCategoria.toLowerCase(), novoGrupo);
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
