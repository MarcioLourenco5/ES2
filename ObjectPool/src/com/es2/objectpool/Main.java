package com.es2.objectpool;
import java.io.BufferedReader;

import java.io.InputStreamReader;
import java.net.HttpURLConnection;

public class Main {

    public static void main(String[] args) {

        ReusablePool pool = ReusablePool.getInstance();

        Runnable task = () -> {

            HttpURLConnection conn = null;

            try {
                conn = pool.acquire();

                int code = conn.getResponseCode();
                System.out.println(Thread.currentThread().getName() + " -> HTTP " + code);

                try (BufferedReader br =
                             new BufferedReader(new InputStreamReader(conn.getInputStream()))) {

                    String firstLine = br.readLine();
                    System.out.println(Thread.currentThread().getName()
                            + " -> primeira linha: " + firstLine);
                }

            } catch (PoolExhaustedException e) {
                System.out.println("Pool cheia: " + e.getMessage());

            } catch (Exception e) {
                System.out.println("Erro: " + e.getMessage());

            } finally {
                if (conn != null) {
                    try {
                        pool.release(conn);
                    } catch (ObjectNotFoundException e) {
                        System.out.println("Erro ao libertar conexão: "
                                + e.getMessage());
                    }
                }
            }
        };

        // Teste com várias threads
        for (int i = 0; i < 20; i++) {
            new Thread(task, "T" + i).start();
        }
    }
}