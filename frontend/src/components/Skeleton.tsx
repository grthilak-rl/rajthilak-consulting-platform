import './Skeleton.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  variant?: 'text' | 'circle' | 'rounded';
  className?: string;
  style?: React.CSSProperties;
}

export default function Skeleton({
  width = '100%',
  height = '16px',
  borderRadius,
  variant = 'text',
  className = '',
  style,
}: SkeletonProps) {
  const variantClass = variant === 'circle'
    ? 'skeleton--circle'
    : variant === 'rounded'
    ? 'skeleton--rounded'
    : '';

  return (
    <div
      className={`skeleton ${variantClass} ${className}`.trim()}
      style={{
        width,
        height,
        ...(borderRadius !== undefined ? { borderRadius } : {}),
        ...style,
      }}
      aria-hidden="true"
    />
  );
}
