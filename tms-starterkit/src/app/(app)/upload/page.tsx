import { UploadZone } from "@/features/upload/components/upload-zone";

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload</h1>
        <p className="text-muted-foreground">
          Upload Robot Framework output.xml to analyze test results
        </p>
      </div>
      <UploadZone />
    </div>
  );
}
