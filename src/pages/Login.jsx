import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "../firebase/config";
import fundoLogin from "../assets/fundo.jpg";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [continuarSessao, setContinuarSessao] = useState(true);
  const [usuarioAtual, setUsuarioAtual] = useState(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);
  const [entrando, setEntrando] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setPersistence(
      auth,
      continuarSessao ? browserLocalPersistence : browserSessionPersistence,
    ).catch(() => {});
  }, [continuarSessao]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usuario) => {
      setUsuarioAtual(usuario);
      setCarregandoSessao(false);
    });

    return () => unsubscribe();
  }, []);

  const tratarErroLogin = (erro) => {
    const codigo = erro?.code || "";

    if (
      codigo.includes("invalid-credential") ||
      codigo.includes("wrong-password") ||
      codigo.includes("user-not-found")
    ) {
      return "E-mail ou senha inválidos. Verifique os dados e tente novamente.";
    }

    if (codigo.includes("too-many-requests")) {
      return "Muitas tentativas em sequência. Aguarde um pouco antes de tentar novamente.";
    }

    if (codigo.includes("network-request-failed")) {
      return "Não foi possível conectar agora. Verifique a internet e tente novamente.";
    }

    return "Não foi possível entrar no sistema. Tente novamente.";
  };

  const entrar = async (event) => {
    event.preventDefault();
    setFeedback(null);

    if (!email.trim() || !senha.trim()) {
      setFeedback("Informe o e-mail e a senha para acessar o sistema.");
      return;
    }

    try {
      setEntrando(true);
      await setPersistence(
        auth,
        continuarSessao ? browserLocalPersistence : browserSessionPersistence,
      );
      await signInWithEmailAndPassword(auth, email.trim(), senha);
      navigate("/inicio");
    } catch (erro) {
      setFeedback(tratarErroLogin(erro));
    } finally {
      setEntrando(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-shell">
        <div
          className="login-institutional"
          style={{
            backgroundImage:
              `linear-gradient(145deg, rgba(45, 16, 91, 0.94) 0%, rgba(109, 40, 217, 0.78) 52%, rgba(168, 85, 247, 0.66) 100%), url(${fundoLogin})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="login-brand">
            <div className="login-emblem">GE</div>

            <div>
              <span>Sistema de Gestão</span>
              <h1>Eventos</h1>
            </div>
          </div>

          <div className="login-copy">
            <span className="pill light">Controle financeiro</span>
            <h2>Gerenciador de Eventos</h2>
            <p>
              Planeje eventos, registre custos, acompanhe orçamento, guarde comprovantes e
              arquive tudo para consulta futura.
            </p>
          </div>

          <div className="login-stats">
            <div>
              <strong>∞</strong>
              <span>Eventos</span>
            </div>
            <div>
              <strong>R$</strong>
              <span>Custos</span>
            </div>
            <div>
              <strong>PDF</strong>
              <span>Relatórios</span>
            </div>
          </div>
        </div>

        <div className="login-panel">
          <div className="login-header">
            <span className="pill">Acesso restrito</span>
            <h2>Entrar no sistema</h2>
            <p>Use suas credenciais institucionais para continuar.</p>
          </div>

          {usuarioAtual && !carregandoSessao && (
            <div className="session-card">
              <div>
                <strong>Sessão ativa</strong>
                <span>{usuarioAtual.email}</span>
              </div>

              <button type="button" className="button primary" onClick={() => navigate("/inicio")}>
                Continuar
              </button>
            </div>
          )}

          <form className="form-stack" onSubmit={entrar}>
            <label className="field-group">
              <span>E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seu.email@dominio.com"
                autoComplete="email"
                disabled={entrando}
              />
            </label>

            <label className="field-group">
              <span>Senha</span>
              <input
                type="password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                placeholder="Digite sua senha"
                autoComplete="current-password"
                disabled={entrando}
              />
            </label>

            <label className="session-option">
              <input
                type="checkbox"
                checked={continuarSessao}
                onChange={(event) => setContinuarSessao(event.target.checked)}
                disabled={entrando}
              />

              <div>
                <strong>Continuar sessão neste navegador</strong>
                <span>Assim você não precisa entrar de novo no mesmo aparelho.</span>
              </div>
            </label>

            {feedback && (
              <div className="feedback-error">
                <strong>Acesso não realizado</strong>
                <span>{feedback}</span>
              </div>
            )}

            <button type="submit" className="button primary large" disabled={entrando}>
              {entrando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <footer className="login-footer">
            Uso exclusivo da equipe responsável pela organização de eventos.
          </footer>
        </div>
      </section>
    </main>
  );
}
