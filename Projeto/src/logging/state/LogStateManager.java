package logging.state;

import logging.config.LogConfig;
import logging.logger.LoggerFactory;

//originator, lê e escreve em logConfig

public class LogStateManager {

    public LogSystemMemento guardarEstado() {
        LogConfig config = LogConfig.getInstancia();

        return new LogSystemMemento(
                config.getNivelMinimo(),
                config.getFormatoMensagem(),
                config.isConsolaAtiva(),
                config.isFicheiroAtivo(),
                config.isBaseDadosAtiva(),
                config.getNomeFicheiroLog(),
                config.getFiltroNivelAtivo(),
                config.getFiltroCategoriaAtiva(),
                config.getFiltroDataInicio(),
                config.getFiltroDataFim()
        );
    }

    public void restaurarEstado(LogSystemMemento memento) {
        if (memento == null) {
            throw new IllegalArgumentException("Memento não pode ser nulo.");
        }

        LogConfig config = LogConfig.getInstancia();

        config.setNivelMinimo(memento.getNivelMinimo());
        config.setFormatoMensagem(memento.getFormatoMensagem());
        config.setConsolaAtiva(memento.isConsolaAtiva());
        config.setFicheiroAtivo(memento.isFicheiroAtivo());
        config.setBaseDadosAtiva(memento.isBaseDadosAtiva());
        config.setNomeFicheiroLog(memento.getNomeFicheiroLog());
        config.setFiltroNivelAtivo(memento.getFiltroNivelAtivo());
        config.setFiltroCategoriaAtiva(memento.getFiltroCategoriaAtiva());
        config.setFiltroDataInicio(memento.getFiltroDataInicio());
        config.setFiltroDataFim(memento.getFiltroDataFim());

        LoggerFactory.reconfigurarLogger();
    }
}