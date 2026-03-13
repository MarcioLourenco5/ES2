public class Main {
    public static void main(String[] args) {

        LogConfig config1 = LogConfig.getInstancia();
        LogConfig config2 = LogConfig.getInstancia();

        config1.setNivelMinimo("ERROR");
        config1.setFicheiroAtivo(true);

        System.out.println("Configuração obtida por config1:");
        config1.mostrarConfiguracao();

        System.out.println();

        System.out.println("Configuração obtida por config2:");
        config2.mostrarConfiguracao();

        System.out.println();
        System.out.println("As duas variáveis apontam para a mesma instância? " + (config1 == config2));
    }
}