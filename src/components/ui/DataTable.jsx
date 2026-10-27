import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { StatusBadge } from "./StatusBadge";
import { getDisplayValue, getStatusTone } from "../../utils/records";

export const DataTable = ({
  columns,
  rows,
  emptyTitle = "Nenhum registro encontrado",
  emptyMessage,
  onEdit,
  onDelete,
  getRowHref
}) => {
  if (!rows.length) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
            {(onEdit || onDelete || getRowHref) && <th>Ações</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => {
                const value = getDisplayValue(row, column);

                return (
                  <td key={column.key} data-label={column.label}>
                    {column.type === "status" ? (
                      <StatusBadge
                        value={row[column.key]}
                        options={column.options}
                        tone={getStatusTone(row[column.key], column.options)}
                      />
                    ) : column.type === "link" && row[column.key] ? (
                      <a href={row[column.key]} target="_blank" rel="noreferrer">
                        Abrir link
                      </a>
                    ) : (
                      value
                    )}
                  </td>
                );
              })}
              {(onEdit || onDelete || getRowHref) && (
                <td data-label="Ações">
                  <div className="table-actions">
                    {getRowHref ? (
                      <Button variant="secondary" size="sm" onClick={() => getRowHref(row)}>
                        Abrir
                      </Button>
                    ) : null}
                    {onEdit ? (
                      <Button variant="ghost" size="sm" onClick={() => onEdit(row)}>
                        Editar
                      </Button>
                    ) : null}
                    {onDelete ? (
                      <Button variant="danger-ghost" size="sm" onClick={() => onDelete(row)}>
                        Remover
                      </Button>
                    ) : null}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
