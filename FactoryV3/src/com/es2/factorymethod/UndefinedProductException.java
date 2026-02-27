package com.es2.factorymethod;

public class UndefinedProductException extends RuntimeException {
    public UndefinedProductException(String message) {
        super(message);
    }
}