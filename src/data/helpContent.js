export const perguntasAjuda = [
  {
    categoria: "Novidades",
    pergunta: "O que mudou nesta versão?",
    resposta: "O sistema foi transformado para organizar eventos, custos, orçamento, comprovantes, envolvidos, cronograma, relatórios e arquivo histórico.",
  },
  {
    categoria: "Eventos",
    pergunta: "Como crio um evento novo?",
    resposta: "Entre em Eventos, informe o nome e, se quiser, tipo, data, responsável, local inicial e orçamento. O evento nasce vazio; depois você escolhe quais áreas deseja detalhar.",
  },
  {
    categoria: "Eventos",
    pergunta: "O evento precisa ter local e orçamento?",
    resposta: "Não. Local, orçamento, envolvidos, tarefas e categorias de custo são opcionais. Use apenas o que fizer sentido para aquele evento.",
  },
  {
    categoria: "Custos",
    pergunta: "Como escolho o que será controlado no evento?",
    resposta: "Na página Custos, primeiro selecione o evento. Depois, no formulário Lançar gasto, escolha a área do custo, como Local, Alimentação, Decoração, Equipamentos, Equipe ou Outros.",
  },
  {
    categoria: "Custos",
    pergunta: "Como lanço um gasto?",
    resposta: "Em Custos, selecione a área, descreva no que foi gasto, informe valor, data, fornecedor, forma de pagamento e comprovante se houver. Depois clique em Adicionar custo.",
  },
  {
    categoria: "Comprovantes",
    pergunta: "Onde guardo comprovantes?",
    resposta: "Cada custo tem campo para link do comprovante e também aceita um arquivo pequeno. Depois o comprovante aparece como Abrir na tabela do evento, no Arquivo e nos relatórios.",
  },
  {
    categoria: "Comprovantes",
    pergunta: "Por que o arquivo de comprovante precisa ser pequeno?",
    resposta: "Nesta versão o comprovante pequeno é salvo junto ao registro do evento. Para arquivos maiores, use um link do Drive, armazenamento interno ou outro local compartilhado.",
  },
  {
    categoria: "Orçamento",
    pergunta: "Como funciona o orçamento?",
    resposta: "O orçamento é opcional. Quando ativo, o sistema compara o total gasto com o valor previsto e mostra percentual usado, saldo restante ou valor excedido.",
  },
  {
    categoria: "Orçamento",
    pergunta: "Quando um evento entra em atenção?",
    resposta: "Ele entra em atenção quando atinge o percentual configurado em Configurações. Por padrão, o alerta aparece a partir de 85% do orçamento.",
  },
  {
    categoria: "Envolvidos",
    pergunta: "Como registro pessoas e fornecedores?",
    resposta: "Na página Custos, use a seção Envolvidos para adicionar nome, papel, contato e observações. Isso ajuda a centralizar responsáveis e fornecedores do evento.",
  },
  {
    categoria: "Cronograma",
    pergunta: "Para que serve o Cronograma?",
    resposta: "O Cronograma organiza tarefas com responsável, prazo, status e observações. Ele mostra pendentes, em andamento, concluídas e atrasadas.",
  },
  {
    categoria: "Arquivo",
    pergunta: "Como concluo e arquivo um evento?",
    resposta: "Você pode marcar o evento como concluído em Eventos ou Arquivo. Depois, em Arquivo, clique em Arquivar no banco para guardar o evento para consultas futuras.",
  },
  {
    categoria: "Arquivo",
    pergunta: "Posso consultar custos depois de arquivar?",
    resposta: "Sim. Eventos arquivados continuam disponíveis na página Arquivo, com total gasto, orçamento, custos e comprovantes.",
  },
  {
    categoria: "Relatórios",
    pergunta: "Quais relatórios posso gerar?",
    resposta: "Relatórios permite gerar resumo financeiro, custos por categoria, comprovantes pendentes, orçamento x realizado e eventos arquivados.",
  },
  {
    categoria: "Relatórios",
    pergunta: "Como salvo ou gero PDF?",
    resposta: "Configure o relatório, clique em Salvar relatório para guardar no Firestore ou Gerar PDF para abrir a impressão do navegador.",
  },
  {
    categoria: "Configurações",
    pergunta: "Como altero as categorias do evento?",
    resposta: "Em Configurações, edite as linhas de categorias no formato id | nome | descrição. Essas categorias aparecem no campo Área do custo em Lançar gasto.",
  },
  {
    categoria: "Configurações",
    pergunta: "Como altero o limite de alerta do orçamento?",
    resposta: "Em Configurações, ajuste o Limite de atenção e salve. Esse percentual alimenta o painel Início, a sidebar e a página Orçamento.",
  },
  {
    categoria: "Login",
    pergunta: "Como entro no sistema?",
    resposta: "Na tela inicial, informe o e-mail e a senha cadastrados no Firebase Authentication e clique em Entrar.",
  },
  {
    categoria: "Ajuda",
    pergunta: "Como encontro uma dúvida rapidamente?",
    resposta: "Use a busca da página Ajuda. Ela procura pelo texto da pergunta, resposta e categoria.",
  },
];

