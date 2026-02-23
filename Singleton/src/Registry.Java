package com.es2.singleton;


public class Registry {
    // volatile garante que a instância é lida corretamente entre diferentes threads
    private static volatile Registry instance;

    private String connectionString;
    private String pathFiles;

    // Construtor privado: impede a criação de instâncias externas
    private Registry() {
        // Valores por defeito (só para evitar nulls caso sejam acedidos antes de serem configurados)
        this.connectionString = "jdbc:mysql://localhost:3306/mydb";
        this.pathFiles = "/usr/local/files";
    }


    public static Registry getInstance() {
        if (instance == null) {//Double-check
            synchronized (Registry.class) {// sync -> evitar que duas instancias sejam criadas (multi-thread)
                if (instance == null) {
                    instance = new Registry();
                }
            }
        }
        return instance;
    }

    // Getters e Setters
    public String getPath() {
        return pathFiles;
    }

    public void setPath(String pathFiles) {
        this.pathFiles = pathFiles;
    }

    public String getConnectionString() {
        return connectionString;
    }

    public void setConnectionString(String connectionString) {
        this.connectionString = connectionString;
    }
}