package logging.app;

import logging.catalog.LogCatalogo;
import logging.config.LogConfig;
import logging.logger.LoggerFactory;
import logging.logger.SimpleLogger;
import logging.model.LogLevel;
import logging.pool.ConnectionPool;
import logging.pool.FormatterPool;
import logging.pool.LogFormatter;
import logging.pool.StorageConnection;
import logging.state.LogStateManager;
import logging.state.LogSystemMemento;
import logging.state.LogStateHistory;

import logging.observer.AdminAlertObserver;
import logging.observer.ErrorPatternObserver;
import logging.observer.MonitoringObserver;

import java.time.LocalDateTime;

public class Main {

    public static void main(String[] args) {
        configurarSistema();

        SimpleLogger logger = LoggerFactory.getLogger();

        testarEmissaoLogs(logger);
        testarCatalogo();
        testarFormatterPool();
        testarConnectionPool();
        testarMemento();
        testarObservers();
    }

    private static void configurarSistema() {
        LogConfig config = LogConfig.getInstancia();
        config.setNivelMinimo(LogLevel.DEBUG);
        config.setFormatoMensagem("[%nivel%] %dataHora% - %mensagem%");
        config.setConsolaAtiva(true);
        config.setFicheiroAtivo(true);
        config.setBaseDadosAtiva(false);
    }

    private static void testarEmissaoLogs(SimpleLogger logger) {
        System.out.println("============= M3 - Emissão de Logs =============");

        logger.log("Sistema", LogLevel.INFO, "Aplicação iniciada com sucesso.");
        logger.log("Autenticação", LogLevel.WARNING, "Tentativa de login falhada.");
        logger.log("Base de Dados", LogLevel.ERROR, "Falha ao ligar à base de dados.");
        logger.log("Rede", LogLevel.WARNING, "Tempo de resposta da rede elevado.");
        logger.log("Interface", LogLevel.ERROR, "Erro ao carregar interface.");
        logger.log("Sistema", LogLevel.DEBUG, "Valor da variável x = 10.");
    }

    private static void testarCatalogo() {
        System.out.println("\n============= M4 - Composite / Catálogo =============");

        LogCatalogo catalogo = LogCatalogo.getInstancia();

        System.out.println("\n=== Estrutura de Logs ===");
        catalogo.mostrarEstrutura();

        System.out.println("\nTotal de logs: " + catalogo.contarLogs());

        System.out.println("\n=== Logs do tipo ERROR ===");
        catalogo.obterLogsPorNivel(LogLevel.ERROR)
                .forEach(System.out::println);

        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime inicio = agora.minusMinutes(5);
        LocalDateTime fim = agora;

        System.out.println("\n=== Logs entre " + inicio + " e " + fim + " ===");
        catalogo.obterLogsEntreDatas(inicio, fim)
                .forEach(System.out::println);
    }

    private static void testarFormatterPool() {
        System.out.println("\n============= M5 - FormatterPool =============");

        FormatterPool formatterPool = FormatterPool.getInstancia();

        System.out.println("Inicial -> disponíveis: " + formatterPool.getDisponiveis());
        System.out.println("Inicial -> em uso: " + formatterPool.getEmUso());

        LogFormatter f1 = formatterPool.adquirirFormatter();
        LogFormatter f2 = formatterPool.adquirirFormatter();

        System.out.println("Após adquirir 2 -> disponíveis: " + formatterPool.getDisponiveis());
        System.out.println("Após adquirir 2 -> em uso: " + formatterPool.getEmUso());

        formatterPool.libertarFormatter(f1);
        formatterPool.libertarFormatter(f2);

        System.out.println("Após libertar -> disponíveis: " + formatterPool.getDisponiveis());
        System.out.println("Após libertar -> em uso: " + formatterPool.getEmUso());
    }

