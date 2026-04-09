package logging.model;

import logging.catalog.LogComponente;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public abstract class LogRecord implements LogComponente {

    protected final String categoria;
    protected final String mensagem;
    protected final LocalDateTime dataHora;
    protected final LogLevel nivel;

    public LogRecord(String categoria, String mensagem, LogLevel nivel) {
        if (categoria == null || categoria.isBlank()) {
            throw new IllegalArgumentException("A categoria do log não pode ser vazia.");
        }
        if (mensagem == null || mensagem.isBlank()) {
            throw new IllegalArgumentException("A mensagem do log não pode ser vazia.");
        }
        if (nivel == null) {
            throw new IllegalArgumentException("O nível do log não pode ser nulo.");
        }

        this.categoria = categoria;
        this.mensagem = mensagem;
        this.nivel = nivel;
        this.dataHora = LocalDateTime.now();
    }

    public String getCategoria() {
        return categoria;
    }

    public String getMensagem() {
        return mensagem;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }

    public LogLevel getNivel() {
        return nivel;
    }

    public abstract void mostrarDetalhes();

    @Override
    public void mostrar(String prefixo) {
        System.out.println(prefixo + "- " + this);
    }

    @Override
    public int contarLogs() {
        return 1;
    }

    @Override
    public List<LogRecord> obterLogsPorNivel(LogLevel nivel) {
        List<LogRecord> resultado = new ArrayList<>();

        if (this.nivel == nivel) {
            resultado.add(this);
        }

        return resultado;
    }

    @Override
    public List<LogRecord> obterLogsEntreDatas(LocalDateTime inicio, LocalDateTime fim) {
        if (inicio == null || fim == null) {
            throw new IllegalArgumentException("O intervalo de datas não pode ter valores nulos.");
        }
        if (inicio.isAfter(fim)) {
            throw new IllegalArgumentException("Intervalo inválido: a data de início é posterior à data de fim.");
        }

        List<LogRecord> resultado = new ArrayList<>();
        boolean dentroDoIntervalo = !dataHora.isBefore(inicio) && !dataHora.isAfter(fim);

        if (dentroDoIntervalo) {
            resultado.add(this);
        }

        return resultado;
    }

    @Override
    public String toString() {
        return "[" + nivel + "] [" + categoria + "] " + dataHora + " - " + mensagem;
    }
}
