import { getTeacherPackages } from "@/server/package-actions"
import { TeacherPackagesManager } from "@/components/teacher-packages-manager"

export default async function TeacherPackagesPage() {
  const packages = await getTeacherPackages()

  return (
    <div className="container mx-auto py-8">
      <TeacherPackagesManager initialPackages={packages} />
    </div>
  )
}
