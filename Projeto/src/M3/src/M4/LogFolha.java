package M4;

import M2.LogLevel;
import M2.LogRecord;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class LogFolha implements LogComponente {

    private final LogRecord record;

    public LogFolha(LogRecord record) {
        this.record = record;
    }

    @Override
    public void mostrar(String prefixo) {
        if (record != null) {
            System.out.println(prefixo + "- [" + record.getNivel() + "] "
                    + record.getDataHora() + " - "
                    + record.getMensagem());
        }
    }

    @Override
    public int contarLogs() {
        return record == null ? 0 : 1;
    }

    @Override
    public List<LogRecord> obterLogsPorNivel(LogLevel nivel) {
        List<LogRecord> resultado = new ArrayList<>();

        if (record != null && record.getNivel() == nivel) {
            resultado.add(record);
        }

        return resultado;
    }

    @Override
    public List<LogRecord> obterLogsEntreDatas(LocalDateTime inicio, LocalDateTime fim) {
        if (inicio.isAfter(fim)) {
            throw new IllegalArgumentException("Intervalo inválido: a data de início não pode ser posterior à data de fim.");
        }

        List<LogRecord> resultado = new ArrayList<>();

        if (record == null) {
            return resultado;
        }

        LocalDateTime dataHora = record.getDataHora();
        boolean dentroDoIntervalo = !dataHora.isBefore(inicio) && !dataHora.isAfter(fim);

        if (dentroDoIntervalo) {
            resultado.add(record);
        }

        return resultado;
    }
}
