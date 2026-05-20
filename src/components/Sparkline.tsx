interface Props {
  data: number[];
  positive?: boolean;
  height?: number;
  width?: number;
}

export default function Sparkline({ data, positive, height = 36, width = 120 }: Props) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const isPos = positive ?? data[data.length - 1] >= data[0];
  const stroke = isPos ? '#16c784' : '#ea3943';
  const fill = isPos ? 'rgba(22,199,132,0.18)' : 'rgba(234,57,67,0.18)';

  return (
    <svg width={width} height={height}>
      <polyline points={`0,${height} ${points} ${width},${height}`} fill={fill} stroke="none" />
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="1.5" />
    </svg>
  );
}
