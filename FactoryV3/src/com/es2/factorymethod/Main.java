package com.es2.factorymethod;

public class Main {
    public static void main(String[] args) {
        Product p1 = FactoryProduct.makeProduct("Computer");
        p1.setBrand("Lenovo");
        System.out.println(p1);

        Product p2 = FactoryProduct.makeProduct("Software");
        p2.setBrand("Microsoft");
        System.out.println(p2);

        // TODO 3: testa um caso inválido (deve lançar UndefinedProductException)
         Product p3 = FactoryProduct.makeProduct("Exemplo");
        p3.setBrand("ERRO");
         System.out.println(p3);
    }
}