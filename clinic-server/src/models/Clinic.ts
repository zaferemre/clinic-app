import mongoose from "mongoose";

const clinicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    ownerEmail: { type: String, required: true },
    workers: [{ type: String }], // e-postalar listesi
  },
  {
    timestamps: true,
  }
);

// Model adı "Clinic" ise koleksiyon adı otomatik lowercase çoğul “clinics” olur
const Clinic = mongoose.model("Clinic", clinicSchema);
export default Clinic;
