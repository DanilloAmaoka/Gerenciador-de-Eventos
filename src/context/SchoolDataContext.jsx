import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase/config";
import {
  CONFIG_EVENTOS_PADRAO,
  criarEventoVazio,
  normalizarConfiguracoesEventos,
  normalizarEvento,
} from "../data/eventosData";
import { useFeedback } from "./FeedbackContext";

const SchoolDataContext = createContext(null);
const eventosCollection = collection(db, "eventos");
const configuracoesEventosDoc = doc(db, "configuracoes", "eventos");
const EVENTO_SELECIONADO_KEY = "gerenciador-eventos:evento-selecionado";

function normalizarDocumentoEvento(documento) {
  return normalizarEvento({
    id: documento.id,
    ...documento.data(),
  });
}

function criarItemComId(dados) {
  return {
    ...dados,
    id: dados.id || String(Date.now()) + "-" + Math.random().toString(16).slice(2),
  };
}

export function SchoolDataProvider({ children }) {
  const [eventos, setEventos] = useState([]);
  const [carregandoEventos, setCarregandoEventos] = useState(true);
  const [configuracoesEventos, setConfiguracoesEventos] = useState(CONFIG_EVENTOS_PADRAO);
  const [eventoSelecionadoId, setEventoSelecionadoId] = useState(() => {
    try {
      return window.localStorage.getItem(EVENTO_SELECIONADO_KEY) || "";
    } catch {
      return "";
    }
  });
  const { mostrarFeedback } = useFeedback();

  const selecionarEvento = useCallback((eventoId) => {
    const proximoId = String(eventoId || "");
    setEventoSelecionadoId(proximoId);

    try {
      if (proximoId) {
        window.localStorage.setItem(EVENTO_SELECIONADO_KEY, proximoId);
      } else {
        window.localStorage.removeItem(EVENTO_SELECIONADO_KEY);
      }
    } catch {
      // A selecao continua na sessao mesmo se o navegador bloquear localStorage.
    }
  }, []);

  const carregarEventos = useCallback(async () => {
    setCarregandoEventos(true);

    try {
      const consulta = query(eventosCollection, orderBy("data", "asc"));
      const resultado = await getDocs(consulta);
      setEventos(resultado.docs.map(normalizarDocumentoEvento));
    } catch (error) {
      mostrarFeedback("Não foi possível carregar os eventos do banco.", "erro");
    } finally {
      setCarregandoEventos(false);
    }
  }, [mostrarFeedback]);

  const carregarConfiguracoesEventos = useCallback(async () => {
    try {
      const documento = await getDoc(configuracoesEventosDoc);

      if (documento.exists()) {
        setConfiguracoesEventos(normalizarConfiguracoesEventos(documento.data()));
      } else {
        setConfiguracoesEventos(CONFIG_EVENTOS_PADRAO);
      }
    } catch (error) {
      mostrarFeedback("Não foi possível carregar as configurações de eventos.", "erro");
    }
  }, [mostrarFeedback]);

  useEffect(() => {
    carregarConfiguracoesEventos();
    carregarEventos();
  }, [carregarConfiguracoesEventos, carregarEventos]);

  async function adicionarEvento(dadosEvento) {
    const novoEvento = {
      ...criarEventoVazio(dadosEvento),
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    };

    const referencia = await addDoc(eventosCollection, novoEvento);
    const eventoCriado = normalizarEvento({
      ...novoEvento,
      id: referencia.id,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    });

    setEventos((listaAtual) => [...listaAtual, eventoCriado].sort((a, b) => String(a.data || "").localeCompare(String(b.data || ""))));
    selecionarEvento(eventoCriado.id);

    return eventoCriado;
  }

  async function salvarEvento(eventoId, alteracoes) {
    const patch = {
      ...alteracoes,
      atualizadoEm: serverTimestamp(),
    };

    await setDoc(doc(db, "eventos", String(eventoId)), patch, { merge: true });

    setEventos((listaAtual) =>
      listaAtual.map((evento) =>
        String(evento.id) === String(eventoId)
          ? normalizarEvento({ ...evento, ...alteracoes, atualizadoEm: new Date().toISOString() })
          : evento,
      ),
    );
  }

  async function deletarEvento(eventoId) {
    await deleteDoc(doc(db, "eventos", String(eventoId)));
    setEventos((listaAtual) => listaAtual.filter((evento) => String(evento.id) !== String(eventoId)));
  }

  async function atualizarEventoPorFuncao(eventoId, montarAlteracoes) {
    const eventoAtual = eventos.find((evento) => String(evento.id) === String(eventoId));
    if (!eventoAtual) throw new Error("Evento não encontrado.");

    const alteracoes = montarAlteracoes(eventoAtual);
    await salvarEvento(eventoId, alteracoes);
    return normalizarEvento({ ...eventoAtual, ...alteracoes });
  }

  async function alternarCategoriaEvento(eventoId, categoriaId) {
    return atualizarEventoPorFuncao(eventoId, (evento) => {
      const categoriasAtivas = evento.categoriasAtivas || [];
      const ativa = categoriasAtivas.includes(categoriaId);

      return {
        categoriasAtivas: ativa
          ? categoriasAtivas.filter((id) => id !== categoriaId)
          : [...categoriasAtivas, categoriaId],
      };
    });
  }

  async function adicionarCusto(eventoId, dadosCusto) {
    return atualizarEventoPorFuncao(eventoId, (evento) => ({
      custos: [
        ...(evento.custos || []),
        criarItemComId({
          ...dadosCusto,
          valor: Number(dadosCusto.valor) || 0,
          criadoEm: new Date().toISOString(),
        }),
      ],
    }));
  }

  async function atualizarCusto(eventoId, custoId, alteracoes) {
    return atualizarEventoPorFuncao(eventoId, (evento) => ({
      custos: (evento.custos || []).map((custo) =>
        String(custo.id) === String(custoId)
          ? { ...custo, ...alteracoes, valor: Number(alteracoes.valor ?? custo.valor) || 0 }
          : custo,
      ),
    }));
  }

  async function deletarCusto(eventoId, custoId) {
    return atualizarEventoPorFuncao(eventoId, (evento) => ({
      custos: (evento.custos || []).filter((custo) => String(custo.id) !== String(custoId)),
    }));
  }

  async function adicionarEnvolvido(eventoId, envolvido) {
    return atualizarEventoPorFuncao(eventoId, (evento) => ({
      envolvidos: [
        ...(evento.envolvidos || []),
        criarItemComId({
          nome: envolvido.nome,
          papel: envolvido.papel,
          contato: envolvido.contato,
          observacoes: envolvido.observacoes,
        }),
      ],
    }));
  }

  async function atualizarEnvolvido(eventoId, envolvidoId, alteracoes) {
    return atualizarEventoPorFuncao(eventoId, (evento) => ({
      envolvidos: (evento.envolvidos || []).map((envolvido) =>
        String(envolvido.id) === String(envolvidoId) ? { ...envolvido, ...alteracoes } : envolvido,
      ),
    }));
  }

  async function removerEnvolvido(eventoId, envolvidoId) {
    return atualizarEventoPorFuncao(eventoId, (evento) => ({
      envolvidos: (evento.envolvidos || []).filter((envolvido) => String(envolvido.id) !== String(envolvidoId)),
    }));
  }

  async function adicionarTarefa(eventoId, tarefa) {
    return atualizarEventoPorFuncao(eventoId, (evento) => ({
      tarefas: [
        ...(evento.tarefas || []),
        criarItemComId({
          titulo: tarefa.titulo,
          responsavel: tarefa.responsavel,
          prazo: tarefa.prazo,
          status: tarefa.status || "pendente",
          observacoes: tarefa.observacoes || "",
        }),
      ],
    }));
  }

  async function atualizarTarefa(eventoId, tarefaId, alteracoes) {
    return atualizarEventoPorFuncao(eventoId, (evento) => ({
      tarefas: (evento.tarefas || []).map((tarefa) =>
        String(tarefa.id) === String(tarefaId) ? { ...tarefa, ...alteracoes } : tarefa,
      ),
    }));
  }

  async function deletarTarefa(eventoId, tarefaId) {
    return atualizarEventoPorFuncao(eventoId, (evento) => ({
      tarefas: (evento.tarefas || []).filter((tarefa) => String(tarefa.id) !== String(tarefaId)),
    }));
  }

  async function concluirEvento(eventoId) {
    await salvarEvento(eventoId, {
      status: "concluido",
      concluidoEm: new Date().toISOString(),
      arquivado: false,
    });
  }

  async function arquivarEvento(eventoId) {
    await salvarEvento(eventoId, {
      status: "arquivado",
      arquivado: true,
      concluidoEm: new Date().toISOString(),
      arquivadoEm: new Date().toISOString(),
    });
  }

  async function reabrirEvento(eventoId) {
    await salvarEvento(eventoId, {
      status: "planejamento",
      arquivado: false,
      arquivadoEm: "",
      concluidoEm: "",
    });
  }

  async function salvarConfiguracoesEventos(novasConfiguracoes) {
    const configuracoes = normalizarConfiguracoesEventos(novasConfiguracoes);

    await setDoc(
      configuracoesEventosDoc,
      {
        ...configuracoes,
        atualizadoEm: serverTimestamp(),
      },
      { merge: true },
    );

    setConfiguracoesEventos(configuracoes);
  }

  const eventosAtivos = useMemo(
    () => eventos.filter((evento) => !evento.arquivado),
    [eventos],
  );

  const eventosArquivados = useMemo(
    () => eventos.filter((evento) => evento.arquivado),
    [eventos],
  );

  const eventoSelecionado = useMemo(
    () => eventos.find((evento) => String(evento.id) === String(eventoSelecionadoId)) || null,
    [eventoSelecionadoId, eventos],
  );

  const valor = useMemo(
    () => ({
      eventos,
      eventosAtivos,
      eventosArquivados,
      eventoSelecionado,
      eventoSelecionadoId,
      carregandoEventos,
      configuracoesEventos,
      periodoAtual: new Date().getFullYear(),
      anoLetivoAtual: new Date().getFullYear(),
      carregarEventos,
      carregarConfiguracoesEventos,
      selecionarEvento,
      adicionarEvento,
      salvarEvento,
      deletarEvento,
      alternarCategoriaEvento,
      adicionarCusto,
      atualizarCusto,
      deletarCusto,
      adicionarEnvolvido,
      atualizarEnvolvido,
      removerEnvolvido,
      adicionarTarefa,
      atualizarTarefa,
      deletarTarefa,
      concluirEvento,
      arquivarEvento,
      reabrirEvento,
      salvarConfiguracoesEventos,
    }),
    [
      carregandoEventos,
      configuracoesEventos,
      eventos,
      eventosArquivados,
      eventosAtivos,
      eventoSelecionado,
      eventoSelecionadoId,
      carregarEventos,
      carregarConfiguracoesEventos,
      selecionarEvento,
    ],
  );

  return <SchoolDataContext.Provider value={valor}>{children}</SchoolDataContext.Provider>;
}

export function useSchoolData() {
  const contexto = useContext(SchoolDataContext);

  if (!contexto) {
    throw new Error("useSchoolData precisa estar dentro de SchoolDataProvider.");
  }

  return contexto;
}
