package com.es2.factorymethod;

public class Computer implements Product {
    private String brand;

    // package-private: NÃO é public nem protected nem private
    Computer() { }

    @Override
    public String getBrand() {
        return brand;
    }

    @Override
    public void setBrand(String brand) {
        this.brand = brand;
    }

    @Override
    public String toString() {
        return "Computer{brand='" + brand + "'}";
    }
}