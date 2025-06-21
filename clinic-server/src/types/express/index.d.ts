// src/types/express/index.d.ts
import { IUser } from "../thirdParty/firebaseAdminService";
import { CompanyDocument } from "../models/Company";
import { ClinicDocument } from "../models/Clinic";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      company?: CompanyDocument;
      clinic?: ClinicDocument;
    }
  }
}
