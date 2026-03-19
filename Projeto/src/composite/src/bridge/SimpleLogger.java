package bridge;

import config.LogConfig;
import factory.LogFactory;
import factory.LogLevel;
import factory.LogRecord;

import java.util.ArrayList;
import java.util.List;

public class SimpleLogger extends Logger {
    private final List<LogDestino> destinos = new ArrayList<>();

    @Override
    public void adicionarDestino(LogDestino destino) {
        this.destinos.add(destino);
    }

    @Override
    public void log(LogLevel nivel, String mensagem) {
        LogRecord record = LogFactory.criarLog(nivel, mensagem);

        if (record == null) {
            return;
        }

        if (destinos.isEmpty()) {
            System.out.println("Aviso: nenhum destino de log foi configurado.");
            return;
        }

        String mensagemFormatada = formatarMensagem(record);

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
