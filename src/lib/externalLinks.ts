// Canonical entry points into the LetsMakeCV builder.
//
// These live in one place because the same "create a CV" destination was already typed by
// hand in several components and had drifted into three different URLs — /resume/builder,
// /resume/generator?step=0&templateId=0 and /auth/login — so the same button sent people to
// different places depending on which page they clicked it from.

const LETSMAKECV_BASE = "https://letsmakecv.com";

/** Resume/CV builder, opened on the first step with no template preselected. */
export const CREATE_CV_URL = `${LETSMAKECV_BASE}/resume/generator?step=0&templateId=0`;

/** Cover letter builder. */
export const CREATE_COVER_LETTER_URL = `${LETSMAKECV_BASE}/cover-letters/builder`;

/**
 * Anchor props for links that leave the site.
 *
 * `noopener` stops the opened page reaching back through `window.opener` (tabnabbing);
 * `noreferrer` keeps our URL out of its referrer. Spread onto an `<a target="_blank">`.
 */
export const EXTERNAL_LINK_PROPS = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;
