import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { InlineAlert } from "../../components/ui/InlineAlert";
import { LoadingOverlay } from "../../components/ui/LoadingOverlay";
import { PageHeader } from "../../components/ui/PageHeader";
import { getEventPath } from "../../constants/routes";
import { useEvents } from "../../hooks/useEvents";
import { formatTime, toDate } from "../../utils/formatters";

const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric"
});

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const getMonthDays = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
};

const getDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const { events, isLoading, error } = useEvents();
  const navigate = useNavigate();

  const days = useMemo(() => getMonthDays(currentMonth), [currentMonth]);

  const eventsByDate = useMemo(
    () =>
      events.reduce((groups, event) => {
        const date = toDate(event.startDateTime);

        if (!date || event.archived) {
          return groups;
        }

        const key = getDateKey(date);
        groups[key] = groups[key] || [];
        groups[key].push(event);
        return groups;
      }, {}),
    [events]
  );

  const changeMonth = (amount) => {
    setCurrentMonth((current) => {
      const next = new Date(current);
      next.setMonth(current.getMonth() + amount);
      return next;
    });
  };

  return (
    <section className="page-stack">
      <PageHeader
        title="Calendário"
        description="Visualização temporal dos eventos e compromissos relevantes."
        actions={
          <div className="button-group">
            <Button variant="secondary" onClick={() => changeMonth(-1)}>
              Mês anterior
            </Button>
            <Button variant="secondary" onClick={() => changeMonth(1)}>
              Próximo mês
            </Button>
          </div>
        }
      />

      {error ? <InlineAlert tone="danger">{error}</InlineAlert> : null}

      <Card className="calendar-card">
        <div className="calendar-card__header">
          <h2>{monthFormatter.format(currentMonth)}</h2>
          <Button variant="ghost" onClick={() => setCurrentMonth(new Date())}>
            Hoje
          </Button>
        </div>

        {isLoading ? (
          <LoadingOverlay isVisible inline message="Carregando calendário..." />
        ) : (
          <div className="calendar-grid" role="grid" aria-label="Calendário mensal">
            {weekDays.map((day) => (
              <div className="calendar-grid__weekday" key={day}>
                {day}
              </div>
            ))}
            {days.map((day) => {
              const key = getDateKey(day);
              const dayEvents = eventsByDate[key] || [];
              const isOutsideMonth = day.getMonth() !== currentMonth.getMonth();
              const isToday = getDateKey(day) === getDateKey(new Date());

              return (
                <div
                  className={[
                    "calendar-day",
                    isOutsideMonth ? "calendar-day--muted" : "",
                    isToday ? "calendar-day--today" : ""
                  ].join(" ")}
                  key={key}
                >
                  <span className="calendar-day__number">{day.getDate()}</span>
                  <div className="calendar-day__events">
                    {dayEvents.slice(0, 3).map((event) => (
                      <button
                        type="button"
                        key={event.id}
                        onClick={() => navigate(getEventPath(event.id))}
                      >
                        <strong>{formatTime(event.startDateTime)}</strong>
                        <span>{event.name}</span>
                      </button>
                    ))}
                    {dayEvents.length > 3 ? (
                      <small>+{dayEvents.length - 3} evento(s)</small>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </section>
  );
};
