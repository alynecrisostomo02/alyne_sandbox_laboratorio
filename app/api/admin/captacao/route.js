import {
  cleanCaptureForm,
  isAuthenticated,
  json,
  listCaptureForms,
  readJson,
  sameOrigin,
  saveCaptureForm,
} from "@/src/admin/server";

export async function GET(request) {
  if (!(await isAuthenticated(request))) {
    return json({ code: "UNAUTHORIZED" }, 401);
  }

  try {
    return json({ forms: await listCaptureForms() });
  } catch (error) {
    console.error(JSON.stringify({
      event: "capture_forms_read_failed",
      message: error?.message,
    }));

    return json({ code: "DATABASE_UNAVAILABLE" }, 503);
  }
}

export async function PUT(request) {
  if (!sameOrigin(request)) {
    return json({ code: "ORIGIN_NOT_ALLOWED" }, 403);
  }

  if (!(await isAuthenticated(request))) {
    return json({ code: "UNAUTHORIZED" }, 401);
  }

  try {
    const form = cleanCaptureForm(await readJson(request));
    await saveCaptureForm(form);

    return json({ form });
  } catch (error) {
    const invalid = [
      "INVALID_CAPTURE_FORM",
      "REQUEST_TOO_LARGE",
    ].includes(error?.message);

    return json(
      { code: invalid ? error.message : "DATABASE_UNAVAILABLE" },
      invalid ? 400 : 503
    );
  }
}
