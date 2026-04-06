package logging.model;

public class InfoLog extends LogRecord {

    public InfoLog(String mensagem) {
        super(mensagem, LogLevel.INFO);
    }

    @Override
    public void mostrarDetalhes() {
        System.out.println("[INFO] " + dataHora + " - " + mensagem);
    }
}
