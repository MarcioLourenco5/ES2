package M3;

import M1.LogConfig;
import M2.LogFactory;
import M2.LogLevel;
import M2.LogRecord;

import java.util.LinkedHashSet;
import java.util.Set;

public class SimpleLogger extends Logger {

    private static volatile SimpleLogger instancia;

    // LinkedHashSet → evita duplicados e mantém ordem de inserção
    private final Set<LogDestino> destinos;

    private SimpleLogger() {
        this.destinos = new LinkedHashSet<>();
    }

    public static SimpleLogger getInstancia() {
        if (instancia == null) {
            synchronized (SimpleLogger.class) {
                if (instancia == null) {
                    instancia = new SimpleLogger();
                }
            }
        }
        return instancia;
    }

    @Override
    public void adicionarDestino(LogDestino destino) {
        if (destino == null) {
            throw new IllegalArgumentException("Destino não pode ser nulo.");
        }

        destinos.add(destino); // Set evita duplicados automaticamente
    }

    // Opcional mas útil (para LoggerFactory)
    public void limparDestinos() {
        destinos.clear();
    }

    @Override
    public void log(LogLevel nivel, String mensagem) {
        LogRecord record = LogFactory.criarLog(nivel, mensagem);

        if (record == null) {
            return; // log bloqueado pelo nível mínimo
        }

        if (destinos.isEmpty()) {
            System.out.println("Aviso: nenhum destino configurado.");
            return;
        }

        String mensagemFormatada = formatarMensagem(record);

        for (LogDestino destino : destinos) {
            destino.escrever(mensagemFormatada);
        }
    }

    private String formatarMensagem(LogRecord record) {
        String formato = LogConfig.getInstancia().getFormatoMensagem();

        if (formato == null || formato.isBlank()) {
            formato = "[%nivel%] %dataHora% - %mensagem%";
        }

        return formato
                .replace("%nivel%", String.valueOf(record.getNivel()))
                .replace("%dataHora%", String.valueOf(record.getDataHora()))
                .replace("%mensagem%", record.getMensagem());
    }
}