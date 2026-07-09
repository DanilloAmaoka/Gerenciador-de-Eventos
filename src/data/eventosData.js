export const CATEGORIAS_EVENTO = [
  {
    id: "local",
    nome: "Local do evento",
    descricao: "Aluguel, reserva, taxas, limpeza e estrutura do espaço.",
  },
  {
    id: "alimentacao",
    nome: "Alimentação",
    descricao: "Buffet, lanches, bebidas, descartáveis e equipe de apoio.",
  },
  {
    id: "decoracao",
    nome: "Decoração",
    descricao: "Flores, painéis, mesas, identidade visual e ambientação.",
  },
  {
    id: "equipamentos",
    nome: "Equipamentos",
    descricao: "Som, luz, projetor, palco, gerador e itens técnicos.",
  },
  {
    id: "divulgacao",
    nome: "Divulgação",
    descricao: "Convites, artes, anúncios, impressos e comunicação.",
  },
  {
    id: "equipe",
    nome: "Equipe e serviços",
    descricao: "Cerimonial, recepção, segurança, limpeza, fotografia e fornecedores.",
  },
  {
    id: "transporte",
    nome: "Transporte",
    descricao: "Fretes, deslocamentos, estacionamento e logística.",
  },
  {
    id: "brindes",
    nome: "Brindes e materiais",
    descricao: "Kits, lembranças, crachás, papelaria e materiais de apoio.",
  },
  {
    id: "outros",
    nome: "Outros custos",
    descricao: "Qualquer despesa que não se encaixe nas categorias anteriores.",
  },
];

export const TIPOS_EVENTO = [
  "Palestra",
  "Reunião",
  "Formatura",
  "Feira",
  "Workshop",
  "Celebração",
  "Viagem",
  "Outro",
];

export const FORMAS_PAGAMENTO = [
  "Pix",
  "Dinheiro",
  "Cartão",
  "Transferência",
  "Boleto",
  "Ainda não pago",
];

export const STATUS_EVENTO = [
  { id: "planejamento", nome: "Planejamento", classe: "status-meta" },
  { id: "em-andamento", nome: "Em andamento", classe: "status-reforco" },
  { id: "concluido", nome: "Concluído", classe: "status-destaque" },
  { id: "arquivado", nome: "Arquivado", classe: "status-critico" },
];

export const CONFIG_EVENTOS_PADRAO = {
  moeda: "BRL",
  alertaOrcamento: 85,
  categorias: CATEGORIAS_EVENTO,
};

