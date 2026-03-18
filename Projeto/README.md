M1 usamos singleton

    existe apenas uma instância da classe

    essa instância é acessível globalmente

    todas as partes do sistema usam a mesma configuração


M1 Singleton → configuração centralizada 

    Foi utilizado para garantir um ponto único de acesso às configurações globais do sistema de logs, evitando inconsistências provocadas por múltiplas instâncias.

M2 Factory → criação de registos de log

  Foi aplicado para encapsular a criação dos diferentes tipos de registos de log, promovendo extensibilidade e reduzindo acoplamento.

M3 Bridge → separação entre o log e o destino

Foi escolhido para separar a abstração de registo de logs da implementação dos destinos, permitindo adicionar novos destinos sem alterar a lógica principal.

M4 Composite → organização por categorias/componentes

  Foi usado para organizar logs em estruturas hierárquicas por categorias ou componentes, tratando grupos e elementos individuais de forma uniforme.

m5 Object Pool → reutilização de recursos

  Foi implementado para reutilizar recursos dispendiosos, como formatadores ou conexões, reduzindo custos de criação repetida.

M6 Memento → guardar/restaurar estado do sistema

  Foi utilizado para guardar e restaurar o estado do sistema de logs sem expor a representação interna das configurações.

M7 Decorator → acrescentar funcionalidades sem alterar a base

  Foi aplicado para adicionar funcionalidades extra ao sistema de forma dinâmica, como alertas e integração com monitorização, sem alterar a implementação base.
