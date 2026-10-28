import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { FirebaseConfigState } from '../../types';
import { getSavedFirebaseConfig, saveFirebaseConfig } from '../../services/firebase';
import { StorageService } from '../../services/storageService';
import { Flame, Check, UploadCloud, Copy, ExternalLink, ShieldCheck, Database } from 'lucide-react';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const [config, setConfig] = useState<FirebaseConfigState>(getSavedFirebaseConfig);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [copiedRules, setCopiedRules] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(getSavedFirebaseConfig());
      setSeedMessage(null);
    }
  }, [isOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveFirebaseConfig({
      ...config,
      isConfigured: Boolean(config.apiKey && config.projectId),
    });
    onConfigUpdated();
    alert('Firebase configuration saved! If you enabled Live Firebase, refresh or use the Seed button below.');
    onClose();
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    setSeedMessage(null);
    try {
      const result = await StorageService.seedFirebase();
      setSeedMessage(result.message);
      if (result.success) {
        onConfigUpdated();
      }
    } catch (err: any) {
      setSeedMessage(`Error: ${err.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const sampleRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Demo mode: customize for production auth
    }
  }
}`;

  const copyRules = () => {
    navigator.clipboard.writeText(sampleRules);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Firebase Cloud Database Settings"
      subtitle="Connect StockPulse to your Google Firebase Firestore project for multi-user real-time sync"
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Status Card */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          config.useLiveFirebase && config.projectId 
            ? 'bg-amber-50/70 border-amber-300 text-amber-900' 
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              config.useLiveFirebase && config.projectId ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">
                {config.useLiveFirebase && config.projectId 
                  ? `Active Cloud Project: ${config.projectId}` 
                  : 'Currently in Offline / Local Demo Mode'}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {config.useLiveFirebase && config.projectId
                  ? 'All changes to items, GRNs, TOGs, and Bincards sync to Firestore.'
                  : 'Data is stored persistently in local browser storage. You can enter Firebase keys below to connect.'}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.useLiveFirebase}
              onChange={(e) => setConfig({ ...config, useLiveFirebase: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            <span className="ml-2 text-xs font-semibold text-slate-700">Enable Firestore</span>
          </label>
        </div>

        {/* Firebase Config Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Database className="w-4 h-4 text-amber-600" />
            <span>Firebase Web SDK Configuration</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">API Key</label>
              <input
                type="text"
                placeholder="AIzaSy..."
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                className="w-full bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Project ID</label>
              <input
                type="text"
                placeholder="my-stock-project-123"
                value={config.projectId}
                onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                className="w-full bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Auth Domain</label>
              <input
                type="text"
                placeholder="my-project.firebaseapp.com"
                value={config.authDomain}
                onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                className="w-full bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Storage Bucket</label>
              <input
                type="text"
                placeholder="my-project.appspot.com"
                value={config.storageBucket}
                onChange={(e) => setConfig({ ...config, storageBucket: e.target.value })}
                className="w-full bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Messaging Sender ID</label>
              <input
                type="text"
                placeholder="1092837465..."
                value={config.messagingSenderId}
                onChange={(e) => setConfig({ ...config, messagingSenderId: e.target.value })}
                className="w-full bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">App ID</label>
              <input
                type="text"
                placeholder="1:1092837465:web:abcdef..."
                value={config.appId}
                onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                className="w-full bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <a
              href="https://console.firebase.google.com/"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>Open Firebase Console</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Configuration</span>
              </button>
            </div>
          </div>
        </form>

        {/* Cloud Upload / Seed Tools */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-xs font-bold text-slate-800">Seed Firestore Database</h5>
              <p className="text-[11px] text-slate-500">
                Push sample inventory items, GRNs, TOGs, adjustments, and bincards into your Firestore collections.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSeedData}
              disabled={isSeeding || !config.useLiveFirebase || !config.projectId}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isSeeding ? 'Uploading...' : 'Seed Data to Firebase'}</span>
            </button>
          </div>

          {seedMessage && (
            <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
              {seedMessage}
            </div>
          )}
        </div>

        {/* Security Rules Snippet */}
        <div className="bg-slate-900 text-slate-300 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Recommended Firestore Rules (firestore.rules)</span>
            </span>
            <button
              onClick={copyRules}
              className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedRules ? 'Copied!' : 'Copy Rules'}</span>
            </button>
          </div>
          <pre className="text-[11px] font-mono bg-slate-950 p-2.5 rounded border border-slate-800 overflow-x-auto text-emerald-300">
            {sampleRules}
          </pre>
        </div>
      </div>
    </Modal>
  );
};
