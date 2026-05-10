"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Schedule {
  id: string;
  isRecurring: boolean;
  daysOfWeek: number[];
  timeStart: string;
  timeEnd: string;
  specificDate?: string | null;
  class: { name: string; maxStudents: number };
  _count: { enrollments: number };
}

interface CalendarEvent {
  scheduleId: string;
  date: Date;
  timeStart: string;
  timeEnd: string;
  className: string;
  enrollments: number;
  maxStudents: number;
}

// ─── Calendar helpers ─────────────────────────────────────────────────────────

const DAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const DAY_NAMES_FULL = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];
const MONTH_NAMES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

const MIN_HOUR = 7;
const MAX_HOUR = 22;
const HOUR_HEIGHT = 56; // px per hour

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
}

function getWeekDates(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function timeToY(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return ((h - MIN_HOUR) + m / 60) * HOUR_HEIGHT;
}

function expandToWeek(schedules: Schedule[], monday: Date): CalendarEvent[] {
  const weekDates = getWeekDates(monday);
  const events: CalendarEvent[] = [];

  for (const s of schedules) {
    if (s.isRecurring) {
      for (const dow of s.daysOfWeek) {
        // dow 0=Sun,1=Mon...6=Sat  →  weekDates index (Mon=0...Sun=6)
        const idx = dow === 0 ? 6 : dow - 1;
        events.push({
          scheduleId: s.id,
          date: weekDates[idx],
          timeStart: s.timeStart,
          timeEnd: s.timeEnd,
          className: s.class.name,
          enrollments: s._count.enrollments,
          maxStudents: s.class.maxStudents,
        });
      }
    } else if (s.specificDate) {
      const sd = new Date(s.specificDate);
      for (const wd of weekDates) {
        if (isSameDay(sd, wd)) {
          events.push({
            scheduleId: s.id,
            date: wd,
            timeStart: s.timeStart,
            timeEnd: s.timeEnd,
            className: s.class.name,
            enrollments: s._count.enrollments,
            maxStudents: s.class.maxStudents,
          });
        }
      }
    }
  }

  return events;
}

// ─── WeeklyCalendar ───────────────────────────────────────────────────────────

function WeeklyCalendar({ schedules }: { schedules: Schedule[] }) {
  const [monday, setMonday] = useState(() => getMondayOf(new Date()));
  const bodyRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  const weekDates = getWeekDates(monday);
  const events = expandToWeek(schedules, monday);
  const totalHours = MAX_HOUR - MIN_HOUR;
  const gridHeight = totalHours * HOUR_HEIGHT;
  const hours = Array.from({ length: totalHours + 1 }, (_, i) => MIN_HOUR + i);

  // Scroll to show current time (or 8:00) on mount
  useEffect(() => {
    if (!bodyRef.current) return;
    const now = new Date();
    const targetHour = isSameDay(now, today) ? Math.max(now.getHours() - 1, MIN_HOUR) : 8;
    bodyRef.current.scrollTop = (targetHour - MIN_HOUR) * HOUR_HEIGHT;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prevWeek = () => {
    setMonday((m) => {
      const d = new Date(m);
      d.setDate(m.getDate() - 7);
      return d;
    });
  };

  const nextWeek = () => {
    setMonday((m) => {
      const d = new Date(m);
      d.setDate(m.getDate() + 7);
      return d;
    });
  };

  const weekLabel = (() => {
    const end = weekDates[6];
    if (monday.getMonth() === end.getMonth()) {
      return `${monday.getDate()}–${end.getDate()} ${MONTH_NAMES[monday.getMonth()]} ${monday.getFullYear()}`;
    }
    return `${monday.getDate()} ${MONTH_NAMES[monday.getMonth()]} – ${end.getDate()} ${MONTH_NAMES[end.getMonth()]} ${end.getFullYear()}`;
  })();

  // "now" line: only when today is in the current week
  const todayInWeek = weekDates.some((d) => isSameDay(d, today));
  const nowY = (() => {
    const now = new Date();
    const y = timeToY(`${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`);
    return y < 0 || y > gridHeight ? null : y;
  })();

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden select-none">
      {/* Navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <button
          onClick={prevWeek}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-600"
          aria-label="Semana anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900">{weekLabel}</p>
          <button
            onClick={() => setMonday(getMondayOf(new Date()))}
            className="text-xs text-blue-600 hover:underline mt-0.5"
          >
            Hoy
          </button>
        </div>
        <button
          onClick={nextWeek}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-600"
          aria-label="Semana siguiente"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day headers */}
      <div
        className="grid border-b bg-gray-50"
        style={{ gridTemplateColumns: "52px repeat(7, 1fr)" }}
      >
        <div className="border-r" />
        {weekDates.map((d, i) => {
          const isToday = isSameDay(d, today);
          return (
            <div
              key={i}
              className={`py-2 text-center border-l ${isToday ? "bg-blue-50" : ""}`}
            >
              <p className="text-xs text-gray-500 font-medium">{DAY_NAMES[i]}</p>
              <p
                className={`text-sm font-bold mt-0.5 w-7 h-7 rounded-full flex items-center justify-center mx-auto ${
                  isToday
                    ? "bg-blue-600 text-white"
                    : "text-gray-800"
                }`}
              >
                {d.getDate()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Time grid body */}
      <div ref={bodyRef} className="overflow-y-auto" style={{ maxHeight: 504 }}>
        <div
          className="grid"
          style={{ gridTemplateColumns: "52px repeat(7, 1fr)", height: gridHeight }}
        >
          {/* Hour labels */}
          <div className="relative border-r">
            {hours.slice(0, -1).map((h) => (
              <div
                key={h}
                className="absolute right-2 text-[11px] text-gray-400 leading-none"
                style={{ top: (h - MIN_HOUR) * HOUR_HEIGHT - 7 }}
              >
                {h}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDates.map((date, colIdx) => {
            const isToday = isSameDay(date, today);
            const dayEvents = events.filter((e) => isSameDay(e.date, date));

            return (
              <div
                key={colIdx}
                className={`relative border-l ${isToday ? "bg-blue-50/20" : ""}`}
              >
                {/* Hour lines */}
                {hours.map((h) => (
                  <div
                    key={h}
                    className="absolute w-full border-t border-gray-100"
                    style={{ top: (h - MIN_HOUR) * HOUR_HEIGHT }}
                  />
                ))}

                {/* "Now" indicator */}
                {isToday && todayInWeek && nowY !== null && (
                  <div
                    className="absolute w-full z-10 pointer-events-none"
                    style={{ top: nowY }}
                  >
                    <div className="relative flex items-center">
                      <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 shrink-0" />
                      <div className="flex-1 border-t-2 border-red-400" />
                    </div>
                  </div>
                )}

                {/* Events */}
                {dayEvents.map((ev, evIdx) => {
                  const top = timeToY(ev.timeStart);
                  const height = timeToY(ev.timeEnd) - top;
                  const isFull = ev.enrollments >= ev.maxStudents;
                  const showDetail = height >= 44;

                  return (
                    <div
                      key={`${ev.scheduleId}-${evIdx}`}
                      title={`${ev.className}\n${ev.timeStart}–${ev.timeEnd}\n${ev.enrollments}/${ev.maxStudents} alumnos`}
                      className={`absolute rounded-md px-1.5 py-1 text-xs overflow-hidden z-20 cursor-default border ${
                        isFull
                          ? "bg-red-50 border-red-200 text-red-800"
                          : "bg-blue-50 border-blue-200 text-blue-800"
                      }`}
                      style={{ top: top + 1, height: height - 2, left: 2, right: 2 }}
                    >
                      <p className="font-semibold leading-tight truncate">{ev.className}</p>
                      {showDetail && (
                        <>
                          <p className="leading-tight opacity-80">
                            {ev.timeStart}–{ev.timeEnd}
                          </p>
                          <p className="leading-tight opacity-70">
                            {ev.enrollments}/{ev.maxStudents}
                          </p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 border-t bg-gray-50 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-blue-100 border border-blue-200 inline-block" />
          Con lugar
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-100 border border-red-200 inline-block" />
          Completo
        </span>
        {todayInWeek && (
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-red-400 inline-block" />
            Ahora
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────

interface Payment {
  amount: number;
  status: string;
}

export default function TeacherDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalPayments: 0,
    totalRevenue: 0,
    pendingPayments: 0,
  });
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, paymentsRes, schedulesRes] = await Promise.all([
          fetch("/api/teacher/students"),
          fetch("/api/teacher/payments"),
          fetch("/api/teacher/schedules"),
        ]);

        const students = studentsRes.ok ? await studentsRes.json() : [];
        const payments = paymentsRes.ok ? await paymentsRes.json() : [];
        const schedulesData = schedulesRes.ok ? await schedulesRes.json() : [];

        const totalRevenue = payments.reduce(
          (sum: number, p: Payment) => sum + p.amount,
          0
        );
        const pending = payments.filter(
          (p: Payment) => p.status === "PENDING"
        ).length;

        setStats({
          totalStudents: students.length,
          totalPayments: payments.length,
          totalRevenue,
          pendingPayments: pending,
        });
        setSchedules(schedulesData || []);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Panel del Profesor</h1>

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="card">
              <div className="text-gray-500 text-sm">Estudiantes Totales</div>
              <div className="text-3xl font-bold mt-2">{stats.totalStudents}</div>
            </div>
            <div className="card">
              <div className="text-gray-500 text-sm">Pagos Recibidos</div>
              <div className="text-3xl font-bold mt-2">{stats.totalPayments}</div>
            </div>
            <div className="card">
              <div className="text-gray-500 text-sm">Ingresos Totales</div>
              <div className="text-3xl font-bold mt-2">
                ${stats.totalRevenue.toFixed(2)}
              </div>
            </div>
            <div className="card">
              <div className="text-gray-500 text-sm">Pagos Pendientes</div>
              <div className="text-3xl font-bold mt-2 text-amber-600">
                {stats.pendingPayments}
              </div>
            </div>
          </div>

          {/* Weekly calendar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Agenda semanal</h2>
              <Link
                href="/teacher/schedules"
                className="text-sm text-blue-600 hover:underline"
              >
                Gestionar horarios →
              </Link>
            </div>

            {schedules.length === 0 ? (
              <div className="card text-center py-10">
                <p className="text-gray-500 mb-3">
                  No hay horarios creados todavía
                </p>
                <Link href="/teacher/schedules" className="btn-primary inline-block">
                  Crear primer horario
                </Link>
              </div>
            ) : (
              <WeeklyCalendar schedules={schedules} />
            )}
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <Link
              href="/teacher/students"
              className="card hover:shadow-lg transition cursor-pointer"
            >
              <div className="text-base font-semibold">Estudiantes</div>
              <p className="text-gray-600 text-sm mt-1">
                Ver lista y detalles
              </p>
            </Link>
            <Link
              href="/teacher/schedules"
              className="card hover:shadow-lg transition cursor-pointer"
            >
              <div className="text-base font-semibold">Horarios</div>
              <p className="text-gray-600 text-sm mt-1">
                Crear y gestionar
              </p>
            </Link>
            <Link
              href="/teacher/payment-plans"
              className="card hover:shadow-lg transition cursor-pointer"
            >
              <div className="text-base font-semibold">Planes de Pago</div>
              <p className="text-gray-600 text-sm mt-1">
                Precios y paquetes
              </p>
            </Link>
            <Link
              href="/teacher/payments"
              className="card hover:shadow-lg transition cursor-pointer"
            >
              <div className="text-base font-semibold">Pagos</div>
              <p className="text-gray-600 text-sm mt-1">
                Historial de cobros
              </p>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
