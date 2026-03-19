package bridge;

import java.io.FileWriter;
import java.io.IOException;

public class FicheiroDestino implements LogDestino {

    private final String nomeFicheiro;

    public FicheiroDestino(String nomeFicheiro) {
        this.nomeFicheiro = nomeFicheiro;
    }

    @Override
    public void escrever(String mensagemFormatada) {
        try (FileWriter escritor = new FileWriter(nomeFicheiro, true)) {
            escritor.write(mensagemFormatada + System.lineSeparator());
        } catch (IOException e) {
            System.out.println("Erro ao escrever no ficheiro: " + e.getMessage());
        }
    }
}
