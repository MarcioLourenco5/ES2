package M2;

import java.time.LocalDateTime;

public abstract class LogRecord {

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
    public String toString() {
        return "[" + nivel + "] " + dataHora + " - " + mensagem;
    }
}
