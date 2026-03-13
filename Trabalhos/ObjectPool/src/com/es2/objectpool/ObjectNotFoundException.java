package com.es2.objectpool;

public class ObjectNotFoundException extends Exception {

    public ObjectNotFoundException() {
        super();
    }

    public ObjectNotFoundException(String message) {
        super(message);
    }
}