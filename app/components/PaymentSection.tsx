'use client';

import { useMemo, useState } from 'react';
import { cn } from './ui/utils';
import { Input } from './ui/input';
import { Label } from './ui/label';

type PaymentMethod = 'card' | 'sbp' | 'installment';

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
const formattedTotal = useMemo(
() => total.toLocaleString('ru-RU'),
[total]
);

return (
<section className="relative">
{/* Тёмный фон-блок как на макете */}
<div className="rounded-[28px] bg-[#0b0f14] border border-white/10 p-6 md:p-8 text-white">
<div className="flex items-center gap-3 mb-6">
<div className="h-8 w-8 rounded-xl bg-white/10" />
<h3 className="text-lg font-medium">Способ оплаты</h3>
</div>

{/* DESKTOP LAYOUT */}
<div className="grid grid-cols-12 gap-6">
{/* Карта слева */}
<div className="col-span-12 md:col-span-7">
<div className="rounded-[22px] bg-white text-black p-6 h-[240px] border border-black/5 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.6)]">
<div className="h-10 w-10 rounded-lg bg-[#E2B62A]" />
<div className="mt-16 text-2xl tracking-[0.25em] text-black/70 select-none">
0000&nbsp;&nbsp;0000&nbsp;&nbsp;0000&nbsp;&nbsp;0000
</div>
<div className="mt-6 flex items-end justify-between text-xs text-black/50">
<div>
<div className="uppercase">IVAN IVANOV</div>
<div className="text-[10px] mt-1">ДЕРЖАТЕЛЬ КАРТЫ</div>
</div>
<div className="text-right">
<div className="uppercase">MM/ГГ</div>
<div className="text-[10px] mt-1">ДЕЙСТВИТЕЛЬНА</div>
</div>
</div>
</div>
</div>

{/* Инпуты справа */}
<div className="col-span-12 md:col-span-5 space-y-4">
<div className="rounded-[22px] bg-white/95 text-black p-5 border border-white/10">
<Label className="text-sm text-black/80">CVC/CVV код</Label>
<Input
inputMode="numeric"
maxLength={3}
placeholder="•••"
className="mt-2 h-11 rounded-xl bg-white"
/>
<p className="mt-2 text-xs text-black/50">
3 цифры на обратной стороне карты
</p>
</div>

<div className="rounded-[22px] bg-white/95 text-black p-5 border border-white/10">
<Label className="text-sm text-black/80">
Email для получения информации
</Label>
<Input
value={email}
onChange={(e) => onEmailChange(e.target.value)}
placeholder="example@email.com"
className="mt-2 h-11 rounded-xl bg-white"
/>
<p className="mt-2 text-xs text-black/50">
На этот адрес придет подтверждение заказа, детали церемонии и все необходимые документы
</p>
</div>
</div>
</div>

{/* Нижний ряд: альтернативы + secure */}
<div className="mt-6 grid grid-cols-12 gap-6">
<div className="col-span-12 md:col-span-7">
<p className="text-white/50 text-sm mb-3">Или выберите другой способ:</p>

<div className="grid grid-cols-2 gap-4">
<button
type="button"
onClick={() => setMethod('sbp')}
className={cn(
'rounded-[22px] border p-5 text-left transition',
method === 'sbp'
? 'border-white/40 bg-white/10'
: 'border-white/10 bg-white/5 hover:bg-white/10'
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
: 'border-white/10 bg-white/5 hover:bg-white/10'
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

<div className="col-span-12 md:col-span-5">
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
</div>

{/* Плавающая панель "итого" */}
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
</section>
);
}