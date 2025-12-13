"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Package, LogOut, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { calculateTotal, calculateBreakdown } from "./calculationUtils";

// ======================
// Типы
// ======================

type UiOrderStatus = "pending" | "processing" | "completed";

interface UiOrder {
  id: string;
  date: string;
  status: UiOrderStatus;
  total: number;
  serviceType: "burial" | "cremation";
  name: string;
}

/**
 * ВАЖНО:
 * StepperWorkflow рендерит так:
 * <PersonalAccountModal open={isAccountOpen} onOpenChange={setIsAccountOpen} />
 * Значит здесь props должны быть open/onOpenChange.
 */
export interface PersonalAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// как мы храним пользователя в localStorage
interface StoredUser {
  email: string;
  name?: string;
}

// структура драфта из localStorage
interface DraftFromStorage {
  formData: any;
  savedAt: string;
}

// ответ API /api/orders
interface OrdersApiResponse {
  ok: boolean;
  orders?: any[];
  error?: string;
}

// ======================
// Утилиты
// ======================

function mapStatus(status: string): UiOrderStatus {
  // Prisma enum: PENDING | IN_PROGRESS | COMPLETED | CANCELLED
  if (status === "COMPLETED") return "completed";
  if (status === "PENDING") return "pending";
  return "processing";
}

function mapServiceType(serviceType: string): "burial" | "cremation" {
  // Prisma enum: BURIAL | CREMATION
  return serviceType === "CREMATION" ? "cremation" : "burial";
}

function normalizeOrders(apiOrders: any[]): UiOrder[] {
  return apiOrders.map((o) => ({
    id: o.id,
    date: o.createdAt ?? o.date ?? new Date().toISOString(),
    status: mapStatus(o.status),
    total: typeof o.totalAmount === "number" ? o.totalAmount : 0,
    serviceType: mapServiceType(o.serviceType),
    name: o.fullName || o.user?.name || o.user?.email || "Заказ без имени",
  }));
}

// ======================
// Компонент
// ======================

