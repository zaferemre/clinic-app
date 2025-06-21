"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o)
            if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.listGroups = listGroups;
exports.createGroup = createGroup;
exports.getGroup = getGroup;
exports.updateGroup = updateGroup;
exports.deleteGroup = deleteGroup;
exports.addPatientToGroup = addPatientToGroup;
exports.removePatientFromGroup = removePatientFromGroup;
// services/groupService.ts
const repoGroup = __importStar(require("../dataAccess/groupRepository"));
const repoPatient = __importStar(require("../dataAccess/patientRepository")); // <--- Import this!
const mongoose_1 = require("mongoose");
const http_errors_1 = __importDefault(require("http-errors"));
// Validate Mongo IDs
function validId(id) {
  return mongoose_1.Types.ObjectId.isValid(id);
}
async function listGroups(companyId, clinicId) {
  if (!validId(companyId) || !validId(clinicId))
    throw (0, http_errors_1.default)(400, "Invalid company or clinic id");
  return repoGroup.listGroups(companyId, clinicId);
}
async function createGroup(companyId, clinicId, data, userId) {
  if (!validId(companyId))
    throw (0, http_errors_1.default)(400, "Invalid companyId");
  if (!validId(clinicId))
    throw (0, http_errors_1.default)(400, "Invalid clinicId");
  // Convert patients array to ObjectIds safely
  const patients = Array.isArray(data.patients)
    ? data.patients
        .filter((id) => validId(id))
        .map((id) => new mongoose_1.Types.ObjectId(id))
    : [];

  // Handle field names: maxSize in model, not size!
  const doc = {
    companyId: new mongoose_1.Types.ObjectId(companyId),
    clinicId: new mongoose_1.Types.ObjectId(clinicId),
    name: data.name,
    note: data.note,
    credit: typeof data.credit === "number" ? data.credit : 0,
    maxSize: typeof data.size === "number" ? data.size : 6, // accept `size` as input, but store as `maxSize`
    status: ["active", "inactive", "archived"].includes(data.status)
      ? data.status
      : "active",
    patients,
    employees: [], // If you have employee input, add here
    groupType: data.groupType,
    appointments: [],
    createdBy: userId,
    customFields: data.customFields ?? {},
  };
  const group = await repoGroup.createGroup(doc);
  // ---- Keep Patient.groups in sync! ----
  if (patients.length) {
    await repoPatient.addGroupToPatients(
      patients.map((objId) => objId.toString()),
      group._id.toString()
    );
  }
  return group;
}
async function getGroup(companyId, clinicId, groupId) {
  if (!validId(companyId) || !validId(clinicId) || !validId(groupId))
    throw (0, http_errors_1.default)(400, "Invalid ids");
  const g = await repoGroup.findGroupById(companyId, clinicId, groupId);
  if (!g) throw (0, http_errors_1.default)(404, "Group not found");
  return g;
}
async function updateGroup(companyId, clinicId, groupId, updates) {
  if (!validId(groupId))
    throw (0, http_errors_1.default)(400, "Invalid groupId");
  // You could add more validation here if needed
  return repoGroup.updateGroupById(groupId, updates);
}
async function deleteGroup(companyId, clinicId, groupId) {
  if (!validId(groupId))
    throw (0, http_errors_1.default)(400, "Invalid groupId");
  // Remove group from all patients' groups array
  await repoPatient.removeGroupFromAllPatients(groupId);
  return repoGroup.deleteGroupById(groupId);
}
async function addPatientToGroup(companyId, clinicId, groupId, patientId) {
  if (!validId(groupId) || !validId(patientId))
    throw (0, http_errors_1.default)(400, "Invalid groupId or patientId");
  const updatedGroup = await repoGroup.addPatientToGroup(
    companyId,
    clinicId,
    groupId,
    patientId
  );
  // Add group to patient's groups field
  await repoPatient.addGroupToPatients([patientId], groupId);
  return updatedGroup;
}
async function removePatientFromGroup(companyId, clinicId, groupId, patientId) {
  if (!validId(groupId) || !validId(patientId))
    throw (0, http_errors_1.default)(400, "Invalid groupId or patientId");
  const updatedGroup = await repoGroup.removePatientFromGroup(
    companyId,
    clinicId,
    groupId,
    patientId
  );
  // Remove group from patient's groups field
  await repoPatient.removeGroupFromPatients([patientId], groupId);
  return updatedGroup;
}