export function normalizarTexto(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function criarId(texto, prefixo = "item") {
  const base = normalizarTexto(texto)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return base || prefixo + "-" + Date.now();
}

export function numeroSeguro(valor, padrao = 0) {
  if (valor === "" || valor === null || valor === undefined) return padrao;

  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : padrao;
}

export function formatarMoeda(valor) {
  return numeroSeguro(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatarData(valor) {
  if (!valor) return "Sem data";
  if (typeof valor.toDate === "function") return valor.toDate().toLocaleDateString("pt-BR");

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return String(valor);

  return data.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function formatarDataHora(valor) {
  if (!valor) return "Sem data";
  if (typeof valor.toDate === "function") return valor.toDate().toLocaleString("pt-BR");

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return String(valor);

  return data.toLocaleString("pt-BR");
}

export function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

export function normalizarConfiguracoesEventos(configuracoes = {}) {
  const categorias = Array.isArray(configuracoes.categorias) && configuracoes.categorias.length > 0
    ? configuracoes.categorias
    : CATEGORIAS_EVENTO;

  return {
    ...CONFIG_EVENTOS_PADRAO,
    ...configuracoes,
    alertaOrcamento: Math.min(100, Math.max(1, numeroSeguro(configuracoes.alertaOrcamento, 85))),
    categorias,
  };
}

export function criarEventoVazio(dados = {}) {
  return {
    nome: String(dados.nome || "").trim(),
    tipo: dados.tipo || "Outro",
    data: dados.data || hojeISO(),
    responsavel: String(dados.responsavel || "").trim(),
    descricao: String(dados.descricao || "").trim(),
    local: String(dados.local || "").trim(),
    status: "planejamento",
    categoriasAtivas: [],
    orcamentoAtivo: Boolean(dados.orcamentoAtivo),
    orcamento: dados.orcamentoAtivo ? numeroSeguro(dados.orcamento) : 0,
    envolvidos: [],
    custos: [],
    tarefas: [],
    observacoes: "",
    arquivado: false,
  };
}

export function obterCategoria(categoriaId, categorias = CATEGORIAS_EVENTO) {
  return categorias.find((categoria) => categoria.id === categoriaId) || CATEGORIAS_EVENTO.find((categoria) => categoria.id === "outros");
}

export function obterStatusEvento(statusId) {
  return STATUS_EVENTO.find((status) => status.id === statusId) || STATUS_EVENTO[0];
}

export function normalizarEvento(evento = {}) {
  return {
    ...evento,
    categoriasAtivas: Array.isArray(evento.categoriasAtivas) ? evento.categoriasAtivas : [],
    envolvidos: Array.isArray(evento.envolvidos) ? evento.envolvidos : [],
    custos: Array.isArray(evento.custos) ? evento.custos : [],
    tarefas: Array.isArray(evento.tarefas) ? evento.tarefas : [],
    orcamento: numeroSeguro(evento.orcamento),
    orcamentoAtivo: Boolean(evento.orcamentoAtivo),
    status: evento.arquivado ? "arquivado" : evento.status || "planejamento",
    arquivado: Boolean(evento.arquivado || evento.status === "arquivado"),
  };
}

export function calcularTotalEvento(evento, categoriaId = null) {
  return (evento?.custos || [])
    .filter((custo) => !categoriaId || custo.categoriaId === categoriaId)
    .reduce((total, custo) => total + numeroSeguro(custo.valor), 0);
}

export function calcularResumoEvento(evento) {
  const total = calcularTotalEvento(evento);
  const orcamento = numeroSeguro(evento?.orcamento);
  const orcamentoAtivo = Boolean(evento?.orcamentoAtivo && orcamento > 0);
  const percentual = orcamentoAtivo ? Math.round((total / orcamento) * 100) : 0;
  const restante = orcamentoAtivo ? orcamento - total : 0;
  const custos = evento?.custos || [];
  const comprovantes = custos.filter((custo) => custo.comprovanteUrl || custo.comprovanteArquivo?.dados).length;

  return {
    total,
    orcamento,
    orcamentoAtivo,
    percentual,
    restante,
    totalCustos: custos.length,
    comprovantes,
    pendentesComprovante: Math.max(0, custos.length - comprovantes),
  };
}

export function calcularResumoGeral(eventos = []) {
  const ativos = eventos.filter((evento) => !evento.arquivado);
  const arquivados = eventos.filter((evento) => evento.arquivado);
  const totalGasto = ativos.reduce((total, evento) => total + calcularTotalEvento(evento), 0);
  const totalOrcado = ativos.reduce(
    (total, evento) => total + (evento.orcamentoAtivo ? numeroSeguro(evento.orcamento) : 0),
    0,
  );
  const comOrcamento = ativos.filter((evento) => evento.orcamentoAtivo && numeroSeguro(evento.orcamento) > 0);
  const acimaDoOrcamento = comOrcamento.filter((evento) => calcularTotalEvento(evento) > numeroSeguro(evento.orcamento)).length;
  const hoje = new Date(hojeISO() + "T00:00:00");
  const limite = new Date(hoje);
  limite.setDate(limite.getDate() + 30);
  const proximos = ativos.filter((evento) => {
    const data = new Date((evento.data || hojeISO()) + "T00:00:00");
    return data >= hoje && data <= limite;
  }).length;

  return {
    ativos: ativos.length,
    arquivados: arquivados.length,
    totalGasto,
    totalOrcado,
    comOrcamento: comOrcamento.length,
    acimaDoOrcamento,
    proximos,
  };
}

export function listarCustosRecentes(eventos = []) {
  return eventos
    .flatMap((evento) =>
      (evento.custos || []).map((custo) => ({
        ...custo,
        eventoId: evento.id,
        eventoNome: evento.nome,
      })),
    )
    .sort((a, b) => String(b.data || "").localeCompare(String(a.data || "")));
}

export function despesasPorCategoria(eventos = [], categorias = CATEGORIAS_EVENTO) {
  return categorias.map((categoria) => {
    const total = eventos.reduce((soma, evento) => soma + calcularTotalEvento(evento, categoria.id), 0);
    const itens = eventos.reduce(
      (soma, evento) => soma + (evento.custos || []).filter((custo) => custo.categoriaId === categoria.id).length,
      0,
    );

    return {
      ...categoria,
      total,
      itens,
    };
  });
}

export function ordenarEventosPorData(eventos = []) {
  return [...eventos].sort((a, b) => String(a.data || "").localeCompare(String(b.data || "")));
}
