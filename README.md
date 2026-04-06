# ES2
https://miro.com/welcomeonboard/TVR3bUdDak1JS3R4b2FIY2JnZjRRQzFjYnJvUStTYzBsbi92Qm82eGNEejhxbXphTURaQVNscTFicjkzeVNlUXdQYVpXQlJqeFVXTnVVc293WlFiSWh2ZlYvdjNzY2VaR1E0QjgxLzRxUlNvQjBsUldsSlZsWGo1YlBGaTRNUXZBS2NFMDFkcUNFSnM0d3FEN050ekl3PT0hdjE=?share_link_id=159239692577

 
 //---------------------------------//---------------------------------/ Singleton /---------------------------------//------------------------------//

# video explicativo singleton https://www.youtube.com/watch?v=tSZn4wkBIu8

 //---------------------------------//---------------------------------/ Factory /---------------------------------//---------------------------------//
 
# video explicativo Factory https://www.youtube.com/watch?v=EdFq_JIThqM&t=64s

 //---------------------------------//---------------------------------/ ObjectPool /---------------------------------//------------------------------//


O objetivo é reutilizar conexões HTTP limitando o número máximo de instâncias criadas e garantindo segurança em ambiente concorrente.

1. Estrutura Geral
  A classe principal ReusablePool implementa o padrão Singleton e mantém dois conjuntos: 'available' para objetos livres e 'inUse' para objetos atualmente utilizados.
2. Funcionamento do Método acquire()
  O método acquire() devolve um objeto disponível se existir. Caso contrário, cria um novo se o número máximo ainda não tiver sido atingido. Se o limite for alcançado, lança a exceção PoolExhaustedException.
3. Funcionamento do Método release()
  O método release() devolve o objeto à pool, movendo-o de 'inUse' para 'available'. Caso o objeto não pertença à pool ou seja null, lança ObjectNotFoundException.
4. Thread Safety
  Os métodos críticos são sincronizados (synchronized), garantindo que apenas uma thread possa modificar o estado interno da pool de cada vez.
 //---------------------------------//---------------------------------/ Bridge /---------------------------------//------------------------------//


# video explicativo Bridge https://www.youtube.com/watch?v=88kAIisOiYs

 //---------------------------------//---------------------------------/ Decorator  /---------------------------------//---------------------------------//
 O Decorator permite adicionar comportamento dinamicamente sem alterar a classe base. Open/Closed 
 Ex: AuthInterface auth =
        new CommonWordsValidator(
            new Logging(
                new Auth()
            )
        );

   Cada class tem apenas uma responsabilidade : Solid
   
Classe              	Responsabilidade
Auth	                autenticar
Logging	             registar atividade
CommonWordsValidator	validar password (se existe em banco de dados de pw comum)
CaptchaValidator	    verificar captcha


//----------------------------------//--------------------/ Momento /--------------------------------------//-------------------------------------------------//

 # M6 – Armazenamento de Estado do Sistema de Logs 

Foi implementado o módulo M6 com base no padrão de desenho Memento, permite guardar e restaurar o estado interno do sistema sem quebrar o encapsulamento

Funcionalidades
-Captura do estado atual do sistema (configurações de logging)
-Armazenamento de múltiplos snapshots identificados por nome
-Restauro de estados anteriores sem expor detalhes internos
-Reconfiguração automática do sistema após restauro

Classes principais
- LogSystemMemento
  Representa o estado do sistema (nível de log, formato, destinos ativos)
- LogStateManager
  Responsável por criar e restaurar snapshots (Originator)
- LogStateHistory
  Armazena múltiplos estados do sistema (Caretaker)

 //---------------------------------//---------------------------------/ Observer  /---------------------------------//---------------------------------//

M7 – Extensão de Funcionalidades Dinâmicas

O módulo M7 foi implementado com base no padrão de desenho Observer, permitindo adicionar novas funcionalidades ao sistema de logs de forma dinâmica, sem modificar a estrutura principal.

Funcionalidades

-Notificação automática quando um log é emitido
-Suporte para múltiplos observers
-Extensão do sistema sem alteração do código existente
 
 Classes principais
- LogObserver
   Interface comum para todos os observers
- AdminAlertObserver
   Gera alertas quando ocorrem erros críticos
- MonitoringObserver
   Integração com monitorização (simulada)
- ErrorPatternObserver
   Deteta padrões de erro repetidos


