package logging.factory;

import logging.config.LogConfig;
import logging.destination.BaseDadosDestino;
import logging.destination.ConsoleDestino;
import logging.destination.FicheiroDestino;
import logging.destination.LogDestino;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.function.Supplier;

public class DestinoFactory {

    private static final Map<String, Supplier<LogDestino>> creators = new LinkedHashMap<>();

    static {
        registar("consola", ConsoleDestino::new);
        registar("ficheiro", () -> new FicheiroDestino(LogConfig.getInstancia().getNomeFicheiroLog()));
        registar("basedados", BaseDadosDestino::new);
    }

    private DestinoFactory() {
    }

    public static void registar(String tipo, Supplier<LogDestino> creator) {
        if (tipo == null || tipo.isBlank() || creator == null) {
            throw new IllegalArgumentException("O tipo e o criador do destino são obrigatórios.");
        }
        creators.put(tipo.toLowerCase(), creator);
    }

    public static LogDestino criar(String tipo) {
        Supplier<LogDestino> creator = creators.get(tipo.toLowerCase());
        if (creator == null) {
            throw new IllegalArgumentException("Destino não suportado: " + tipo);
        }
        return creator.get();
    }
}
