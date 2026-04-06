package logging.state;

import java.util.HashMap;
import java.util.Map;

public class LogStateHistory {
    private final Map<String, LogSystemMemento> snapshots;

    public LogStateHistory() {
        this.snapshots = new HashMap<>();
    }

    public void guardarSnapshot(String nome, LogSystemMemento memento) {
        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException("Nome do snapshot inválido.");
        }

        if (memento == null) {
            throw new IllegalArgumentException("Memento não pode ser nulo.");
        }

        snapshots.put(nome, memento);
    }

    public LogSystemMemento obterSnapshot(String nome) {
        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException("Nome do snapshot inválido.");
        }

        return snapshots.get(nome);
    }

    public void removerSnapshot(String nome) {
        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException("Nome do snapshot inválido.");
        }

        snapshots.remove(nome);
    }

    public boolean existeSnapshot(String nome) {
        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException("Nome do snapshot inválido.");
        }

        return snapshots.containsKey(nome);
    }
}