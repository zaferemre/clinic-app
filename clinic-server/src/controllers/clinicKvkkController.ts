import Clinic from "../models/Clinic";
import { RequestHandler } from "express";

export const getClinicKvkk: RequestHandler = async (req, res, next) => {
  try {
    const clinic = await Clinic.findById(req.params.clinicId);
    if (!clinic) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({
      kvkkText: clinic.kvkkText ?? "",
      kvkkRequired: clinic.kvkkRequired ?? false,
      kvkkLastSetAt: clinic.kvkkLastSetAt,
    });
  } catch (err) {
    next(err);
  }
};

export const setClinicKvkk: RequestHandler = async (req, res, next) => {
  try {
    const { kvkkText, kvkkRequired } = req.body;
    const clinic = await Clinic.findByIdAndUpdate(
      req.params.clinicId,
      {
        kvkkText,
        kvkkRequired,
        kvkkLastSetAt: new Date(),
      },
      { new: true }
    );
    if (!clinic) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({
      kvkkText: clinic.kvkkText ?? "",
      kvkkRequired: clinic.kvkkRequired ?? false,
      kvkkLastSetAt: clinic.kvkkLastSetAt,
    });
  } catch (err) {
    next(err);
  }
};
