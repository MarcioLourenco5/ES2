package com.es2.objectpool;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashSet;
import java.util.Set;

public final class ReusablePool {

    private static ReusablePool instance;

    private final String targetUrl;
    private int maxPoolSize;

    private final Set<HttpURLConnection> available;
    private final Set<HttpURLConnection> inUse;

    private ReusablePool() {
        targetUrl = "https://www.ipv.pt/";
        maxPoolSize = 10;
        available = new HashSet<>();
        inUse = new HashSet<>();
    }

    public synchronized static ReusablePool getInstance() {
        if (instance == null) {
            instance = new ReusablePool();
        }
        return instance;
    }


    public synchronized void resetPool() {
        for (HttpURLConnection c : available) {
            safeDisconnect(c);
        }
        for (HttpURLConnection c : inUse) {
            safeDisconnect(c);
        }
        available.clear();
        inUse.clear();
        maxPoolSize = 10;
    }

    public synchronized void setMaxPoolSize(int newMaxPoolSize) {
        if (newMaxPoolSize <= 0) {
            throw new IllegalArgumentException("maxPoolSize tem de ser > 0");
        }
        maxPoolSize = newMaxPoolSize;

        // se reduziste o máximo, remove extras que estejam em available
        while (available.size() + inUse.size() > maxPoolSize && !available.isEmpty()) {
            HttpURLConnection conn = available.iterator().next();
            available.remove(conn);
            safeDisconnect(conn);
        }
    }

    public synchronized int getMaxPoolSize() {
        return maxPoolSize;
    }

    public synchronized int getNumberOfAvailable() {
        return available.size();
    }

    public synchronized int getNumberOfInUse() {
        return inUse.size();
    }

    public synchronized HttpURLConnection acquire() throws IOException, PoolExhaustedException {

        // 1) reutiliza se houver disponível
        if (!available.isEmpty()) {
            HttpURLConnection conn = available.iterator().next();
            available.remove(conn);
            inUse.add(conn);
            return conn;
        }

        // 2) cria se ainda não atingiu max
        int total = available.size() + inUse.size();
        if (total >= maxPoolSize) {
            throw new PoolExhaustedException();
        }

        HttpURLConnection conn = createConnection();
        inUse.add(conn);
        return conn;
    }

    public synchronized void release(HttpURLConnection conn) throws ObjectNotFoundException {

        //  garantir que NUNCA sai NullPointerException daqui
        if (conn == null) {
            throw new ObjectNotFoundException();
        }

        //  se não estiver em uso, não pertence ao ciclo acquire->release
        if (!inUse.contains(conn)) {
            throw new ObjectNotFoundException();
        }

        inUse.remove(conn);
        available.add(conn);
    }

    private HttpURLConnection createConnection() throws IOException {
        URL url = new URL(targetUrl);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setConnectTimeout(5000);
        conn.setReadTimeout(5000);
        conn.setInstanceFollowRedirects(true);
        conn.setRequestProperty("Connection", "keep-alive");
        return conn;
    }

    private void safeDisconnect(HttpURLConnection conn) {
        try {
            conn.disconnect();
        } catch (Exception ignored) {
            // ignore
        }
    }
}