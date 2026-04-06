package logging.state;

import logging.model.LogLevel;

public class LogSystemMemento {
    private final LogLevel nivelMinimo;
    private final String formatoMensagem;
    private final boolean consolaAtiva;
    private final boolean ficheiroAtivo;
    private final boolean baseDadosAtiva;

    public LogSystemMemento(
            LogLevel nivelMinimo,
            String formatoMensagem,
            boolean consolaAtiva,
            boolean ficheiroAtivo,
            boolean baseDadosAtiva) {
        this.nivelMinimo = nivelMinimo;
        this.formatoMensagem = formatoMensagem;
        this.consolaAtiva = consolaAtiva;
        this.ficheiroAtivo = ficheiroAtivo;
        this.baseDadosAtiva = baseDadosAtiva;
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
}