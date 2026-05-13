import { useState } from "react";
import { scanService } from "../services/scanService";

export function useScan() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const wrap = async (fn) => {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const scanWithCamera = (base64) =>
    wrap(() => scanService.scanCamera({ image: base64 }));
  const scanWithBarcode = (barcode) =>
    wrap(() => scanService.scanCamera({ barcode, image: "" }));
  const scanManually = (text) => {
    const encoded =
      typeof btoa !== "undefined"
        ? btoa(unescape(encodeURIComponent(text)))
        : Buffer.from(text, "utf-8").toString("base64");
    return wrap(() => scanService.scanCamera({ image: encoded }));
  };

  return { loading, error, scanWithCamera, scanWithBarcode, scanManually };
}