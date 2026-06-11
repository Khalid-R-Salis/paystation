import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users, ShieldCheck, TrendingUp, Zap, Search,
  Filter, LogOut, ChevronRight, Moon, Sun, Bell,
  Settings, UserCheck, UserX, UserMinus, MoreVertical,
  ArrowUpRight, ArrowDownRight, Clock, Calendar,
  BarChart2, CheckCircle, XCircle, AlertCircle,
  RefreshCw, Eye, Wallet, Star, Activity, FileText,
  Hash, Phone, Mail, MapPin, Target, X,
  ClipboardList, ChevronDown, TrendingDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from './ui/dialog';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AdminDashboardProps {
  user: UserType;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

type TimePeriod = 'today' | 'week' | 'month' | 'year' | 'all' | 'custom';

interface ProfileRow {
  id: string;
  full_name: string;
  username: string;
  email: string;
  phone: string;
  role: 'user' | 'agent' | 'admin';
  wallet_balance: number;
  is_active: boolean;
  joined_at: string;
  referral_code: string;
  referral_points: number;
  agent_address?: string;
  agent_target?: string;
  agent_dob?: string;
  agent_status?: 'pending' | 'approved' | 'rejected';
  agent_applied_at?: string;
}

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: string;
  created_at: string;
  profiles?: { full_name: string; username: string; email: string };
}

interface Notification {
  id: string;
  type: 'agent_request' | 'revenue' | 'new_user' | 'alert';
  message: string;
  created_at: string;
  read: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (name: string) => {
  if (!name) return 'U';
  return name.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();
};

const avatarColor = (name: string) => {
  const colors = [
    'bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-orange-500',
    'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-rose-500',
  ];
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const formatCurrency = (n: number) => `₦${(n || 0).toLocaleString()}`;
const formatDate = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

const pad = (n: number) => String(n).padStart(2, '0');
const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Returns { current: {gte,lte}, previous: {gte,lte} | null } for trend calculation */
const getPeriodRange = (period: TimePeriod, customStart?: string, customEnd?: string) => {
  const now = new Date();
  if (period === 'today') {
    const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
    return {
      current: { gte: fmt(now), lte: fmt(now) },
      previous: { gte: fmt(yesterday), lte: fmt(yesterday) },
      label: 'vs yesterday',
    };
  }
  if (period === 'week') {
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfLastWeek = new Date(startOfWeek); startOfLastWeek.setDate(startOfWeek.getDate() - 7);
    const endOfLastWeek = new Date(startOfWeek); endOfLastWeek.setDate(startOfWeek.getDate() - 1);
    return {
      current: { gte: fmt(startOfWeek), lte: fmt(now) },
      previous: { gte: fmt(startOfLastWeek), lte: fmt(endOfLastWeek) },
      label: 'vs last week',
    };
  }
  if (period === 'month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    return {
      current: { gte: fmt(startOfMonth), lte: fmt(now) },
      previous: { gte: fmt(startOfLastMonth), lte: fmt(endOfLastMonth) },
      label: 'vs last month',
    };
  }
  if (period === 'year') {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
    const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31);
    return {
      current: { gte: fmt(startOfYear), lte: fmt(now) },
      previous: { gte: fmt(startOfLastYear), lte: fmt(endOfLastYear) },
      label: 'vs last year',
    };
  }
  if (period === 'custom' && customStart && customEnd) {
    return {
      current: { gte: customStart, lte: customEnd },
      previous: null,
      label: 'custom range',
    };
  }
  // 'all' — no filter
  return { current: null, previous: null, label: 'all time' };
};

const calcTrend = (current: number, previous: number): number | undefined => {
  if (!previous || previous === 0) return undefined;
  return Math.round(((current - previous) / previous) * 100);
};

// ─── UserAvatar ───────────────────────────────────────────────────────────────
const UserAvatar = ({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) => {
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-14 h-14 text-lg' : 'w-10 h-10 text-sm';
  return (
    <div className={`${sz} ${avatarColor(name)} rounded-2xl flex items-center justify-center text-white font-black flex-shrink-0 shadow-sm`}>
      {getInitials(name)}
    </div>
  );
};

// ─── PeriodDropdown ───────────────────────────────────────────────────────────
const PERIOD_OPTS: { label: string; value: TimePeriod }[] = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
  { label: 'All Time', value: 'all' },
  { label: 'Custom Range', value: 'custom' },
];

