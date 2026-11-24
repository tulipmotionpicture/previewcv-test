import { MOBILE_APPS, MobileAppId } from "@/lib/mobileApps";
import AppQr from "./AppQr";
import StoreBadges from "./StoreBadges";

/** App promotion on the picture side of the sign-in and sign-up pages. Left out on screens
 *  too short for it. */
export default function AuthAppPromo({ app }: { app: MobileAppId }) {
  const from = app === "letsmakecv" ? "pcv-auth" : "auth";
  return (
    <div className="my-4 flex w-fit max-w-full items-center gap-3 rounded-2xl border border-white/60 bg-white/70 p-3 backdrop-blur-sm dark:border-white/10 dark:bg-white/10 [@media(max-height:660px)]:hidden">
      <AppQr app={app} from={from} size={100} />
      <div className="min-w-0">
        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
          Get the {MOBILE_APPS[app].name} app
        </p>
        <p className="mb-2 text-xs text-gray-600 dark:text-gray-300">
          Scan to install on iPhone or Android
        </p>
        <StoreBadges app={app} from={from} className="!flex-nowrap !gap-2" />
      </div>
    </div>
  );
}