    private static void testarConnectionPool() {
        System.out.println("\n============= M5 - ConnectionPool =============");

        ConnectionPool connectionPool = ConnectionPool.getInstancia();

        System.out.println("Inicial -> disponíveis: " + connectionPool.getDisponiveis());
        System.out.println("Inicial -> em uso: " + connectionPool.getEmUso());

        StorageConnection c1 = connectionPool.adquirirConexao();
        StorageConnection c2 = connectionPool.adquirirConexao();

        System.out.println("Após adquirir 2 -> disponíveis: " + connectionPool.getDisponiveis());
        System.out.println("Após adquirir 2 -> em uso: " + connectionPool.getEmUso());

        c1.enviar("Log ERROR: Falha no sistema");
        c2.enviar("Log WARNING: Memória baixa");

        connectionPool.libertarConexao(c1);
        connectionPool.libertarConexao(c2);

        System.out.println("Após libertar -> disponíveis: " + connectionPool.getDisponiveis());
        System.out.println("Após libertar -> em uso: " + connectionPool.getEmUso());
    }


    private static void imprimirEstadoAtual(LogConfig config) {
        System.out.println("Nivel: " + config.getNivelMinimo());
        System.out.println("Formato: " + config.getFormatoMensagem());
        System.out.println("Consola: " + config.isConsolaAtiva());
        System.out.println("Ficheiro: " + config.isFicheiroAtivo());
        System.out.println("Base de dados: " + config.isBaseDadosAtiva());
    }

    private static void testarMemento() {
        LogConfig config = LogConfig.getInstancia();
        LogStateManager gestorEstado = new LogStateManager();
        LogStateHistory historico = new LogStateHistory();

        System.out.println("=== ESTADO INICIAL ===");
        imprimirEstadoAtual(config);
        historico.guardarSnapshot("inicial", gestorEstado.guardarEstado());

        config.setNivelMinimo(LogLevel.ERROR);
        config.setFormatoMensagem("[ERRO] %mensagem%");
        config.setConsolaAtiva(false);
        config.setFicheiroAtivo(true);
        config.setBaseDadosAtiva(false);

        System.out.println("\n=== ESTADO TESTE ===");
        imprimirEstadoAtual(config);
        historico.guardarSnapshot("teste", gestorEstado.guardarEstado());

        config.setNivelMinimo(LogLevel.WARNING);
        config.setFormatoMensagem("[PRODUCAO] %nivel% - %mensagem%");
        config.setConsolaAtiva(true);
        config.setFicheiroAtivo(false);
        config.setBaseDadosAtiva(true);

        System.out.println("\n=== ESTADO PRODUCAO ===");
        imprimirEstadoAtual(config);
        historico.guardarSnapshot("producao", gestorEstado.guardarEstado());

        System.out.println("\n=== RESTAURAR TESTE ===");
        gestorEstado.restaurarEstado(historico.obterSnapshot("teste"));
        imprimirEstadoAtual(config);

        System.out.println("\n=== RESTAURAR INICIAL ===");
        gestorEstado.restaurarEstado(historico.obterSnapshot("inicial"));
        imprimirEstadoAtual(config);

        System.out.println("\n=== RESTAURAR PRODUCAO ===");
        gestorEstado.restaurarEstado(historico.obterSnapshot("producao"));
        imprimirEstadoAtual(config);
    }

    private static void testarObservers() {
        SimpleLogger logger = LoggerFactory.getLogger();

        logger.limparObservers();

        logger.adicionarObserver(new AdminAlertObserver());
        logger.adicionarObserver(new MonitoringObserver());
        logger.adicionarObserver(new ErrorPatternObserver());

        System.out.println("\n=== TESTE OBSERVERS ===");

        logger.log("autenticacao", LogLevel.INFO, "Utilizador autenticado com sucesso");
        logger.log("base_dados", LogLevel.ERROR, "Falha na ligação à base de dados");
        logger.log("base_dados", LogLevel.ERROR, "Falha na ligação à base de dados");
        logger.log("base_dados", LogLevel.ERROR, "Falha na ligação à base de dados");
        logger.log("rede", LogLevel.WARNING, "Latência elevada detetada");
    }
}
