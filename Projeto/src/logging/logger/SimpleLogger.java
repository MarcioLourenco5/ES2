package logging.logger;

import logging.catalog.LogCatalogo;
import logging.destination.LogDestino;
import logging.factory.LogFactory;
import logging.model.LogLevel;
import logging.model.LogRecord;
import logging.observer.LogObserver;
import logging.pool.FormatterPool;
import logging.pool.LogFormatter;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

public class SimpleLogger extends Logger {

    private static volatile SimpleLogger instancia;

    private final Set<LogDestino> destinos;
    private final Set<LogObserver> observers;

    private SimpleLogger() {
        this.destinos = new LinkedHashSet<>();
        this.observers = new LinkedHashSet<>();
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
        if (destino == null) {
            throw new IllegalArgumentException("Destino não pode ser nulo.");
        }

        destinos.add(destino);
    }

    public void limparDestinos() {
        destinos.clear();
    }

    public void adicionarObserver(LogObserver observer) {
        if (observer == null) {
            throw new IllegalArgumentException("Observer não pode ser nulo.");
        }

        observers.add(observer);
    }

    public void removerObserver(LogObserver observer) {
        observers.remove(observer);
    }

    public void limparObservers() {
        observers.clear();
    }

    private void notificarObservers(String categoria, LogRecord record) {
        for (LogObserver observer : observers) {
            try {
                observer.atualizar(categoria, record);
            } catch (Exception e) {
                System.out.println("Erro ao notificar observer: " + e.getMessage());
            }
        }
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
            notificarObservers(categoria, record);
            return;
        }

        FormatterPool pool = FormatterPool.getInstancia();
        LogFormatter formatter = pool.adquirirFormatter();

        try {
            String mensagemFormatada = formatter.formatar(record);

            for (LogDestino destino : destinos) {
                try {
                    destino.escrever(mensagemFormatada);
                } catch (Exception e) {
                    System.out.println("Erro ao escrever no destino: " + e.getMessage());
                }
            }
        } finally {
            pool.libertarFormatter(formatter);
        }

        notificarObservers(categoria, record);
    }
}