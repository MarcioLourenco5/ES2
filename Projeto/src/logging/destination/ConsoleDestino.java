package logging.destination;

public class ConsoleDestino implements LogDestino {

    @Override
    public void escrever(String mensagemFormatada) {
        System.out.println(mensagemFormatada);
    }
}
