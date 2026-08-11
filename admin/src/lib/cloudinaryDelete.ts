const MAIN_APP = import.meta.env.VITE_STOREFRONT_URL || import.meta.env.VITE_MAIN_APP_URL || "http://localhost:3000";

/**
 * Calls the Next.js API to permanently delete Cloudinary assets.
 * Non-blocking on failure — Firestore delete always proceeds.
 */
export async function deleteCloudinaryAssets(
  publicIds: string[],
  resourceType: "image" | "video" = "image"
): Promise<void> {
  const ids = publicIds.filter(Boolean);
  if (ids.length === 0) return;

  try {
    const res = await fetch(`${MAIN_APP}/api/cloudinary/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": import.meta.env.VITE_ADMIN_API_SECRET || "",
      },
      body: JSON.stringify({ publicIds: ids, resourceType }),
    });
    if (!res.ok) console.error("[Cloudinary Delete]", await res.text());
  } catch (e) {
    console.error("[Cloudinary Delete] Network error:", e);
  }
}
