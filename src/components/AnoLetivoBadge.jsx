import { useSchoolData } from "../context/SchoolDataContext";

export default function AnoLetivoBadge() {
  const { periodoAtual } = useSchoolData();

  return (
    <div className="year-badge" data-tour="ano-letivo-atual">
      <span>Período atual</span>
      <strong>{periodoAtual}</strong>
    </div>
  );
}