export const tutoriaisPraticos = [
  {
    id: "novidades-eventos",
    titulo: "Novidades do Gerenciador de Eventos",
    descricao: "Apresenta as principais áreas do novo fluxo de eventos.",
    passos: [
      {
        seletor: '[data-tour="nav-novidades"]',
        titulo: "Novidades no topo",
        texto: "Este botão abre um tour rápido sobre a transformação do sistema para gestão de eventos.",
      },
      {
        rota: "/eventos",
        seletor: '[data-tour="evento-criar"]',
        titulo: "Eventos vazios",
        texto: "O evento é criado vazio. Depois você escolhe quais áreas, custos, envolvidos e tarefas serão detalhados.",
      },
      {
        rota: "/custos",
        seletor: '[data-tour="custos-lancar"]',
        titulo: "Área no lançamento",
        texto: "A área do custo é escolhida diretamente no formulário de lançamento, sem etapa extra.",
      },
      {
        rota: "/orcamento",
        seletor: '[data-tour="orcamento-lista"]',
        titulo: "Orçamento acompanhado",
        texto: "Quando há orçamento, o sistema compara gastos e valor previsto. Sem orçamento, ele mostra apenas o total gasto.",
      },
      {
        rota: "/arquivo",
        seletor: '[data-tour="arquivo-lista"]',
        titulo: "Arquivo histórico",
        texto: "Eventos concluídos podem ser arquivados no banco e consultados depois com custos e comprovantes.",
      },
    ],
  },
  {
    id: "criar-evento",
    titulo: "Criar um evento",
    descricao: "Mostra como criar o registro inicial de um evento.",
    passos: [
      {
        rota: "/eventos",
        seletor: '[data-tour="nav-eventos"]',
        titulo: "Abra Eventos",
        texto: "O cadastro começa na página Eventos.",
      },
      {
        rota: "/eventos",
        seletor: '[data-tour="evento-nome"]',
        titulo: "Informe o nome",
        texto: "O nome é o único campo obrigatório para criar o evento vazio.",
      },
      {
        rota: "/eventos",
        seletor: '[data-tour="evento-cadastrar"]',
        titulo: "Crie o evento",
        texto: "Depois de criar, você poderá abrir Custos para detalhar somente o necessário.",
      },
    ],
  },
  {
    id: "lancar-custos",
    titulo: "Lançar custos e comprovantes",
    descricao: "Ensina a escolher evento e registrar gastos.",
    passos: [
      {
        rota: "/custos",
        seletor: '[data-tour="nav-custos"]',
        titulo: "Abra Custos",
        texto: "É aqui que ficam lançamentos, edição de custos, comprovantes, gráfico por área e envolvidos.",
      },
      {
        rota: "/custos",
        seletor: '[data-tour="custos-evento"]',
        titulo: "Escolha pelo card do topo",
        texto: "O card principal mostra o evento atual. Clique nele para abrir a lista e trocar o evento gerenciado.",
      },
      {
        rota: "/custos",
        seletor: '[data-tour="custos-lancar"]',
        titulo: "Escolha a área do gasto",
        texto: "No formulário principal, escolha se o custo é de local, alimentação, decoração ou outra categoria.",
      },
      {
        rota: "/custos",
        seletor: '[data-tour="custos-lancar"]',
        titulo: "Lance o gasto",
        texto: "Preencha descrição, valor, data, fornecedor e comprovante quando houver.",
      },
      {
        rota: "/custos",
        seletor: '[data-tour="custos-lista"]',
        titulo: "Abra um custo registrado",
        texto: "Clique em um card de custo para ver detalhes, editar valor, data, área e adicionar ou abrir comprovantes.",
      },
    ],
  },
  {
    id: "acompanhar-orcamento",
    titulo: "Acompanhar orçamento",
    descricao: "Mostra como encontrar eventos próximos do limite ou acima do orçamento.",
    passos: [
      {
        rota: "/orcamento",
        seletor: '[data-tour="nav-orcamento"]',
        titulo: "Abra Orçamento",
        texto: "A página mostra a comparação entre previsto e realizado.",
      },
      {
        rota: "/orcamento",
        seletor: '[data-tour="orcamento-filtros"]',
        titulo: "Filtre eventos",
        texto: "Busque pelo nome, local, responsável ou situação do orçamento.",
      },
      {
        rota: "/orcamento",
        seletor: '[data-tour="orcamento-segmentos"]',
        titulo: "Separe por situação",
        texto: "Veja todos, em atenção, acima do orçamento ou sem orçamento.",
      },
    ],
  },
  {
    id: "organizar-cronograma",
    titulo: "Organizar cronograma",
    descricao: "Ensina a criar tarefas e acompanhar prazos.",
    passos: [
      {
        rota: "/cronograma",
        seletor: '[data-tour="nav-cronograma"]',
        titulo: "Abra Cronograma",
        texto: "Use esta página para tarefas, responsáveis e prazos.",
      },
      {
        rota: "/cronograma",
        seletor: '[data-tour="cronograma-criar"]',
        titulo: "Adicione tarefa",
        texto: "Informe tarefa, responsável, prazo, status e observações.",
      },
      {
        rota: "/cronograma",
        seletor: '[data-tour="cronograma-lista"]',
        titulo: "Acompanhe execução",
        texto: "Atualize o status e veja rapidamente pendências e atrasos.",
      },
    ],
  },
  {
    id: "arquivar-evento",
    titulo: "Concluir e arquivar",
    descricao: "Mostra como guardar eventos para consultas futuras.",
    passos: [
      {
        rota: "/arquivo",
        seletor: '[data-tour="nav-arquivo"]',
        titulo: "Abra Arquivo",
        texto: "O Arquivo concentra eventos ativos, concluídos e arquivados.",
      },
      {
        rota: "/arquivo",
        seletor: '[data-tour="arquivo-abas"]',
        titulo: "Use as abas",
        texto: "Escolha entre arquivados, concluídos ou ativos para consultar e agir.",
      },
      {
        rota: "/arquivo",
        seletor: '[data-tour="arquivo-lista"]',
        titulo: "Consulte detalhes",
        texto: "Ao selecionar um evento, você vê custos, orçamento e comprovantes guardados.",
      },
    ],
  },
  {
    id: "relatorio-salvo",
    titulo: "Salvar e consultar relatórios",
    descricao: "Ensina a gerar, salvar, consultar e exportar PDF.",
    passos: [
      {
        rota: "/relatorios",
        seletor: '[data-tour="nav-relatorios"]',
        titulo: "Abra Relatórios",
        texto: "Todos os relatórios financeiros ficam nesta página.",
      },
      {
        rota: "/relatorios",
        seletor: '[data-tour="relatorio-tipo"]',
        titulo: "Escolha o tipo",
        texto: "Escolha resumo financeiro, categorias, comprovantes pendentes, orçamento x realizado ou arquivados.",
      },
      {
        rota: "/relatorios",
        seletor: '[data-tour="relatorio-filtros"]',
        titulo: "Ajuste filtros",
        texto: "Você pode filtrar por evento e por mês.",
      },
      {
        rota: "/relatorios",
        seletor: '[data-tour="relatorio-salvar"]',
        titulo: "Salve no banco",
        texto: "Clique em Salvar relatório para guardar a consulta.",
      },
      {
        rota: "/relatorios",
        seletor: '[data-tour="relatorios-salvos"]',
        titulo: "Consulte depois",
        texto: "Relatórios salvos ficam nesta lista para consulta, PDF ou exclusão.",
      },
    ],
  },
  {
    id: "usar-ajuda",
    titulo: "Como usar a Ajuda",
    descricao: "Mostra como pesquisar dúvidas, abrir respostas e iniciar tutoriais guiados.",
    passos: [
      {
        rota: "/ajuda",
        seletor: '[data-tour="nav-ajuda"]',
        titulo: "Abra Ajuda",
        texto: "A Ajuda fica destacada no menu e também tem atalho no Início.",
      },
      {
        rota: "/ajuda",
        seletor: '[data-tour="ajuda-busca"]',
        titulo: "Pesquise sua dúvida",
        texto: "Digite palavras como evento, custo, orçamento, comprovante, arquivo ou relatório.",
      },
      {
        rota: "/ajuda",
        seletor: '[data-tour="ajuda-faq"]',
        titulo: "Abra uma resposta",
        texto: "Clique em uma pergunta para ver a resposta completa.",
      },
      {
        rota: "/ajuda",
        seletor: '[data-tour="ajuda-tutoriais"]',
        titulo: "Use tutoriais práticos",
        texto: "Os tutoriais guiados destacam cada parte da tela.",
      },
    ],
  },
  {
    id: "entender-inicio",
    titulo: "Como funciona o Início",
    descricao: "Explica os indicadores principais, alertas e atalhos da primeira página.",
    passos: [
      {
        rota: "/inicio",
        seletor: '[data-tour="nav-inicio"]',
        titulo: "Abra Início",
        texto: "O Início resume gastos, orçamento, próximos eventos e lançamentos recentes.",
      },
      {
        rota: "/inicio",
        seletor: '[data-tour="inicio-resumo"]',
        titulo: "Veja o resumo geral",
        texto: "Aqui aparece o total gasto nos eventos ativos e o percentual do orçamento geral usado.",
      },
      {
        rota: "/inicio",
        seletor: '[data-tour="inicio-metricas"]',
        titulo: "Leia os indicadores",
        texto: "Os cards mostram ativos, arquivados, eventos próximos e orçamento acima do previsto.",
      },
      {
        rota: "/inicio",
        seletor: '[data-tour="inicio-atalhos"]',
        titulo: "Use os atalhos",
        texto: "Os atalhos levam rapidamente para as funções principais.",
      },
    ],
  },
  {
    id: "entender-configuracoes",
    titulo: "Como funcionam as Configurações",
    descricao: "Mostra onde alterar categorias e limite de atenção.",
    passos: [
      {
        rota: "/configuracoes",
        seletor: '[data-tour="nav-configuracoes"]',
        titulo: "Abra Configurações",
        texto: "Configurações guarda regras que influenciam o restante do sistema.",
      },
      {
        rota: "/configuracoes",
        seletor: '[data-tour="config-orcamento"]',
        titulo: "Ajuste o alerta",
        texto: "Defina a partir de qual percentual o orçamento entra em atenção.",
      },
      {
        rota: "/configuracoes",
        seletor: '[data-tour="config-categorias"]',
        titulo: "Edite categorias",
        texto: "As categorias configuradas aparecem no campo Área do custo em Lançar gasto.",
      },
      {
        rota: "/configuracoes",
        seletor: '[data-tour="config-salvar"]',
        titulo: "Salve tudo",
        texto: "Clique em Salvar configurações para gravar no banco.",
      },
    ],
  },
];
