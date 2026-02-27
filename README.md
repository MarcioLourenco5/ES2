# ES2

 //---------------------------------//---------------------------------/ Singleton /---------------------------------//------------------------------//

# video explicativo singleton https://www.youtube.com/watch?v=tSZn4wkBIu8

 //---------------------------------//---------------------------------/ Factory /---------------------------------//---------------------------------//
 
# video explicativo Factory https://www.youtube.com/watch?v=EdFq_JIThqM&t=64s

 //---------------------------------//---------------------------------/ ObjectPool /---------------------------------//------------------------------//
#ObjectoPool

O objetivo é reutilizar conexões HTTP limitando o número máximo de instâncias criadas e garantindo segurança em ambiente concorrente.

1. Estrutura Geral
  A classe principal ReusablePool implementa o padrão Singleton e mantém dois conjuntos: 'available' para objetos livres e 'inUse' para objetos atualmente utilizados.
2. Funcionamento do Método acquire()
  O método acquire() devolve um objeto disponível se existir. Caso contrário, cria um novo se o número máximo ainda não tiver sido atingido. Se o limite for alcançado, lança a exceção PoolExhaustedException.
3. Funcionamento do Método release()
  O método release() devolve o objeto à pool, movendo-o de 'inUse' para 'available'. Caso o objeto não pertença à pool ou seja null, lança ObjectNotFoundException.
4. Thread Safety
  Os métodos críticos são sincronizados (synchronized), garantindo que apenas uma thread possa modificar o estado interno da pool de cada vez.