export function PersonalAccountModal({ open, onOpenChange }: PersonalAccountModalProps) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [orders, setOrders] = useState<UiOrder[]>([]);
  const [currentDraft, setCurrentDraft] = useState<DraftFromStorage | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  const isLoggedIn = !!user;

  const close = () => onOpenChange(false);

  // ======================
  // Загрузка пользователя и драфта при открытии модалки
  // ======================
  useEffect(() => {
    if (!open) return;

    // 1) пользователь
    try {
      const raw = localStorage.getItem("funeral-user");
      if (raw) {
        const parsed: StoredUser = JSON.parse(raw);
        if (parsed.email) {
          setUser(parsed);
          void fetchOrdersFromApi(parsed.email);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }

    // 2) текущий драфт мастера
    try {
      const draftRaw = localStorage.getItem("funeral-workflow-draft");
      if (draftRaw) {
        const parsed: DraftFromStorage = JSON.parse(draftRaw);
        if (parsed?.formData) setCurrentDraft(parsed);
        else setCurrentDraft(null);
      } else {
        setCurrentDraft(null);
      }
    } catch {
      setCurrentDraft(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ======================
  // Запрос заказов из API
  // ======================

  const fetchOrdersFromApi = async (email: string) => {
    if (!email) return;
    try {
      setIsLoadingOrders(true);
      const res = await fetch(`/api/orders?email=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: OrdersApiResponse = await res.json();
      if (!data.ok || !Array.isArray(data.orders)) {
        throw new Error(data.error || "Bad response");
      }
      setOrders(normalizeOrders(data.orders));
    } catch (e) {
      console.error("Failed to load orders", e);
      toast.error("Не удалось загрузить заказы. Попробуйте позже.");
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // ======================
  // Логин / регистрация
  // ======================

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get("email") || "").trim();
    const name = String(fd.get("name") || "").trim() || "Пользователь";

    if (!email) {
      toast.error("Укажите email");
      return;
    }

    const stored: StoredUser = { email, name };
    localStorage.setItem("funeral-user", JSON.stringify(stored));
    setUser(stored);

    toast.success("Вы вошли в личный кабинет");
    await fetchOrdersFromApi(email);
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    // для фронта логика та же, что и логин: просто сохраняем email локально
    return handleLogin(e);
  };

  const handleLogout = () => {
    localStorage.removeItem("funeral-user");
    setUser(null);
    setOrders([]);
    toast.info("Вы вышли из личного кабинета");
  };

  // ======================
  // Сохранение текущего расчёта как заказ
  // ======================

  const handleSaveCurrentOrder = async () => {
    if (!currentDraft) {
      toast.error("Нет сохранённого расчёта");
      return;
    }
    if (!user?.email) {
      toast.error("Сначала войдите в личный кабинет");
      return;
    }

    try {
      setIsSavingOrder(true);

      const formData = currentDraft.formData;

      // пока без категории кладбища — берём 'standard' по умолчанию
      const total = calculateTotal(formData, "standard");
      const breakdown = calculateBreakdown(formData, "standard");

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: user.email,
          userName: user.name,
          formData,
          total,
          breakdown,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "ORDER_CREATE_FAILED");

      toast.success("Заказ сохранён в личном кабинете");
      await fetchOrdersFromApi(user.email);
    } catch (e) {
      console.error("Save order failed", e);
      toast.error("Не удалось сохранить заказ. Попробуйте позже.");
    } finally {
      setIsSavingOrder(false);
    }
  };

  // ======================
  // Рендер
  // ======================

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Фон */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
      </AnimatePresence>

      {/* Основное окно */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 flex h-[90vh] w-[min(960px,100vw-32px)] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Верхняя панель */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-white">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-medium text-stone-900">Кабинет</div>
              {isLoggedIn && user?.email && (
                <div className="text-xs text-stone-500">{user.email}</div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLoggedIn && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-red-100 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="mr-1 h-4 w-4" />
                Выйти
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={close}
              className="rounded-full hover:bg-stone-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Контент с прокруткой */}
        <ScrollArea className="flex-1">
          <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-6 pb-10">
            {!isLoggedIn ? (
              // ======== Блок логина / регистрации ========
              <div className="mx-auto w-full max-w-md pt-2">
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="mb-6 grid w-full grid-cols-2">
                    <TabsTrigger value="login">Вход</TabsTrigger>
                    <TabsTrigger value="register">Регистрация</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4" autoComplete="on">
                      <div className="space-y-2">
                        <Label htmlFor="login-name">Имя</Label>
                        <Input
                          id="login-name"
                          name="name"
                          placeholder="Как к вам обращаться"
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input
                          id="login-email"
                          name="email"
                          type="email"
                          placeholder="name@example.com"
                          required
                          className="h-11"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="mt-4 h-11 w-full bg-stone-900 text-base hover:bg-stone-800"
                      >
                        Войти
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="register">
                    <form
                      onSubmit={handleRegister}
                      className="space-y-4"
                      autoComplete="on"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="reg-name">Имя</Label>
                        <Input
                          id="reg-name"
                          name="name"
                          placeholder="Иван Иванов"
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-email">Email</Label>
                        <Input
                          id="reg-email"
                          name="email"
                          type="email"
                          placeholder="name@example.com"
                          required
                          className="h-11"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="mt-4 h-11 w-full bg-stone-900 text-base hover:bg-stone-800"
                      >
                        Зарегистрироваться
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              // ======== Основной кабинет ========
              <>
                {/* Текущий черновик */}
                {currentDraft && (
                  <Card className="border-stone-200 bg-stone-50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <CardTitle className="text-sm font-medium">
                            Текущий расчёт
                          </CardTitle>
                          <CardDescription>
                            Последнее изменение:{" "}
                            {new Date(currentDraft.savedAt).toLocaleString("ru-RU")}
                          </CardDescription>
                        </div>
                        <Badge
                          variant="outline"
                          className="border-yellow-200 bg-yellow-50 text-xs text-yellow-700"
                        >
                          Черновик
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <div className="text-stone-500">Тип услуги</div>
                          <div className="font-medium text-stone-900">
                            {currentDraft.formData?.serviceType === "cremation"
                              ? "Кремация"
                              : "Погребение"}
                          </div>
                        </div>
                        {currentDraft.formData?.fullName && (
                          <div>
                            <div className="text-stone-500">Усопший</div>
                            <div className="font-medium text-stone-900">
                              {currentDraft.formData.fullName}
                            </div>
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={handleSaveCurrentOrder}
                        disabled={isSavingOrder}
                        className="mt-2 h-11 w-full gap-2 bg-white text-sm text-stone-900 hover:bg-stone-100"
                        variant="outline"
                      >
                        <Save className="h-4 w-4" />
                        {isSavingOrder ? "Сохраняем..." : "Сохранить в мои заказы"}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* История заказов */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-stone-500" />
                      <span className="text-sm font-medium uppercase tracking-wide text-stone-500">
                        История заказов
                      </span>
                    </div>
                    {isLoadingOrders && (
                      <span className="text-xs text-stone-400">Обновление…</span>
                    )}
                  </div>

                  {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-200 bg-slate-50 py-10 text-center text-sm text-stone-500">
                      Пока нет сохранённых заказов
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <Card
                          key={order.id}
                          className="border-stone-200 transition hover:shadow-sm"
                        >
                          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
                            <div className="min-w-[180px]">
                              <div className="font-medium text-stone-900">{order.name}</div>
                              <div className="text-xs text-stone-500">
                                {new Date(order.date).toLocaleString("ru-RU")}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                              <Badge variant="outline">
                                {order.serviceType === "cremation"
                                  ? "Кремация"
                                  : "Погребение"}
                              </Badge>
                              <Badge
                                className={
                                  order.status === "completed"
                                    ? "bg-green-100 text-green-700"
                                    : order.status === "pending"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-blue-100 text-blue-700"
                                }
                              >
                                {order.status === "completed"
                                  ? "Завершён"
                                  : order.status === "pending"
                                  ? "В ожидании"
                                  : "В обработке"}
                              </Badge>
                              <Separator orientation="vertical" className="h-6" />
                              <div className="text-base font-semibold text-stone-900">
                                {order.total.toLocaleString("ru-RU")} ₽
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </motion.div>
    </div>,
    document.body,
  );
}