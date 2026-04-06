package logging.observer;

import java.util.HashMap;
import java.util.Map;

import logging.model.LogLevel;
import logging.model.LogRecord;

public class ErrorPatternObserver implements LogObserver {
    private final Map<String, Integer> contagemErros;

    public ErrorPatternObserver() {
        this.contagemErros = new HashMap<>();
    }

    @Override
    public void atualizar(String categoria, LogRecord record) {
        if (record.getNivel() == LogLevel.ERROR) {
            String chave = categoria + ":" + record.getMensagem();
            int total = contagemErros.getOrDefault(chave, 0) + 1;
            contagemErros.put(chave, total);

            if (total >= 3) {
                System.out.println("[PADRAO DETETADO] Erro repetido " + total + " vezes: " + chave);
            }
        }
    }
}