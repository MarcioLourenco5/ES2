package logging.destination;

import logging.pool.ConnectionPool;
import logging.pool.StorageConnection;

public class BaseDadosDestino implements LogDestino {

    @Override
    public void escrever(String mensagemFormatada) {
        ConnectionPool pool = ConnectionPool.getInstancia();
        StorageConnection conexao = pool.adquirirConexao();

        try {
            conexao.enviar("Guardar na base de dados: " + mensagemFormatada);
        } finally {
            pool.libertarConexao(conexao);
        }
    }
}