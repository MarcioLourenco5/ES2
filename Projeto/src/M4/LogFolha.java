package M4;

import M2.LogLevel;
import M2.LogRecord;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class LogFolha implements LogComponente {

    private final LogRecord record;

    public LogFolha(LogRecord record) {
        if (record == null) {
            throw new IllegalArgumentException("O registo de log não pode ser nulo.");
        }
        this.record = record;
    }

    @Override
    public void mostrar(String prefixo) {
        System.out.println(prefixo + "- " + record);
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
        if (inicio.isAfter(fim)) {
            throw new IllegalArgumentException("Intervalo inválido: a data de início é posterior à data de fim.");
        }

        List<LogRecord> resultado = new ArrayList<>();
        LocalDateTime dataHora = record.getDataHora();

        boolean dentroDoIntervalo = !dataHora.isBefore(inicio) && !dataHora.isAfter(fim);

        if (dentroDoIntervalo) {
            resultado.add(record);
        }

        return resultado;
    }

    public LogRecord getRecord() {
        return record;
    }
}