const PeriodDropdown = ({
  value, onChange, customStart, customEnd, onCustomChange,
}: {
  value: TimePeriod;
  onChange: (v: TimePeriod) => void;
  customStart?: string;
  customEnd?: string;
  onCustomChange?: (which: 'start' | 'end', val: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = PERIOD_OPTS.find(o => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-[11px] font-black uppercase tracking-wide"
      >
        {current?.label}
        <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            className="absolute right-0 top-9 z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-1.5 min-w-[160px] overflow-hidden"
          >
            {PERIOD_OPTS.map(o => (
              <button
                key={o.value}
                onClick={() => { onChange(o.value); if (o.value !== 'custom') setOpen(false); }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-xs font-bold transition-colors ${
                  value === o.value
                    ? 'bg-[#084328]/10 text-[#084328] dark:text-emerald-400'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {value === o.value && <div className="w-1.5 h-1.5 rounded-full bg-[#084328] dark:bg-emerald-400" />}
                {value !== o.value && <div className="w-1.5 h-1.5" />}
                {o.label}
              </button>
            ))}
            {value === 'custom' && (
              <div className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800 mt-1 space-y-1.5">
                <input
                  type="date"
                  value={customStart || ''}
                  onChange={e => onCustomChange?.('start', e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1.5 text-foreground"
                />
                <input
                  type="date"
                  value={customEnd || ''}
                  onChange={e => onCustomChange?.('end', e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1.5 text-foreground"
                />
                <button
                  onClick={() => setOpen(false)}
                  className="w-full py-1.5 bg-[#084328] text-white text-xs font-black rounded-lg"
                >Apply</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── EmptyState ───────────────────────────────────────────────────────────────
const EmptyState = ({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-4">
    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center">
      <Icon size={36} className="text-slate-300 dark:text-slate-600" />
    </div>
    <div className="text-center">
      <p className="font-black text-slate-700 dark:text-slate-200 text-lg">{title}</p>
      <p className="text-slate-400 dark:text-slate-500 text-sm font-medium mt-1">{subtitle}</p>
    </div>
  </div>
);

// ─── StatsCard — v1 beautiful UI + v2 live data + trend ──────────────────────
const StatsCard = ({
  title, value, loading, icon: Icon, color,
  period, onPeriodChange, customStart, customEnd, onCustomChange,
  trend, trendLabel,
}: {
  title: string;
  value: string;
  loading: boolean;
  icon: any;
  color: string;
  period: TimePeriod;
  onPeriodChange: (v: TimePeriod) => void;
  customStart?: string;
  customEnd?: string;
  onCustomChange?: (which: 'start' | 'end', val: string) => void;
  trend?: number;
  trendLabel?: string;
}) => (
  <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
    <CardContent className="p-8">
      {/* Icon + Dropdown */}
      <div className="flex items-center justify-between mb-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} text-white shadow-xl shadow-current/30 group-hover:scale-110 transition-transform`}>
          <Icon size={28} />
        </div>
        <PeriodDropdown
          value={period}
          onChange={onPeriodChange}
          customStart={customStart}
          customEnd={customEnd}
          onCustomChange={onCustomChange}
        />
      </div>

      {/* Label */}
      <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mb-1 uppercase tracking-widest">{title}</p>

      {/* Value */}
      {loading
        ? <div className="h-10 w-32 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
        : <h3 className="text-3xl font-black text-slate-900 dark:text-white">{value}</h3>
      }

      {/* Trend */}
      <div className="flex items-center gap-1.5 mt-2 h-5">
        {trend !== undefined ? (
          <>
            {trend >= 0
              ? <ArrowUpRight size={14} className="text-emerald-500" />
              : <ArrowDownRight size={14} className="text-red-400" />
            }
            <span className={`text-xs font-black ${trend >= 0 ? 'text-green-600' : 'text-red-400'}`}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-tighter">{trendLabel}</span>
          </>
        ) : (
          <span className="text-slate-300 dark:text-slate-700 text-[10px] font-bold uppercase tracking-tighter">
            {period === 'all' ? 'All time' : 'No prior data'}
          </span>
        )}
      </div>
    </CardContent>
  </Card>
);

// ─── ActionMenu ───────────────────────────────────────────────────────────────
const ActionMenu = ({ profile, onAction }: { profile: ProfileRow; onAction: (action: string, p: ProfileRow) => void }) => {
  const [open, setOpen] = useState(false);
  const isActive = profile.is_active !== false;
  const isAgent = profile.role === 'agent';

  const actions = [
    { label: 'View Details', icon: Eye, action: 'view', color: 'text-slate-600 dark:text-slate-300' },
    ...(!isAgent ? [{ label: 'Upgrade to Agent', icon: Star, action: 'upgrade', color: 'text-indigo-600' }] : []),
    ...(isAgent ? [{ label: 'Downgrade to User', icon: UserMinus, action: 'downgrade', color: 'text-orange-500' }] : []),
    { label: isActive ? 'Deactivate Account' : 'Reactivate Account', icon: isActive ? UserX : UserCheck, action: isActive ? 'deactivate' : 'reactivate', color: isActive ? 'text-amber-500' : 'text-emerald-500' },
    { label: 'Remove User', icon: UserX, action: 'remove', color: 'text-red-500' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400"
      >
        <MoreVertical size={16} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              className="absolute right-0 top-10 z-20 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-2 min-w-[180px] overflow-hidden"
            >
              {actions.map(a => (
                <button
                  key={a.action}
                  onClick={() => { onAction(a.action, profile); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <a.icon size={15} className={a.color} />
                  <span className={`text-sm font-bold ${a.color}`}>{a.label}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── UserDetailModal ──────────────────────────────────────────────────────────
const UserDetailModal = ({ profile, open, onClose }: { profile: ProfileRow | null; open: boolean; onClose: () => void }) => {
  if (!profile) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-[2rem] dark:bg-slate-900 p-0 overflow-hidden">
        <div className="bg-[#084328] p-8 text-white">
          <div className="flex items-center gap-4">
            <UserAvatar name={profile.full_name} size="lg" />
            <div>
              <h3 className="text-2xl font-black">{profile.full_name}</h3>
              <p className="opacity-70 font-medium">@{profile.username}</p>
            </div>
          </div>
        </div>
        <div className="p-8 space-y-4">
          {[
            { icon: Mail, label: 'Email', value: profile.email },
            { icon: Phone, label: 'Phone', value: profile.phone || '—' },
            { icon: Wallet, label: 'Balance', value: formatCurrency(profile.wallet_balance) },
            { icon: Star, label: 'Referral Points', value: profile.referral_points?.toString() || '0' },
            { icon: Hash, label: 'Referral Code', value: profile.referral_code || '—' },
            { icon: Calendar, label: 'Joined', value: profile.joined_at ? formatDate(profile.joined_at) : '—' },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                <f.icon size={14} className="text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">{f.label}</p>
                <p className="font-bold text-slate-800 dark:text-white text-sm">{f.value}</p>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-3 pt-2">
            <Badge className={
              profile.role === 'admin' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
              profile.role === 'agent' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' :
              'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
            }>{profile.role?.toUpperCase()}</Badge>
            <Badge className={profile.is_active !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}>
              {profile.is_active !== false ? 'ACTIVE' : 'INACTIVE'}
            </Badge>
          </div>
        </div>
        <div className="px-8 pb-8">
          <Button onClick={onClose} className="w-full bg-[#084328] text-white rounded-2xl h-12 font-black">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── AgentRequestCard ─────────────────────────────────────────────────────────
const AgentRequestCard = ({ profile, onAccept, onReject }: {
  profile: ProfileRow;
  onAccept: (p: ProfileRow) => void;
  onReject: (p: ProfileRow) => void;
}) => (
  <Card className="border-none shadow-md dark:shadow-none rounded-[1.5rem] bg-white dark:bg-slate-900 overflow-hidden">
    <CardContent className="p-6">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <UserAvatar name={profile.full_name} />
          <div>
            <p className="font-black text-slate-900 dark:text-white">{profile.full_name}</p>
            <p className="text-slate-400 text-sm font-medium">@{profile.username} · {profile.email}</p>
          </div>
        </div>
        <Badge className="bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 text-[10px] font-black uppercase">
          Pending
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
        {profile.agent_address && (
          <div className="flex items-start gap-2">
            <MapPin size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400">Address</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{profile.agent_address}</p>
            </div>
          </div>
        )}
        {profile.agent_target && (
          <div className="flex items-start gap-2">
            <Target size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400">Monthly Target</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{profile.agent_target} users</p>
            </div>
          </div>
        )}
        {profile.agent_dob && (
          <div className="flex items-start gap-2">
            <Calendar size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400">Date of Birth</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{profile.agent_dob}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Mail, label: 'Email', value: profile.email },
          { icon: Phone, label: 'Phone', value: profile.phone || '—' },
          { icon: Wallet, label: 'Balance', value: formatCurrency(profile.wallet_balance) },
          { icon: Calendar, label: 'Applied', value: profile.agent_applied_at ? formatDate(profile.agent_applied_at) : '—' },
        ].map(f => (
          <div key={f.label} className="flex items-center gap-2">
            <f.icon size={13} className="text-slate-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400">{f.label}</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{f.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
        <Button onClick={() => onAccept(profile)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 font-black gap-2">
          <CheckCircle size={16} /> Accept
        </Button>
        <Button onClick={() => onReject(profile)} variant="outline" className="flex-1 border-red-200 text-red-500 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 rounded-xl h-11 font-black gap-2">
          <XCircle size={16} /> Reject
        </Button>
      </div>
    </CardContent>
  </Card>
);

// ─── NotificationPanel ────────────────────────────────────────────────────────
const NotificationPanel = ({ open, onClose, notifications, onMarkRead }: {
  open: boolean; onClose: () => void; notifications: Notification[]; onMarkRead: (id: string) => void;
}) => {
  const iconMap: Record<string, any> = { agent_request: Star, revenue: TrendingUp, new_user: Users, alert: AlertCircle };
  const colorMap: Record<string, string> = {
    agent_request: 'bg-indigo-100 text-indigo-600', revenue: 'bg-emerald-100 text-emerald-600',
    new_user: 'bg-blue-100 text-blue-600', alert: 'bg-amber-100 text-amber-600',
  };
  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed right-4 top-20 z-50 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-slate-900 dark:text-white text-lg">Notifications</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="max-h-[480px] overflow-y-auto">
              {notifications.length === 0 ? (
                <EmptyState icon={Bell} title="No notifications" subtitle="You're all caught up" />
              ) : (
                notifications.map(n => {
                  const Icon = iconMap[n.type] || Bell;
                  return (
                    <div
                      key={n.id}
                      onClick={() => onMarkRead(n.id)}
                      className={`flex items-start gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors ${!n.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[n.type]}`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold ${!n.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{n.message}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{formatDate(n.created_at)}</p>
                      </div>
                      {!n.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── AdminSettingsModal ───────────────────────────────────────────────────────
const AdminSettingsModal = ({ open, onClose, user }: { open: boolean; onClose: () => void; user: UserType }) => {
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePw = async () => {
    if (!newPw || newPw.length < 8) { setPwError('Password must be at least 8 characters.'); return; }
    if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return; }
    setPwError(''); setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Password updated successfully!');
    setNewPw(''); setConfirmPw(''); onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-[2rem] dark:bg-slate-900 p-0 overflow-hidden">
        <div className="bg-[#084328] p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <ShieldCheck size={28} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black">Admin Settings</h3>
              <p className="opacity-70 text-sm font-medium">Manage your admin account</p>
            </div>
          </div>
        </div>
        <div className="p-8 space-y-6">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Email Address</p>
            <p className="font-black text-slate-800 dark:text-white">{(user as any).email || '—'}</p>
          </div>
          <div className="space-y-3">
            <p className="font-black text-slate-700 dark:text-white uppercase text-xs tracking-widest">Change Password</p>
            <Input type="password" placeholder="New Password" value={newPw}
              onChange={e => { setNewPw(e.target.value); setPwError(''); }}
              className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none" />
            <Input type="password" placeholder="Confirm New Password" value={confirmPw}
              onChange={e => { setConfirmPw(e.target.value); setPwError(''); }}
              className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none" />
            {pwError && <p className="text-red-500 text-sm font-medium">{pwError}</p>}
          </div>
        </div>
        <div className="px-8 pb-8 flex gap-3">
          <Button onClick={handleChangePw} disabled={loading} className="flex-1 bg-[#084328] text-white rounded-2xl h-12 font-black">
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant="ghost" onClick={onClose} className="flex-1 rounded-2xl h-12 font-black">Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Sum a numeric column across rows, with optional date filter.
 * Uses select + client-side reduce instead of server aggregate to avoid RLS count/permission issues.
 */
const sumColumn = async (table: string, column: string, filters: Record<string, any>, range: { gte: string; lte: string } | null) => {
  try {
    let q = supabase.from(table).select(column);
    Object.entries(filters).forEach(([k, v]) => { q = (q as any).eq(k, v); });
    if (range) q = (q as any).gte('created_at', range.gte).lte('created_at', range.lte + 'T23:59:59');
    const { data, error } = await q;
    if (error || !data) {
      console.error(`sumColumn error (${table}.${column}):`, error?.message ?? 'no data');
      return 0;
    }
    return data.reduce((acc, curr) => acc + (Number(curr[column]) || 0), 0);
  } catch (e) {
    console.error(`sumColumn exception (${table}.${column}):`, e);
    return 0;
  }
};

/**
 * Count rows matching filters, with optional date filter.
 * Avoids `head: true` which can silently fail under RLS — uses select('id') + data.length instead.
 */
const countRows = async (table: string, filters: Record<string, any>, range: { gte: string; lte: string } | null) => {
  try {
    let q = supabase.from(table).select('id');
    Object.entries(filters).forEach(([k, v]) => { q = (q as any).eq(k, v); });
    if (range) q = (q as any).gte('created_at', range.gte).lte('created_at', range.lte + 'T23:59:59');
    const { data, error } = await q;
    if (error || !data) {
      console.error(`countRows error (${table}):`, error?.message ?? 'no data');
      return 0;
    }
    return data.length || 0;
  } catch (e) {
    console.error(`countRows exception (${table}):`, e);
    return 0;
  }
};

// ─── Main AdminDashboard ──────────────────────────────────────────────────────
const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout, isDarkMode, toggleTheme }) => {
  const { t } = useLanguage();

  // ── State ──────────────────────────────────────────────────────────────────
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [agentRequests, setAgentRequests] = useState<ProfileRow[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [loadingTx, setLoadingTx] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'agent'>('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [detailProfile, setDetailProfile] = useState<ProfileRow | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ action: string; profile: ProfileRow } | null>(null);

  // Stats with period + trend
  const [statPeriods, setStatPeriods] = useState<Record<string, TimePeriod>>({
    users: 'month', revenue: 'month', agents: 'all', pending: 'all', transactions: 'month', platform: 'month',
  });
  const [customDates, setCustomDates] = useState<Record<string, { start: string; end: string }>>({});
  // const [stats, setStats] = useState({
  //   totalUsers: 0, totalRevenue: 0, activeAgents: 0,
  //   pendingAgents: 0, totalTransactions: 0, platformUsers: 0,  totalTransactionCount: 0, totalTransactionAmount: 0,
  // });
  const [stats, setStats] = useState({
  totalUsers: 0, 
  totalRevenue: 0, 
  activeAgents: 0,
  pendingAgents: 0, 
  totalTransactions: 0, 
  platformUsers: 0,
  totalTransactionCount: 0, 
  totalTransactionAmount: 0,
});
  
  const [trends, setTrends] = useState<Record<string, { value?: number; label: string }>>({});

  // ── Fetch profiles ─────────────────────────────────────────────────────────
  const fetchProfiles = useCallback(async () => {
    setLoadingProfiles(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('role', 'admin')
      .order('joined_at', { ascending: false });
    if (!error && data) {
      setProfiles(data as ProfileRow[]);
      setAgentRequests(data.filter((p: any) => p.agent_status === 'pending') as ProfileRow[]);
    }
    setLoadingProfiles(false);
  }, []);

  // ── Fetch transactions ─────────────────────────────────────────────────────
  const fetchTransactions = useCallback(async () => {
    setLoadingTx(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*, profiles(full_name, username, email)')
      .order('created_at', { ascending: false })
      .limit(200);
    if (!error && data) setTransactions(data as Transaction[]);
    setLoadingTx(false);
  }, []);

  // (countRows and sumColumn defined outside component — used below)


const computeStats = useCallback(async () => {
  try {
    setLoadingStats(true);

    const getRange = (key: string) =>
      getPeriodRange(
        statPeriods[key],
        customDates[key]?.start,
        customDates[key]?.end
      );

    // Get all ranges
    const [usersRange, txRange, revRange, platRange] = await Promise.all([
      getRange('users'),
      getRange('transactions'),
      getRange('revenue'),
      getRange('platform'),
    ]);

    // Fetch all statistics
    const [
      totalUsersAll,
      activeAgentsAll,
      pendingAgentsAll,

      usersCurrent,
      usersPrev,

      txCurrent,
      txPrev,

      revCurrent,
      revPrev,

      amtCurrent,
      amtPrev,

      allTxCount,
      allTxAmount,
    ] = await Promise.all([
      // Users
      countRows('profiles', {}, null),
      countRows('profiles', { role: 'agent' }, null),
      countRows('profiles', { agent_status: 'pending' }, null),

      usersRange.current
        ? countRows('profiles', {}, usersRange.current)
        : Promise.resolve(0),

      usersRange.previous
        ? countRows('profiles', {}, usersRange.previous)
        : Promise.resolve(0),

      // Transactions Count (SUCCESS ONLY)
      txRange.current
        ? countRows(
            'transactions',
            { status: 'success' },
            txRange.current
          )
        : Promise.resolve(0),

      txRange.previous
        ? countRows(
            'transactions',
            { status: 'success' },
            txRange.previous
          )
        : Promise.resolve(0),

      // Revenue
      revRange.current
        ? sumColumn(
            'transactions',
            'amount',
            { status: 'success' },
            revRange.current
          )
        : Promise.resolve(0),

      revRange.previous
        ? sumColumn(
            'transactions',
            'amount',
            { status: 'success' },
            revRange.previous
          )
        : Promise.resolve(0),

      // Platform Transaction Amount
      platRange.current
        ? sumColumn(
            'transactions',
            'amount',
            { status: 'success' },
            platRange.current
          )
        : Promise.resolve(0),

      platRange.previous
        ? sumColumn(
            'transactions',
            'amount',
            { status: 'success' },
            platRange.previous
          )
        : Promise.resolve(0),

      // ALL TIME TOTALS
      countRows(
        'transactions',
        { status: 'success' },
        null
      ),

      sumColumn(
        'transactions',
        'amount',
        { status: 'success' },
        null
      ),
    ]);

    console.log('Fetched Stats:', {
      totalUsersAll,
      txCurrent,
      allTxCount,
      allTxAmount,
    });

    setStats({
      totalUsers:
        statPeriods.users === 'all'
          ? totalUsersAll
          : usersCurrent,

      totalRevenue: revCurrent,

      activeAgents: activeAgentsAll,

      pendingAgents: pendingAgentsAll,

      totalTransactions:
        statPeriods.transactions === 'all'
          ? allTxCount
          : txCurrent,

      totalTransactionCount:
        statPeriods.transactions === 'all'
          ? allTxCount
          : txCurrent,

      platformUsers:
        statPeriods.platform === 'all'
          ? allTxAmount
          : amtCurrent,

      totalTransactionAmount:
        statPeriods.platform === 'all'
          ? allTxAmount
          : amtCurrent,
    });

    // If you already have trend calculations,
    // leave them below this section unchanged.

  } catch (error) {
    console.error('Error computing stats:', error);
  } finally {
    setLoadingStats(false);
  }
}, [statPeriods, customDates]);

  // ── Notifications ──────────────────────────────────────────────────────────
  const buildNotifications = useCallback((profs: ProfileRow[], txs: Transaction[]) => {
    const notifs: Notification[] = [];
    profs.filter(p => p.agent_status === 'pending').slice(0, 5).forEach(p => {
      notifs.push({
        id: `agent_${p.id}`, type: 'agent_request',
        message: `${p.full_name} requested agent upgrade`,
        created_at: p.agent_applied_at || new Date().toISOString(), read: false,
      });
    });
    const todayRev = txs.filter(tx =>
      new Date(tx.created_at).toDateString() === new Date().toDateString() && tx.status === 'success'
    ).reduce((s, tx) => s + (tx.amount || 0), 0);
    if (todayRev > 0) {
      notifs.push({
        id: 'rev_today', type: 'revenue',
        message: `Today's revenue: ${formatCurrency(todayRev)}`,
        created_at: new Date().toISOString(), read: false,
      });
    }
    setNotifications(notifs);
  }, []);

  useEffect(() => { fetchProfiles(); fetchTransactions(); }, []);
  useEffect(() => { computeStats(); }, [statPeriods, customDates]);
  useEffect(() => { if (profiles.length || transactions.length) buildNotifications(profiles, transactions); }, [profiles, transactions]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleAction = (action: string, profile: ProfileRow) => {
    if (action === 'view') { setDetailProfile(profile); setShowDetail(true); return; }
    setConfirmAction({ action, profile });
  };

  const executeAction = async () => {
    if (!confirmAction) return;
    const { action, profile } = confirmAction;
    setConfirmAction(null);
    const updates: Partial<ProfileRow> = {};
    if (action === 'upgrade') updates.role = 'agent';
    if (action === 'downgrade') updates.role = 'user';
    if (action === 'deactivate') updates.is_active = false;
    if (action === 'reactivate') updates.is_active = true;
    if (action === 'remove') {
      const { error } = await supabase.from('profiles').delete().eq('id', profile.id);
      if (error) { toast.error(error.message); return; }
      toast.success(`${profile.full_name} removed.`);
      fetchProfiles(); return;
    }
    const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id);
    if (error) { toast.error(error.message); return; }
    const labels: Record<string, string> = { upgrade: 'upgraded to Agent', downgrade: 'downgraded to User', deactivate: 'deactivated', reactivate: 'reactivated' };
    toast.success(`${profile.full_name} ${labels[action]}.`);
    fetchProfiles(); computeStats();
  };

  const handleAcceptAgent = async (profile: ProfileRow) => {
    const { error } = await supabase.from('profiles').update({ role: 'agent', agent_status: 'approved' }).eq('id', profile.id);
    if (error) { toast.error(error.message); return; }
    toast.success(`${profile.full_name} is now an Agent!`);
    fetchProfiles(); computeStats();
  };

  const handleRejectAgent = async (profile: ProfileRow) => {
    const { error } = await supabase.from('profiles').update({ agent_status: 'rejected' }).eq('id', profile.id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Request from ${profile.full_name} rejected.`);
    fetchProfiles();
  };

  // ── Filtered profiles ──────────────────────────────────────────────────────
  const filteredProfiles = profiles.filter(p => {
    const matchSearch = !searchTerm ||
      p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'all' || p.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleStatPeriodChange = (key: string, period: TimePeriod) =>
    setStatPeriods(prev => ({ ...prev, [key]: period }));

  const handleCustomDate = (key: string, which: 'start' | 'end', val: string) =>
    setCustomDates(prev => ({ ...prev, [key]: { ...prev[key], [which]: val } }));

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#084328] rounded-xl flex items-center justify-center shadow-lg">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <div className="hidden sm:block">
              <h2 className="text-base font-black text-slate-900 dark:text-white leading-none">{t('admin_terminal')}</h2>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{t('admin_mgmt')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:block"><LanguageSelector /></div>

            {/* Notifications */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-black text-white flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
            >
              {isDarkMode ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-blue-500" />}
            </button>

            <Button variant="outline"
              className="hidden md:flex gap-2 font-bold border-slate-200 dark:border-slate-700 dark:text-white rounded-xl bg-white dark:bg-slate-900 h-10 px-4 text-sm"
              onClick={onLogout}
            >
              <LogOut size={16} /> {t('dashboard_logout')}
            </Button>

            <button
              onClick={() => setShowSettings(true)}
              className="w-10 h-10 bg-[#084328] rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg"
            >
              {getInitials((user as any).name || 'Admin')}
            </button>
          </div>
        </div>
      </header>

      <NotificationPanel
        open={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
      />

      <AdminSettingsModal open={showSettings} onClose={() => setShowSettings(false)} user={user} />
      <UserDetailModal profile={detailProfile} open={showDetail} onClose={() => setShowDetail(false)} />

      {/* Confirm Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent className="max-w-sm rounded-[1.5rem] dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="font-black text-lg">Confirm Action</DialogTitle>
            <DialogDescription>
              {confirmAction?.action === 'remove' && `Permanently remove ${confirmAction.profile.full_name}? This cannot be undone.`}
              {confirmAction?.action === 'deactivate' && `Deactivate ${confirmAction?.profile.full_name}'s account?`}
              {confirmAction?.action === 'reactivate' && `Reactivate ${confirmAction?.profile.full_name}'s account?`}
              {confirmAction?.action === 'upgrade' && `Upgrade ${confirmAction?.profile.full_name} to Agent?`}
              {confirmAction?.action === 'downgrade' && `Downgrade ${confirmAction?.profile.full_name} to User?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 flex-row">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button
              className={`flex-1 rounded-xl ${confirmAction?.action === 'remove' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#084328] hover:bg-[#063a23]'} text-white font-black`}
              onClick={executeAction}
            >Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* Stats Grid — matches v1 beautiful 4-column layout */}
        <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  // Changing to auto-fit allows the browser to wrap cards naturally 
  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
>
          {/* Total Users */}
          <div className="xl:col-span-1 sm:col-span-1">
            <StatsCard
              title="Total Users"
              value={loadingStats ? '—' : stats.totalUsers.toLocaleString()}
              loading={loadingStats}
              icon={Users}
              color="bg-blue-600"
              period={statPeriods.users}
              onPeriodChange={v => handleStatPeriodChange('users', v)}
              customStart={customDates.users?.start}
              customEnd={customDates.users?.end}
              onCustomChange={(w, v) => handleCustomDate('users', w, v)}
              trend={trends.users?.value}
              trendLabel={trends.users?.label}
            />
          </div>

          {/* Revenue */}
          <div className="xl:col-span-1 sm:col-span-1">
            <StatsCard
              title="Revenue"
              value={loadingStats ? '—' : formatCurrency(stats.totalRevenue)}
              loading={loadingStats}
              icon={TrendingUp}
              color="bg-green-600"
              period={statPeriods.revenue}
              onPeriodChange={v => handleStatPeriodChange('revenue', v)}
              customStart={customDates.revenue?.start}
              customEnd={customDates.revenue?.end}
              onCustomChange={(w, v) => handleCustomDate('revenue', w, v)}
              trend={trends.revenue?.value}
              trendLabel={trends.revenue?.label}
            />
          </div>

          {/* Active Agents */}
          <div className="xl:col-span-1 sm:col-span-1">
            <StatsCard
              title="Active Agents"
              value={loadingStats ? '—' : stats.activeAgents.toLocaleString()}
              loading={loadingStats}
              icon={ShieldCheck}
              color="bg-indigo-600"
              period={statPeriods.agents}
              onPeriodChange={v => handleStatPeriodChange('agents', v)}
              customStart={customDates.agents?.start}
              customEnd={customDates.agents?.end}
              onCustomChange={(w, v) => handleCustomDate('agents', w, v)}
              trend={trends.agents?.value}
              trendLabel={trends.agents?.label}
            />
          </div>

          {/* Agent Applications */}
          <div className="xl:col-span-1 sm:col-span-1">
            <StatsCard
              title="Applications"
              value={loadingStats ? '—' : stats.pendingAgents.toLocaleString()}
              loading={loadingStats}
              icon={ClipboardList}
              color="bg-orange-600"
              period={statPeriods.pending}
              onPeriodChange={v => handleStatPeriodChange('pending', v)}
              customStart={customDates.pending?.start}
              customEnd={customDates.pending?.end}
              onCustomChange={(w, v) => handleCustomDate('pending', w, v)}
              trend={trends.pending?.value}
              trendLabel={trends.pending?.label}
            />
          </div>

          {/* Total Transactions */}
          <div className="xl:col-span-1 sm:col-span-1">
            <StatsCard
              title="Total Transactions"
  value={loadingStats ? '—' : stats.totalTransactionCount.toLocaleString()}
  loading={loadingStats}
  icon={Activity} 
  color="bg-violet-600"
              period={statPeriods.transactions}
              onPeriodChange={v => handleStatPeriodChange('transactions', v)}
              customStart={customDates.transactions?.start}
              customEnd={customDates.transactions?.end}
              onCustomChange={(w, v) => handleCustomDate('transactions', w, v)}
              trend={trends.transactions?.value}
              trendLabel={trends.transactions?.label}
            />
          </div>

          {/* Total Transaction Amount */}
          <div className="xl:col-span-1 sm:col-span-1">
            <StatsCard
             title="Total Transaction Amount"
  value={loadingStats ? '—' : formatCurrency(stats.totalTransactionAmount)}
  loading={loadingStats}
  icon={Wallet}
  color="bg-rose-500"
              period={statPeriods.platform}
              onPeriodChange={v => handleStatPeriodChange('platform', v)}
              customStart={customDates.platform?.start}
              customEnd={customDates.platform?.end}
              onCustomChange={(w, v) => handleCustomDate('platform', w, v)}
              trend={trends.platform?.value}
              trendLabel={trends.platform?.label}
            />
          </div>
        </motion.div>

        

        {/* ── Tabs ── */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-2xl w-full md:w-auto flex overflow-x-auto no-scrollbar">
            {[
              { value: 'users', label: 'Platform Users', icon: Users },
              { value: 'transactions', label: 'All Transactions', icon: Activity },
              { value: 'agents', label: `Agent Requests${agentRequests.length > 0 ? ` (${agentRequests.length})` : ''}`, icon: Star },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-xl px-6 py-2.5 font-black text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-lg dark:text-slate-400 data-[state=active]:text-foreground flex items-center gap-2 whitespace-nowrap"
              >
                <tab.icon size={14} />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">

            {/* ── Platform Users Tab ── */}
            <TabsContent value="users" className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Card className="border-none shadow-xl dark:shadow-none rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900">
                  <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <CardTitle className="text-2xl font-black dark:text-white">User Management</CardTitle>
                        <p className="text-slate-400 text-sm font-medium mt-0.5">{filteredProfiles.length} users shown</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <Input
                            placeholder="Search users..."
                            className="pl-10 w-full md:w-80 h-12 bg-white dark:bg-slate-800 rounded-xl border-slate-100 dark:border-slate-800 shadow-sm text-foreground"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                          />
                        </div>
                        {/* Role filter pills */}
                        <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                          {(['all', 'user', 'agent'] as const).map(r => (
                            <button
                              key={r}
                              onClick={() => setRoleFilter(r)}
                              className={`px-3 py-2 rounded-lg text-xs font-black uppercase transition-all ${
                                roleFilter === r
                                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                  : 'text-slate-400 hover:text-slate-600'
                              }`}
                            >
                              {r === 'all' ? 'All' : r === 'user' ? 'Users' : 'Agents'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  {loadingProfiles ? (
                    <div className="p-12 flex items-center justify-center">
                      <RefreshCw size={24} className="text-slate-300 animate-spin" />
                    </div>
                  ) : filteredProfiles.length === 0 ? (
                    <EmptyState
                      icon={Users}
                      title="No users found"
                      subtitle={searchTerm || roleFilter !== 'all' ? 'Try adjusting your search or filter.' : 'No users have registered yet.'}
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-slate-800/30">
                          <TableRow className="border-none">
                            <TableHead className="px-8 font-black text-slate-400 py-4 uppercase text-[10px] tracking-widest">Member</TableHead>
                            <TableHead className="font-black text-slate-400 py-4 uppercase text-[10px] tracking-widest">Access</TableHead>
                            <TableHead className="font-black text-slate-400 py-4 uppercase text-[10px] tracking-widest">Balance</TableHead>
                            <TableHead className="font-black text-slate-400 py-4 uppercase text-[10px] tracking-widest">Status</TableHead>
                            <TableHead className="font-black text-slate-400 py-4 uppercase text-[10px] tracking-widest">Joined</TableHead>
                            <TableHead className="px-8 text-right font-black text-slate-400 py-4 uppercase text-[10px] tracking-widest">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <AnimatePresence>
                            {filteredProfiles.map((p, i) => (
                              <motion.tr
                                key={p.id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: i * 0.02 }}
                                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-slate-50 dark:border-slate-800 transition-colors group"
                              >
                                <TableCell className="px-8 py-5">
                                  <div className="flex items-center gap-4">
                                    <UserAvatar name={p.full_name} />
                                    <div>
                                      <p className="font-black text-slate-900 dark:text-white">{p.full_name}</p>
                                      <p className="text-slate-400 text-sm font-medium">@{p.username} · {p.email}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={
                                    p.role === 'agent'
                                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 border-none'
                                      : 'bg-green-600/10 text-green-600 dark:text-green-500 hover:bg-green-600/10 border-none'
                                  }>
                                    {p.role?.toUpperCase()}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-black text-slate-900 dark:text-white">
                                  {formatCurrency(p.wallet_balance)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1.5">
                                    <div className={`w-2.5 h-2.5 rounded-full ${p.is_active !== false ? 'bg-green-500' : 'bg-red-400'}`} />
                                    <span className={`text-sm font-bold ${p.is_active !== false ? 'text-green-600' : 'text-red-400'}`}>
                                      {p.is_active !== false ? 'Active' : 'Inactive'}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                                  {p.joined_at ? formatDate(p.joined_at) : '—'}
                                </TableCell>
                                <TableCell className="px-8 text-right">
                                  <ActionMenu profile={p} onAction={handleAction} />
                                </TableCell>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </Card>
              </motion.div>
            </TabsContent>

            {/* ── All Transactions Tab ── */}
            <TabsContent value="transactions">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Card className="border-none shadow-xl dark:shadow-none rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900">
                  <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl font-black dark:text-white">All Transactions</CardTitle>
                        <p className="text-slate-400 text-sm font-medium mt-0.5">{transactions.length} records</p>
                      </div>
                      <Button variant="outline" onClick={fetchTransactions} className="gap-2 rounded-xl border-slate-200 dark:border-slate-700 font-bold text-sm h-10 bg-white dark:bg-slate-900 text-foreground">
                        <RefreshCw size={14} /> Refresh
                      </Button>
                    </div>
                  </CardHeader>

                  {loadingTx ? (
                    <div className="p-12 flex items-center justify-center">
                      <RefreshCw size={24} className="text-slate-300 animate-spin" />
                    </div>
                  ) : transactions.length === 0 ? (
                    <EmptyState icon={Activity} title="No transactions yet" subtitle="All platform transactions will appear here." />
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-slate-800/30">
                          <TableRow className="border-none">
                            {['Member', 'Type', 'Amount', 'Status', 'Date'].map(h => (
                              <TableHead key={h} className="px-8 font-black text-slate-400 py-4 uppercase text-[10px] tracking-widest">{h}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactions.slice(0, 50).map((tx) => (
                            <TableRow key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-slate-50 dark:border-slate-800 transition-colors">
                              <TableCell className="px-8 py-5">
                                <div className="flex items-center gap-4">
                                  <UserAvatar name={tx.profiles?.full_name || 'Unknown'} size="sm" />
                                  <div>
                                    <p className="font-black text-slate-900 dark:text-white">{tx.profiles?.full_name || 'Unknown'}</p>
                                    <p className="text-slate-400 text-sm font-medium">@{tx.profiles?.username || '—'}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-black uppercase text-slate-600 dark:text-slate-300">
                                  {tx.type || '—'}
                                </span>
                              </TableCell>
                              <TableCell className="font-black text-slate-900 dark:text-white">
                                {formatCurrency(tx.amount)}
                              </TableCell>
                              <TableCell>
                                <Badge className={
                                  tx.status === 'success'
                                    ? 'bg-green-600/10 text-green-600 dark:text-green-500 border-none'
                                    : tx.status === 'pending'
                                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border-none'
                                    : 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400 border-none'
                                }>
                                  {(tx.status || 'unknown').toUpperCase()}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-slate-500 dark:text-slate-400 font-medium text-sm px-8">
                                {formatDate(tx.created_at)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </Card>
              </motion.div>
            </TabsContent>

            {/* ── Agent Requests Tab ── */}
            <TabsContent value="agents">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Agent Upgrade Requests</h3>
                    <p className="text-slate-400 text-sm font-medium mt-0.5">{agentRequests.length} pending review</p>
                  </div>
                  <Button variant="outline" onClick={fetchProfiles} className="gap-2 rounded-xl border-slate-200 dark:border-slate-700 font-bold text-sm h-10 bg-white dark:bg-slate-900 text-foreground">
                    <RefreshCw size={14} /> Refresh
                  </Button>
                </div>

                {agentRequests.length === 0 ? (
                  <Card className="border-none shadow-xl dark:shadow-none rounded-[2rem] bg-white dark:bg-slate-900">
                    <EmptyState
                      icon={ClipboardList}
                      title="No pending requests"
                      subtitle="Agent upgrade applications from users will appear here."
                    />
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {agentRequests.map(p => (
                      <AgentRequestCard
                        key={p.id}
                        profile={p}
                        onAccept={handleAcceptAgent}
                        onReject={handleRejectAgent}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </TabsContent>

          </AnimatePresence>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
