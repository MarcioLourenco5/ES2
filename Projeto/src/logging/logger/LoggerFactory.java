package logging.logger;

import logging.config.LogConfig;
import logging.destination.CompositeDestino;
import logging.factory.DestinoFactory;

public class LoggerFactory {

    public static SimpleLogger getLogger() {
        SimpleLogger logger = SimpleLogger.getInstancia();
        configurarImplementador(logger, LogConfig.getInstancia());
        return logger;
    }

    public static void mostrarDestinosAtivos() {
        LogConfig config = LogConfig.getInstancia();

        System.out.println("Destinos ativos:");

        if (config.isConsolaAtiva())
            System.out.println(" - Consola");

        if (config.isFicheiroAtivo())
            System.out.println(" - Ficheiro");

        if (config.isBaseDadosAtiva())
            System.out.println(" - Base de Dados");

        System.out.println();
    }

    public static void reconfigurarLogger() {
        configurarImplementador(SimpleLogger.getInstancia(), LogConfig.getInstancia());
    }

    private static void configurarImplementador(SimpleLogger logger, LogConfig config) {
        CompositeDestino compositeDestino = new CompositeDestino();

        if (config.isConsolaAtiva()) {
            compositeDestino.adicionar(DestinoFactory.criar("consola"));
        }

        if (config.isFicheiroAtivo()) {
            compositeDestino.adicionar(DestinoFactory.criar("ficheiro"));
        }

        if (config.isBaseDadosAtiva()) {
            compositeDestino.adicionar(DestinoFactory.criar("basedados"));
        }

        logger.definirImplementador(compositeDestino);
    }
}
