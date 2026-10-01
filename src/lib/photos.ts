import invite from "../../public/images/invite.jpg"
import meetup from "../../public/images/meetup.jpg"
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
  meetup: {
    src: meetup,
    width: meetup.width,
    height: meetup.height,
    photographer: "Quilia",
    profile: "https://unsplash.com/@heyquilia",
    page: "https://unsplash.com/photos/1-aA2Fadydc",
  },
} as const

export type PhotoKey = keyof typeof PHOTOS
