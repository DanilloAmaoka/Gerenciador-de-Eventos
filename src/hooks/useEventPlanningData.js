import { useCallback, useEffect, useMemo, useState } from "react";
import { PLANNING_SECTIONS } from "../constants/planningSections";
import { listEventRecords } from "../services/eventRecordsService";
import { calculateEventFinancials } from "../utils/eventFinancials";

const sortRecords = (sectionId, records) => {
  if (sectionId === "schedule") {
    return [...records].sort((first, second) =>
      String(first.startTime || "").localeCompare(String(second.startTime || ""))
    );
  }

  if (sectionId === "notes") {
    return [...records].sort((first, second) =>
      String(second.date || "").localeCompare(String(first.date || ""))
    );
  }

  return records;
};

export const useEventPlanningData = (eventId, budgetLimit = 0) => {
  const [recordsBySection, setRecordsBySection] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPlanningData = useCallback(async () => {
    if (!eventId) {
      setRecordsBySection({});
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const entries = await Promise.all(
        PLANNING_SECTIONS.map(async (section) => {
          const records = await listEventRecords(section.collection, eventId);
          return [section.id, sortRecords(section.id, records)];
        })
      );

      setRecordsBySection(Object.fromEntries(entries));
    } catch {
      setError("Não foi possível carregar o planejamento deste evento.");
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadPlanningData();
  }, [loadPlanningData]);

  const financials = useMemo(
    () => calculateEventFinancials(recordsBySection, budgetLimit),
    [budgetLimit, recordsBySection]
  );

  return {
    recordsBySection,
    isLoading,
    error,
    financials,
    loadPlanningData
  };
};
