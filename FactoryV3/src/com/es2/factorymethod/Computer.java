package com.es2.factorymethod;

public class Computer implements Product {
    private String brand;

    protected Computer() {
        // Construtor protegido conforme especificação
    }

    @Override
    public String getBrand() {
        return brand;
    }

    @Override
    public void setBrand(String brand) {
        this.brand = brand;
    }
}