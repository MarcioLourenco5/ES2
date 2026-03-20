package M3;

import M1.LogConfig;

public class LoggerFactory {

    public static SimpleLogger getLogger() {
        LogConfig config = LogConfig.getInstancia();
        SimpleLogger logger = SimpleLogger.getInstancia();

        //  evitar acumular destinos em chamadas repetidas
        logger.limparDestinos();

        if (config.isConsolaAtiva()) {
            logger.adicionarDestino(new ConsoleDestino());
        }

        if (config.isFicheiroAtivo()) {
            logger.adicionarDestino(new FicheiroDestino("log_aplicacao.txt"));
        }

        if (config.isBaseDadosAtiva()) {
            logger.adicionarDestino(new BaseDadosDestino());
        }

        return logger;
    }
}