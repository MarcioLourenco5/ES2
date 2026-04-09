package logging.destination;

import logging.model.LogRecord;

public interface LogDestino {
    void escrever(LogRecord record);
}
