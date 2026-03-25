package app;

import M1.LogConfig;
import M2.LogLevel;
import M3.LoggerFactory;
import M3.SimpleLogger;
import M4.LogCatalogo;
import M5.ConnectionPool;
import M5.FormatterPool;
import M5.LogFormatter;
import M5.StorageConnection;

import java.time.LocalDateTime;

public class Main {

    public static void main(String[] args) {
        configurarSistema();

        SimpleLogger logger = LoggerFactory.getLogger();

        testarEmissaoLogs(logger);
        testarCatalogo();
        testarFormatterPool();
        testarConnectionPool();
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
}