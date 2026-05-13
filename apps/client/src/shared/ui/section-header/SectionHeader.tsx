interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
}

export function SectionHeader({ title, subtitle, actionLabel }: SectionHeaderProps) {
  return (
    <div className="section-header">
      <div>
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {actionLabel ? (
        <button className="ui-btn ui-btn-outline" type="button">
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
