package app;

import bridge.BaseDadosDestino;
import bridge.ConsoleDestino;
import bridge.FicheiroDestino;
import bridge.SimpleLogger;
import composite.LogFolha;
import composite.LogGrupo;
import config.LogConfig;
import factory.LogFactory;
import factory.LogLevel;
import factory.LogRecord;

import java.time.LocalDateTime;
import java.util.List;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        demonstrarBridge();
//        demonstrarComposite();
    }

    private static void demonstrarBridge() {
        LogConfig config = LogConfig.getInstancia();
        config.setNivelMinimo(LogLevel.DEBUG);
        config.setFormatoMensagem("[%dataHora%] [%nivel%] %mensagem%");

        SimpleLogger logger = new SimpleLogger();
        logger.adicionarDestino(new ConsoleDestino());
        logger.adicionarDestino(new FicheiroDestino("log_aplicacao.txt"));
        logger.adicionarDestino(new BaseDadosDestino());

        System.out.println("=== Demonstração do Bridge ===");
        logger.log(LogLevel.INFO, "Sistema inicializado com sucesso.");
        logger.log(LogLevel.DEBUG, "Bridge: a abstração envia a mesma mensagem para vários destinos.");
        logger.log(LogLevel.ERROR, "Exemplo de erro registado em múltiplos canais.");
    }
}
