import { TestTubes } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginButton } from "@/features/auth/components/login-button";

export default function LoginPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <TestTubes className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl">TMS</CardTitle>
        <CardDescription>
          Test Management System
          <br />
          Sign in with your Google Workspace account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginButton />
      </CardContent>
    </Card>
  );
}
