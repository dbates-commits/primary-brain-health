import type { Template } from "tinacms";

export const videoSpotlightBlock: Template = {
  name: "videoSpotlight",
  label: "Video Spotlight",
  ui: {
    defaultItem: {
      headline: "",
      subheadline: "",
    },
    itemProps: (item) => ({
      label: `Video Spotlight - ${item?.headline?.slice(0, 40) || "Untitled"}`,
    }),
  },
  fields: [
    {
      name: "headline",
      label: "Headline (optional)",
      type: "string",
    },
    {
      name: "subheadline",
      label: "Subheadline (optional)",
      type: "string",
      ui: {
        component: "textarea",
      },
    },
    {
      name: "video",
      label: "Video URL",
      type: "string",
      description:
        "Path to a video file in /public (e.g. /videos/intro.mp4). Plays in a modal when the play button is clicked.",
    },
    {
      name: "poster",
      label: "Poster Image",
      type: "image",
      description: "Still shown in the centered card before play",
    },
    {
      name: "leftImage",
      label: "Left Decorative Image",
      type: "image",
      description: "Decorative image peeking out behind the video on the left",
    },
    {
      name: "rightImage",
      label: "Right Decorative Image",
      type: "image",
      description: "Decorative image peeking out behind the video on the right",
    },
  ],
};
