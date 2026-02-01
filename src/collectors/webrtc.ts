export interface WebRTCInfo {
  available: boolean;
  localIPs: string[];
}

// Global STUN server host configuration stored in window
const DEFAULT_STUN_HOST = 'stun.deadbeef.pp.ua';

declare global {
  interface Window {
    __stunServerHost?: string;
  }
}

export function getStunServerHost(): string {
  if (typeof window !== 'undefined' && window.__stunServerHost) {
    return window.__stunServerHost;
  }
  return DEFAULT_STUN_HOST;
}

export function setStunServerHost(host: string): void {
  if (typeof window !== 'undefined') {
    window.__stunServerHost = host;
  }
}

interface StunInitResponse {
  port: number;
  ttl: number;
}

async function initStunServer(reqId: string): Promise<StunInitResponse | null> {
  try {
    const host = getStunServerHost();
    const response = await fetch(`https://${host}/init?req_id=${encodeURIComponent(reqId)}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch {
    return null;
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

  // Get dynamic STUN port from init endpoint
  const generatedReqId = reqId || crypto.randomUUID();
  const stunInit = await initStunServer(generatedReqId);

  const iceServers: RTCIceServer[] = stunInit
    ? [{ urls: `stun:${getStunServerHost()}:${stunInit.port}` }]
    : [];

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
          clearTimeout(timeout);
          pc.close();
          result.localIPs = Array.from(ips);
          resolve(result);
          return;
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
