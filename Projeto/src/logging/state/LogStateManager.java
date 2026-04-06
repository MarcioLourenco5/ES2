package logging.state;

import logging.config.LogConfig;
import logging.logger.LoggerFactory;

public class LogStateManager {

    public LogSystemMemento guardarEstado() {
        LogConfig config = LogConfig.getInstancia();

        return new LogSystemMemento(
                config.getNivelMinimo(),
                config.getFormatoMensagem(),
                config.isConsolaAtiva(),
                config.isFicheiroAtivo(),
                config.isBaseDadosAtiva()
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

        LoggerFactory.getLogger();
    }
}