import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { InlineAlert } from "../../components/ui/InlineAlert";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../contexts/AuthContext";
import { useFeedback } from "../../contexts/FeedbackContext";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, resetPassword } = useAuth();
  const { showToast } = useFeedback();

  const submitLogin = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login({ email, password });
      const destination = location.state?.from?.pathname || ROUTES.home;
      navigate(destination, { replace: true });
    } catch {
      setError("Credenciais inválidas ou acesso indisponível. Confira os dados e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const requestReset = async () => {
    if (!email.trim()) {
      setError("Informe seu e-mail para solicitar a recuperação de senha.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await resetPassword(email);
      showToast({
        tone: "info",
        title: "Verifique seu e-mail",
        message: "Se houver uma conta vinculada, as instruções serão enviadas."
      });
    } catch {
      setError("Não foi possível enviar a recuperação agora. Tente novamente em alguns instantes.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-panel__brand">
          <div className="brand-mark brand-mark--large" aria-hidden="true">
            PI
          </div>
          <div>
            <p>Escola Municipal Cívico-Militar</p>
            <h1>Princesa Isabel</h1>
          </div>
        </div>
        <p>
          Ambiente interno para planejar, acompanhar e organizar eventos escolares com
          clareza e segurança.
        </p>
      </section>

      <Card className="login-card">
        <div className="card-heading">
          <div>
            <h2>Acessar sistema</h2>
            <p>Use suas credenciais autorizadas.</p>
          </div>
        </div>

        {error ? <InlineAlert tone="danger">{error}</InlineAlert> : null}

        <form className="login-form" onSubmit={submitLogin}>
          <label className="form-field" htmlFor="email">
            <span className="form-field__label">E-mail</span>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="form-field" htmlFor="password">
            <span className="form-field__label">Senha</span>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <Button type="submit" isLoading={isLoading}>
            Entrar
          </Button>
          <Button type="button" variant="ghost" onClick={requestReset} disabled={isLoading}>
            Recuperar senha
          </Button>
        </form>
      </Card>
    </main>
  );
};
