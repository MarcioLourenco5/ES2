package com.es2.decorator;

public class Auth implements AuthInterface {

    @Override
    public void auth(String username, String password) throws AuthException {
        if (!"admin".equals(username) || !"admin".equals(password)) {
            throw new AuthException("Credenciais inválidas.");
        }
    }
}