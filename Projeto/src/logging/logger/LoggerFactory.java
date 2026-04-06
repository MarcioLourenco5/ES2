package logging.logger;

import logging.config.LogConfig;
import logging.destination.BaseDadosDestino;
import logging.destination.ConsoleDestino;
import logging.destination.FicheiroDestino;

public class LoggerFactory {

    public static SimpleLogger getLogger() {
        LogConfig config = LogConfig.getInstancia();
        SimpleLogger logger = SimpleLogger.getInstancia();

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
