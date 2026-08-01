const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target?.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export const uploadProductImage = async (file: File): Promise<string> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "";

  // Fallback to local base64 if Cloudinary credentials are not configured yet
  if (!cloudName || !uploadPreset || cloudName.includes("YOUR_") || uploadPreset.includes("YOUR_")) {
    console.warn("Cloudinary not configured. Falling back to local Base64 string for testing.");
    return await fileToDataURL(file);
  }

  const formData = new FormData();
  formData.append("file", file); // Direct binary upload for image
  formData.append("upload_preset", uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to upload image to Cloudinary");
  }

  const data = await res.json();
  return data.secure_url; // Direct secure CDN URL
};

export const uploadVideoToCloudinary = async (file: File): Promise<string> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "";

  if (!cloudName || !uploadPreset || cloudName.includes("YOUR_") || uploadPreset.includes("YOUR_")) {
    throw new Error("Cloudinary credentials are not configured. Please add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your env configuration.");
  }

  const formData = new FormData();
  formData.append("file", file); // Direct binary upload for video
  formData.append("upload_preset", uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    console.error("Cloudinary upload failed:", errorBody);
    throw new Error("Failed to upload video to Cloudinary");
  }

  const data = await res.json();
  return data.secure_url;
};
