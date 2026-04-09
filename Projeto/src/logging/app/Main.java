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

import logging.decorator.AdminAlertDecorator;
import logging.decorator.ErrorPatternDecorator;
import logging.decorator.MonitoringDecorator;
import logging.logger.Logger;

import java.time.LocalDateTime;

public class Main {

    public static void main(String[] args) {

        separador("M1 - SINGLETON");
        executarModulo1_Singleton();

        separador("CONFIGURAÇÃO INICIAL");
        configurarSistema();

        separador("M2 - FACTORY");
        executarModulo2_Factory();

        separador("M3 - EMISSÃO DE LOGS");
        executarModulo3_Logger();

        separador("M4 - COMPOSITE / CATÁLOGO");
        executarModulo4_Composite();

        separador("M5 - OBJECT POOLS");
        executarModulo5_Pools();

        separador("M6 - MEMENTO (SNAPSHOTS)");
        executarModulo6_Memento();

        separador("M7 - DECORATOR");
        executarModulo7_Decorator();

        separador("FIM DA EXECUÇÃO");
    }


    private static void configurarSistema() {

        LogConfig config = LogConfig.getInstancia();

        config.setNivelMinimo(LogLevel.DEBUG);
        config.setFormatoMensagem("[%nivel%] [%categoria%] %dataHora% - %mensagem%");
        config.setConsolaAtiva(true);
        config.setFicheiroAtivo(true);
        config.setBaseDadosAtiva(false);

        LoggerFactory.reconfigurarLogger();
    }

    private static void executarModulo1_Singleton() {

        System.out.println("\n--- Teste Singleton LogConfig ---");

        LogConfig config1 = LogConfig.getInstancia();
        LogConfig config2 = LogConfig.getInstancia();

        System.out.println("Instância 1: "
                + config1.hashCode());

        System.out.println("Instância 2: "
                + config2.hashCode());

        if (config1 == config2) {
            System.out.println("✔ Singleton confirmado (mesma instância)");
        } else {
            System.out.println("✘ Erro: instâncias diferentes");
        }


        System.out.println("\n--- Teste Singleton SimpleLogger ---");

        SimpleLogger logger1 = SimpleLogger.getInstancia();
        SimpleLogger logger2 = SimpleLogger.getInstancia();

        System.out.println("Logger 1: "
                + logger1.hashCode());

        System.out.println("Logger 2: "
                + logger2.hashCode());

        if (logger1 == logger2) {
            System.out.println("✔ Singleton confirmado (logger único)");
        } else {
            System.out.println("✘ Erro: loggers diferentes");
        }
    }





    private static void executarModulo2_Factory() {

        System.out.println("\n--- Teste Factory + Bridge (LoggerFactory) ---");

        LogConfig config = LogConfig.getInstancia();

        // Apenas consola

        config.setConsolaAtiva(true);
        config.setFicheiroAtivo(false);
        config.setBaseDadosAtiva(false);

        LoggerFactory.reconfigurarLogger();

        SimpleLogger logger = LoggerFactory.getLogger();

        logger.log("Factory",
                LogLevel.INFO,
                "Log apenas para CONSOLA");


        // Consola + ficheiro

        config.setConsolaAtiva(true);
        config.setFicheiroAtivo(true);
        config.setBaseDadosAtiva(false);

        LoggerFactory.reconfigurarLogger();
        LoggerFactory.mostrarDestinosAtivos();

        logger.log("Factory",
                LogLevel.INFO,
                "Log para CONSOLA e FICHEIRO");


        // Base de dados ativa

        config.setConsolaAtiva(false);
        config.setFicheiroAtivo(false);
        config.setBaseDadosAtiva(true);

        LoggerFactory.reconfigurarLogger();

        logger.log("Factory",
                LogLevel.ERROR,
                "Log enviado para BASE DE DADOS");

        System.out.println("✔ Factory testada com múltiplas configurações");
    }
    // =====================================================
    // M3 - BRIDGE (com Composite nos destinos)
    // =====================================================

    private static void executarModulo3_Logger() {

        SimpleLogger logger = LoggerFactory.getLogger();

        logger.log("Sistema", LogLevel.INFO,
                "Aplicação iniciada com sucesso.");

        logger.log("Autenticação", LogLevel.WARNING,
                "Tentativa de login falhada.");

        logger.log("BaseDados", LogLevel.ERROR,
                "Falha ao ligar à base de dados.");

        logger.log("Rede", LogLevel.WARNING,
                "Tempo de resposta elevado.");

        logger.log("Interface", LogLevel.ERROR,
                "Erro ao carregar interface.");

        logger.log("Sistema", LogLevel.DEBUG,
                "Valor da variável x = 10.");
    }

    // =====================================================
    // M4 - COMPOSITE
    // =====================================================

