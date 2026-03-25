package M5;

import java.util.ArrayList;
import java.util.List;

public class FormatterPool {

    private static volatile FormatterPool instancia;

    private final List<LogFormatter> disponiveis;
    private final List<LogFormatter> emUso;
    private static final int TAMANHO_INICIAL = 3;

    private FormatterPool() {
        this.disponiveis = new ArrayList<>();
        this.emUso = new ArrayList<>();

        for (int i = 0; i < TAMANHO_INICIAL; i++) {
            disponiveis.add(new LogFormatter());
        }
    }

    public static FormatterPool getInstancia() {
        if (instancia == null) {
            synchronized (FormatterPool.class) {
                if (instancia == null) {
                    instancia = new FormatterPool();
                }
            }
        }
        return instancia;
    }

    public synchronized LogFormatter adquirirFormatter() {
        LogFormatter formatter;

        if (disponiveis.isEmpty()) {
            formatter = new LogFormatter();
        } else {
            formatter = disponiveis.remove(0);
        }

        emUso.add(formatter);
        return formatter;
    }

    public synchronized void libertarFormatter(LogFormatter formatter) {
        if (formatter != null && emUso.remove(formatter)) {
            disponiveis.add(formatter);
        }
    }

    public synchronized int getDisponiveis() {
        return disponiveis.size();
    }

    public synchronized int getEmUso() {
        return emUso.size();
    }
}