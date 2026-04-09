package logging.pool;

import logging.config.LogConfig;
import logging.model.LogRecord;

public class LogFormatter {

    public String formatar(LogRecord record) {
        String formato = LogConfig.getInstancia().getFormatoMensagem();

        if (formato == null || formato.isBlank()) {
            formato = "[%nivel%] [%categoria%] %dataHora% - %mensagem%";
        }

        return formato
                .replace("%nivel%", String.valueOf(record.getNivel()))
                .replace("%categoria%", record.getCategoria())
                .replace("%dataHora%", String.valueOf(record.getDataHora()))
                .replace("%mensagem%", record.getMensagem());
    }
}
