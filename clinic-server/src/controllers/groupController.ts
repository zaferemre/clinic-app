import { Request, Response, NextFunction, RequestHandler } from "express";
import { Types } from "mongoose";
import { IUser } from "../thirdParty/firebaseAdminService";
import * as groupService from "../services/groupService";
import Appointment from "../models/Appointment";
import Group from "../models/Group";
import createError from "http-errors";

// Helper for safe ObjectId conversion
function safeObjectId(val?: string) {
  if (typeof val === "string" && val.length === 24)
    return new Types.ObjectId(val);
  return undefined;
}

/**
 * GET /company/:companyId/clinics/:clinicId/groups
 */
export const listGroups: RequestHandler = async (req, res, next) => {
  try {
    const { companyId, clinicId } = req.params;
    const groups = await groupService.listGroups(companyId, clinicId);
    res.status(200).json(groups);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /company/:companyId/clinics/:clinicId/groups
 */
export const createGroup: RequestHandler = async (req, res, next) => {
  try {
    const { companyId, clinicId } = req.params;
    const user = req.user as IUser;
    const created = await groupService.createGroup(
      companyId,
      clinicId,
      req.body,
      user.uid
    );
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /company/:companyId/clinics/:clinicId/groups/:groupId
 */
export const getGroupById: RequestHandler = async (req, res, next) => {
  try {
    const { companyId, clinicId, groupId } = req.params;
    const group = await groupService.getGroup(companyId, clinicId, groupId);
    res.status(200).json(group);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /company/:companyId/clinics/:clinicId/groups/:groupId
 */
export const updateGroup: RequestHandler = async (req, res, next) => {
  try {
    const { companyId, clinicId, groupId } = req.params;
    const updated = await groupService.updateGroup(
      companyId,
      clinicId,
      groupId,
      req.body
    );
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /company/:companyId/clinics/:clinicId/groups/:groupId
 */
export const deleteGroup: RequestHandler = async (req, res, next) => {
  try {
    const { companyId, clinicId, groupId } = req.params;
    await groupService.deleteGroup(companyId, clinicId, groupId);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /company/:companyId/clinics/:clinicId/groups/:groupId/patients
 */
export const addPatientToGroup: RequestHandler = async (req, res, next) => {
  try {
    const { companyId, clinicId, groupId } = req.params;
    const { patientId } = req.body as { patientId: string };
    const updated = await groupService.addPatientToGroup(
      companyId,
      clinicId,
      groupId,
      patientId
    );
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /company/:companyId/clinics/:clinicId/groups/:groupId/patients/:patientId
 */
export const removePatientFromGroup: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { companyId, clinicId, groupId, patientId } = req.params;
    const updated = await groupService.removePatientFromGroup(
      companyId,
      clinicId,
      groupId,
      patientId
    );
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /company/:companyId/clinics/:clinicId/groups/:groupId/appointments
 */
export const listGroupAppointments: RequestHandler = async (req, res, next) => {
  try {
    const { companyId, clinicId, groupId } = req.params;
    const appts = await Appointment.find({
      companyId: safeObjectId(companyId),
      clinicId: safeObjectId(clinicId),
      groupId: safeObjectId(groupId),
    })
      .lean()
      .exec();
    res.status(200).json(appts);
  } catch (err) {
    next(err);
  }
};
/**
 * POST /company/:companyId/clinics/:clinicId/groups/:groupId/appointments
 * Body: { start, end, employeeId, serviceId }
 */
export const createGroupAppointment: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { companyId, clinicId, groupId } = req.params;
    const user = req.user as IUser;
    const { start, end, employeeId, serviceId } = req.body as {
      start: string;
      end: string;
      employeeId: string;
      serviceId: string;
    };

    // Validate
    if (!start || !end || !employeeId || !serviceId || !groupId)
      throw createError(
        400,
        "start, end, employeeId, serviceId, and groupId are required."
      );

    // Validate ObjectIds
    if (
      ![companyId, clinicId, groupId, employeeId, serviceId].every(
        Types.ObjectId.isValid
      )
    )
      throw createError(400, "Invalid ObjectId(s)");

    // Optionally: check if employee, service, and group exist!
    // Optionally: check overlap, credit, etc, if your business rules require it.

    const doc = {
      companyId: new Types.ObjectId(companyId),
      clinicId: new Types.ObjectId(clinicId),
      groupId: new Types.ObjectId(groupId),
      employeeId: new Types.ObjectId(employeeId),
      serviceId: new Types.ObjectId(serviceId),
      appointmentType: "group",
      start: new Date(start),
      end: new Date(end),
      status: "scheduled",
      createdBy: Types.ObjectId.isValid(user.uid)
        ? new Types.ObjectId(user.uid)
        : undefined, // or store as string if using Firebase UIDs!
    };

    // Remove undefined for createdBy if not a MongoId
    if (!doc.createdBy) delete doc.createdBy;

    const appt = await Appointment.create(doc);

    // Link appointment to Group's appointment array
    await Group.findByIdAndUpdate(groupId, {
      $addToSet: { appointments: appt._id },
    }).exec();

    res.status(201).json(appt);
  } catch (err) {
    next(err);
  }
};
