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
    const forms = await listCaptureForms();
    return json({ forms });
  } catch (error) {
    console.warn(JSON.stringify({
      event: "capture_forms_read_recovered",
      message: error?.message,
    }));

    return json({ forms: [] });
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
