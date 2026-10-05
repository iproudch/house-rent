type SectionCardProps = {
  title: string;
  children: React.ReactNode;
  badge?: string;
  badgeClass?: string;
  aside?: React.ReactNode;
  className?: string;
}

export default function SectionCard(props: SectionCardProps) {
const {title, children, className, badge, badgeClass, aside} = props

  return (
    <div className={`bg-white border border-line rounded-2xl px-7 py-6 card-shadow fade-up ${className}`}>
      {badge ? (
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className={`w-[34px] h-[34px] rounded-[9px] flex items-center justify-center text-[13px] font-bold ${badgeClass}`}
            >
              {badge}
            </div>
            <h2 className="text-base font-semibold">{title}</h2>
          </div>
          {aside}
        </div>
      ) : (
        <h2 className="text-[15px] font-semibold text-center text-primary-label mb-5">{title}</h2>
      )}
      {children}
    </div>
  );
}

