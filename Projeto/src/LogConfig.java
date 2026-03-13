public class LogConfig {

    private static volatile LogConfig instancia;

    private String nivelMinimo;
    private String formatoMensagem;
    private boolean consolaAtiva;
    private boolean ficheiroAtivo;
    private boolean baseDadosAtiva;

    private LogConfig() {
        this.nivelMinimo = "INFO";
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

    public String getNivelMinimo() {
        return nivelMinimo;
    }

    public void setNivelMinimo(String nivelMinimo) {
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

    public void mostrarConfiguracao() {
        System.out.println("=== Configuração do Sistema de Logs ===");
        System.out.println("Nível mínimo: " + nivelMinimo);
        System.out.println("Formato da mensagem: " + formatoMensagem);
        System.out.println("Consola ativa: " + consolaAtiva);
        System.out.println("Ficheiro ativo: " + ficheiroAtivo);
        System.out.println("Base de dados ativa: " + baseDadosAtiva);
    }
}