package app;

import M3.LoggerFactory;
import M3.SimpleLogger;
import M1.LogConfig;
import M2.LogFactory;
import M2.LogLevel;
import M2.LogRecord;
import M4.LogFolha;
import M4.LogGrupo;

import java.time.LocalDateTime;
import java.util.List;

public class Main {
    public static void main(String[] args) throws InterruptedException {

        LogConfig config = LogConfig.getInstancia();
        config.setNivelMinimo(LogLevel.DEBUG);
        config.setFormatoMensagem("[%nivel%] %dataHora% - %mensagem%");
        config.setConsolaAtiva(true);
        config.setFicheiroAtivo(true);
        config.setBaseDadosAtiva(false);

        SimpleLogger logger = LoggerFactory.getLogger();

        logger.log(LogLevel.INFO, "Aplicação iniciada com sucesso.");
        logger.log(LogLevel.WARNING, "Memória disponível abaixo do esperado.");
        logger.log(LogLevel.ERROR, "Falha ao ligar à base de dados.");
        logger.log(LogLevel.DEBUG, "Valor da variável x = 10.");

        Thread.sleep(1000);

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

        System.out.println("\n=== Estrutura de Logs ===");
        sistema.mostrar("");

        System.out.println("\nTotal de logs: " + sistema.contarLogs());

        System.out.println("\n=== Logs do tipo ERROR ===");
        List<LogRecord> erros = sistema.obterLogsPorNivel(LogLevel.ERROR);
        for (LogRecord erro : erros) {
            System.out.println(erro);
        }

        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime inicio = agora.minusSeconds(3);
        LocalDateTime fim = agora;

        System.out.println("\n=== Logs entre " + inicio + " e " + fim + " ===");
        List<LogRecord> logsIntervalo = sistema.obterLogsEntreDatas(inicio, fim);
        for (LogRecord log : logsIntervalo) {
            System.out.println(log);
        }
    }
}