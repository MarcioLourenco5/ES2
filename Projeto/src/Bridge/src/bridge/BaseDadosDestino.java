package bridge;

public class BaseDadosDestino implements LogDestino {

    @Override
    public void escrever(String mensagemFormatada) {
        System.out.println("Guardar na base de dados: " + mensagemFormatada);
    }
}
