import type { MediaImage } from "@laioutr-core/canonical-types";
import type { Media } from "../../client/types/media";

export const mapImageFragment = (media: Media): MediaImage => ({
  type: "image",
  alt: undefined,
  sources: [{ provider: "emporix", src: media.url ?? "" }],
});
