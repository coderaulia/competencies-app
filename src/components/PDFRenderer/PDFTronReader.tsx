import WebViewer from "@pdftron/webviewer";
import { defineComponent, onMounted, ref, toRef, watch } from "vue";

function normalizeUrl(basePath: string, path: string) {
  return `${basePath.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

function resolveDocumentUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const storageBasepath = String(
    import.meta.env.VITE_AWS_S3_BUCKET_OBJECT_BASEPATH ?? ""
  ).trim();

  if (!storageBasepath) {
    return "";
  }

  return normalizeUrl(storageBasepath, path);
}

export default defineComponent({
  name: "PDFTronReader",
  props: {
    path: String,
  },
  setup(props) {
    const PDFReaderRefs = ref<HTMLElement | null>(null);
    const documentPath = toRef(props, "path");
    const viewerLicenseKey = String(
      import.meta.env.VITE_WEBVIEWER_LICENSE_KEY ?? ""
    ).trim();

    const mountViewer = async (nextPath: string) => {
      if (!PDFReaderRefs.value) {
        return;
      }

      const documentUrl = resolveDocumentUrl(nextPath);
      if (!documentUrl) {
        return;
      }

      PDFReaderRefs.value.replaceChildren();

      const viewerOptions: Record<string, string> = {
        path: "/webviewer",
        initialDoc: documentUrl,
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
          }
        },
        { immediate: true }
      );
    });

    return {
      PDFReaderRefs,
    };
  },
  render() {
    return <div ref="PDFReaderRefs" class={["h-[100vh]"]} />;
  },
});
