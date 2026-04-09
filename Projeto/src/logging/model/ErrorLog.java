package logging.model;

public class ErrorLog extends LogRecord {

    public ErrorLog(String categoria, String mensagem) {
        super(categoria, mensagem, LogLevel.ERROR);
    }

    @Override
    public void mostrarDetalhes() {
        System.out.println("ERROR - [" + categoria + "] " + mensagem + " | Data/Hora: " + dataHora);
    }
}
