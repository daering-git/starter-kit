"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileUp, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface UploadResult {
  id: string;
  name: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  suitesCount: number;
}

export function UploadZone() {
  const router = useRouter();
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      setStatus("uploading");
      setError(null);
      setResult(null);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Upload failed");
        }

        setResult(data);
        setStatus("success");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        setStatus("error");
      }
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file?.name.endsWith(".xml")) {
        uploadFile(file);
      } else {
        setError("Please upload a .xml file");
        setStatus("error");
      }
    },
    [uploadFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        )}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        {status === "idle" && (
          <>
            <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">
              Drag & drop output.xml here
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              or click to browse
            </p>
          </>
        )}
        {status === "uploading" && (
          <>
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Parsing & uploading...</p>
          </>
        )}
        {status === "success" && result && (
          <>
            <CheckCircle className="mb-4 h-12 w-12 text-green-500" />
            <p className="text-lg font-medium">Upload successful</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {result.name} — {result.suitesCount} suite(s), {result.total}{" "}
              test(s)
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="mb-4 h-12 w-12 text-destructive" />
            <p className="text-lg font-medium">Upload failed</p>
            <p className="mt-1 text-sm text-destructive">{error}</p>
          </>
        )}
        <input
          id="file-input"
          type="file"
          accept=".xml"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {status === "success" && result && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Result</CardTitle>
            <CardDescription>{result.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{result.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">
                  {result.passed}
                </p>
                <p className="text-sm text-muted-foreground">Passed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">
                  {result.failed}
                </p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-muted-foreground">
                  {result.skipped}
                </p>
                <p className="text-sm text-muted-foreground">Skipped</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => router.push(`/runs/${result.id}`)}
              >
                View Run Details
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setStatus("idle");
                  setResult(null);
                }}
              >
                Upload Another
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(status === "error") && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => {
              setStatus("idle");
              setError(null);
            }}
          >
            Try Again
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileUp className="h-4 w-4" />
            CLI Upload
          </CardTitle>
          <CardDescription>
            Upload via command line using curl
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
            <code>{`curl -X POST ${origin || "http://localhost:3000"}/api/upload \\
  -H "Cookie: authjs.session-token=<your-session-token>" \\
  -F "file=@output.xml"`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
