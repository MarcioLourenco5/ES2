package logging.model;

public class WarningLog extends LogRecord {

    public WarningLog(String categoria, String mensagem) {
        super(categoria, mensagem, LogLevel.WARNING);
    }

    @Override
    public void mostrarDetalhes() {
        System.out.println("WARNING - [" + categoria + "] " + mensagem + " | Data/Hora: " + dataHora);
    }
}
