import WebViewer from "@pdftron/webviewer";
import { useAuthStore } from "@/stores/auth";
import { defineComponent, onBeforeUnmount, onMounted, ref, toRef, watch } from "vue";

function normalizeUrl(basePath: string, path: string) {
  return `${basePath.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

function toBackendOrigin(apiBaseUrl: string) {
  return apiBaseUrl.replace(/\/+$/, "").replace(/\/api$/, "");
}

function resolveDocumentUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (path.startsWith("/api/")) {
    const backendOrigin = toBackendOrigin(
      String(import.meta.env.VITE_BACKEND_BASE_URL ?? "").trim()
    );
    return backendOrigin ? normalizeUrl(backendOrigin, path) : "";
  }

  const storageBasepath = String(
    import.meta.env.VITE_AWS_S3_BUCKET_OBJECT_BASEPATH ?? ""
  ).trim();

  if (!storageBasepath) {
    return "";
  }

  return normalizeUrl(storageBasepath, path);
}

function isAuthenticatedBackendDocument(url: string) {
  const apiBaseUrl = String(import.meta.env.VITE_BACKEND_BASE_URL ?? "").trim();
  const backendOrigin = toBackendOrigin(apiBaseUrl);

  return (
    Boolean(apiBaseUrl && url.startsWith(apiBaseUrl)) ||
    Boolean(backendOrigin && url.startsWith(`${backendOrigin}/api/`))
  );
}

export default defineComponent({
  name: "PDFTronReader",
  props: {
    path: String,
  },
  setup(props) {
    const PDFReaderRefs = ref<HTMLElement | null>(null);
    const documentPath = toRef(props, "path");
    const activeObjectUrl = ref<string | null>(null);
    const viewerLicenseKey = String(
      import.meta.env.VITE_WEBVIEWER_LICENSE_KEY ?? ""
    ).trim();
    const authStore = useAuthStore();

    const releaseObjectUrl = () => {
      if (!activeObjectUrl.value) {
        return;
      }

      URL.revokeObjectURL(activeObjectUrl.value);
      activeObjectUrl.value = null;
    };

    const resolveViewerSource = async (documentUrl: string) => {
      if (!isAuthenticatedBackendDocument(documentUrl)) {
        return documentUrl;
      }

      const response = await fetch(documentUrl, {
        headers: authStore.access_token
          ? {
              Authorization: `Bearer ${authStore.access_token}`,
            }
          : undefined,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch document: ${response.status}`);
      }

      const blob = await response.blob();
      releaseObjectUrl();
      activeObjectUrl.value = URL.createObjectURL(blob);
      return activeObjectUrl.value;
    };

    const mountViewer = async (nextPath: string) => {
      if (!PDFReaderRefs.value) {
        return;
      }

      const documentUrl = resolveDocumentUrl(nextPath);
      if (!documentUrl) {
        return;
      }

      PDFReaderRefs.value.replaceChildren();
      const viewerSource = await resolveViewerSource(documentUrl);

      const viewerOptions: Record<string, string> = {
        path: "/webviewer",
        initialDoc: viewerSource,
        extension: "pdf",
      };

      if (viewerLicenseKey) {
        viewerOptions.licenseKey = viewerLicenseKey;
      }

      const instance = await WebViewer(viewerOptions, PDFReaderRefs.value);

      instance.UI.setTheme("dark");
    };

    onMounted(() => {
      watch(
        documentPath,
        (nextPath) => {
          if (nextPath) {
            void mountViewer(nextPath);
          } else {
            releaseObjectUrl();
          }
        },
        { immediate: true }
      );
    });

    onBeforeUnmount(() => {
      releaseObjectUrl();
    });

    return {
      PDFReaderRefs,
    };
  },
  render() {
    return <div ref="PDFReaderRefs" class={["h-[100vh]"]} />;
  },
});
