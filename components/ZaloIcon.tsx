type Props = { size?: number; className?: string };

export default function ZaloIcon({ size = 20, className }: Props) {
  return (
    <img
      src="/images/zalo-icon.svg"
      alt="Zalo"
      width={size}
      height={size}
      className={className}
      style={{ display: "inline-block", flexShrink: 0 }}
    />
  );
}
