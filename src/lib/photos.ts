import invite from "../../public/images/invite.jpg"
import workshop from "../../public/images/workshop.jpg"

/** Unsplash photos (free licence), credited on /credits and in docs/assets.md. */
export const PHOTOS = {
  invite: {
    src: invite,
    width: invite.width,
    height: invite.height,
    photographer: "SanDisk",
    profile: "https://unsplash.com/@sandisk",
    page: "https://unsplash.com/photos/aKC5r4WoLxY",
  },
  workshop: {
    src: workshop,
    width: workshop.width,
    height: workshop.height,
    photographer: "Maxim Tolchinskiy",
    profile: "https://unsplash.com/@shaikhulud",
    page: "https://unsplash.com/photos/ovSMrhtQr_0",
  },
} as const

export type PhotoKey = keyof typeof PHOTOS
