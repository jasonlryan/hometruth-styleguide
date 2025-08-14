interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export default function SectionHeader({
  title,
  subtitle,
  centered = true,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`mb-16 ${centered ? "text-center" : ""} ${className}`}>
      <h2 className="text-3xl lg:text-4xl text-black mb-4 font-gill-sans-light">
        {title}
      </h2>
      {subtitle && (
        <p className="text-xl text-gray-600 max-w-2xl mx-auto font-gill-sans-light">
          {subtitle}
        </p>
      )}
    </div>
  );
}
