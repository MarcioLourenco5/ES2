package com.es2.factorymethod;

public final class FactoryProduct {

    private FactoryProduct() {
        // impede instanciar a factory
    }

    public static Product makeProduct(String type) {
        if (type == null) {
            throw new UndefinedProductException("Tipo inválido: null");
        }

        String normalized = type.trim().toLowerCase();

        //
        switch (normalized) {
            case "computer":
                return new Computer();
            case "software":
                return new Software();
            default:
                // TODO 2:
                throw new UndefinedProductException("Tipo inválido: " + type);
        }
    }
}