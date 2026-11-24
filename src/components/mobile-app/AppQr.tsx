import { MOBILE_APPS, MobileAppId, qrSrc } from "@/lib/mobileApps";

interface AppQrProps {
  app: MobileAppId;
  from: string;
  size: number;
  className?: string;
}

/** Install QR code. Hidden on phones, which can't scan their own screen. */
export default function AppQr({ app, from, size, className = "" }: AppQrProps) {
  return (
    <div className={`hidden md:block shrink-0 rounded-lg bg-white p-1 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrSrc(app, from)}
        alt={`QR code to install the ${MOBILE_APPS[app].name} app`}
        width={size}
        height={size}
        loading="lazy"
      />
    </div>
  );
}
