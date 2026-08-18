import React, { useEffect, useMemo, useState } from 'react';
import { Users, CheckCircle2, XCircle, AlertCircle, CalendarDays, PlusCircle, FileText } from 'lucide-react';
import { api } from '../../services/api';
import { EodReport, EodReportEmployee, User } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common/Button';
import { WorkFormModal } from '../works/WorkFormModal';

const inputClass =
  'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white';

type StatusFilter = 'all' | 'marked' | 'absent' | 'not_marked';
type EmployeeRow = EodReportEmployee & { status: 'marked' | 'absent_leave' | 'not_marked' };

function todayIso() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function formatDisplayDate(iso: string) {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

function SummaryBox({
  totalEmployees,
  marked,
  notMarked,
  absent,
  isLoading,
  hideTotal,
}: {
  totalEmployees: number;
  marked: number;
  notMarked: number;
  absent: number;
  isLoading: boolean;
  hideTotal?: boolean;
}) {
  const allRows = [
    { label: 'Total Employees', value: totalEmployees, icon: Users },
    { label: 'Marked', value: marked, icon: CheckCircle2 },
    { label: 'Not Marked', value: notMarked, icon: AlertCircle },
    { label: 'Absent', value: absent, icon: XCircle },
  ];

  const rows = hideTotal ? allRows.filter((r) => r.label !== 'Total Employees') : allRows;

  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {rows.map(({ label, value, icon: Icon }) => {
        const colorMap: Record<string, { iconBg: string; iconText: string; pillBg: string; pillText: string }> = {
          'Total Employees': { iconBg: 'bg-violet-100 dark:bg-violet-950/20', iconText: 'text-violet-600', pillBg: 'bg-violet-50', pillText: 'text-violet-700' },
          Marked: { iconBg: 'bg-emerald-100 dark:bg-emerald-950/20', iconText: 'text-emerald-600', pillBg: 'bg-emerald-50', pillText: 'text-emerald-700' },
          'Not Marked': { iconBg: 'bg-amber-100 dark:bg-amber-950/20', iconText: 'text-amber-600', pillBg: 'bg-amber-50', pillText: 'text-amber-700' },
          Absent: { iconBg: 'bg-rose-100 dark:bg-rose-950/20', iconText: 'text-rose-600', pillBg: 'bg-rose-50', pillText: 'text-rose-700' },
        };
        const color = colorMap[label] || { iconBg: 'bg-slate-100', iconText: 'text-slate-400', pillBg: 'bg-slate-50', pillText: 'text-slate-600' };

        return (
          <div key={label} className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${color.iconBg} ${color.iconText}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${color.pillBg} ${color.pillText}`}>{label}</span>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-3xl font-black text-slate-900 dark:text-white">{value}</p>
              <p className="text-xs text-slate-500 mt-1">as of today</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }: { status: EmployeeRow['status'] }) {
  if (status === 'marked') {
    return (
      <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
        Marked
      </span>
    );
  }
  if (status === 'absent_leave') {
    return (
      <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-500 dark:bg-rose-950/40 dark:text-rose-400">
        Absent
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
      Not Marked
    </span>
  );
}

export const EodReportPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const isEmployee = user?.role === 'employee';
  const [date, setDate] = useState(todayIso());
  const [userId, setUserId] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [report, setReport] = useState<EodReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWorkLogOpen, setIsWorkLogOpen] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await api.eod.report(date, { userId: userId || undefined });
      setReport(data);
    } catch (error: any) {
      addToast('error', 'EOD Report Error', error.message || 'Could not load EOD report.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isEmployee) {
      api.users.list().then((list) => setUsers(list.filter((u) => u.role === 'employee'))).catch(() => undefined);
    }
  }, [isEmployee]);

  useEffect(() => {
    load();
  }, [date, userId]);

  const allRows: EmployeeRow[] = useMemo(() => {
    if (!report) return [];
    return [
      ...report.marked.map((r) => ({ ...r, status: 'marked' as const })),
      ...report.absentLeave.map((r) => ({ ...r, status: 'absent_leave' as const })),
      ...report.notMarked.map((r) => ({ ...r, status: 'not_marked' as const })),
    ].sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [report]);

  const filteredRows = useMemo(() => {
    if (statusFilter === 'all') return allRows;
    if (statusFilter === 'marked') return allRows.filter((r) => r.status === 'marked');
    if (statusFilter === 'absent') return allRows.filter((r) => r.status === 'absent_leave');
    return allRows.filter((r) => r.status === 'not_marked');
  }, [allRows, statusFilter]);

  const totalEmployees = allRows.length;
  const markedCount = report?.marked.length ?? 0;
  const absentCount = report?.absentLeave.length ?? 0;
  const notMarkedCount = report?.notMarked.length ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>

      {isEmployee && (
        <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-white p-5 shadow-sm dark:border-indigo-900/50 dark:from-indigo-950/30 dark:to-slate-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">WorkLog Entry</h2>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  Log your daily work or mark absent/leave for today.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              onClick={() => setIsWorkLogOpen(true)}
              icon={<PlusCircle className="h-4 w-4" />}
              className="shrink-0 self-start sm:self-auto"
            >
              Log Work Entry
            </Button>
          </div>
        </div>
      )}

      <SummaryBox
        totalEmployees={totalEmployees}
        marked={markedCount}
        notMarked={notMarkedCount}
        absent={absentCount}
        isLoading={isLoading}
        hideTotal={isEmployee}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Employee Status List</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Showing records on {formatDisplayDate(date)}
              </p>
              <p className="text-xs text-slate-400">
                {filteredRows.length} employee{filteredRows.length !== 1 ? 's' : ''} in current view
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`${inputClass} pl-9`}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className={inputClass}
              >
                <option value="all">All status</option>
                <option value="marked">Marked</option>
                <option value="absent">Absent</option>
                <option value="not_marked">Not Marked</option>
              </select>

              {!isEmployee && (
                <>
                  <select value={userId} onChange={(e) => setUserId(e.target.value)} className={inputClass}>
                    <option value="">All employees</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName}
                      </option>
                    ))}
                  </select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStatusFilter('all');
                      setUserId('');
                      setDate(todayIso());
                    }}
                    className="ml-1"
                  >
                    Clear Filters
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">Loading EOD report…</div>
          ) : filteredRows.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              No employee records found for the selected filters.
            </div>
          ) : (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Employee Name</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Note</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRows.map((row) => (
                  <tr key={row.userId} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-300">
                      {formatDisplayDate(date)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{row.fullName}</p>
                      {row.employeeId && (
                        <p className="text-xs text-slate-400">ID: {row.employeeId}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{row.email}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{row.department}</td>
                    <td className="max-w-[200px] truncate px-6 py-4 text-slate-500 dark:text-slate-400">
                      {row.reason || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isEmployee && (
        <WorkFormModal
          isOpen={isWorkLogOpen}
          onClose={() => setIsWorkLogOpen(false)}
          onSuccess={() => {
            setIsWorkLogOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
};
