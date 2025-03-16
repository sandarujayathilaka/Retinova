import { GalleryVerticalEnd } from "lucide-react";

import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPassword() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-gradient-to-r from-main/70 via-main/40 to-main/70 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Acme Inc.
        </a>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
