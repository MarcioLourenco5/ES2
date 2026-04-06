package logging.model;

public class WarningLog extends LogRecord {

    public WarningLog(String mensagem) {
        super(mensagem, LogLevel.WARNING);
    }

    @Override
    public void mostrarDetalhes() {
        System.out.println("[WARNING] " + dataHora + " - " + mensagem);
    }
}
