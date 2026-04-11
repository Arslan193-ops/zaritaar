import { getRole } from "../actions"
import RoleForm from "../RoleForm"
import { notFound } from "next/navigation"

export default async function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const role = await getRole(id)
  
  if (!role) {
    notFound()
  }

  return <RoleForm role={role} />
}
