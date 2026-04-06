package logging.observer;

import logging.model.LogRecord;

public class MonitoringObserver implements LogObserver {

    @Override
    public void atualizar(String categoria, LogRecord record) {
        System.out.println("[MONITORIZACAO] Categoria: " + categoria + " | Log: " + record);
    }
}