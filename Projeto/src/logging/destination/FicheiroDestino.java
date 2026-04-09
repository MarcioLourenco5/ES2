package logging.destination;

import logging.model.LogRecord;
import logging.pool.LogFormatter;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;

public class FicheiroDestino implements LogDestino {

    private final String nomeFicheiro;
    private final LogFormatter formatter;

    public FicheiroDestino(String nomeFicheiro) {
        if (nomeFicheiro == null || nomeFicheiro.isBlank()) {
            throw new IllegalArgumentException("O nome do ficheiro não pode ser vazio.");
        }
        this.nomeFicheiro = nomeFicheiro;
        this.formatter = new LogFormatter();
    }

    @Override
    public synchronized void escrever(LogRecord record) {
        try (BufferedWriter escritor = new BufferedWriter(new FileWriter(nomeFicheiro, true))) {
            escritor.write(formatter.formatar(record));
            escritor.newLine();
        } catch (IOException e) {
            throw new IllegalStateException("Erro ao escrever no ficheiro de logs: " + e.getMessage(), e);
        }
    }
}
