package logging.destination;

import logging.pool.LogFormatter;
import logging.model.LogRecord;

public class ConsoleDestino implements LogDestino {

    private final LogFormatter formatter;

    public ConsoleDestino() {
        this.formatter = new LogFormatter();
    }

    @Override
    public void escrever(LogRecord record) {
        String mensagemFormatada = formatter.formatar(record);
        if (record.getNivel().name().equals("ERROR")) {
            System.err.println(mensagemFormatada);
            return;
        }
        System.out.println(mensagemFormatada);
    }
}
