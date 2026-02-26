package com.es2.factorymethod;

public class Main {
    public static void main(String[] args) {
        try {
            // 1. Criando um Computer através da Factory
            Product comp = FactoryProduct.makeProduct("Computer");
            comp.setBrand("Dell");
            System.out.println("Produto criado: " + comp.getClass().getSimpleName());
            System.out.println("Marca definida: " + comp.getBrand());

            System.out.println("--------------------------------");

            // 2. Criando um Software através da Factory
            Product soft = FactoryProduct.makeProduct("Software");
            soft.setBrand("Windows 11");
            System.out.println("Produto criado: " + soft.getClass().getSimpleName());
            System.out.println("Marca definida: " + soft.getBrand());

            System.out.println("--------------------------------");

            // 3. Testando o erro (Produto inexistente)
            System.out.println("Tentando criar um produto inválido...");
            Product erro = FactoryProduct.makeProduct("Smartphone");

        } catch (UndefinedProductException e) {
            // Captura a exceção que você corrigiu anteriormente
            System.err.println("Erro esperado capturado: " + e.getMessage());
        }
    }
}