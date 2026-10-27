import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ROUTES } from "../../constants/routes";

export const AccessDeniedPage = () => {
  const navigate = useNavigate();

  return (
    <main className="center-page">
      <Card className="center-card">
        <span className="center-card__code">403</span>
        <h1>Acesso negado</h1>
        <p>Seu perfil não possui permissão para acessar esta área administrativa.</p>
        <Button onClick={() => navigate(ROUTES.home)}>
          Voltar ao início
        </Button>
      </Card>
    </main>
  );
};
