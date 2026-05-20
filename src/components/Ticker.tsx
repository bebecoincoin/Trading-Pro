import { useEffect, useState } from 'react';
import { fmtCurrency, fmtPct, pctColor } from '@/lib/format';
import clsx from 'clsx';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
}

export default function Ticker() {
  const [coins, setCoins] = useState<Coin[]>([]);

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      const r = await window.tradingPro.markets.cryptoTop(20);
      if (!cancel && r?.ok) setCoins(r.data);
    };
    load();
    const i = setInterval(load, 30000);
    return () => {
      cancel = true;
      clearInterval(i);
    };
  }, []);

  if (!coins.length) return null;

  const row = (key: string) => (
    <div className="flex items-center gap-8 px-2" key={key}>
      {coins.map((c) => (
        <div key={`${key}-${c.id}`} className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-text-dim uppercase font-semibold text-[11px]">{c.symbol}</span>
          <span className="font-mono text-sm">{fmtCurrency(c.current_price)}</span>
          <span
            className={clsx('text-xs font-semibold', pctColor(c.price_change_percentage_24h))}
          >
            {fmtPct(c.price_change_percentage_24h)}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="border-b border-bg-border bg-bg-soft/40 overflow-hidden">
      <div className="flex animate-ticker py-1.5">
        {row('a')}
        {row('b')}
      </div>
    </div>
  );
}
