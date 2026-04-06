package logging.config;

import logging.model.LogLevel;

public class LogConfig {

    private static volatile LogConfig instancia;

    private LogLevel nivelMinimo;
    private String formatoMensagem;
    private boolean consolaAtiva;
    private boolean ficheiroAtivo;
    private boolean baseDadosAtiva;

    private LogConfig() {
        this.nivelMinimo = LogLevel.INFO;
        this.formatoMensagem = "[%nivel%] %mensagem%";
        this.consolaAtiva = true;
        this.ficheiroAtivo = false;
        this.baseDadosAtiva = false;
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

    public LogLevel getNivelMinimo() {
        return nivelMinimo;
    }

    public void setNivelMinimo(LogLevel nivelMinimo) {
        this.nivelMinimo = nivelMinimo;
    }

    public String getFormatoMensagem() {
        return formatoMensagem;
    }

    public void setFormatoMensagem(String formatoMensagem) {
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
}
