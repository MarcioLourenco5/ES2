package com.es2.singleton;

public class Main {
    public static void main(String[] args) {
        System.out.println("--- Exercício Singleton ---");

        // Obtemos a instância única do registo
        Registry config = Registry.getInstance();

        // Configuramos os valores
        config.setPath("/app/ficheiros/log");
        config.setConnectionString("jdbc:postgresql://server:5432/main_db");

        // Verificar os Setters e Getters
        System.out.println("Caminho de Ficheiros: " + config.getPath());
        System.out.println("String de Conexão: " + config.getConnectionString());


        Registry outraReferencia = Registry.getInstance();
        if (config == outraReferencia) {
            System.out.println("\nSucesso: 'config' e 'outraReferencia' apontam para a mesma instância.");
        }
    }
}