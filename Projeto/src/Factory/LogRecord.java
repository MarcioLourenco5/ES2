package Factory;

import java.time.LocalDateTime;

public abstract class LogRecord {

    protected String mensagem;
    protected LocalDateTime dataHora;
    protected LogLevel nivel;

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
}