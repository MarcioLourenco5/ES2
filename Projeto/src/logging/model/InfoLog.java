package logging.model;

public class InfoLog extends LogRecord {

    public InfoLog(String categoria, String mensagem) {
        super(categoria, mensagem, LogLevel.INFO);
    }

    @Override
    public void mostrarDetalhes() {
        System.out.println("INFO - [" + categoria + "] " + mensagem + " | Data/Hora: " + dataHora);
    }
}
