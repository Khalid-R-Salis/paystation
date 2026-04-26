import React from 'react';
import {
  Users, ShieldCheck, TrendingUp, Zap, Search,
  Filter, LogOut, ChevronRight, Moon, Sun
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

interface AdminDashboardProps {
  user: UserType;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout, isDarkMode, toggleTheme }) => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 transition-colors duration-300">
      <header className="max-w-7xl mx-auto flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#084328] rounded-2xl flex items-center justify-center shadow-xl">
            <ShieldCheck className="text-white" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('admin_terminal')}</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest">{t('admin_mgmt')}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden md:block">
              <LanguageSelector />
           </div>
           <button 
              onClick={toggleTheme} 
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm text-slate-600 dark:text-slate-400"
            >
              {isDarkMode ? <Sun size={22} className="text-yellow-500" /> : <Moon size={22} className="text-blue-500" />}
            </button>
           <Button variant="outline" className="hidden md:flex gap-2 font-bold border-slate-200 dark:border-slate-800 dark:text-white rounded-xl bg-white dark:bg-slate-900 text-foreground" onClick={onLogout}>
             <LogOut size={18} /> {t('dashboard_logout')}
           </Button>
           <Avatar className="w-12 h-12 border-2 border-[#084328] shadow-lg">
             <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Admin`} />
             <AvatarFallback>AD</AvatarFallback>
           </Avatar>
        </div>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard title="Total Users" value="48,291" change="+18%" icon={Users} color="bg-blue-600" />
          <StatsCard title="Daily Revenue" value="\\u20a62.4M" change="+12%" icon={TrendingUp} color="bg-green-600" />
          <StatsCard title="Active Agents" value="1,204" change="+5%" icon={ShieldCheck} color="bg-indigo-600" />
          <StatsCard title="Service Health" value="99.9%" change="Stable" icon={Zap} color="bg-orange-600" />
        </div>

        <Tabs defaultValue="users" className="space-y-8">
          <TabsList className="bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-2xl w-full md:w-auto flex overflow-x-auto no-scrollbar">
            <TabsTrigger value="users" className="rounded-xl px-8 py-2.5 font-black text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-lg dark:text-slate-400 data-[state=active]:text-foreground">Platform Users</TabsTrigger>
            <TabsTrigger value="transactions" className="rounded-xl px-8 py-2.5 font-black text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-lg dark:text-slate-400 data-[state=active]:text-foreground">All Transactions</TabsTrigger>
            <TabsTrigger value="agents" className="rounded-xl px-8 py-2.5 font-black text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-lg dark:text-slate-400 data-[state=active]:text-foreground">Agent Requests</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="users" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="border-none shadow-xl dark:shadow-none rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900">
                  <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <CardTitle className="text-2xl font-black dark:text-white">User Management</CardTitle>
                      <div className="flex gap-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <Input placeholder="Search users..." className="pl-10 w-full md:w-80 h-12 bg-white dark:bg-slate-800 rounded-xl border-slate-100 dark:border-slate-800 shadow-sm text-foreground" />
                        </div>
                        <Button variant="outline" className="h-12 w-12 rounded-xl p-0 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-foreground"><Filter size={20} /></Button>
                      </div>
                    </div>
                  </CardHeader>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50/50 dark:bg-slate-800/30">
                        <TableRow className="border-none">
                          <TableHead className="px-8 font-black text-slate-400 py-4 uppercase text-[10px] tracking-widest">Member</TableHead>
                          <TableHead className="font-black text-slate-400 py-4 uppercase text-[10px] tracking-widest">Access</TableHead>
                          <TableHead className="font-black text-slate-400 py-4 uppercase text-[10px] tracking-widest">Balance</TableHead>
                          <TableHead className="font-black text-slate-400 py-4 uppercase text-[10px] tracking-widest">Joined</TableHead>
                          <TableHead className="font-black text-slate-400 py-4 uppercase text-[10px] tracking-widest">Status</TableHead>
                          <TableHead className="px-8 text-right font-black text-slate-400 py-4 uppercase text-[10px] tracking-widest">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <TableRow key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-slate-50 dark:border-slate-800 transition-colors group">
                            <TableCell className="px-8 py-5">
                              <div className="flex items-center gap-4">
                                <Avatar className="w-10 h-10 shadow-sm">
                                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} />
                                  <AvatarFallback>U{i}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-black text-slate-900 dark:text-white">User Profile {i}</p>
                                  <p className="text-slate-400 text-sm font-medium">user{i}@paystation.com</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                               <Badge className={i % 3 === 0 ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50' : 'bg-green-600/10 text-green-600 dark:text-green-500 hover:bg-green-600/10 border-none'}>
                                 {i % 3 === 0 ? 'AGENT' : 'CUSTOMER'}
                               </Badge>
                            </TableCell>
                            <TableCell className="font-black text-slate-900 dark:text-white">\\u20a6{(12500 * i).toLocaleString()}</TableCell>
                            <TableCell className="text-slate-500 dark:text-slate-400 font-medium text-sm">Oct {10+i}, 2023</TableCell>
                            <TableCell><span className="w-2.5 h-2.5 bg-green-500 rounded-full inline-block mr-2" /> Active</TableCell>
                            <TableCell className="px-8 text-right">
                              <Button variant="ghost" size="icon" className="group-hover:bg-white dark:group-hover:bg-slate-800 shadow-none text-foreground"><ChevronRight size={18} /></Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="transactions">
               <motion.div
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
               >
                 <Card className="border-none shadow-xl dark:shadow-none rounded-[2rem] p-12 text-center bg-white dark:bg-slate-900 flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-3xl flex items-center justify-center mb-4">
                       <Zap size={40} />
                    </div>
                    <h3 className="text-2xl font-black dark:text-white">Transaction Monitoring</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-lg font-medium leading-relaxed">Real-time view of all platform activities will appear here. Currently syncing with payment gateways...</p>
                    <Button className="mt-4 bg-[#084328] text-white h-14 px-8 rounded-2xl font-black">Refresh Data Sync</Button>
                 </Card>
               </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </div>
  );
};

const StatsCard = ({ title, value, change, icon: Icon, color }: any) => (
  <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
    <CardContent className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} text-white shadow-xl shadow-current/30 group-hover:scale-110 transition-transform`}>
          <Icon size={28} />
        </div>
        <div className="text-right">
           <p className="text-green-600 font-black text-sm">{change}</p>
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-tighter">vs last month</p>
        </div>
      </div>
      <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mb-1 uppercase tracking-widest">{title}</p>
      <h3 className="text-3xl font-black text-slate-900 dark:text-white">{value}</h3>
    </CardContent>
  </Card>
);

export default AdminDashboard;