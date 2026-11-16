import type { ReactNode } from "react";
import { Icon } from "./Icon";
import type { IconName } from "./Icon";

export function EmptyState({
  title,
  description,
  icon = "tasks",
  children,
}: {
  title: string;
  description: string;
  icon?: IconName;
  children?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon name={icon} size={28} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}
