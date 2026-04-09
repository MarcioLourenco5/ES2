package logging.logger;

import logging.catalog.LogCatalogo;
import logging.config.LogConfig;
import logging.destination.CompositeDestino;
import logging.destination.LogDestino;
import logging.factory.LogFactory;
import logging.model.LogLevel;
import logging.model.LogRecord;

public class SimpleLogger extends Logger {

    private static volatile SimpleLogger instancia;

    private SimpleLogger(LogDestino implementador) {
        super(implementador);
    }

    public static SimpleLogger getInstancia() {
        if (instancia == null) {
            synchronized (SimpleLogger.class) {
                if (instancia == null) {
                    instancia = new SimpleLogger(new CompositeDestino());
                }
            }
        }
        return instancia;
    }

    public synchronized CompositeDestino getDestinoComposto() {
        if (!(implementador instanceof CompositeDestino compositeDestino)) {
            throw new IllegalStateException("O logger não está configurado com um destino composto.");
        }
        return compositeDestino;
    }

    @Override
    public void log(LogLevel nivel, String mensagem) {
        log("Geral", nivel, mensagem);
    }

    @Override
    public void log(String categoria, LogLevel nivel, String mensagem) {
        LogRecord record = LogFactory.criarLog(nivel, categoria, mensagem);
        LogConfig config = LogConfig.getInstancia();

        if (!config.deveRegistar(record)) {
            return;
        }

        LogCatalogo.getInstancia().registarLog(record);

        CompositeDestino destinoComposto = getDestinoComposto();
        if (destinoComposto.estaVazio()) {
            System.out.println("Aviso: nenhum destino configurado.");
            return;
        }

        for (LogDestino destino : destinoComposto.getDestinos()) {
            try {
                destino.escrever(record);
            } catch (Exception e) {
                System.out.println("Erro ao escrever no destino: " + e.getMessage());
            }
        }
    }
}
