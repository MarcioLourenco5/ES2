package Factory;

public class LogFactory {

    public static LogRecord criarLog(LogLevel nivel, String mensagem) {
        LogLevel nivelGlobal = LogConfig.getInstancia().getNivelMinimo();
0
        if (nivel.getPrioridade() < nivelGlobal.getPrioridade()) {
            System.out.println("LOG BLOQUEADO: tentativa de criar log do tipo "
                    + nivel + ", mas o sistema está configurado para registar apenas logs a partir de "
                    + nivelGlobal);            return null;
        }

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