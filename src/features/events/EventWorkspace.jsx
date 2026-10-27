import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { getEvent } from "../../services/eventsService";
import { Button } from "../../components/ui/Button";
import { InlineAlert } from "../../components/ui/InlineAlert";
import { LoadingOverlay } from "../../components/ui/LoadingOverlay";
import { EventPlanningPanel } from "./EventPlanningPanel";

export const EventWorkspace = () => {
  const { eventId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const routeSuffix = (() => {
    const suffix = location.pathname.replace(`${ROUTES.events}/${eventId}`, "").replace(/^\//, "");
    return suffix;
  })();

  const loadEvent = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await getEvent(eventId);

      if (!data) {
        setError("Evento não encontrado.");
      }

      setEvent(data);
    } catch {
      setError("Não foi possível carregar o evento. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  useEffect(() => {
    if (routeSuffix) {
      navigate(`${ROUTES.events}/${eventId}`, { replace: true });
    }
  }, [eventId, navigate, routeSuffix]);

  if (isLoading) {
    return <LoadingOverlay isVisible inline message="Carregando evento..." />;
  }

  if (error) {
    return (
      <section className="section-stack">
        <InlineAlert tone="danger">{error}</InlineAlert>
        <Button variant="secondary" onClick={() => navigate(ROUTES.events)}>
          Voltar para eventos
        </Button>
      </section>
    );
  }

  return (
    <EventPlanningPanel event={event} onEventUpdated={loadEvent} />
  );
};
