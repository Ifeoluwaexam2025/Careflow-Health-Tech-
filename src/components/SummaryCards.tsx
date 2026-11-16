import type { CareFlowData } from "../types/CareFlowData";
import { getDashboardSummary } from "../logic/getDashboardSummary";
import { Icon } from "./Icon";

export function SummaryCards({ data }: { data: CareFlowData }) {
  const summary = getDashboardSummary(data);
  const cards = [
    {
      label: "Total patients",
      value: summary.patients,
      icon: "people" as const,
      caption: "Fictional records",
      href: "#/patients",
      color: "blue",
    },
    {
      label: "Pending tasks",
      value: summary.pending,
      icon: "tasks" as const,
      caption: `${summary.overdue} overdue`,
      href: "#/tasks?status=pending",
      color: "amber",
    },
    {
      label: "Completed tasks",
      value: summary.completed,
      icon: "check" as const,
      caption: "Across your workspace",
      href: "#/tasks?status=completed",
      color: "teal",
    },
    {
      label: "Due today",
      value: summary.dueToday,
      icon: "calendar" as const,
      caption: "Pending · local calendar day",
      href: "#/tasks?status=pending&due=today",
      color: "violet",
    },
  ];
  return (
    <div className="summary-grid">
      {cards.map((card) => (
        <a key={card.label} className="summary-card" href={card.href}>
          <div className="summary-top">
            <span>{card.label}</span>
            <span className={`summary-icon ${card.color}`}>
              <Icon name={card.icon} />
            </span>
          </div>
          <strong>{card.value}</strong>
          <span className="summary-caption">
            {card.caption}
            <Icon name="arrow" size={15} />
          </span>
        </a>
      ))}
    </div>
  );
}
