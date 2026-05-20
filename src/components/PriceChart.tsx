import { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, LineStyle } from 'lightweight-charts';

interface PricePoint {
  time: number; // ms epoch
  value: number;
}

interface Props {
  data: PricePoint[];
  height?: number;
  fillUp?: string;
  lineColor?: string;
}

export default function PriceChart({
  data,
  height = 360,
  fillUp = 'rgba(34,211,238,0.25)',
  lineColor = '#22d3ee',
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const chart = createChart(ref.current, {
      width: ref.current.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#8a91a3',
        fontFamily: 'Inter, sans-serif',
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.04)' },
        horzLines: { color: 'rgba(255,255,255,0.04)' },
      },
      rightPriceScale: {
        borderColor: '#1f2533',
      },
      timeScale: {
        borderColor: '#1f2533',
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: {
          color: 'rgba(34,211,238,0.5)',
          style: LineStyle.Dashed,
          width: 1,
        },
        horzLine: {
          color: 'rgba(34,211,238,0.5)',
          style: LineStyle.Dashed,
        },
      },
    });
    chartRef.current = chart;

    const series = chart.addAreaSeries({
      lineColor,
      topColor: fillUp,
      bottomColor: 'rgba(34,211,238,0)',
      lineWidth: 2,
    });
    seriesRef.current = series;

    const ro = new ResizeObserver(() => {
      if (ref.current) chart.applyOptions({ width: ref.current.clientWidth });
    });
    ro.observe(ref.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [height, fillUp, lineColor]);

  useEffect(() => {
    if (!seriesRef.current) return;
    const formatted = data
      .map((d) => ({ time: Math.floor(d.time / 1000) as any, value: d.value }))
      .sort((a, b) => (a.time as number) - (b.time as number));
    seriesRef.current.setData(formatted);
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  return <div ref={ref} style={{ width: '100%', height }} />;
}
