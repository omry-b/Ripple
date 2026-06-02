type PageHeaderProps = {
  title: string;
  subtitle?: string;
  kicker?: string;
};

export function PageHeader({ title, subtitle, kicker = "Ripple intelligence" }: PageHeaderProps) {
  return (
    <header className="page-header">
      <p className="page-header-kicker">{kicker}</p>
      <h1 className="page-header-title">{title}</h1>
      {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
    </header>
  );
}
