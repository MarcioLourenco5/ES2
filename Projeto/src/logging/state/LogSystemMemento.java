package logging.state;

import java.time.LocalDateTime;

import logging.model.LogLevel;

//snapshot

public class LogSystemMemento {
    private final LogLevel nivelMinimo;
    private final String formatoMensagem;
    private final boolean consolaAtiva;
    private final boolean ficheiroAtivo;
    private final boolean baseDadosAtiva;
    private final String nomeFicheiroLog;
    private final LogLevel filtroNivelAtivo;
    private final String filtroCategoriaAtiva;
    private final LocalDateTime filtroDataInicio;
    private final LocalDateTime filtroDataFim;

    public LogSystemMemento(
            LogLevel nivelMinimo,
            String formatoMensagem,
            boolean consolaAtiva,
            boolean ficheiroAtivo,
            boolean baseDadosAtiva,
            String nomeFicheiroLog,
            LogLevel filtroNivelAtivo,
            String filtroCategoriaAtiva,
            LocalDateTime filtroDataInicio,
            LocalDateTime filtroDataFim) {
        this.nivelMinimo = nivelMinimo;
        this.formatoMensagem = formatoMensagem;
        this.consolaAtiva = consolaAtiva;
        this.ficheiroAtivo = ficheiroAtivo;
        this.baseDadosAtiva = baseDadosAtiva;
        this.nomeFicheiroLog = nomeFicheiroLog;
        this.filtroNivelAtivo = filtroNivelAtivo;
        this.filtroCategoriaAtiva = filtroCategoriaAtiva;
        this.filtroDataInicio = filtroDataInicio;
        this.filtroDataFim = filtroDataFim;
    }

    public LogLevel getNivelMinimo() {
        return nivelMinimo;
    }

    public String getFormatoMensagem() {
        return formatoMensagem;
    }

    public boolean isConsolaAtiva() {
        return consolaAtiva;
    }

    public boolean isFicheiroAtivo() {
        return ficheiroAtivo;
    }

    public boolean isBaseDadosAtiva() {
        return baseDadosAtiva;
    }

    public String getNomeFicheiroLog() {
        return nomeFicheiroLog;
    }

    public LogLevel getFiltroNivelAtivo() {
        return filtroNivelAtivo;
    }

    public String getFiltroCategoriaAtiva() {
        return filtroCategoriaAtiva;
    }

    public LocalDateTime getFiltroDataInicio() {
        return filtroDataInicio;
    }

    public LocalDateTime getFiltroDataFim() {
        return filtroDataFim;
    }
}