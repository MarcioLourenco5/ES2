package Factory;

public class LogFactory {

    public static LogRecord criarLog(LogLevel nivel, String mensagem) {
        switch (nivel) {
            case INFO:
                return new InfoLog(mensagem);
            case WARNING:
                return new WarningLog(mensagem);
            case ERROR:
                return new ErrorLog(mensagem);
            case DEBUG:
                return new DebugLog(mensagem);
            default:
                throw new IllegalArgumentException("Nível de log inválido: " + nivel);
        }
    }
}