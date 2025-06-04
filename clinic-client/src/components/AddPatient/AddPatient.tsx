// src/AddPatient.tsx
import React, { useState, ChangeEvent, FormEvent } from "react";
import "./AddPatient.css";

interface AddPatientProps {
  idToken: string;
  clinicId: string;
}

interface ServiceLine {
  name: string;
  pointsLeft: string;
  sessionsTaken: string;
}

interface PaymentLine {
  date: string;
  method: "Havale" | "Card" | "Cash" | "Unpaid";
  amount: string;
  note: string;
}

const AddPatient: React.FC<AddPatientProps> = ({ idToken, clinicId }) => {
  const [name, setName] = useState<string>("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [age, setAge] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [services, setServices] = useState<ServiceLine[]>([
    { name: "", pointsLeft: "", sessionsTaken: "" },
  ]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentLine[]>([
    { date: "", method: "Havale", amount: "", note: "" },
  ]);
  const [note, setNote] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");

    const payload = {
      name: name.trim(),
      gender,
      age: age ? Number(age) : undefined,
      phone: phone.trim(),
      services: services
        .filter((s) => s.name.trim())
        .map((s) => ({
          name: s.name.trim(),
          pointsLeft: Number(s.pointsLeft),
          sessionsTaken: Number(s.sessionsTaken),
        })),
      paymentHistory: paymentHistory
        .filter((p) => p.amount.trim())
        .map((p) => ({
          date: p.date
            ? new Date(p.date).toISOString()
            : new Date().toISOString(),
          method: p.method,
          amount: Number(p.amount),
          note: p.note.trim(),
        })),
      note: note.trim(),
    };

    try {
      const res = await fetch(
        `http://localhost:3001/clinic/${clinicId}/patients`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error ?? "Unknown error");
      }

      const newPatient = await res.json();
      setMessage(`Hasta başarıyla eklendi: ${newPatient._id}`);
      // Reset form
      setName("");
      setGender("Male");
      setAge("");
      setPhone("");
      setServices([{ name: "", pointsLeft: "", sessionsTaken: "" }]);
      setPaymentHistory([{ date: "", method: "Havale", amount: "", note: "" }]);
      setNote("");
    } catch (err) {
      if (err instanceof Error) {
        console.error(err);
        setMessage("Hata: " + err.message);
      } else {
        setMessage("Bilinmeyen hata oluştu.");
      }
    }
  };

  // Handlers for dynamic rows
  const handleServiceChange = (
    index: number,
    field: keyof ServiceLine,
    value: string
  ) => {
    const updated = [...services];
    updated[index][field] = value;
    setServices(updated);
  };
  const addServiceLine = () => {
    setServices([...services, { name: "", pointsLeft: "", sessionsTaken: "" }]);
  };

  const handlePaymentChange = (
    index: number,
    field: keyof PaymentLine,
    value: string
  ) => {
    const updated = [...paymentHistory];
    if (field === "method") {
      updated[index][field] = value as PaymentLine["method"];
    } else {
      updated[index][field] = value;
    }
    setPaymentHistory(updated);
  };

  const addPaymentLine = () => {
    setPaymentHistory([
      ...paymentHistory,
      { date: "", method: "Havale", amount: "", note: "" },
    ]);
  };

  return (
    <div className="addpatient-container">
      <form className="addpatient-form" onSubmit={handleSubmit}>
        <label className="addpatient-label" htmlFor="patient-name">
          İsim
        </label>
        <input
          id="patient-name"
          type="text"
          className="addpatient-input"
          value={name}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
          required
          placeholder="Tam isim"
        />

        <label className="addpatient-label" htmlFor="patient-gender">
          Cinsiyet
        </label>
        <select
          id="patient-gender"
          value={gender}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setGender(e.target.value as "Male" | "Female" | "Other")
          }
          className="addpatient-input"
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <label className="addpatient-label" htmlFor="patient-age">
          Yaş
        </label>
        <input
          id="patient-age"
          type="number"
          className="addpatient-input"
          value={age}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setAge(e.target.value)
          }
          placeholder="Yaş"
        />

        <label className="addpatient-label" htmlFor="patient-phone">
          Telefon
        </label>
        <input
          id="patient-phone"
          type="text"
          className="addpatient-input"
          value={phone}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setPhone(e.target.value)
          }
          placeholder="(555) 123-4567"
        />

        <label className="addpatient-label">Hizmetler</label>
        {services.map((s, i) => (
          <div key={s.name + "-" + i} className="addpatient-row">
            <input
              type="text"
              placeholder="Hizmet adı"
              value={s.name}
              onChange={(e) => handleServiceChange(i, "name", e.target.value)}
              className="addpatient-input small"
            />
            <input
              type="number"
              placeholder="Kalan puan"
              value={s.pointsLeft}
              onChange={(e) =>
                handleServiceChange(i, "pointsLeft", e.target.value)
              }
              className="addpatient-input smaller"
            />
            <input
              type="number"
              placeholder="Alınan seans"
              value={s.sessionsTaken}
              onChange={(e) =>
                handleServiceChange(i, "sessionsTaken", e.target.value)
              }
              className="addpatient-input smaller"
            />
          </div>
        ))}
        <button
          type="button"
          className="addpatient-btn"
          onClick={addServiceLine}
        >
          Hizmet Ekle
        </button>

        <label className="addpatient-label">Ödeme Geçmişi</label>
        {paymentHistory.map((p, i) => (
          <div
            key={p.date + "-" + p.amount + "-" + i}
            className="addpatient-row"
          >
            <input
              type="datetime-local"
              value={p.date}
              onChange={(e) => handlePaymentChange(i, "date", e.target.value)}
              className="addpatient-input medium"
            />
            <select
              value={p.method}
              onChange={(e) =>
                handlePaymentChange(
                  i,
                  "method",
                  e.target.value as PaymentLine["method"]
                )
              }
              className="addpatient-input small"
            >
              <option value="Havale">Havale</option>
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
              <option value="Unpaid">Unpaid</option>
            </select>
            <input
              type="number"
              placeholder="Tutar"
              value={p.amount}
              onChange={(e) => handlePaymentChange(i, "amount", e.target.value)}
              className="addpatient-input smaller"
            />
            <input
              type="text"
              placeholder="Not"
              value={p.note}
              onChange={(e) => handlePaymentChange(i, "note", e.target.value)}
              className="addpatient-input medium"
            />
          </div>
        ))}
        <button
          type="button"
          className="addpatient-btn"
          onClick={addPaymentLine}
        >
          Ödeme Satırı Ekle
        </button>

        <label className="addpatient-label" htmlFor="patient-note">
          Not
        </label>
        <textarea
          id="patient-note"
          className="addpatient-input"
          rows={3}
          value={note}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setNote(e.target.value)
          }
          placeholder="Ek bilgi (alerjiler, yorumlar vb.)"
        />

        {message && <div className="addpatient-error">{message}</div>}

        <button type="submit" className="btn‐primary addpatient-btn">
          Hasta Oluştur
        </button>
      </form>
    </div>
  );
};

export default AddPatient;
