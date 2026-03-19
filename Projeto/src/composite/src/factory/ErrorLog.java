package factory;

public class ErrorLog extends LogRecord {

    public ErrorLog(String mensagem) {
        super(mensagem, LogLevel.ERROR);
    }

    @Override
    public void mostrarDetalhes() {
        System.out.println("[ERROR] " + dataHora + " - " + mensagem);
    }
}
