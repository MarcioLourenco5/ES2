package composite;

import factory.LogLevel;
import factory.LogRecord;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class LogGrupo implements LogComponente {

    private final String nomeCategoria;
    private final List<LogComponente> componentes;

    public LogGrupo(String nomeCategoria) {
        this.nomeCategoria = nomeCategoria;
        this.componentes = new ArrayList<>();
    }

    public void adicionar(LogComponente componente) {
        componentes.add(componente);
    }

    public void remover(LogComponente componente) {
        componentes.remove(componente);
    }

    @Override
    public void mostrar(String prefixo) {
        System.out.println(prefixo + "Categoria: " + nomeCategoria);
        for (LogComponente componente : componentes) {
            componente.mostrar(prefixo + "  ");
        }
    }

    @Override
    public int contarLogs() {
        int total = 0;
        for (LogComponente componente : componentes) {
            total += componente.contarLogs();
        }
        return total;
    }

    @Override
    public List<LogRecord> obterLogsPorNivel(LogLevel nivel) {
        List<LogRecord> resultado = new ArrayList<>();

        for (LogComponente componente : componentes) {
            resultado.addAll(componente.obterLogsPorNivel(nivel));
        }

        return resultado;
    }

    @Override
    public List<LogRecord> obterLogsEntreDatas(LocalDateTime inicio, LocalDateTime fim) {
        if (inicio.isAfter(fim)) {
            throw new IllegalArgumentException("Intervalo inválido: a data de início não pode ser posterior à data de fim.");
        }

        List<LogRecord> resultado = new ArrayList<>();

        for (LogComponente componente : componentes) {
            resultado.addAll(componente.obterLogsEntreDatas(inicio, fim));
        }

        return resultado;
    }
}
