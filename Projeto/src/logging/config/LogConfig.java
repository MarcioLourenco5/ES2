package logging.config;

import java.time.LocalDateTime;

import logging.model.LogLevel;
import logging.model.LogRecord;

public class LogConfig {

    private static volatile LogConfig instancia;

    private LogLevel nivelMinimo;
    private String formatoMensagem;
    private boolean consolaAtiva;
    private boolean ficheiroAtivo;
    private boolean baseDadosAtiva;

    private String nomeFicheiroLog;

    private LogLevel filtroNivelAtivo;
    private String filtroCategoriaAtiva;
    private LocalDateTime filtroDataInicio;
    private LocalDateTime filtroDataFim;

    private LogConfig() {
        this.nivelMinimo = LogLevel.DEBUG;
        this.formatoMensagem = "[%nivel%] [%categoria%] %dataHora% - %mensagem%";
        this.consolaAtiva = true;
        this.ficheiroAtivo = true;
        this.baseDadosAtiva = false;

        this.nomeFicheiroLog = "log_aplicacao.txt";

        this.filtroNivelAtivo = null;
        this.filtroCategoriaAtiva = null;
        this.filtroDataInicio = null;
        this.filtroDataFim = null;
    }

    public static LogConfig getInstancia() {
        if (instancia == null) {
            synchronized (LogConfig.class) {
                if (instancia == null) {
                    instancia = new LogConfig();
                }
            }
        }
        return instancia;
    }

    public boolean deveRegistar(LogRecord record) {
        if (record == null) {
            return false;
        }

        if (record.getNivel().getPrioridade() < nivelMinimo.getPrioridade()) {
            return false;
        }

        if (filtroNivelAtivo != null && record.getNivel() != filtroNivelAtivo) {
            return false;
        }

        if (filtroCategoriaAtiva != null && !filtroCategoriaAtiva.isBlank()
                && !record.getCategoria().equalsIgnoreCase(filtroCategoriaAtiva)) {
            return false;
        }

        if (filtroDataInicio != null && record.getDataHora().isBefore(filtroDataInicio)) {
            return false;
        }

        if (filtroDataFim != null && record.getDataHora().isAfter(filtroDataFim)) {
            return false;
        }

        return true;
    }

    public LogLevel getNivelMinimo() {
        return nivelMinimo;
    }

    public void setNivelMinimo(LogLevel nivelMinimo) {
        if (nivelMinimo == null) {
            throw new IllegalArgumentException("O nível mínimo não pode ser nulo.");
        }
        this.nivelMinimo = nivelMinimo;
    }

    public String getFormatoMensagem() {
        return formatoMensagem;
    }

    public void setFormatoMensagem(String formatoMensagem) {
        if (formatoMensagem == null || formatoMensagem.isBlank()) {
            throw new IllegalArgumentException("O formato da mensagem não pode ser vazio.");
        }
        this.formatoMensagem = formatoMensagem;
    }

    public boolean isConsolaAtiva() {
        return consolaAtiva;
    }

    public void setConsolaAtiva(boolean consolaAtiva) {
        this.consolaAtiva = consolaAtiva;
    }

    public boolean isFicheiroAtivo() {
        return ficheiroAtivo;
    }

    public void setFicheiroAtivo(boolean ficheiroAtivo) {
        this.ficheiroAtivo = ficheiroAtivo;
    }

    public boolean isBaseDadosAtiva() {
        return baseDadosAtiva;
    }

    public void setBaseDadosAtiva(boolean baseDadosAtiva) {
        this.baseDadosAtiva = baseDadosAtiva;
    }

    public String getNomeFicheiroLog() {
        return nomeFicheiroLog;
    }

    public void setNomeFicheiroLog(String nomeFicheiroLog) {
        if (nomeFicheiroLog == null || nomeFicheiroLog.isBlank()) {
            throw new IllegalArgumentException("O nome do ficheiro de log é inválido.");
        }
        this.nomeFicheiroLog = nomeFicheiroLog;
    }

    public LogLevel getFiltroNivelAtivo() {
        return filtroNivelAtivo;
    }

    public void setFiltroNivelAtivo(LogLevel filtroNivelAtivo) {
        this.filtroNivelAtivo = filtroNivelAtivo;
    }

    public String getFiltroCategoriaAtiva() {
        return filtroCategoriaAtiva;
    }

    public void setFiltroCategoriaAtiva(String filtroCategoriaAtiva) {
        this.filtroCategoriaAtiva = filtroCategoriaAtiva;
    }

    public LocalDateTime getFiltroDataInicio() {
        return filtroDataInicio;
    }

    public void setFiltroDataInicio(LocalDateTime filtroDataInicio) {
        this.filtroDataInicio = filtroDataInicio;
    }

    public LocalDateTime getFiltroDataFim() {
        return filtroDataFim;
    }

    public void setFiltroDataFim(LocalDateTime filtroDataFim) {
        this.filtroDataFim = filtroDataFim;
    }
}
