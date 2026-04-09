package logging.destination;

import logging.model.LogRecord;
import logging.pool.ConnectionPool;
import logging.pool.StorageConnection;

public class BaseDadosDestino implements LogDestino {

    @Override
    public void escrever(LogRecord record) {
        ConnectionPool pool = ConnectionPool.getInstancia();
        StorageConnection conexao = pool.adquirirConexao();

        try {
            String payload = "INSERT LOG {nivel=" + record.getNivel()
                    + ", categoria=" + record.getCategoria()
                    + ", dataHora=" + record.getDataHora()
                    + ", mensagem='" + record.getMensagem() + "'}";
            conexao.enviar(payload);
        } finally {
            pool.libertarConexao(conexao);
        }
    }
}
