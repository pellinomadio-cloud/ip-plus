import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Users, 
  DollarSign, 
  Edit3, 
  Search, 
  X, 
  Check, 
  ShieldCheck, 
  Save,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Clock,
  XCircle,
  Copy,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { User } from '../types';
import { formatCurrency } from '../data/marketData';
import { useAuth } from '../context/AuthContext';

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const { 
    trc20WalletAddress, 
    updateTrc20WalletAddress, 
    depositRequests, 
    approveDepositRequest, 
    rejectDepositRequest 
  } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newBalanceInput, setNewBalanceInput] = useState<string>('');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Wallet Address State
  const [walletInput, setWalletInput] = useState<string>(trc20WalletAddress || 'TX9b8K2mN1x4Vp7L6rE3d9QzF8s2Jw1yAc');
  const [walletSavedNotice, setWalletSavedNotice] = useState<boolean>(false);

  // Load all users from localStorage
  const loadUsersFromDb = () => {
    try {
      const savedDb = localStorage.getItem('iq_plus_registered_users');
      const parsed: User[] = savedDb ? JSON.parse(savedDb) : [];
      setUsers(parsed);
    } catch {
      setUsers([]);
    }
  };

  useEffect(() => {
    loadUsersFromDb();
  }, []);

  useEffect(() => {
    if (trc20WalletAddress) {
      setWalletInput(trc20WalletAddress);
    }
  }, [trc20WalletAddress]);

  const handleEditBalanceClick = (user: User) => {
    setSelectedUser(user);
    setNewBalanceInput(user.balance.toString());
  };

  const handleSaveBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const parsedNum = parseFloat(newBalanceInput);
    if (isNaN(parsedNum) || parsedNum < 0) {
      setNotice({ type: 'error', text: 'Please enter a valid balance amount.' });
      return;
    }

    try {
      const savedDbStr = localStorage.getItem('iq_plus_registered_users');
      const db: User[] = savedDbStr ? JSON.parse(savedDbStr) : [];
      const userIndex = db.findIndex(u => u.email.toLowerCase() === selectedUser.email.toLowerCase());

      if (userIndex >= 0) {
        db[userIndex].balance = Number(parsedNum.toFixed(2));
        localStorage.setItem('iq_plus_registered_users', JSON.stringify(db));

        // If editing active logged in user, update active session too
        const activeUserStr = localStorage.getItem('iq_plus_active_user');
        if (activeUserStr) {
          const activeUser: User = JSON.parse(activeUserStr);
          if (activeUser.email.toLowerCase() === selectedUser.email.toLowerCase()) {
            activeUser.balance = Number(parsedNum.toFixed(2));
            localStorage.setItem('iq_plus_active_user', JSON.stringify(activeUser));
          }
        }

        setNotice({ 
          type: 'success', 
          text: `Balance for ${selectedUser.name} updated to $${parsedNum.toFixed(2)}!` 
        });
        setSelectedUser(null);
        loadUsersFromDb();
        setTimeout(() => setNotice(null), 3000);
      }
    } catch (e) {
      console.error(e);
      setNotice({ type: 'error', text: 'Failed to update balance.' });
    }
  };

  const handleToggleKyc = (user: User) => {
    try {
      const savedDbStr = localStorage.getItem('iq_plus_registered_users');
      const db: User[] = savedDbStr ? JSON.parse(savedDbStr) : [];
      const idx = db.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());

      if (idx >= 0) {
        db[idx].isKycVerified = !db[idx].isKycVerified;
        localStorage.setItem('iq_plus_registered_users', JSON.stringify(db));
        loadUsersFromDb();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveWalletAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletInput.trim()) return;

    updateTrc20WalletAddress(walletInput.trim());
    setWalletSavedNotice(true);
    setTimeout(() => setWalletSavedNotice(false), 3000);
  };

  const handleApproveDeposit = (reqId: string) => {
    const res = approveDepositRequest(reqId);
    if (res.success) {
      setNotice({ type: 'success', text: res.message });
      loadUsersFromDb();
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const handleRejectDeposit = (reqId: string) => {
    const res = rejectDepositRequest(reqId);
    if (res.success) {
      setNotice({ type: 'error', text: res.message });
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.accountNumber && u.accountNumber.toLowerCase().includes(search.toLowerCase()))
  );

  const pendingRequests = depositRequests.filter(r => r.status === 'pending_review');

  const totalPlatformCapital = users.reduce((acc, u) => acc + (u.balance || 0), 0);

  return (
    <div className="min-h-screen bg-[#070A0F] text-white pb-24 select-none">
      {/* Top Header Bar for Full-Screen Page */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#090D14] border-b border-slate-800/80 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#141B27] border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
            aria-label="Back to Settings"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white leading-tight">Admin Dashboard</h1>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                AUTHENTICATED
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Platform Management & User Balances</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="py-1.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition-colors cursor-pointer"
        >
          Exit Admin
        </button>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-5">
        {/* Notice alert */}
        {notice && (
          <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            notice.type === 'success' 
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}>
            {notice.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{notice.text}</span>
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 bg-[#121824] border border-slate-800 rounded-2xl">
            <span className="text-slate-400 text-xs block">Registered Users</span>
            <span className="font-mono font-bold text-xl text-white mt-1 block">{users.length}</span>
          </div>
          <div className="p-3.5 bg-[#121824] border border-slate-800 rounded-2xl">
            <span className="text-slate-400 text-xs block">Platform Capital</span>
            <span className="font-mono font-bold text-xl text-amber-400 mt-1 block">
              {formatCurrency(totalPlatformCapital)}
            </span>
          </div>
          <div className="p-3.5 bg-[#121824] border border-slate-800 rounded-2xl">
            <span className="text-slate-400 text-xs block">Pending Review</span>
            <span className={`font-mono font-bold text-xl mt-1 block ${pendingRequests.length > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
              {pendingRequests.length}
            </span>
          </div>
        </div>

        {/* Admin Section 1: TRC20 Deposit Wallet Address Settings */}
        <div className="p-4 bg-[#121824] border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#26A17B]" />
              TRC20 Deposit Wallet Address Config
            </h3>
            <span className="text-[10px] text-[#26A17B] bg-[#26A17B]/10 px-2 py-0.5 rounded font-mono font-bold">
              USDT (TRC20)
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Change the default TRC20 wallet address presented to users on the deposit page.
          </p>

          {walletSavedNotice && (
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>TRC20 Wallet Address updated! All user deposit pages will now display this address.</span>
            </div>
          )}

          <form onSubmit={handleSaveWalletAddress} className="flex gap-2">
            <input
              type="text"
              required
              value={walletInput}
              onChange={(e) => setWalletInput(e.target.value)}
              className="flex-1 px-3 py-2 bg-[#0B0F17] border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-[#26A17B]"
              placeholder="Enter TRC20 wallet address..."
            />
            <button
              type="submit"
              className="py-2 px-4 bg-[#26A17B] hover:bg-[#208f6d] text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Address</span>
            </button>
          </form>
        </div>

        {/* Admin Section 2: Pending User Deposit Reviews */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Pending Deposits Review Queue ({pendingRequests.length})
            </h3>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="p-4 text-center bg-[#121824] border border-slate-800 rounded-2xl text-slate-400 text-xs">
              No pending deposit requests awaiting review.
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {pendingRequests.map(req => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-2xl bg-[#121824] border border-amber-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{req.userName}</span>
                      <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
                        ${req.amount.toFixed(2)} USDT ({req.network})
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{req.userEmail}</p>
                    <p className="text-[10px] font-mono text-slate-500 truncate">TxHash: {req.txHash}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleRejectDeposit(req.id)}
                      className="py-1.5 px-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApproveDeposit(req.id)}
                      className="py-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer shadow-md shadow-emerald-500/20"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Approve & Credit</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admin Section 3: Registered Accounts Management */}
        <div className="space-y-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              Registered User Accounts ({filteredUsers.length})
            </h3>

            {/* Search Input */}
            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#121824] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50"
              />
            </div>
          </div>

          {/* Table / Cards List */}
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center bg-[#121824] border border-slate-800 rounded-2xl text-slate-400 text-xs">
              No registered users found in database.
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className="p-3.5 rounded-2xl bg-[#121824] border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm truncate">{user.name}</span>
                      <span className="font-mono text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                        {user.accountNumber || 'IQ-881230'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Balance</span>
                      <span className="font-mono font-bold text-sm text-emerald-400">
                        {formatCurrency(user.balance)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditBalanceClick(user)}
                        className="py-1.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Balance</span>
                      </button>

                      <button
                        onClick={() => handleToggleKyc(user)}
                        className={`p-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                          user.isKycVerified
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                        title="Toggle KYC"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit User Balance Modal Popup */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#121824] border border-amber-400/50 w-full max-w-sm rounded-2xl p-5 shadow-2xl text-white space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h4 className="font-bold text-sm text-amber-400">Edit User Balance</h4>
                  <p className="text-xs text-slate-300 font-semibold">{selectedUser.name}</p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveBalance} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    New Balance Amount (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={newBalanceInput}
                      onChange={(e) => setNewBalanceInput(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-xl text-base font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[0, 100, 500, 1000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setNewBalanceInput(amt.toString())}
                      className="py-1 rounded bg-slate-800 text-[11px] font-mono text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                    >
                      ${amt}
                    </button>
                  ))}
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Balance</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
