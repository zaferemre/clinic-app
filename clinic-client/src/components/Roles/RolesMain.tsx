import React, { useState, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import {
  listRoles,
  createRole,
  updateRole,
  deleteRole,
} from "../../api/roleApi";
import RolesInfoBox from "./RolesInfoBox";
import EmptyRoles from "./EmptyRoles";
import RoleList from "./RoleList";
import RoleModal from "../Modals/RoleModal";
import GreetingHeader from "../GreetingHeader/GreetingHeader";
import { Role } from "../../types/sharedTypes";
import { NavigationBar } from "../NavigationBar/NavigationBar";

const RolesMain: React.FC = () => {
  const {
    idToken,
    selectedCompanyId,
    selectedCompanyName,
    selectedClinicId,
    selectedClinicName,
    user,
  } = useAuth();

  const [roles, setRoles] = useState<Role[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);

  const fetchRoles = async () => {
    if (!idToken || !selectedCompanyId || !selectedClinicId) return;
    try {
      const data: Role[] = await listRoles(
        idToken,
        selectedCompanyId,
        selectedClinicId
      );
      setRoles(
        data.map(
          (role): Role => ({
            _id: role._id,
            name: role.name,
            createdBy: role.createdBy ?? "",
            isDefault: role.isDefault ?? false,
            createdAt: role.createdAt ?? "",
            updatedAt: role.updatedAt ?? "",
          })
        )
      );
    } catch (e) {
      console.error("Error fetching roles", e);
    }
  };

  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line
  }, [idToken, selectedCompanyId, selectedClinicId]);

  const openCreate = () => {
    setCurrentRole(null);
    setShowModal(true);
  };

  const openEdit = (role: Role) => {
    setCurrentRole(role);
    setShowModal(true);
  };

  const handleSave = async ({ name }: { name: string }) => {
    if (!idToken || !selectedCompanyId || !selectedClinicId) return;
    try {
      if (currentRole) {
        await updateRole(
          idToken,
          selectedCompanyId,
          selectedClinicId,
          currentRole._id,
          name
        );
      } else {
        await createRole(idToken, selectedCompanyId, selectedClinicId, name);
      }
      setShowModal(false);
      fetchRoles();
    } catch (e) {
      console.error("Error saving role", e);
    }
  };

  const handleDelete = async (role: Role) => {
    if (!idToken || !selectedCompanyId || !selectedClinicId) return;
    if (
      !window.confirm(`'${role.name}' rolünü silmek istediğinize emin misiniz?`)
    )
      return;
    try {
      await deleteRole(idToken, selectedCompanyId, selectedClinicId, role._id);
      fetchRoles();
    } catch (e) {
      console.error("Error deleting role", e);
    }
  };

  if (
    !idToken ||
    !selectedCompanyId ||
    !selectedClinicId ||
    !user ||
    !selectedCompanyName ||
    !selectedClinicName
  ) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-gray-100 pb-20">
      <div className="px-4 pt-4">
        <GreetingHeader
          userAvatarUrl={user?.photoUrl ?? ""}
          clinicName={selectedClinicName}
          pageTitle="Roller"
          showBackButton={true}
        />
      </div>

      <div className="px-4">
        <RolesInfoBox />
      </div>

      <main className="flex-1 p-6 overflow-auto">
        {roles.length === 0 ? (
          <EmptyRoles onAdd={openCreate} />
        ) : (
          <RoleList roles={roles} onEdit={openEdit} onDelete={handleDelete} />
        )}
      </main>
      <NavigationBar />

      {/* FAB */}
      <button
        className="fixed bottom-20 right-6 w-16 h-16 rounded-full bg-brand-main shadow-lg flex items-center justify-center text-white hover:bg-brand-red transition duration-200 text-3xl"
        onClick={openCreate}
        aria-label="Rol Ekle"
      >
        <PlusIcon className="h-8 w-8" />
      </button>

      <RoleModal
        show={showModal}
        initial={
          currentRole || {
            _id: "",
            name: "",
            createdBy: "",
            isDefault: false,
            createdAt: "",
            updatedAt: "",
          }
        }
        onClose={() => setShowModal(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default RolesMain;
