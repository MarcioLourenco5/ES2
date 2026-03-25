package M5;

import java.util.ArrayList;
import java.util.List;

public class ConnectionPool {

    private static volatile ConnectionPool instancia;

    private final List<StorageConnection> disponiveis;
    private final List<StorageConnection> emUso;
    private static int contadorIds = 1;

    private ConnectionPool() {
        this.disponiveis = new ArrayList<>();
        this.emUso = new ArrayList<>();

        for (int i = 0; i < 3; i++) {
            disponiveis.add(new StorageConnection(contadorIds++));
        }
    }

    public static ConnectionPool getInstancia() {
        if (instancia == null) {
            synchronized (ConnectionPool.class) {
                if (instancia == null) {
                    instancia = new ConnectionPool();
                }
            }
        }
        return instancia;
    }

    public synchronized StorageConnection adquirirConexao() {
        StorageConnection conexao;

        if (disponiveis.isEmpty()) {
            conexao = new StorageConnection(contadorIds++);
        } else {
            conexao = disponiveis.remove(0);
        }

        emUso.add(conexao);
        return conexao;
    }

    public synchronized void libertarConexao(StorageConnection conexao) {
        if (conexao != null && emUso.remove(conexao)) {
            disponiveis.add(conexao);
        }
    }

    public synchronized int getDisponiveis() {
        return disponiveis.size();
    }

    public synchronized int getEmUso() {
        return emUso.size();
    }
}