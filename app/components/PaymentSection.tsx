'use client';

import { useMemo, useState } from 'react';
import { cn } from './ui/utils';
import { Input } from './ui/input';
import { Label } from './ui/label';

type PaymentMethod = 'card' | 'sbp' | 'installment';

type CardData = {
number: string;
holder: string;
expiry: string;
cvc: string;
};

export function PaymentSection({
total = 47000,
email,
onEmailChange,
}: {
total?: number;
email: string;
onEmailChange: (v: string) => void;
}) {
const [method, setMethod] = useState<PaymentMethod>('card');

const [cardData, setCardData] = useState<CardData>({
number: '',
holder: '',
expiry: '',
cvc: '',
});

const formattedTotal = useMemo(() => total.toLocaleString('ru-RU'), [total]);

return (
<section className="relative">
<div className="rounded-[28px] bg-[#0b0f14] border border-white/10 p-6 min-[1024px]:p-8 text-white">
<div className="flex items-center gap-3 mb-6">
<div className="h-8 w-8 rounded-xl bg-white/10" />
<h3 className="text-lg font-medium">Способ оплаты</h3>
</div>

{/* === CARD METHOD ONLY === */}
{method === 'card' && (
<div className="grid grid-cols-1 gap-6 min-[1024px]:grid-cols-12 min-[1024px]:items-start">
{/* Card left */}
<div className="min-[1024px]:col-span-7">
<div
className={cn(
'relative w-full aspect-[1.586/1] rounded-[22px] shadow-2xl bg-white border border-black/5 text-black overflow-hidden',
// make card less “gromozdky” only on desktop
'p-6 min-[1024px]:p-5',
)}
>
{/* Chip */}
<div className="absolute top-6 left-6 w-12 h-10 rounded bg-gradient-to-br from-yellow-300/80 to-yellow-500/80 backdrop-blur" />

{/* Network logo */}
<div className="absolute top-6 right-6 flex gap-2">
<div className="w-8 h-8 rounded-full bg-black/5 border border-black/10" />
<div className="w-8 h-8 rounded-full bg-black/10 border border-black/10 -ml-4" />
</div>

{/* Card number */}
<div className="absolute left-6 right-6 top-16 min-[1024px]:top-auto min-[1024px]:bottom-[78px]">
<input
type="text"
className="w-full bg-transparent border-none text-black text-xl min-[1024px]:text-[18px] tracking-[0.2em] placeholder:text-black/40 focus:outline-none font-mono"
placeholder="0000 0000 0000 0000"
value={cardData.number}
onChange={(e) => {
const value = e.target.value
.replace(/\s/g, '')
.replace(/(\d{4})/g, '$1 ')
.trim();
setCardData((p) => ({ ...p, number: value }));
}}
maxLength={19}
inputMode="numeric"
/>
</div>

{/* Holder + expiry */}
<div className="absolute bottom-8 left-6 right-6 flex justify-between items-end">
<div className="flex-1 min-w-0 mr-4">
<input
type="text"
className="w-full bg-transparent border-none text-black text-sm placeholder:text-black/40 focus:outline-none uppercase"
placeholder="IVAN IVANOV"
value={cardData.holder}
onChange={(e) => {
const value = e.target.value.toUpperCase().replace(/[^A-Z\s]/g, '');
setCardData((p) => ({ ...p, holder: value }));
}}
/>
<div className="text-[10px] text-black/50 mt-1 uppercase tracking-wide">
Держатель карты
</div>
</div>

<div className="flex-shrink-0">
<input
type="text"
className="w-16 bg-transparent border-none text-black text-sm text-right placeholder:text-black/40 focus:outline-none font-mono"
placeholder="MM/ГГ"
value={cardData.expiry}
onChange={(e) => {
let value = e.target.value.replace(/\D/g, '');
if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2, 4);
setCardData((p) => ({ ...p, expiry: value }));
}}
maxLength={5}
inputMode="numeric"
/>
<div className="text-[10px] text-black/50 mt-1 uppercase tracking-wide text-right">
Действительна
</div>
</div>
</div>
</div>
</div>

{/* Inputs right */}
<div className="min-[1024px]:col-span-5 space-y-4 min-w-0">
<div className="rounded-[22px] bg-white/95 text-black p-5 border border-white/10 overflow-hidden min-w-0">
<Label className="text-sm text-black/80" htmlFor="cardCvc">
CVC/CVV код
</Label>

<Input
id="cardCvc"
inputMode="numeric"
maxLength={3}
placeholder="•••"
type="password"
value={cardData.cvc}
onChange={(e) => {
const value = e.target.value.replace(/\D/g, '');
setCardData((p) => ({ ...p, cvc: value }));
}}
className="mt-2 h-11 rounded-xl bg-white text-black placeholder:text-black/40"
/>

{/* force the hint to stay INSIDE the block on desktop */}
<p className="mt-2 text-xs text-black/50 block w-full max-w-full whitespace-normal break-words">
3 цифры на обратной стороне карты
</p>
</div>

<div className="rounded-[22px] bg-white/95 text-black p-5 border border-white/10 overflow-hidden min-w-0">
<Label className="text-sm text-black/80" htmlFor="payEmail">
Email для получения информации
</Label>

<Input
id="payEmail"
value={email}
onChange={(e) => onEmailChange(e.target.value)}
placeholder="example@email.com"
className="mt-2 h-11 rounded-xl bg-white text-black placeholder:text-black/40"
/>

<p className="mt-2 text-xs text-black/50 block w-full max-w-full whitespace-normal break-words">
На этот адрес придет подтверждение заказа, детали церемонии и все необходимые документы
</p>
</div>
</div>
</div>
)}

{/* Bottom row: alternatives + secure */}
<div className="mt-6 grid grid-cols-1 gap-6 min-[1024px]:grid-cols-12">
<div className="min-[1024px]:col-span-7">
<p className="text-white/50 text-sm mb-3">Или выберите другой способ:</p>

<div className="grid grid-cols-1 min-[560px]:grid-cols-2 gap-4">
<button
type="button"
onClick={() => setMethod('sbp')}
className={cn(
'rounded-[22px] border p-5 text-left transition',
method === 'sbp'
? 'border-white/40 bg-white/10'
: 'border-white/10 bg-white/5 hover:bg-white/10',
)}
>
<div className="flex items-center gap-3">
<div className="h-4 w-4 rounded-full border border-white/40" />
<div>
<div className="text-sm">СБП</div>
<div className="text-xs text-white/50">Система быстрых платежей</div>
</div>
</div>
</button>

<button
type="button"
onClick={() => setMethod('installment')}
className={cn(
'rounded-[22px] border p-5 text-left transition',
method === 'installment'
? 'border-white/40 bg-white/10'
: 'border-white/10 bg-white/5 hover:bg-white/10',
)}
>
<div className="flex items-center gap-3">
<div className="h-4 w-4 rounded-full border border-white/40" />
<div>
<div className="text-sm">Рассрочка</div>
<div className="text-xs text-white/50">Оплата частями</div>
</div>
</div>
</button>
</div>
</div>

<div className="min-[1024px]:col-span-5">
<div className="rounded-[22px] border border-emerald-400/20 bg-emerald-500/10 p-5">
<div className="flex items-center gap-3">
<div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
<div className="h-3 w-3 rounded-full bg-emerald-400" />
</div>
<div>
<div className="text-sm">Защищённый платёж</div>
<div className="text-xs text-white/50">
Данные передаются по защищённому протоколу и не хранятся на наших серверах.
</div>
</div>
</div>
</div>
</div>
</div>

{/* Floating total */}
<div className="sticky bottom-4 mt-6">
<div className="mx-auto max-w-[520px] rounded-[28px] bg-white/90 backdrop-blur border border-black/10 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.6)] px-6 py-4 flex items-center justify-between">
<div>
<div className="text-xs text-black/50 uppercase tracking-wider">итого</div>
<div className="text-2xl text-black">{formattedTotal} ₽</div>
</div>
<button
type="button"
className="h-12 w-12 rounded-full bg-black/5 hover:bg-black/10 transition flex items-center justify-center"
aria-label="Свернуть"
>
<span className="text-black/60">⌃</span>
</button>
</div>
</div>
</div>
</section>
);
}