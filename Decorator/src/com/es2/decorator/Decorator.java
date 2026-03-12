package com.es2.decorator;

import java.io.IOException;

public abstract class Decorator implements AuthInterface {

    protected AuthInterface component;

    public Decorator(AuthInterface component) {
        this.component = component;
    }

    @Override
    public void auth(String username, String password) throws AuthException, IOException {
        component.auth(username, password);
    }
}