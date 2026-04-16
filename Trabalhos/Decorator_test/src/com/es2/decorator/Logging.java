package com.es2.decorator;

import java.io.IOException;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;

public class Logging extends Decorator{

    public Logging(AuthInterface auth) {
        super(auth);
    }

    public void auth(String username, String password) throws AuthException, IOException {
        System.out.println(System.currentTimeMillis() + ",auth()");
        super.auth(username, password);
    }

}
