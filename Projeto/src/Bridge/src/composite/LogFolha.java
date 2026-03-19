package composite;

import factory.LogLevel;
import factory.LogRecord;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class LogFolha implements LogComponente {

    private LogRecord record;

    public LogFolha(LogRecord record) {
        this.record = record;
    }

    @Override
    public void mostrar(String prefixo) {
        System.out.println(prefixo + "- [" + record.getNivel() + "] "
                + record.getDataHora() + " - "
                + record.getMensagem());
    }

    @Override
    public int contarLogs() {
        return 1;
    }

    @Override
    public List<LogRecord> obterLogsPorNivel(LogLevel nivel) {
        List<LogRecord> resultado = new ArrayList<>();

        if (record.getNivel() == nivel) {
            resultado.add(record);
        }

        return resultado;
    }

    @Override
    public List<LogRecord> obterLogsEntreDatas(LocalDateTime inicio, LocalDateTime fim) {
        List<LogRecord> resultado = new ArrayList<>();
        LocalDateTime dataHora = record.getDataHora();

        boolean dentroDoIntervalo = (dataHora.isEqual(inicio) || dataHora.isAfter(inicio))
                && (dataHora.isEqual(fim) || dataHora.isBefore(fim));

        if (dentroDoIntervalo) {
            resultado.add(record);
        }

        return resultado;
    }
}
