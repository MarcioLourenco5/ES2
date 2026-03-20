package M3;

import M2.LogLevel;

public abstract class Logger {
    // Define a assinatura que o SimpleLogger vai implementar
    public abstract void log(LogLevel nivel, String mensagem);
    public abstract void adicionarDestino(LogDestino destino);
}