import { useCallback, useEffect, useMemo, useState } from "react";
import { RECORD_CONFIGS } from "../constants/recordConfigs";
import { listEventRecords } from "../services/eventRecordsService";

export const useEventRecords = (eventId, recordType) => {
  const config = RECORD_CONFIGS[recordType];
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRecords = useCallback(async () => {
    if (!eventId || !config) {
      setRecords([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await listEventRecords(config.collection, eventId);
      setRecords(data);
    } catch {
      setError("Não foi possível carregar os registros desta área.");
    } finally {
      setIsLoading(false);
    }
  }, [config, eventId]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const sortedRecords = useMemo(() => {
    if (recordType === "schedule") {
      return [...records].sort((first, second) =>
        String(first.startTime || "").localeCompare(String(second.startTime || ""))
      );
    }

    if (recordType === "history") {
      return [...records].sort((first, second) =>
        String(second.date || "").localeCompare(String(first.date || ""))
      );
    }

    return records;
  }, [recordType, records]);

  return {
    records: sortedRecords,
    isLoading,
    error,
    loadRecords
  };
};
