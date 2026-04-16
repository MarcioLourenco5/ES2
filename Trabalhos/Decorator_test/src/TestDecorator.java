import com.es2.decorator.*;
import org.junit.jupiter.api.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintStream;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TestDecorator {
    private static final ByteArrayOutputStream outContent = new ByteArrayOutputStream();

    @BeforeEach
    void setUp() throws Exception {
        outContent.reset();
    }
    TestDecorator() {
    }

    @BeforeAll
    public static void setUpStreams() {
        System.setOut(new PrintStream(outContent));
    }

    @AfterAll
    public static void tearDownAfterClass(){
        System.setOut(System.out);
        new End();
    }

    @Test
    public void testAuthSuccessful(){
        AuthInterface auth = new Auth();

        try {
            auth.auth("admin", "admin");
        } catch (IOException | AuthException e) {
        }
    }
    @Test
    public void testAuthInvalidCredentials(){
        Auth auth = new Auth();

        assertThrows(AuthException.class,()->{
            auth.auth("admin", "hello");
        });
    }
    @Test
    void testCommonWordsValidatorAuthException(){
        AuthInterface auth = new CommonWordsValidator(new Auth());

        assertThrows(AuthException.class,()->{
            auth.auth("admin", "hello");
        });
        assertThrows(AuthException.class,()->{
            auth.auth("admin", null);
        });
    }

    @Test
    void testCommonWordsValidatorAuthException2(){
        AuthInterface auth = new CommonWordsValidator(new Auth());

        try {
            auth.auth("admin", "admin");
        } catch (IOException | AuthException e) {
        }
    }
    @Test
    void testCommonWordsValidatorAuthException3(){
        AuthInterface auth = new CommonWordsValidator(new Auth());

        assertThrows(AuthException.class,()->{
            auth.auth("admin", "");
        });

    }

    @Test
    void testAuthLogging() throws AuthException, IOException {
        AuthInterface auth = new Logging(new Auth());

        auth.auth("admin", "admin");

        assertTrue(outContent.toString().contains("auth()"));
    }
    @Test
    void testCommonWordsValidatorLogging(){
        AuthInterface auth = new CommonWordsValidator(new Logging(new Auth()));

        try {
            auth.auth("admin", "admin");
        } catch (IOException | AuthException e) {
        }
    }


}
