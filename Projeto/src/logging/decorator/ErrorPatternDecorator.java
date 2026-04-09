package logging.decorator;

import logging.logger.Logger;
import logging.model.LogLevel;

import java.util.HashMap;
import java.util.Map;

public class ErrorPatternDecorator extends LoggerDecorator {
    private final Map<String, Integer> contagemErros;

    public ErrorPatternDecorator(Logger loggerBase) {
        super(loggerBase);
        this.contagemErros = new HashMap<>();
    }

    @Override
    public void log(LogLevel nivel, String mensagem) {
        log("Geral", nivel, mensagem);
    }

    @Override
    public void log(String categoria, LogLevel nivel, String mensagem) {
        loggerBase.log(categoria, nivel, mensagem);

        if (nivel == LogLevel.ERROR) {
            String chave = categoria + ":" + mensagem;
            int total = contagemErros.getOrDefault(chave, 0) + 1;
            contagemErros.put(chave, total);

            if (total >= 3) {
                System.out.println("[PADRAO DETETADO] Erro repetido " + total + " vezes: " + chave);
            }
        }
    }
}
