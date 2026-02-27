package com.es2.objectpool;

public class PoolExhaustedException extends Exception {

    public PoolExhaustedException() {
        super();
    }

    public PoolExhaustedException(String message) {
        super(message);
    }
}