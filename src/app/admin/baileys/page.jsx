"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSend, FiRefreshCw, FiCheck, FiX, FiUser, FiPhone, FiMessageSquare, FiWifi, FiPlus } from 'react-icons/fi';
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

  // Fetch accounts from backend
  const fetchAccounts = async () => {
    try {
      const response = await axios.get('https://baileys-vpc9.onrender.com/accounts');
      setAccounts(response.data);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  };

  // Setup connection to SSE
  useEffect(() => {
    const eventSource = new EventSource('https://baileys-vpc9.onrender.com/events');
    
    eventSource.addEventListener('status', (event) => {
      const data = JSON.parse(event.data);
      setAccounts(prev => prev.map(acc => 
        acc.appKey === data.appKey ? { ...acc, status: data.status } : acc
      ));
    });
    
    eventSource.addEventListener('qr', (event) => {
      const data = JSON.parse(event.data);
      setQrData(prev => ({ ...prev, [data.appKey]: data.qr }));
      setConnectingAccounts(prev => ({ ...prev, [data.appKey]: true }));
    });
    
    eventSource.addEventListener('connected', (event) => {
      const data = JSON.parse(event.data);
      setQrData(prev => ({ ...prev, [data.appKey]: null }));
      setConnectingAccounts(prev => ({ ...prev, [data.appKey]: false }));
      setAccounts(prev => prev.map(acc => 
        acc.appKey === data.appKey ? { ...acc, status: 'connected', phoneNumber: data.phoneNumber } : acc
      ));
    });
    
    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      setTimeout(() => {
        eventSource.close();
        const newEventSource = new EventSource('https://baileys-vpc9.onrender.com/events');
        // Reattach event listeners
        newEventSource.addEventListener('status', eventSource.onstatus);
        newEventSource.addEventListener('qr', eventSource.onqr);
        newEventSource.addEventListener('connected', eventSource.onconnected);
      }, 5000);
    };
    
    // Initial fetch
    fetchAccounts();
    
    return () => {
      eventSource.close();
    };
  }, []);

  // Connect account handler
  const connectAccount = async (appKey) => {
    try {
      setConnectingAccounts(prev => ({ ...prev, [appKey]: true }));
      await axios.post(`https://baileys-vpc9.onrender.com/connect/${appKey}`);
    } catch (error) {
      console.error(`Error connecting ${appKey}:`, error);
      setConnectingAccounts(prev => ({ ...prev, [appKey]: false }));
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
      const response = await axios.post('https://baileys-vpc9.onrender.com/send-message', {
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
      const response = await axios.post('https://baileys-vpc9.onrender.com/accounts', {
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
 <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            WhatsApp Business Manager
          </h1>
          <p className="text-lg text-gray-600">
            Connect and manage multiple WhatsApp accounts
          </p>
        </header>

        {/* Account Cards */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
              <FiUser className="mr-2" /> Your Accounts
            </h2>
            <div className="flex space-x-4">
              <button
                onClick={refreshAccounts}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                <FiRefreshCw className="mr-2" />
                Refresh
              </button>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
              >
                <FiPlus className="mr-2" />
                Add Account
              </button>
            </div>
          </div>

          {/* Add Account Form */}
          {showAddForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Add New WhatsApp Account</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                  <input
                    type="text"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                    placeholder="e.g., Business Account"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unique App Key</label>
                  <input
                    type="text"
                    value={newAccount.appKey}
                    onChange={(e) => setNewAccount({...newAccount, appKey: e.target.value})}
                    placeholder="e.g., business1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={addAccount}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                >
                  Save Account
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {accounts.map(account => (
              <div 
                key={account.appKey} 
                className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 border-l-4 ${
                  account.status === 'connected' ? 'border-green-500' : 
                  account.status === 'initializing' ? 'border-blue-500' : 
                  account.status === 'error' ? 'border-red-500' : 
                  'border-gray-300'
                }`}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{account.name}</h3>
                      <p className="text-sm text-gray-500">Key: {account.appKey}</p>
                      {account.phoneNumber && (
                        <p className="text-sm text-gray-500">Phone: {account.phoneNumber}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      account.status === 'connected' ? 'bg-green-100 text-green-800' : 
                      account.status === 'initializing' ? 'bg-blue-100 text-blue-800' : 
                      account.status === 'error' ? 'bg-red-100 text-red-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {account.status || 'disconnected'}
                    </span>
                  </div>
                  
                  {account.status !== 'connected' && (
                    <div className="mt-4">
                      <button
                        onClick={() => connectAccount(account.appKey)}
                        disabled={connectingAccounts[account.appKey]}
                        className={`w-full py-2.5 rounded-md flex items-center justify-center ${
                          connectingAccounts[account.appKey] 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
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
                    <div className="mt-4 animate-pulse">
                      <div className="text-center mb-3">
                        <p className="text-sm font-medium text-gray-700">Scan with WhatsApp</p>
                        <p className="text-xs text-gray-500 mt-1">Linked Devices → Link a Device</p>
                      </div>
                      <img 
                        src={qrData[account.appKey]} 
                        alt="QR Code" 
                        className="w-full max-w-[200px] mx-auto rounded-lg border-4 border-white shadow"
                      />
                    </div>
                  )}

                  {account.status === 'error' && (
                    <div className="mt-4 text-center text-red-500 text-sm">
                      Connection failed. Try again.
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-50 px-5 py-3">
                  <button
                    onClick={() => {
                      if (account.status === 'connected') {
                        setSelectedAccount(account.appKey);
                        setSendStatus(null);
                      }
                    }}
                    disabled={account.status !== 'connected'}
                    className={`w-full py-2.5 rounded-md text-sm font-medium transition ${
                      selectedAccount === account.appKey
                        ? 'bg-indigo-600 text-white'
                        : account.status === 'connected'
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {selectedAccount === account.appKey 
                      ? 'Selected' 
                      : account.status === 'connected'
                        ? 'Select Account'
                        : 'Not Connected'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Send Message Section - Only show when account is selected */}
        {selectedAccount && (
          <section className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <FiSend className="mr-2" /> Send Message
            </h2>
            
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="mr-3 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="font-bold text-indigo-700">{selectedAccount}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {accounts.find(a => a.appKey === selectedAccount)?.name || selectedAccount}
                  </p>
                  <p className="text-sm text-green-600">
                    Status: Connected
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FiPhone className="mr-2" /> Phone Number
                </label>
                <input
                  type="text"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="e.g., 15551234567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Include country code without spaces or special characters
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FiMessageSquare className="mr-2" /> Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows="3"
                  placeholder="Type your message here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                {sendStatus && (
                  <div className={`flex items-center ${
                    sendStatus.success ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {sendStatus.success ? (
                      <>
                        <FiCheck className="mr-2 text-xl" />
                        <span>{sendStatus.message}</span>
                      </>
                    ) : (
                      <>
                        <FiX className="mr-2 text-xl" />
                        <span>{sendStatus.error}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              <button
                onClick={sendMessage}
                disabled={isSending}
                className={`flex items-center justify-center px-8 py-3.5 rounded-lg font-medium text-white shadow-lg transition ${
                  isSending
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700'
                }`}
              >
                <FiSend className="mr-2 text-lg" />
                {isSending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
    </DashboardLayout>
   
  );
}