import com.es2.decorator.Auth;
import com.es2.decorator.AuthException;
import com.es2.decorator.AuthInterface;
import com.es2.decorator.CommonWordsValidator;
import com.es2.decorator.Logging;

import java.io.IOException;

public class Main {

    public static void main(String[] args) {
        AuthInterface auth;

        System.out.println("=== Teste 1: apenas autenticação base ===");
        auth = new Auth();
        testar(auth, "admin", "admin");

        System.out.println("\n=== Teste 2: autenticação com logging ===");
        auth = new Logging(new Auth());
        testar(auth, "admin", "admin");

        System.out.println("\n=== Teste 3: autenticação com logging e validação de password comum ===");
        auth = new CommonWordsValidator(new Logging(new Auth()));
        testar(auth, "admin", "admin");

        System.out.println("\n=== Teste 4: password não comum mas credenciais erradas ===");
        auth = new CommonWordsValidator(new Logging(new Auth()));
        testar(auth, "joao", "segura123");

        System.out.println("\n=== Teste 5: password comum ===");
        auth = new CommonWordsValidator(new Logging(new Auth()));
        testar(auth, "admin", "password");
    }

    private static void testar(AuthInterface auth, String username, String password) {
        try {
            auth.auth(username, password);
            System.out.println("Autenticação concluída com sucesso.");
        } catch (AuthException | IOException e) {
            System.out.println("Erro: " + e.getMessage());
        }
    }
}