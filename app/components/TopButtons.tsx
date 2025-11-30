'use client';

type TopButtonsProps = {
  onAboutClick?: () => void;
  onHowStartClick?: () => void;
  onAiClick?: () => void;
};

export function TopButtons(props: TopButtonsProps) {
  const {
    onAboutClick,
    onHowStartClick,
    onAiClick,
  } = props;

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-black/40 px-2 py-2 backdrop-blur-md text-sm text-white pointer-events-auto">
      <button
        type="button"
        onClick={onAboutClick}
        className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition"
      >
        О сервисе
      </button>
      <button
        type="button"
        onClick={onHowStartClick}
        className="px-4 py-2 rounded-full bg-white text-black font-medium hover:bg-zinc-100 transition"
      >
        Как начать?
      </button>
      <button
        type="button"
        onClick={onAiClick}
        className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition"
      >
        Создать с ИИ
      </button>
    </div>
  );
}