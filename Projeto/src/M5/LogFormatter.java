package M5;

import M1.LogConfig;
import M2.LogRecord;

public class LogFormatter {

    public String formatar(LogRecord record) {
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