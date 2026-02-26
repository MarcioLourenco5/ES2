package com.es2.factorymethod;

public abstract class FactoryProduct {

    public FactoryProduct() {
        // Construtor público conforme especificação
    }

    /**
     * Factory method
     * @param type Selector of the object type. Options are "Computer" or "Software".
     * @return The object created by the factory.
     * @throws UndefinedProductException
     */
    public static Product makeProduct(String type) throws UndefinedProductException {
        if ("Computer".equalsIgnoreCase(type)) {
            return new Computer();
        } else if ("Software".equalsIgnoreCase(type)) {
            return new Software();
        } else {
            throw new UndefinedProductException();
        }
    }
}