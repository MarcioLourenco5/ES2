package bridge;

import config.LogConfig;
import factory.LogFactory;
import factory.LogRecord;
import factory.LogLevel;
import java.util.ArrayList;
import java.util.List;

public class SimpleLogger extends Logger {
    // Lista para suportar múltiplos destinos (Requisito M3)
    private List<LogDestino> destinos = new ArrayList<>();

    public void adicionarDestino(LogDestino destino) {
        this.destinos.add(destino);
    }

    @Override
    public void log(LogLevel nivel, String mensagem) {
        // Criar o log usando a Factory (M2) [cite: 9]
        LogRecord record = LogFactory.criarLog(nivel, mensagem);
        String mensagemFormatada = formatarMensagem(record);

        // Enviar para TODOS os destinos (M3)
        for (LogDestino destino : destinos) {
            destino.escrever(mensagemFormatada);
        }
    }

    private String formatarMensagem(LogRecord record) {
        String formato = LogConfig.getInstancia().getFormatoMensagem();
        return formato
                .replace("%nivel%", String.valueOf(record.getNivel()))
                .replace("%dataHora%", String.valueOf(record.getDataHora()))
                .replace("%mensagem%", record.getMensagem());
    }
}
