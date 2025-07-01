"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSend, FiRefreshCw, FiCheck, FiX, FiUser, FiPhone, FiMessageSquare, FiWifi, FiPlus, FiTrash2 } from 'react-icons/fi';
import { MdLinkOff } from 'react-icons/md';

import DashboardLayout from "../../admin_dashboard_layout/layout"

export default function WhatsAppDashboard() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [number, setNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);
  const [connectingAccounts, setConnectingAccounts] = useState({});
  const [qrData, setQrData] = useState({});
  const [newAccount, setNewAccount] = useState({ name: '', appKey: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingAccounts, setDeletingAccounts] = useState({});
  const [eventSource, setEventSource] = useState(null);

  // Fetch accounts from backend
  const fetchAccounts = async () => {
    try {
      const response = await axios.get('https://baileys-r2cr.onrender.com/accounts');
      setAccounts(response.data);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  };

  // Setup connection to SSE
  useEffect(() => {
    const setupEventSource = () => {
      const es = new EventSource('https://baileys-r2cr.onrender.com/events');
      
      es.addEventListener('status', (event) => {
        const data = JSON.parse(event.data);
        setAccounts(prev => prev.map(acc => 
          acc.appKey === data.appKey ? { ...acc, status: data.status } : acc
        ));
      });
      
      es.addEventListener('qr', (event) => {
        const data = JSON.parse(event.data);
        setQrData(prev => ({ ...prev, [data.appKey]: data.qr }));
        setConnectingAccounts(prev => ({ ...prev, [data.appKey]: true }));
      });
      
      es.addEventListener('connected', (event) => {
        const data = JSON.parse(event.data);
        setQrData(prev => ({ ...prev, [data.appKey]: null }));
        setConnectingAccounts(prev => ({ ...prev, [data.appKey]: false }));
        setAccounts(prev => prev.map(acc => 
          acc.appKey === data.appKey 
            ? { ...acc, status: 'connected', phoneNumber: data.phoneNumber } 
            : acc
        ));
      });
      
      es.onerror = (error) => {
        console.error('SSE error:', error);
        es.close();
        setTimeout(setupEventSource, 5000);
      };
      
      setEventSource(es);
      return es;
    };

    const es = setupEventSource();
    
    // Initial fetch
    fetchAccounts();
    
    return () => {
      if (es) es.close();
    };
  }, []);

  // Connect account handler
  const connectAccount = async (appKey) => {
    try {
      setConnectingAccounts(prev => ({ ...prev, [appKey]: true }));
      await axios.post(`https://baileys-r2cr.onrender.com/connect/${appKey}`);
    } catch (error) {
      console.error(`Error connecting ${appKey}:`, error);
      setConnectingAccounts(prev => ({ ...prev, [appKey]: false }));
    }
  };

  // Delete auth data for account
  const deleteAuthData = async (appKey) => {
    if (!window.confirm('Are you sure you want to disconnect this account? You will need to scan the QR code again.')) {
      return;
    }

    try {
      setDeletingAccounts(prev => ({ ...prev, [appKey]: true }));
      await axios.post(`https://baileys-r2cr.onrender.com/disconnect/${appKey}`);
      
      setAccounts(prev => prev.map(acc => 
        acc.appKey === appKey ? { ...acc, status: 'disconnected' } : acc
      ));
      
      if (selectedAccount === appKey) {
        setSelectedAccount(null);
      }
    } catch (error) {
      console.error(`Error disconnecting account for ${appKey}:`, error);
      alert(`Failed to disconnect: ${error.response?.data?.error || error.message}`);
    } finally {
      setDeletingAccounts(prev => ({ ...prev, [appKey]: false }));
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!selectedAccount) {
      setSendStatus({ success: false, error: 'Please select an account' });
      return;
    }
    
    if (!number || !message) {
      setSendStatus({ success: false, error: 'Number and message are required' });
      return;
    }

    setIsSending(true);
    setSendStatus(null);

    try {
      const response = await axios.post('https://baileys-r2cr.onrender.com/send-message', {
        account: selectedAccount,
        number,
        message
      });
      
      setSendStatus({ 
        success: true, 
        message: `Message sent to ${response.data.number}` 
      });
      
      setMessage('');
    } catch (error) {
      setSendStatus({ 
        success: false, 
        error: error.response?.data?.error || error.message 
      });
    } finally {
      setIsSending(false);
    }
  };

  // Add new account
  const addAccount = async () => {
    if (!newAccount.name || !newAccount.appKey) {
      alert('Name and App Key are required');
      return;
    }

    try {
      const response = await axios.post('https://baileys-r2cr.onrender.com/accounts', {
        name: newAccount.name,
        appKey: newAccount.appKey
      });
      
      setAccounts([...accounts, response.data]);
      setNewAccount({ name: '', appKey: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add account:', error);
      alert(error.response?.data?.error || 'Failed to add account');
    }
  };

  // Refresh accounts manually
  const refreshAccounts = async () => {
    await fetchAccounts();
    setSendStatus(null);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              WhatsApp Business Manager
            </h1>
            <p className="text-base md:text-lg text-gray-600">
              Connect and manage multiple WhatsApp accounts
            </p>
          </header>

          {/* Account Cards */}
          <section className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800 flex items-center">
                <FiUser className="mr-2 text-teal-600" /> Your Accounts
              </h2>
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <button
                  onClick={refreshAccounts}
                  className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition w-full md:w-auto justify-center"
                >
                  <FiRefreshCw className="mr-2" />
                  Refresh
                </button>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition w-full md:w-auto justify-center"
                >
                  <FiPlus className="mr-2" />
                  Add Account
                </button>
              </div>
            </div>

            {/* Add Account Form */}
            {showAddForm && (
              <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6 border border-gray-100">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Add New WhatsApp Account</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                    <input
                      type="text"
                      value={newAccount.name}
                      onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                      placeholder="e.g., Business Account"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unique App Key</label>
                    <input
                      type="text"
                      value={newAccount.appKey}
                      onChange={(e) => setNewAccount({...newAccount, appKey: e.target.value})}
                      placeholder="e.g., business1"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addAccount}
                    className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition text-sm"
                  >
                    Save Account
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {accounts.map(account => (
                <div 
                  key={account.appKey} 
                  className={`bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 border-l-4 ${
                    account.status === 'connected' ? 'border-teal-500' : 
                    account.status === 'initializing' ? 'border-blue-400' : 
                    account.status === 'error' ? 'border-red-400' : 
                    'border-gray-300'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="w-[calc(100%-60px)]">
                        <h3 className="text-base font-bold text-gray-800 truncate">{account.name}</h3>
                        <p className="text-xs text-gray-500 truncate">Key: {account.appKey}</p>
                        {account.phoneNumber && (
                          <p className="text-xs text-gray-500 truncate">Phone: {account.phoneNumber}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        account.status === 'connected' ? 'bg-teal-100 text-teal-800' : 
                        account.status === 'initializing' ? 'bg-blue-100 text-blue-800' : 
                        account.status === 'error' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {account.status || 'disconnected'}
                      </span>
                    </div>
                    
                    {account.status !== 'connected' && (
                      <div className="mt-3">
                        <button
                          onClick={() => connectAccount(account.appKey)}
                          disabled={connectingAccounts[account.appKey]}
                          className={`w-full py-2 rounded-md flex items-center justify-center text-sm ${
                            connectingAccounts[account.appKey] 
                              ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                              : 'bg-teal-100 hover:bg-teal-200 text-teal-700'
                          }`}
                        >
                          {connectingAccounts[account.appKey] ? (
                            <>
                              <FiRefreshCw className="animate-spin mr-2" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <FiWifi className="mr-2" />
                              Connect Account
                            </>
                          )}
                        </button>
                      </div>
                    )}
                    
                    {connectingAccounts[account.appKey] && qrData[account.appKey] && (
                      <div className="mt-3 animate-pulse">
                        <div className="text-center mb-2">
                          <p className="text-xs font-medium text-gray-700">Scan with WhatsApp</p>
                          <p className="text-[10px] text-gray-500 mt-1">Linked Devices → Link a Device</p>
                        </div>
                        <div className="flex justify-center">
                          <img 
                            src={qrData[account.appKey]} 
                            alt="QR Code" 
                            className="w-full max-w-[150px] rounded border-2 border-white shadow"
                          />
                        </div>
                      </div>
                    )}

                    {account.status === 'error' && (
                      <div className="mt-3 text-center text-red-500 text-xs">
                        Connection failed. Try again.
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-2 flex">
                    <button
                      onClick={() => {
                        if (account.status === 'connected') {
                          setSelectedAccount(account.appKey);
                          setSendStatus(null);
                        }
                      }}
                      disabled={account.status !== 'connected'}
                      className={`flex-1 py-2 rounded-md text-xs font-medium transition ${
                        selectedAccount === account.appKey
                          ? 'bg-teal-600 text-white'
                          : account.status === 'connected'
                            ? 'bg-white border border-teal-500 text-teal-600 hover:bg-teal-50'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {selectedAccount === account.appKey 
                        ? 'Selected' 
                        : account.status === 'connected'
                          ? 'Select Account'
                          : 'Not Connected'}
                    </button>
                    
                    <button
                      onClick={() => deleteAuthData(account.appKey)}
                      disabled={deletingAccounts[account.appKey]}
                      className={`ml-2 px-3 py-2 rounded-md text-xs font-medium transition ${
                        deletingAccounts[account.appKey]
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'bg-white border border-red-500 text-red-600 hover:bg-red-50'
                      }`}
                      title="Disconnect this account?"
                    >
                      {deletingAccounts[account.appKey] ? (
                        <FiRefreshCw className="animate-spin" />
                      ) : (
                        <MdLinkOff />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Send Message Section */}
{selectedAccount && (
  <section className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6 border border-gray-100">
    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
      <FiSend className="mr-2 text-teal-600" /> Send Message
    </h2>
    
    {/* Account Info */}
    <div className="mb-5">
      <div className="flex items-center">
        <div className="mr-3 flex-shrink-0 relative group">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center overflow-hidden">
            <span 
              className="font-bold text-teal-700 text-xs truncate px-1"
              title={accounts.find(a => a.appKey === selectedAccount)?.name || selectedAccount}
            >
              {(() => {
                const name = accounts.find(a => a.appKey === selectedAccount)?.name || selectedAccount;
                return name.length > 5 ? `${name.substring(0, 5)}...` : name;
              })()}
            </span>
          </div>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
            {accounts.find(a => a.appKey === selectedAccount)?.name || selectedAccount}
          </div>
        </div>
        
        <div className="min-w-0">
          <p 
            className="font-medium text-gray-800 truncate"
            title={selectedAccount}
          >
            {selectedAccount}
          </p>
          <p className="text-xs text-teal-600">
            Status: Connected
          </p>
        </div>
      </div>
    </div>
    
    {/* Form Fields */}
    <div className="grid grid-cols-1 gap-4 mb-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
          <FiPhone className="mr-2 text-teal-600" /> Phone Number
        </label>
        <input
          type="text"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="e.g., 15551234567"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Include country code without spaces or special characters
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
          <FiMessageSquare className="mr-2 text-teal-600" /> Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows="3"
          placeholder="Type your message here..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
      </div>
    </div>
    
    {/* Status and Submit */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="min-w-0">
        {sendStatus && (
          <div className={`flex items-center text-sm ${
            sendStatus.success ? 'text-teal-600' : 'text-red-600'
          }`}>
            {sendStatus.success ? (
              <>
                <FiCheck className="mr-1" />
                <span className="truncate">{sendStatus.message}</span>
              </>
            ) : (
              <>
                <FiX className="mr-1" />
                <span className="truncate">{sendStatus.error}</span>
              </>
            )}
          </div>
        )}
      </div>
      
      <button
        onClick={sendMessage}
        disabled={isSending}
        className={`flex items-center justify-center px-4 py-2.5 rounded-lg font-medium text-white shadow transition min-w-[140px] ${
          isSending
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700'
        }`}
      >
        <FiSend className="mr-2 text-sm" />
        {isSending ? 'Sending...' : 'Send Message'}
      </button>
    </div>
  </section>
)}
          
          {accounts.length === 0 && !showAddForm && (
            <div className="text-center py-12">
              <div className="bg-gray-100 border-2 border-dashed rounded-xl w-16 h-16 mx-auto flex items-center justify-center mb-4">
                <FiUser className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No accounts yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Get started by adding your first WhatsApp account to begin sending messages.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition"
              >
                <FiPlus className="mr-2" />
                Add Account
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
