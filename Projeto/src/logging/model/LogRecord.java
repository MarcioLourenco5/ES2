package logging.model;

import logging.catalog.LogComponente;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public abstract class LogRecord implements LogComponente {

    protected final String mensagem;
    protected final LocalDateTime dataHora;
    protected final LogLevel nivel;

    public LogRecord(String mensagem, LogLevel nivel) {
        this.mensagem = mensagem;
        this.nivel = nivel;
        this.dataHora = LocalDateTime.now();
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
        return "[" + nivel + "] " + dataHora + " - " + mensagem;
    }
}
