// src/controllers/appointmentController.ts
import { RequestHandler } from "express";
import * as appointmentService from "../services/appointmentService";
import { IUser } from "../thirdParty/firebaseAdminService";

export const getAppointments: RequestHandler = async (req, res, next) => {
  try {
    const { companyId, clinicId } = req.params as {
      companyId: string;
      clinicId: string;
    };
    const filters = {
      employeeId: req.query.employeeId as string | undefined,
      patientId: req.query.patientId as string | undefined,
      groupId: req.query.groupId as string | undefined,
    };
    const events = await appointmentService.getAppointments(
      companyId,
      clinicId,
      filters
    );
    res.status(200).json(events);
  } catch (err) {
    next(err);
  }
};

export const getAppointmentById: RequestHandler = async (req, res, next) => {
  try {
    const { companyId, clinicId, appointmentId } = req.params as {
      companyId: string;
      clinicId: string;
      appointmentId: string;
    };
    const dto = await appointmentService.getAppointmentById(
      companyId,
      clinicId,
      appointmentId
    );
    res.status(200).json(dto);
  } catch (err) {
    next(err);
  }
};

export const createAppointment: RequestHandler = async (req, res, next) => {
  try {
    const { companyId, clinicId } = req.params as {
      companyId: string;
      clinicId: string;
    };
    const user = req.user as IUser;
    const { patientId, groupId, employeeId, serviceId, start, end } =
      req.body as {
        patientId?: string;
        groupId?: string;
        employeeId: string;
        serviceId?: string;
        start: string;
        end: string;
      };

    if (!employeeId || !serviceId || !start || !end) {
      res.status(400).json({
        message: "employeeId, serviceId, start, and end are required.",
      });
      return;
    }

    const appointmentType = groupId ? "group" : "individual";

    const created = await appointmentService.createAppointment(
      companyId,
      clinicId,
      {
        patientId,
        groupId,
        employeeId,
        serviceId,
        start,
        end,
        appointmentType,
      },
      user
    );
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

export const updateAppointment: RequestHandler = async (req, res, next) => {
  try {
    const { companyId, clinicId, appointmentId } = req.params as {
      companyId: string;
      clinicId: string;
      appointmentId: string;
    };
    const updates = { ...req.body } as Record<string, any>;
    if ("groupId" in updates) {
      updates.appointmentType = updates.groupId ? "group" : "individual";
    }
    const updated = await appointmentService.updateAppointment(
      companyId,
      clinicId,
      appointmentId,
      updates
    );
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteAppointment: RequestHandler = async (req, res, next) => {
  try {
    const { companyId, clinicId, appointmentId } = req.params as {
      companyId: string;
      clinicId: string;
      appointmentId: string;
    };
    await appointmentService.deleteAppointment(
      companyId,
      clinicId,
      appointmentId
    );
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
