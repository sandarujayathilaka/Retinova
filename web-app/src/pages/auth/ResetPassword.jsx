import { GalleryVerticalEnd, Shield } from "lucide-react";

import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPassword() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-gradient-to-br from-blue-950 via-indigo-900 to-violet-900 p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-2 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <GalleryVerticalEnd className="h-7 w-7 text-blue-200" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white text-center">Retinova</h1>
          <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 backdrop-blur-sm">
            <Shield className="h-4 w-4 text-blue-300" />
            <span className="text-sm text-blue-200">Secure Password Reset</span>
          </div>
        </div>

        <ResetPasswordForm />
      </div>
    </div>
  );
}
