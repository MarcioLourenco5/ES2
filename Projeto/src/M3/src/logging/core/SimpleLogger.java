package logging.core;

import logging.catalog.LogCatalogo;
import logging.destination.LogDestino;
import logging.model.LogLevel;
import logging.model.LogRecord;
import logging.resource.FormatterPool;
import logging.resource.LogFormatter;

import java.util.LinkedHashSet;
import java.util.Set;

public class SimpleLogger extends Logger {

    private static volatile SimpleLogger instancia;
    private final Set<LogDestino> destinos;

    private SimpleLogger() {
        this.destinos = new LinkedHashSet<>();
    }

    public static SimpleLogger getInstancia() {
        if (instancia == null) {
            synchronized (SimpleLogger.class) {
                if (instancia == null) {
                    instancia = new SimpleLogger();
                }
            }
        }
        return instancia;
    }

    @Override
    public void adicionarDestino(LogDestino destino) {
        destinos.add(destino);
    }

    public void limparDestinos() {
        destinos.clear();
    }

    @Override
    public void log(LogLevel nivel, String mensagem) {
        log("Geral", nivel, mensagem);
    }

    @Override
    public void log(String categoria, LogLevel nivel, String mensagem) {
        LogRecord record = LogFactory.criarLog(nivel, mensagem);

        if (record == null) {
            return;
        }

        LogCatalogo.getInstancia().registarLog(categoria, record);

        if (destinos.isEmpty()) {
            System.out.println("Aviso: nenhum destino configurado.");
            return;
        }

        FormatterPool pool = FormatterPool.getInstancia();
        LogFormatter formatter = pool.adquirirFormatter();

        try {
            String mensagemFormatada = formatter.formatar(record);

            for (LogDestino destino : destinos) {
                destino.escrever(mensagemFormatada);
            }
        } finally {
            pool.libertarFormatter(formatter);
        }
    }
}
