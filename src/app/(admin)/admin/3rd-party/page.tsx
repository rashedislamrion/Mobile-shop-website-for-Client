'use client';

import React, { useState } from 'react';
import { useAdminPage } from '@/contexts/AdminPageContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockThirdPartyConfig, mockBranches } from '@/lib/mock-data/third-party-config';
import { Eye, EyeOff, UploadCloud, AlertTriangle, Edit2, ShieldAlert, FileJson, Mail, MessageSquare, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ThirdPartyConfigPage() {
  const { setPageInfo } = useAdminPage();
  const [config, setConfig] = useState(mockThirdPartyConfig);
  const [hasChanges, setHasChanges] = useState(false);

  // password visibility states
  const [showBkashSecret, setShowBkashSecret] = useState(false);
  const [showBkashPass, setShowBkashPass] = useState(false);
  const [showSslPass, setShowSslPass] = useState(false);
  const [showSmsSecret, setShowSmsSecret] = useState(false);
  const [showMailPass, setShowMailPass] = useState(false);
  const [showFirebaseKey, setShowFirebaseKey] = useState(false);
  const [showRecaptchaSecret, setShowRecaptchaSecret] = useState(false);

  React.useEffect(() => {
    setPageInfo({
      title: '3rd Party Configuration',
      breadcrumbs: [
        { label: 'Business Administration', href: '/admin/3rd-party' },
        { label: '3rd Party Configuration', href: '/admin/3rd-party' }
      ]
    });
  }, [setPageInfo]);

  const handleChange = () => setHasChanges(true);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* LEFT COLUMN: Main Tabs */}
      <div className="flex-1 space-y-6">
        <Tabs defaultValue="payment" className="w-full">
          <TabsList className="bg-slate-100 p-1 rounded-lg w-full justify-start h-auto flex-wrap mb-6">
            <TabsTrigger value="payment" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm rounded-md px-4 py-2 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment Gateway</TabsTrigger>
            <TabsTrigger value="sms" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm rounded-md px-4 py-2 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> SMS Gateway</TabsTrigger>
            <TabsTrigger value="mail" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm rounded-md px-4 py-2 flex items-center gap-2"><Mail className="w-4 h-4" /> Mail Config</TabsTrigger>
            <TabsTrigger value="firebase" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm rounded-md px-4 py-2 flex items-center gap-2"><FileJson className="w-4 h-4" /> Firebase Notification</TabsTrigger>
            <TabsTrigger value="recaptcha" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm rounded-md px-4 py-2 flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> Google ReCaptcha</TabsTrigger>
          </TabsList>

          {/* PAYMENT TAB */}
          <TabsContent value="payment" className="mt-0 space-y-6">
            <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-xl border border-blue-100 flex items-start gap-3">
              <div className="mt-0.5"><AlertTriangle className="w-5 h-5 text-blue-500" /></div>
              <p>Only bKash, SSLCommerz, and Cash on Delivery are supported for this store. Additional gateways are not available.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* BKASH CARD */}
              <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden flex flex-col">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-600 rounded flex items-center justify-center text-white font-bold text-xl">b</div>
                    <CardTitle className="text-lg font-semibold text-slate-800">bKash</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600">{config.payment.bkash.enabled ? 'On' : 'Off'}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={config.payment.bkash.enabled} onChange={(e) => { setConfig({...config, payment: {...config.payment, bkash: {...config.payment.bkash, enabled: e.target.checked}}}); handleChange(); }} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                </CardHeader>
                {config.payment.bkash.enabled && (
                  <CardContent className="p-6 space-y-4 flex-1">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Mode</label>
                      <select value={config.payment.bkash.mode} onChange={(e) => { setConfig({...config, payment: {...config.payment, bkash: {...config.payment.bkash, mode: e.target.value}}}); handleChange(); }} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                        <option value="sandbox">Sandbox</option>
                        <option value="live">Live</option>
                      </select>
                    </div>
                    {config.payment.bkash.mode === 'live' && (
                      <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-lg border border-amber-200 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> <span>⚠ Live mode will process real payments. Make sure credentials are correct.</span>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">App Key</label>
                      <input type="text" value={config.payment.bkash.appKey} onChange={(e) => { setConfig({...config, payment: {...config.payment, bkash: {...config.payment.bkash, appKey: e.target.value}}}); handleChange(); }} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">App Secret Key</label>
                      <div className="relative">
                        <input type={showBkashSecret ? 'text' : 'password'} value={config.payment.bkash.appSecret} onChange={(e) => { setConfig({...config, payment: {...config.payment, bkash: {...config.payment.bkash, appSecret: e.target.value}}}); handleChange(); }} className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                        <button type="button" onClick={() => setShowBkashSecret(!showBkashSecret)} className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600">
                          {showBkashSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                        <input type="text" value={config.payment.bkash.username} onChange={(e) => { setConfig({...config, payment: {...config.payment, bkash: {...config.payment.bkash, username: e.target.value}}}); handleChange(); }} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <div className="relative">
                          <input type={showBkashPass ? 'text' : 'password'} value={config.payment.bkash.password} onChange={(e) => { setConfig({...config, payment: {...config.payment, bkash: {...config.payment.bkash, password: e.target.value}}}); handleChange(); }} className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                          <button type="button" onClick={() => setShowBkashPass(!showBkashPass)} className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600">
                            {showBkashPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Payment Gateway Title</label>
                      <input type="text" value={config.payment.bkash.title} onChange={(e) => { setConfig({...config, payment: {...config.payment, bkash: {...config.payment.bkash, title: e.target.value}}}); handleChange(); }} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Choose Logo (Checkout)</label>
                      <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 flex items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer cursor-not-allowed opacity-70">
                        <div className="flex items-center gap-2 text-sm text-slate-500"><UploadCloud className="w-4 h-4" /> Upload logo.png</div>
                      </div>
                    </div>
                  </CardContent>
                )}
                <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto flex justify-end">
                  <Button onClick={handleChange} className="bg-emerald-600 hover:bg-emerald-700 text-white">Save And Update</Button>
                </div>
              </Card>

              {/* SSLCOMMERZ CARD */}
              <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden flex flex-col">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xl">S</div>
                    <CardTitle className="text-lg font-semibold text-slate-800">SSLCommerz</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600">{config.payment.sslcommerz.enabled ? 'On' : 'Off'}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={config.payment.sslcommerz.enabled} onChange={(e) => { setConfig({...config, payment: {...config.payment, sslcommerz: {...config.payment.sslcommerz, enabled: e.target.checked}}}); handleChange(); }} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                </CardHeader>
                {config.payment.sslcommerz.enabled && (
                  <CardContent className="p-6 space-y-4 flex-1">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Mode</label>
                      <select value={config.payment.sslcommerz.mode} onChange={(e) => { 
                          const isLive = e.target.value === 'live';
                          setConfig({...config, payment: {...config.payment, sslcommerz: {...config.payment.sslcommerz, mode: e.target.value, baseUrl: isLive ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php' : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php'}}}); 
                          handleChange(); 
                        }} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                        <option value="test">Test</option>
                        <option value="live">Live</option>
                      </select>
                    </div>
                    {config.payment.sslcommerz.mode === 'live' && (
                      <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-lg border border-amber-200 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> <span>⚠ Live mode will process real payments. Make sure credentials are correct.</span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Store ID</label>
                        <input type="text" value={config.payment.sslcommerz.storeId} onChange={(e) => { setConfig({...config, payment: {...config.payment, sslcommerz: {...config.payment.sslcommerz, storeId: e.target.value}}}); handleChange(); }} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Store Password</label>
                        <div className="relative">
                          <input type={showSslPass ? 'text' : 'password'} value={config.payment.sslcommerz.storePassword} onChange={(e) => { setConfig({...config, payment: {...config.payment, sslcommerz: {...config.payment.sslcommerz, storePassword: e.target.value}}}); handleChange(); }} className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                          <button type="button" onClick={() => setShowSslPass(!showSslPass)} className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600">
                            {showSslPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Base URL</label>
                      <input type="text" readOnly value={config.payment.sslcommerz.baseUrl} className="w-full px-4 py-2 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                        <input type="text" readOnly value={config.payment.sslcommerz.currency} className="w-full px-4 py-2 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Gateway Title</label>
                        <input type="text" value={config.payment.sslcommerz.title} onChange={(e) => { setConfig({...config, payment: {...config.payment, sslcommerz: {...config.payment.sslcommerz, title: e.target.value}}}); handleChange(); }} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Choose Logo (Checkout)</label>
                      <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 flex items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer cursor-not-allowed opacity-70">
                        <div className="flex items-center gap-2 text-sm text-slate-500"><UploadCloud className="w-4 h-4" /> Upload logo.png</div>
                      </div>
                    </div>
                  </CardContent>
                )}
                <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto flex justify-end">
                  <Button onClick={handleChange} className="bg-emerald-600 hover:bg-emerald-700 text-white">Save And Update</Button>
                </div>
              </Card>

              {/* COD CARD */}
              <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden flex flex-col">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded flex items-center justify-center text-white font-bold text-xl">C</div>
                    <CardTitle className="text-lg font-semibold text-slate-800">Cash on Delivery (COD)</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600">{config.payment.cod.enabled ? 'On' : 'Off'}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={config.payment.cod.enabled} onChange={(e) => { setConfig({...config, payment: {...config.payment, cod: {...config.payment.cod, enabled: e.target.checked}}}); handleChange(); }} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                </CardHeader>
                {config.payment.cod.enabled && (
                  <CardContent className="p-6 space-y-4 flex-1">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Payment Gateway Title</label>
                      <input type="text" value={config.payment.cod.title} onChange={(e) => { setConfig({...config, payment: {...config.payment, cod: {...config.payment.cod, title: e.target.value}}}); handleChange(); }} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">COD Availability</label>
                      <select value={config.payment.cod.availability} onChange={(e) => { setConfig({...config, payment: {...config.payment, cod: {...config.payment.cod, availability: e.target.value}}}); handleChange(); }} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                        <option value="all">All Areas</option>
                        <option value="selected">Selected Branches Only</option>
                      </select>
                    </div>
                    {config.payment.cod.availability === 'selected' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Branches</label>
                        <select multiple value={config.payment.cod.branches} onChange={(e) => { 
                            const values = Array.from(e.target.selectedOptions, option => option.value);
                            setConfig({...config, payment: {...config.payment, cod: {...config.payment.cod, branches: values}}}); handleChange(); 
                          }} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-h-[100px]">
                          {mockBranches.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                        <p className="text-xs text-slate-500 mt-1">Hold CMD/Ctrl to select multiple</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Extra COD Charge (৳)</label>
                        <input type="number" value={config.payment.cod.extraCharge} onChange={(e) => { setConfig({...config, payment: {...config.payment, cod: {...config.payment.cod, extraCharge: e.target.value}}}); handleChange(); }} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Max Order Amount for COD</label>
                        <input type="number" value={config.payment.cod.maxOrderAmount} onChange={(e) => { setConfig({...config, payment: {...config.payment, cod: {...config.payment.cod, maxOrderAmount: e.target.value}}}); handleChange(); }} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Leave empty for no limit" />
                      </div>
                    </div>
                  </CardContent>
                )}
                <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto flex justify-end">
                  <Button onClick={handleChange} className="bg-emerald-600 hover:bg-emerald-700 text-white">Save And Update</Button>
                </div>
              </Card>

            </div>
          </TabsContent>

          {/* SMS GATEWAY TAB */}
          <TabsContent value="sms" className="mt-0 space-y-6">
            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden max-w-3xl">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-800">SMS Gateway</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600">{config.sms.enabled ? 'On' : 'Off'}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={config.sms.enabled} onChange={(e) => { setConfig({...config, sms: {...config.sms, enabled: e.target.checked}}); handleChange(); }} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </CardHeader>
              {config.sms.enabled && (
                <CardContent className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Provider</label>
                    <select value={config.sms.provider} onChange={(e) => { setConfig({...config, sms: {...config.sms, provider: e.target.value}}); handleChange(); }} className="w-full md:w-1/2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                      <option value="BulkSMSBD">BulkSMSBD</option>
                      <option value="SSL Wireless">SSL Wireless</option>
                      <option value="Custom API">Custom API</option>
                    </select>
                  </div>

                  {config.sms.provider === 'Custom API' ? (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">API URL Endpoint</label>
                      <input type="text" value={config.sms.customUrl} onChange={(e) => { setConfig({...config, sms: {...config.sms, customUrl: e.target.value}}); handleChange(); }} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="https://api.sms.com/send?key=...&to=..." />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">API Key</label>
                        <input type="text" value={config.sms.apiKey} onChange={(e) => { setConfig({...config, sms: {...config.sms, apiKey: e.target.value}}); handleChange(); }} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Sender ID / Masking</label>
                        <input type="text" value={config.sms.senderId} onChange={(e) => { setConfig({...config, sms: {...config.sms, senderId: e.target.value}}); handleChange(); }} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">API Secret</label>
                        <div className="relative">
                          <input type={showSmsSecret ? 'text' : 'password'} value={config.sms.apiSecret} onChange={(e) => { setConfig({...config, sms: {...config.sms, apiSecret: e.target.value}}); handleChange(); }} className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                          <button type="button" onClick={() => setShowSmsSecret(!showSmsSecret)} className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600">
                            {showSmsSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-6">
                    <h4 className="text-sm font-semibold text-slate-800 mb-3">Send Test SMS</h4>
                    <div className="flex items-center gap-3">
                      <input type="text" placeholder="+880 1..." className="w-full md:w-64 px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm" />
                      <Button variant="outline" onClick={() => alert('Test SMS Sent (Mock)')}>Send Test</Button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-800 mb-3">SMS Templates</h4>
                    <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
                      {config.sms.templates.map(tpl => (
                        <div key={tpl.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                          <div>
                            <div className="font-medium text-sm text-slate-800">{tpl.event}</div>
                            <div className="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-xs">{tpl.template}</div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => alert(`Open dialog to edit ${tpl.event} template`)}><Edit2 className="w-4 h-4 text-slate-500" /></Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <Button onClick={handleChange} className="bg-emerald-600 hover:bg-emerald-700 text-white">Save And Update</Button>
              </div>
            </Card>
          </TabsContent>

          {/* MAIL CONFIG TAB */}
          <TabsContent value="mail" className="mt-0 space-y-6">
            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden max-w-3xl">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-800">Mail Config</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600">{config.mail.enabled ? 'On' : 'Off'}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={config.mail.enabled} onChange={(e) => { setConfig({...config, mail: {...config.mail, enabled: e.target.checked}}); handleChange(); }} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </CardHeader>
              {config.mail.enabled && (
                <CardContent className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mail Driver</label>
                    <select value={config.mail.driver} onChange={(e) => { setConfig({...config, mail: {...config.mail, driver: e.target.value}}); handleChange(); }} className="w-full md:w-1/2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                      <option value="smtp">SMTP</option>
                      <option value="sendmail">Sendmail</option>
                    </select>
                  </div>
                  
                  {config.mail.driver === 'smtp' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Host</label>
                        <input type="text" value={config.mail.host} onChange={(e) => { setConfig({...config, mail: {...config.mail, host: e.target.value}}); handleChange(); }} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Port</label>
                        <input type="text" value={config.mail.port} onChange={(e) => { setConfig({...config, mail: {...config.mail, port: e.target.value}}); handleChange(); }} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                        <input type="text" value={config.mail.username} onChange={(e) => { setConfig({...config, mail: {...config.mail, username: e.target.value}}); handleChange(); }} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <div className="relative">
                          <input type={showMailPass ? 'text' : 'password'} value={config.mail.password} onChange={(e) => { setConfig({...config, mail: {...config.mail, password: e.target.value}}); handleChange(); }} className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                          <button type="button" onClick={() => setShowMailPass(!showMailPass)} className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600">
                            {showMailPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Encryption</label>
                        <select value={config.mail.encryption} onChange={(e) => { setConfig({...config, mail: {...config.mail, encryption: e.target.value}}); handleChange(); }} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                          <option value="tls">TLS</option>
                          <option value="ssl">SSL</option>
                          <option value="none">None</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {config.mail.driver === 'sendmail' && (
                    <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg text-sm text-slate-600">
                      Sendmail driver uses the server's local mail binary. Ensure your server is configured correctly.
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">From Name</label>
                      <input type="text" value={config.mail.fromName} onChange={(e) => { setConfig({...config, mail: {...config.mail, fromName: e.target.value}}); handleChange(); }} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">From Email</label>
                      <input type="email" value={config.mail.fromEmail} onChange={(e) => { setConfig({...config, mail: {...config.mail, fromEmail: e.target.value}}); handleChange(); }} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-6">
                    <h4 className="text-sm font-semibold text-slate-800 mb-3">Send Test Email</h4>
                    <div className="flex items-center gap-3">
                      <input type="email" placeholder="test@example.com" className="w-full md:w-64 px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm" />
                      <Button variant="outline" onClick={() => alert('Test Email Sent (Mock)')}>Send Test</Button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-800 mb-3">Email Templates</h4>
                    <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
                      {config.mail.templates.map(tpl => (
                        <div key={tpl.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                          <div>
                            <div className="font-medium text-sm text-slate-800">{tpl.event}</div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => alert(`Open HTML editor for ${tpl.event} template`)}><Edit2 className="w-4 h-4 text-slate-500" /></Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <Button onClick={handleChange} className="bg-emerald-600 hover:bg-emerald-700 text-white">Save And Update</Button>
              </div>
            </Card>
          </TabsContent>

          {/* FIREBASE NOTIFICATION TAB */}
          <TabsContent value="firebase" className="mt-0 space-y-6">
            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden max-w-2xl">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-800">Firebase Notification</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600">{config.firebase.enabled ? 'On' : 'Off'}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={config.firebase.enabled} onChange={(e) => { setConfig({...config, firebase: {...config.firebase, enabled: e.target.checked}}); handleChange(); }} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </CardHeader>
              {config.firebase.enabled && (
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Project ID</label>
                      <input type="text" value={config.firebase.projectId} onChange={(e) => { setConfig({...config, firebase: {...config.firebase, projectId: e.target.value}}); handleChange(); }} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Server Key / Cloud Messaging Key</label>
                      <div className="relative">
                        <input type={showFirebaseKey ? 'text' : 'password'} value={config.firebase.serverKey} onChange={(e) => { setConfig({...config, firebase: {...config.firebase, serverKey: e.target.value}}); handleChange(); }} className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                        <button type="button" onClick={() => setShowFirebaseKey(!showFirebaseKey)} className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600">
                          {showFirebaseKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Sender ID</label>
                      <input type="text" value={config.firebase.senderId} onChange={(e) => { setConfig({...config, firebase: {...config.firebase, senderId: e.target.value}}); handleChange(); }} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Config JSON File</label>
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 group hover:border-emerald-400 transition-colors cursor-pointer" onClick={() => {
                          setConfig({...config, firebase: {...config.firebase, configFileName: "google-services.json"}}); handleChange(); 
                      }}>
                        <UploadCloud className="w-6 h-6 text-slate-400 mb-2 group-hover:text-emerald-500" />
                        <div className="text-sm font-medium text-slate-700 mb-1">Upload google-services.json / firebase config</div>
                        <div className="text-xs text-slate-500">{config.firebase.configFileName || 'No file selected (Click to mock upload)'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <div className={`w-2 h-2 rounded-full ${config.firebase.projectId && config.firebase.serverKey ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                    <span className="text-sm font-medium text-slate-600">{config.firebase.projectId && config.firebase.serverKey ? 'Connected' : 'Not Configured'}</span>
                  </div>
                </CardContent>
              )}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <Button onClick={handleChange} className="bg-emerald-600 hover:bg-emerald-700 text-white">Save And Update</Button>
              </div>
            </Card>
          </TabsContent>

          {/* GOOGLE RECAPTCHA TAB */}
          <TabsContent value="recaptcha" className="mt-0 space-y-6">
            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden max-w-2xl">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-800">Google ReCaptcha</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600">{config.recaptcha.enabled ? 'On' : 'Off'}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={config.recaptcha.enabled} onChange={(e) => { setConfig({...config, recaptcha: {...config.recaptcha, enabled: e.target.checked}}); handleChange(); }} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </CardHeader>
              {config.recaptcha.enabled && (
                <CardContent className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">ReCaptcha Version</label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="recaptchaVersion" value="v2" checked={config.recaptcha.version === 'v2'} onChange={(e) => { setConfig({...config, recaptcha: {...config.recaptcha, version: 'v2'}}); handleChange(); }} className="text-emerald-600 focus:ring-emerald-500" />
                        <span className="text-sm text-slate-700">v2 (Checkbox)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="recaptchaVersion" value="v3" checked={config.recaptcha.version === 'v3'} onChange={(e) => { setConfig({...config, recaptcha: {...config.recaptcha, version: 'v3'}}); handleChange(); }} className="text-emerald-600 focus:ring-emerald-500" />
                        <span className="text-sm text-slate-700">v3 (Score-based)</span>
                      </label>
                    </div>
                  </div>

                  {config.recaptcha.version === 'v3' && (
                    <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-slate-700">Minimum Score Threshold</label>
                        <span className="text-sm font-bold text-emerald-600">{config.recaptcha.minScore}</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.1" 
                        value={config.recaptcha.minScore} 
                        onChange={(e) => { setConfig({...config, recaptcha: {...config.recaptcha, minScore: parseFloat(e.target.value)}}); handleChange(); }} 
                        className="w-full accent-emerald-600" 
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>0.0 (Allow all)</span>
                        <span>1.0 (Most strict)</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Site Key</label>
                      <input type="text" value={config.recaptcha.siteKey} onChange={(e) => { setConfig({...config, recaptcha: {...config.recaptcha, siteKey: e.target.value}}); handleChange(); }} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Secret Key</label>
                      <div className="relative">
                        <input type={showRecaptchaSecret ? 'text' : 'password'} value={config.recaptcha.secretKey} onChange={(e) => { setConfig({...config, recaptcha: {...config.recaptcha, secretKey: e.target.value}}); handleChange(); }} className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                        <button type="button" onClick={() => setShowRecaptchaSecret(!showRecaptchaSecret)} className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600">
                          {showRecaptchaSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <label className="block text-sm font-medium text-slate-700 mb-3">Applies To</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'login', label: 'Login Page' },
                        { key: 'registration', label: 'Registration Page' },
                        { key: 'contact', label: 'Contact Us Form' },
                        { key: 'ticket', label: 'Support Ticket Form' },
                      ].map((item) => (
                        <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={(config.recaptcha.appliesTo as any)[item.key]} 
                            onChange={(e) => { 
                              const k = item.key as keyof typeof config.recaptcha.appliesTo;
                              setConfig({...config, recaptcha: {...config.recaptcha, appliesTo: {...config.recaptcha.appliesTo, [k]: e.target.checked}}}); 
                              handleChange(); 
                            }} 
                            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" 
                          />
                          <span className="text-sm text-slate-700">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <Button onClick={handleChange} className="bg-emerald-600 hover:bg-emerald-700 text-white">Save And Update</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* RIGHT COLUMN: Sticky Save */}
      <div className="w-full lg:w-80 flex-shrink-0">
        <div className="sticky top-6">
          <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                Save Changes
                {hasChanges && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <p className="text-sm text-slate-600">
                {hasChanges 
                  ? "You have unsaved changes across your configuration tabs." 
                  : "All 3rd party configurations are up to date."}
              </p>
              <button
                onClick={() => {
                  alert('3rd party configurations saved successfully!');
                  setHasChanges(false);
                }}
                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  hasChanges 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                Save All Settings
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
