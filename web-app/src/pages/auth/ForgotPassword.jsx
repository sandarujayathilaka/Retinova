import { IMAGES } from "@/constants/images";
import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPassword() {
  return (
    <div className="grid min-h-svh lg:grid-cols-12 flex-wrap-reverse">
      <div className="relative hidden lg:block col-span-7">
        {/* Image container with sidebar-themed overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-indigo-900 to-violet-900 mix-blend-multiply z-10" />
        <img
          src={IMAGES.LOGIN_BACKGROUND}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
      </div>

      <div className="flex flex-col w-full gap-4 p-6 md:p-10 col-span-5">
        <div className="flex flex-1 flex-col gap-24 items-center justify-center">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md">
              <img src={IMAGES.LOGO_ICON} alt="Logo" className="size-12 min-w-12" />
            </div>
            <img src={IMAGES.LOGO_TEXT} alt="Logo" className="h-10" />
          </a>
          <div className="w-full max-w-xs">
            <ForgotPasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}
