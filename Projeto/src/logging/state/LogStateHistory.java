package logging.state;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

// Caretaker : Guarda Snapshots

public class LogStateHistory {

    private final Map<String, LogSystemMemento> snapshots;

    public LogStateHistory() {
        this.snapshots = new LinkedHashMap<>();
    }

    public void guardarSnapshot(String nome, LogSystemMemento memento) {

        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException("Nome do snapshot inválido.");
        }

        if (memento == null) {
            throw new IllegalArgumentException("Memento não pode ser nulo.");
        }

        if (snapshots.containsKey(nome)) {
            throw new IllegalArgumentException(
                    "Já existe um snapshot com o nome: " + nome
            );
        }

        snapshots.put(nome, memento);
    }

    public LogSystemMemento obterSnapshot(String nome) {

        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException("Nome do snapshot inválido.");
        }

        if (!snapshots.containsKey(nome)) {
            throw new IllegalArgumentException(
                    "Snapshot não encontrado: " + nome
            );
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

    // Extra útil
    public Set<String> listarSnapshots() {
        return snapshots.keySet();
    }

    // Extra útil
    public void limparSnapshots() {
        snapshots.clear();
    }
}