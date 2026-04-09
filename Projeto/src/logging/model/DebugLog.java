package logging.model;

public class DebugLog extends LogRecord {

    public DebugLog(String categoria, String mensagem) {
        super(categoria, mensagem, LogLevel.DEBUG);
    }

    @Override
    public void mostrarDetalhes() {
        System.out.println("DEBUG - [" + categoria + "] " + mensagem + " | Data/Hora: " + dataHora);
    }
}
