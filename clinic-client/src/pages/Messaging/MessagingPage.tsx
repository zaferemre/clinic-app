// src/pages/Messaging/MessagingPage.tsx

import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  getMessages,
  schedulePatientMessage,
  scheduleBulkMessage,
  scheduleAutoRemind,
} from "../../api/messageApi";
import { getPatients } from "../../api/patientApi";
import { IMessage } from "../../types/sharedTypes";
import { NavigationBar } from "../../components/NavigationBar/NavigationBar";

export const MessagingPage: React.FC = () => {
  const { idToken, companyId } = useAuth();

  // All scheduled messages (past + future)
  const [messages, setMessages] = useState<IMessage[]>([]);

  // Form fields
  const [text, setText] = useState("");
  const [scheduledFor, setScheduledFor] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [sendToAll, setSendToAll] = useState(false);
  const [targetPatientId, setTargetPatientId] = useState<string>("");

  // Auto‐remind toggle + offset (hours before appointment)
  const [autoRemind, setAutoRemind] = useState(false);
  const [remindOffsetHours, setRemindOffsetHours] = useState<number>(1);

  // List of patients for dropdown
  const [patients, setPatients] = useState<{ _id: string; name: string }[]>([]);

  // Fetch existing scheduled messages and patients
  const fetchInitialData = async () => {
    if (!idToken || !companyId) return;
    try {
      const [msgs, pats] = await Promise.all([
        getMessages(idToken, companyId),
        getPatients(idToken, companyId),
      ]);
      setMessages(msgs);
      setPatients(pats.map((p) => ({ _id: p._id, name: p.name })));
    } catch (err) {
      console.error("Mesaj verisi alınamadı:", err);
      setMessages([]);
      setPatients([]);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [idToken, companyId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idToken || !companyId) return;

    // If autoRemind is toggled on, schedule auto‐reminders and exit
    if (autoRemind) {
      // We assume scheduleAutoRemind accepts: (token, companyId, offsetHours)
      try {
        await scheduleAutoRemind(idToken, companyId, {
          offsetHours: remindOffsetHours,
        });
        alert(
          `Randevudan ${remindOffsetHours} saat önce otomatik hatırlatma etkinleştirildi.`
        );
        // Refresh message list (optional, if you store auto‐remind settings)
        fetchInitialData();
        return;
      } catch (err: any) {
        console.error("Auto‐remind hatası:", err);
        return alert(err.message || "Otomatik hatırlatma başarısız.");
      }
    }

    // Otherwise, schedule a one‐time direct message
    try {
      if (sendToAll) {
        await scheduleBulkMessage(idToken, companyId, { text, scheduledFor });
      } else {
        if (!targetPatientId) {
          return alert(
            "Lütfen bir hasta seçin veya “Tüm Hastalar” işaretleyin."
          );
        }
        await schedulePatientMessage(idToken, companyId, targetPatientId, {
          text,
          scheduledFor,
        });
      }
      // Reset form fields
      setText("");
      setTargetPatientId("");
      setScheduledFor(new Date().toISOString().slice(0, 16));
      fetchInitialData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Mesaj planlanamadı.");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-brand-gray-100">
      {/* Scrollable area */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        <h2 className="text-xl font-semibold text-brand-black">Mesajlaşma</h2>

        {/* Form Container */}
        <form
          onSubmit={handleSend}
          className="space-y-6 bg-white rounded-xl shadow p-6"
        >
          {/* 1) Auto‐remind Toggle */}
          <div className="flex items-center space-x-2">
            <input
              id="autoRemind"
              type="checkbox"
              checked={autoRemind}
              onChange={(e) => setAutoRemind(e.target.checked)}
              className="h-4 w-4 text-brand-green-500 focus:ring-brand-green-300 border-brand-gray-300 rounded"
            />
            <label htmlFor="autoRemind" className="text-sm text-brand-black">
              Randevudan Önce Otomatik Hatırlatma
            </label>
          </div>

          {/* If autoRemind is ON, show offset selector and skip other fields */}
          {autoRemind ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-brand-black">
                Hatırlatma Ne Kadar Önce Gönderilsin? (Saat)
              </label>
              <select
                value={remindOffsetHours}
                onChange={(e) => setRemindOffsetHours(Number(e.target.value))}
                className="
                  mt-1 block w-32
                  border border-brand-gray-300
                  rounded-lg px-3 py-2
                  focus:outline-none focus:ring-2 focus:ring-brand-green-300
                "
              >
                {[1, 2, 3, 6, 12, 24].map((h) => (
                  <option key={h} value={h}>
                    {h} saat önce
                  </option>
                ))}
              </select>
              <p className="text-sm text-brand-gray-600">
                Bu ayar, tüm hastalarınızın randevu zamanından{" "}
                <strong>{remindOffsetHours} saat</strong> önce otomatik mesaj
                almasını sağlar.
              </p>
            </div>
          ) : (
            <>
              {/* 2) Send to All Toggle */}
              <div className="flex items-center space-x-2">
                <input
                  id="sendToAll"
                  type="checkbox"
                  checked={sendToAll}
                  onChange={(e) => setSendToAll(e.target.checked)}
                  className="h-4 w-4 text-brand-green-500 focus:ring-brand-green-300 border-brand-gray-300 rounded"
                />
                <label htmlFor="sendToAll" className="text-sm text-brand-black">
                  Tüm Hastalara Gönder
                </label>
              </div>

              {/* 3) If not sending to all, show patient dropdown */}
              {!sendToAll && (
                <div>
                  <label
                    htmlFor="targetPatient"
                    className="block text-sm font-medium text-brand-black"
                  >
                    Hasta Seç
                  </label>
                  <select
                    id="targetPatient"
                    value={targetPatientId}
                    onChange={(e) => setTargetPatientId(e.target.value)}
                    className="
                      mt-1 block w-full
                      border border-brand-gray-300
                      rounded-lg px-3 py-2
                      focus:outline-none focus:ring-2 focus:ring-brand-green-300
                    "
                  >
                    <option value="">– Seçiniz –</option>
                    {patients.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 4) Message Text */}
              <div>
                <label className="block text-sm font-medium text-brand-black">
                  Mesaj Metni
                </label>
                <textarea
                  rows={3}
                  className="
                    mt-1 block w-full
                    border border-brand-gray-300
                    rounded-lg px-3 py-2
                    focus:outline-none focus:ring-2 focus:ring-brand-green-300
                  "
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                  placeholder="Randevunuz … tarihinde gerçekleşecektir."
                />
              </div>

              {/* 5) Scheduling Date/Time */}
              <div>
                <label className="block text-sm font-medium text-brand-black">
                  Gönderim Zamanı
                </label>
                <input
                  type="datetime-local"
                  className="
                    mt-1 block w-full
                    border border-brand-gray-300
                    rounded-lg px-3 py-2
                    focus:outline-none focus:ring-2 focus:ring-brand-green-300
                  "
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {/* 6) Submit Button */}
          <button
            type="submit"
            className="
              w-full bg-brand-green-500 hover:bg-brand-green-600
              text-white font-medium
              px-4 py-2 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-brand-green-300
            "
          >
            {autoRemind ? "Otomatik Hatırlatmayı Etkinleştir" : "Planla"}
          </button>
        </form>

        {/* Scheduled Messages List */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-brand-black mb-4">
            Planlanan Mesajlar
          </h3>

          {messages.length === 0 ? (
            <p className="text-brand-gray-500">Gönderilecek mesaj yok.</p>
          ) : (
            <ul className="space-y-2">
              {messages.map((m) => (
                <li
                  key={m._id}
                  className="
                    flex justify-between items-center
                    border-b pb-2 last:border-none
                  "
                >
                  <div>
                    {m.scheduledFor && (
                      <span className="text-sm text-brand-gray-600">
                        {new Date(m.scheduledFor).toLocaleString()} —{" "}
                      </span>
                    )}
                    <span className="font-medium">{m.text}</span>
                    {m.patientId ? (
                      <span className="text-xs text-brand-gray-500 ml-2">
                        (Tek Hastaya)
                      </span>
                    ) : (
                      <span className="text-xs text-brand-gray-500 ml-2">
                        (Tüm Hastalara)
                      </span>
                    )}
                  </div>
                  <div>
                    {m.sent ? (
                      <span className="text-xs text-success">Gönderildi</span>
                    ) : (
                      <span className="text-xs text-brand-gray-500">
                        Beklemede
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <NavigationBar />
    </div>
  );
};
