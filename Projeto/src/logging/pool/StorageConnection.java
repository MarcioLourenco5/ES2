package logging.pool;

public class StorageConnection {

    private final int id;

    public StorageConnection(int id) {
        this.id = id;
    }

    public int getId() {
        return id;
    }

    public void enviar(String mensagem) {
        System.out.println("Conexão #" + id + " a enviar: " + mensagem);
    }
}
