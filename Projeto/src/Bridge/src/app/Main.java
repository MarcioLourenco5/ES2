//package app;
//
//import bridge.*;
//import factory.LogLevel;
//import config.LogConfig;
//
//public class Main {
//    public static void main(String[] args) {
//        // 1. Aceder à Configuração Centralizada (M1)
//        // Como o construtor é privado, usamos getInstancia()
//        LogConfig config = LogConfig.getInstancia();
//        config.setNivelMinimo(LogLevel.DEBUG);
//        config.setFormatoMensagem("[%nivel%] -> %mensagem%");
//
//        // 2. Criar o Logger (M3 - Bridge)
//        // O Logger deve permitir adicionar vários destinos à sua lista interna
//        SimpleLogger logger = new SimpleLogger();
//
//        // 3. Configurar múltiplos destinos (M3)
//
//
//        // Exemplo de adição de outros destinos conforme a necessidade
//        logger.adicionarDestino(new ConsoleDestino());
//        logger.adicionarDestino(new FicheiroDestino("log_aplicacao.txt")); // Passar o nome do ficheiro
//
//        System.out.println("=== Sistema de Logs M1, M2 e M3 configurado ===\n");
//
//        // 4. Testar a emissão de logs
//        logger.log(LogLevel.INFO, "Sistema inicializado com sucesso.");
//        logger.log(LogLevel.DEBUG, "Detalhes técnicos da operação X.");
//    }
// // %%%%%%%%%%%%%%%%% M4 %%%%%%%%%%%%%%%%%%%%%%%

package app;

import composite.LogFolha;
import composite.LogGrupo;
import factory.LogFactory;
import factory.LogLevel;
import factory.LogRecord;

import java.time.LocalDateTime;
import java.util.List;

public class Main {
    public static void main(String[] args) throws InterruptedException {

        LogRecord log1 = LogFactory.criarLog(LogLevel.WARNING, "Tentativa de login falhada.");
        Thread.sleep(1000);
        LogRecord log2 = LogFactory.criarLog(LogLevel.ERROR, "Falha na ligação à base de dados.");
        Thread.sleep(1000);
        LogRecord log3 = LogFactory.criarLog(LogLevel.WARNING, "Tempo de resposta da rede elevado.");
        Thread.sleep(1000);
        LogRecord log4 = LogFactory.criarLog(LogLevel.ERROR, "Erro ao carregar interface.");

        LogGrupo sistema = new LogGrupo("Sistema");

        LogGrupo autenticacao = new LogGrupo("Autenticação");
        LogGrupo baseDados = new LogGrupo("Base de Dados");
        LogGrupo rede = new LogGrupo("Rede");
        LogGrupo interfaceGrafica = new LogGrupo("Interface");

        if (log1 != null) autenticacao.adicionar(new LogFolha(log1));
        if (log2 != null) baseDados.adicionar(new LogFolha(log2));
        if (log3 != null) rede.adicionar(new LogFolha(log3));
        if (log4 != null) interfaceGrafica.adicionar(new LogFolha(log4));

        sistema.adicionar(autenticacao);
        sistema.adicionar(baseDados);
        sistema.adicionar(rede);
        sistema.adicionar(interfaceGrafica);

        System.out.println("=== Estrutura de Logs ===");
        sistema.mostrar("");

        System.out.println("\nTotal de logs: " + sistema.contarLogs());

        // =========================
        // FILTRO POR NÍVEL
        // =========================
        System.out.println("\n=== Logs do tipo ERROR ===");
        List<LogRecord> erros = sistema.obterLogsPorNivel(LogLevel.ERROR);
        for (LogRecord erro : erros) {
            System.out.println("[" + erro.getNivel() + "] " + erro.getDataHora() + " - " + erro.getMensagem());
        }

        // =========================
        // FILTRO POR DATAS
        // =========================
        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime inicio = agora.minusSeconds(3); // últimos 3 segundos
        LocalDateTime fim = agora;

        System.out.println("\n=== Logs entre as datas: || " + inicio + " || e || " + fim + " || ===");
        List<LogRecord> logsIntervalo = sistema.obterLogsEntreDatas(inicio, fim);

        for (LogRecord log : logsIntervalo) {
            System.out.println("[" + log.getNivel() + "] " + log.getDataHora() + " - " + log.getMensagem());
        }
    }
}