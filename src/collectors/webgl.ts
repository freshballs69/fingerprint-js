interface WebGLInfo {
  vendor: string;
  renderer: string;
  version: string;
}

export function getWebGLInfo(): WebGLInfo {
  const result: WebGLInfo = {
    vendor: '',
    renderer: '',
    version: '',
  };

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl || !(gl instanceof WebGLRenderingContext)) {
      return result;
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

    if (debugInfo) {
      result.vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
      result.renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
    }

    result.version = gl.getParameter(gl.VERSION) || '';
  } catch {
    // WebGL not available
  }

  return result;
}
