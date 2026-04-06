package logging.observer;

import logging.model.LogLevel;
import logging.model.LogRecord;

public class AdminAlertObserver implements LogObserver {

    @Override
    public void atualizar(String categoria, LogRecord record) {
        if (record.getNivel() == LogLevel.ERROR) {
            System.out.println("[ALERTA ADMIN] Erro detetado em " + categoria + ": " + record.getMensagem());
        }
    }
}