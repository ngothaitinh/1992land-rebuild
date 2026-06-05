type Props = { size?: number; className?: string };

export default function MessengerIcon({ size = 20, className }: Props) {
  return (
    <img
      src="/images/messenger-icon.svg"
      alt="Messenger"
      width={size}
      height={size}
      className={className}
      style={{ display: "inline-block", flexShrink: 0 }}
    />
  );
}
