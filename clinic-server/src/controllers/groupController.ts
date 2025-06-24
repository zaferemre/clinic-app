import { RequestHandler } from "express";
import * as groupService from "../services/groupService";
import * as appointmentService from "../services/appointmentService"; // assumed

// List all groups in a clinic
export const listGroups: RequestHandler = async (req, res, next) => {
  try {
    const groups = await groupService.listGroups(
      req.params.companyId,
      req.params.clinicId
    );
    res.json(groups);
  } catch (err) {
    next(err);
  }
};

// Create a new group
export const createGroup: RequestHandler = async (req, res, next) => {
  try {
    const uid = (req.user as any)?.uid;
    const group = await groupService.createGroup(
      req.params.companyId,
      req.params.clinicId,
      req.body,
      uid
    );
    res.status(201).json(group);
  } catch (err) {
    next(err);
  }
};

// Get group by ID
export const getGroup: RequestHandler = async (req, res, next) => {
  try {
    const group = await groupService.getGroup(
      req.params.companyId,
      req.params.clinicId,
      req.params.groupId
    );
    res.json(group);
  } catch (err) {
    next(err);
  }
};

// Update group
export const updateGroup: RequestHandler = async (req, res, next) => {
  try {
    const updated = await groupService.updateGroup(
      req.params.companyId,
      req.params.clinicId,
      req.params.groupId,
      req.body
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// Delete group
export const deleteGroup: RequestHandler = async (req, res, next) => {
  try {
    await groupService.deleteGroup(
      req.params.companyId,
      req.params.clinicId,
      req.params.groupId
    );
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

// Add patient to group
export const addPatientToGroup: RequestHandler = async (req, res, next) => {
  try {
    const updated = await groupService.addPatientToGroup(
      req.params.companyId,
      req.params.clinicId,
      req.params.groupId,
      req.body.patientId
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// Remove patient from group
export const removePatientFromGroup: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const updated = await groupService.removePatientFromGroup(
      req.params.companyId,
      req.params.clinicId,
      req.params.groupId,
      req.params.patientId
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// --- NEW: List appointments for a group
export const listGroupAppointments: RequestHandler = async (req, res, next) => {
  try {
    const { companyId, clinicId, groupId } = req.params;
    // If your appointmentService uses a groupId filter, use it directly:
    const appointments = await appointmentService.getAppointments(
      companyId,
      clinicId,
      { groupId }
    );
    res.json(appointments);
  } catch (err) {
    next(err);
  }
};

// --- NEW: Create an appointment for a group
export const createGroupAppointment: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { companyId, clinicId, groupId } = req.params;
    const uid = (req.user as any)?.uid;
    const data = {
      ...req.body,
      groupId, // tie to this group
    };
    const created = await appointmentService.createAppointment(
      companyId,
      clinicId,
      data,
      uid
    );
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

// Alias for router compatibility
export { getGroup as getGroupById };
