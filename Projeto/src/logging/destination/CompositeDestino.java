package logging.destination;

import logging.model.LogRecord;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class CompositeDestino implements LogDestino {
    private final List<LogDestino> destinos;

    public CompositeDestino() {
        this.destinos = new ArrayList<>();
    }

    public void adicionar(LogDestino destino) {
        if (destino == null) {
            throw new IllegalArgumentException("Destino não pode ser nulo.");
        }
        destinos.add(destino);
    }

    public void limpar() {
        destinos.clear();
    }

    public boolean estaVazio() {
        return destinos.isEmpty();
    }

    public List<LogDestino> getDestinos() {
        return Collections.unmodifiableList(destinos);
    }

    @Override
    public void escrever(LogRecord record) {
        for (LogDestino destino : destinos) {
            destino.escrever(record);
        }
    }
}
