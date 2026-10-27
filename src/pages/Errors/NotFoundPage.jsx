import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ROUTES } from "../../constants/routes";

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <main className="center-page">
      <Card className="center-card">
        <span className="center-card__code">404</span>
        <h1>Página não encontrada</h1>
        <p>A rota acessada não existe ou foi removida.</p>
        <Button onClick={() => navigate(ROUTES.home)}>
          Voltar ao início
        </Button>
      </Card>
    </main>
  );
};
