import { GalleryVerticalEnd } from "lucide-react";
import { IMAGES } from "@/constants/images";
import ResetPasswordForm from "./ResetPasswordForm";
import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPassword() {
  return (
    <div className="grid min-h-svh lg:grid-cols-12 flex-wrap-reverse">
      <div className="relative hidden bg-red-300 lg:block col-span-7">
        <img
          src={IMAGES.LOGIN_BACKGROUND}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>

      <div className="flex flex-col w-full gap-4 p-6 md:p-10 col-span-5">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Retinova
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <ForgotPasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}
