type Props = { className?: string; light?: boolean };

export default function Signature({ className = "", light = false }: Props) {
  const gold = light ? "bg-white/30" : "bg-gold-500/30";
  const text = light ? "text-white/50" : "text-gold-500";
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className={`flex-1 h-px ${gold}`} />
      <span className={`${text} text-[10px] tracking-[0.5em] font-semibold select-none`}>
        · 1992 ·
      </span>
      <div className={`flex-1 h-px ${gold}`} />
    </div>
  );
}