    private static void executarModulo4_Composite() {

        LogCatalogo catalogo = LogCatalogo.getInstancia();

        System.out.println("\n=== Estrutura de Logs ===");

        catalogo.mostrarEstrutura();

        System.out.println("\nTotal de logs: "
                + catalogo.contarLogs());

        System.out.println("\n=== Logs do tipo ERROR ===");

        catalogo.obterLogsPorNivel(LogLevel.ERROR)
                .forEach(System.out::println);

        LocalDateTime agora = LocalDateTime.now();

        LocalDateTime inicio = agora.minusMinutes(5);
        LocalDateTime fim = agora;

        System.out.println("\n=== Logs entre datas ===");

        catalogo.obterLogsEntreDatas(inicio, fim)
                .forEach(System.out::println);
    }

    // =====================================================
    // M5 - OBJECT POOLS
    // =====================================================

    private static void executarModulo5_Pools() {

        testarFormatterPool();
        testarConnectionPool();
    }

    private static void testarFormatterPool() {

        System.out.println("\n--- FormatterPool ---");

        FormatterPool pool = FormatterPool.getInstancia();

        System.out.println("Disponíveis: "
                + pool.getDisponiveis());

        System.out.println("Em uso: "
                + pool.getEmUso());

        LogFormatter f1 = pool.adquirirFormatter();
        LogFormatter f2 = pool.adquirirFormatter();

        System.out.println("Após adquirir 2:");

        System.out.println("Disponíveis: "
                + pool.getDisponiveis());

        System.out.println("Em uso: "
                + pool.getEmUso());

        pool.libertarFormatter(f1);
        pool.libertarFormatter(f2);

        System.out.println("Após libertar:");

        System.out.println("Disponíveis: "
                + pool.getDisponiveis());

        System.out.println("Em uso: "
                + pool.getEmUso());
    }

    private static void testarConnectionPool() {

        System.out.println("\n--- ConnectionPool ---");

        ConnectionPool pool = ConnectionPool.getInstancia();

        StorageConnection c1 = pool.adquirirConexao();
        StorageConnection c2 = pool.adquirirConexao();

        c1.enviar("Log ERROR: Falha no sistema");
        c2.enviar("Log WARNING: Memória baixa");

        pool.libertarConexao(c1);
        pool.libertarConexao(c2);

        System.out.println("Disponíveis: "
                + pool.getDisponiveis());

        System.out.println("Em uso: "
                + pool.getEmUso());
    }

    // =====================================================
    // M6 - MEMENTO
    // =====================================================

    private static void executarModulo6_Memento() {

        LogConfig config = LogConfig.getInstancia();

        LogStateManager gestor = new LogStateManager();
        LogStateHistory historico = new LogStateHistory();

        SimpleLogger logger = LoggerFactory.getLogger();

        // ESTADO INICIAL

        System.out.println("\n--- ESTADO INICIAL ---");

        imprimirEstadoAtual(config);

        historico.guardarSnapshot(
                "inicial",
                gestor.guardarEstado()
        );

        logger.log("Sistema", LogLevel.INFO,
                "Log com configuração INICIAL");

        // ESTADO TESTE

        config.setNivelMinimo(LogLevel.ERROR);
        config.setFormatoMensagem("[TESTE] %mensagem%");
        config.setConsolaAtiva(false);
        config.setFicheiroAtivo(true);
        config.setBaseDadosAtiva(false);

        LoggerFactory.reconfigurarLogger();

        System.out.println("\n--- ESTADO TESTE ---");

        imprimirEstadoAtual(config);

        historico.guardarSnapshot(
                "teste",
                gestor.guardarEstado()
        );

        logger.log("Sistema", LogLevel.ERROR,
                "Log com configuração TESTE");

        // RESTORE

        System.out.println("\n--- RESTAURAR INICIAL ---");

        gestor.restaurarEstado(
                historico.obterSnapshot("inicial")
        );

        imprimirEstadoAtual(config);

        logger.log("Sistema", LogLevel.INFO,
                "Log após RESTORE INICIAL");
    }

    // =====================================================
    // M7 - DECORATOR
    // =====================================================

    private static void executarModulo7_Decorator() {

        Logger logger = LoggerFactory.getLogger();
        logger = new AdminAlertDecorator(logger);
        logger = new MonitoringDecorator(logger);
        logger = new ErrorPatternDecorator(logger);

        System.out.println("\n--- Teste Decorator ---");

        logger.log("autenticacao",
                LogLevel.INFO,
                "Utilizador autenticado");

        logger.log("base_dados",
                LogLevel.ERROR,
                "Falha ligação BD");

        logger.log("base_dados",
                LogLevel.ERROR,
                "Falha ligação BD");

        logger.log("base_dados",
                LogLevel.ERROR,
                "Falha ligação BD");

        logger.log("rede",
                LogLevel.WARNING,
                "Latência elevada");
    }

    // =====================================================
    // AUXILIARES
    // =====================================================

    private static void imprimirEstadoAtual(LogConfig config) {

        System.out.println("Nivel: "
                + config.getNivelMinimo());

        System.out.println("Formato: "
                + config.getFormatoMensagem());

        System.out.println("Consola: "
                + config.isConsolaAtiva());

        System.out.println("Ficheiro: "
                + config.isFicheiroAtivo());

        System.out.println("BaseDados: "
                + config.isBaseDadosAtiva());
    }

    private static void separador(String titulo) {

        System.out.println("\n=======================================");
        System.out.println(titulo);
        System.out.println("=======================================");
    }
}