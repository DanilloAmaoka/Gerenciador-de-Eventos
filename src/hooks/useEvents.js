import { useCallback, useEffect, useMemo, useState } from "react";
import { listEvents } from "../services/eventsService";
import { normalizeText, sortByDate, toDate } from "../utils/formatters";

export const useEvents = ({ includeArchived = false } = {}) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await listEvents({ includeArchived });
      setEvents(sortByDate(data));
    } catch {
      setError("Não foi possível carregar os eventos. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, [includeArchived]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter((event) => {
        const date = toDate(event.startDateTime);
        return date && date >= now && !event.archived;
      })
      .slice(0, 6);
  }, [events]);

  const searchEvents = useCallback(
    ({ search = "", status = "", responsible = "", location = "" }) => {
      const normalizedSearch = normalizeText(search);

      return events.filter((event) => {
        const searchableText = normalizeText(
          [
            event.name,
            event.description,
            event.locationName,
            event.primaryResponsible,
            event.status
          ].join(" ")
        );

        return (
          (!normalizedSearch || searchableText.includes(normalizedSearch)) &&
          (!status || event.status === status) &&
          (!responsible ||
            normalizeText(event.primaryResponsible).includes(normalizeText(responsible))) &&
          (!location || normalizeText(event.locationName).includes(normalizeText(location)))
        );
      });
    },
    [events]
  );

  return {
    events,
    upcomingEvents,
    isLoading,
    error,
    loadEvents,
    searchEvents
  };
};
