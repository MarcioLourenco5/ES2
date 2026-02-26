package com.es2.factorymethod;

public class UndefinedProductException extends Exception {

    /**
     * Constructor Detail conforme a documentação:
     * Sem argumentos (no arguments).
     */
    public UndefinedProductException() {
        // Chamamos o super com uma mensagem padrão ou deixamos vazio
        super("Product type not found or undefined.");
    }
}