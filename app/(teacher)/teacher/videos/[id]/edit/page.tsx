import { getVideoWithResources } from "@/server/teacher-actions";
import { getTeacherPackages } from "@/server/package-actions";
import { notFound } from "next/navigation";
import { TeacherAppSidebar } from "@/components/teacher-app-sidebar";
import { EditVideoForm } from "@/components/edit-video-form";
import { ResourceManager } from "@/components/resource-manager";

type PageProps = {
    params: { id: string };
};

export default async function EditVideoPage({ params }: PageProps) {
    const videoId = params.id;
    const videoData = await getVideoWithResources(videoId);
    const packages = await getTeacherPackages();

    if (!videoData) {
        notFound();
    }

    return (
        <div className="flex min-h-screen">
            <TeacherAppSidebar />
            <main className="flex-1 p-6">
                <h1 className="text-2xl font-bold mb-6">Edit Video</h1>
                <div className="space-y-8">
                    <EditVideoForm video={videoData} packages={packages} />
                    <ResourceManager videoId={videoData.id} resources={videoData.resources} />
                </div>
            </main>
        </div>
    );
}
