package logging.observer;

import logging.model.LogRecord;

public interface LogObserver {
    void atualizar(String categoria, LogRecord record);
}