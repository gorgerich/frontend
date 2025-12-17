import { Phone, Mail, Shield, Clock } from "./Icons";

export function Footer() {
  return (
    <footer className="w-full bg-neutral-50 border-t border-neutral-200 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          {/* Brand Column */}
          <div className="md:col-span-4 flex flex-col justify-between h-full">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-neutral-900 mb-4">Тихий дом</h2>
              <p className="text-sm text-neutral-500 leading-relaxed mb-6 max-w-sm">
                Цифровой сервис ритуальных услуг. Мы обеспечиваем прозрачность, фиксацию цен и полную юридическую защиту на каждом этапе.
              </p>
              <div className="flex items-center gap-2 text-xs font-medium text-neutral-900 bg-neutral-100 w-fit px-3 py-1.5 rounded-full">
                <Shield className="w-3.5 h-3.5" />
               
              </div>
            </div>
          </div>

          {/* Navigation / Contacts Grid */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Contacts */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-400">Связь</h3>
              <div className="space-y-3">
                <a 
                  href="tel:+74951234567" 
                  className="block group"
                >
                  <div className="flex items-center gap-2 text-neutral-900 group-hover:text-neutral-600 transition-colors">
                    <Phone className="w-4 h-4" />
                    <span className="font-mono text-lg">+7 (495) 123-45-67</span>
                  </div>
                  <span className="text-xs text-neutral-400 ml-6">Круглосуточно</span>
                </a>
                <a 
                  href="mailto:info@tikhaya-pamyat.ru" 
                  className="block group"
                >
                  <div className="flex items-center gap-2 text-neutral-900 group-hover:text-neutral-600 transition-colors">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">info@tikhaya-pamyat.ru</span>
                  </div>
                  <span className="text-xs text-neutral-400 ml-6">Отдел заботы</span>
                </a>
              </div>
            </div>

            {/* Hours */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-400">Режим</h3>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-neutral-900">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">24/7</span>
                </div>
                <p className="text-sm text-neutral-600 pl-6">Без выходных</p>
               
              </div>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-400">Данные</h3>
              <div className="space-y-2">
                <p className="text-sm font-medium text-neutral-900">ООО «Тихий дом</p>
                <div className="font-mono text-xs text-neutral-500 space-y-1">
                  <p>ИНН: 1111111111</p>
                  <p>ОГРН: 1234567890123</p>
                  <p>Лицензия № 2384-РБ</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-16 pt-8 border-t border-neutral-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="text-xs text-neutral-400 max-w-xl">
              <p className="mb-2">© 2024 Тихий дом. Все права защищены.</p>
              <p>Информация на сайте не является публичной офертой. Цены фиксируются в договоре.</p>
            </div>
            <div className="flex flex-wrap gap-6 text-xs font-medium text-neutral-500">
              <a href="#" className="hover:text-neutral-900 transition-colors">Конфиденциальность</a>
              <a href="#" className="hover:text-neutral-900 transition-colors">Оферта</a>
              <a href="#" className="hover:text-neutral-900 transition-colors">Карта сайта</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}