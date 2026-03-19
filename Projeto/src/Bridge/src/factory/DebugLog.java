package factory;

public class DebugLog extends LogRecord {

    public DebugLog(String mensagem) {
        super(mensagem, LogLevel.DEBUG);
    }

    @Override
    public void mostrarDetalhes() {
        System.out.println("[DEBUG] " + dataHora + " - " + mensagem);
    }
}
