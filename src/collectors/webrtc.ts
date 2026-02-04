export interface WebRTCInfo {
  available: boolean;
  localIPs: string[];
}

// Global STUN server URL stored in window (format: "stun:host:port")
declare global {
  interface Window {
    __stunServerUrl?: string;
  }
}

export function getStunServerHost(): string {
  if (typeof window !== 'undefined' && window.__stunServerUrl) {
    return window.__stunServerUrl;
  }
  return '';
}

export function setStunServerHost(url: string): void {
  if (typeof window !== 'undefined') {
    window.__stunServerUrl = url;
  }
}

export async function getWebRTCInfo(reqId?: string): Promise<WebRTCInfo> {
  const result: WebRTCInfo = {
    available: false,
    localIPs: [],
  };

  if (typeof RTCPeerConnection === 'undefined') {
    return result;
  }

  result.available = true;

  // Use STUN URL directly from init response (format: "stun:host:port")
  const stunUrl = getStunServerHost();
  const iceServers: RTCIceServer[] = stunUrl ? [{ urls: stunUrl }] : [];

  // Debug logging
  if (typeof console !== 'undefined') {
    console.log('[Fingerprint] WebRTC STUN URL:', stunUrl);
    console.log('[Fingerprint] ICE servers:', JSON.stringify(iceServers));
  }

  try {
    const pc = new RTCPeerConnection({
      iceServers,
    });

    const ips = new Set<string>();

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        pc.close();
        result.localIPs = Array.from(ips);
        resolve(result);
      }, 1000);

      pc.onicecandidate = (event) => {
        if (!event.candidate) {
          if (typeof console !== 'undefined') {
            console.log('[Fingerprint] ICE gathering complete, IPs found:', Array.from(ips));
          }
          clearTimeout(timeout);
          pc.close();
          result.localIPs = Array.from(ips);
          resolve(result);
          return;
        }

        if (typeof console !== 'undefined') {
          console.log('[Fingerprint] ICE candidate:', event.candidate.candidate);
        }
        const candidate = event.candidate.candidate;
        const ipMatch = candidate.match(/(\d{1,3}\.){3}\d{1,3}/);
        if (ipMatch) {
          ips.add(ipMatch[0]);
        }

        const ipv6Match = candidate.match(/([a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/i);
        if (ipv6Match) {
          ips.add(ipv6Match[0]);
        }
      };

      pc.createDataChannel('');
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch(() => {
          clearTimeout(timeout);
          pc.close();
          resolve(result);
        });
    });
  } catch {
    return result;
  }
}
