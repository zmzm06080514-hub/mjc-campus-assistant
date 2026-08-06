/**
 * 서울특별시_버스도착정보조회 서비스 (data.go.kr) 연동.
 *
 * ws.bus.go.kr는 CORS 헤더를 내려주지 않아 브라우저에서 직접 fetch할 수 없다.
 * 개발 서버에서는 vite.config.ts의 proxy(`/api/seoul-bus`)가 중계해준다.
 * ⚠️ 프로덕션 배포판에는 이 프록시가 없으므로, 배포 시에는 별도의 서버리스/백엔드
 *    프록시를 만들어 VITE_SEOUL_BUS_PROXY_BASE 등으로 바꿔줘야 한다.
 */

const SERVICE_KEY = import.meta.env.VITE_SEOUL_BUS_SERVICE_KEY as string | undefined;
const PROXY_BASE = '/api/seoul-bus';

export interface SeoulBusStopConfig {
  stId: string;
  busRouteId: string;
  ord: number;
}

export interface LiveBusArrival {
  /** "3분 후[1번째 전]" 같은 서울시 API 원문 도착 메시지 */
  message: string;
  /** message에서 뽑아낸 분 단위 도착 예정 시간 (파싱 실패 시 null) */
  minutes: number | null;
  /** 몇 번째 전 정류장인지 (파싱 실패 시 null) */
  stopsAway: number | null;
}

/**
 * 메시지 예시: "3분후[1번째전]", "곧 도착", "운행종료"
 * 정규식으로 분/정류장 수를 최대한 뽑아내되, 실패하면 null을 반환한다
 * (호출부에서 message 원문을 그대로 보여주면 되므로 치명적이지 않다).
 */
function parseArrivalMessage(message: string): { minutes: number | null; stopsAway: number | null } {
  const minuteMatch = message.match(/(\d+)\s*분/);
  const stopsMatch = message.match(/(\d+)\s*번째\s*전/);
  return {
    minutes: minuteMatch ? Number(minuteMatch[1]) : null,
    stopsAway: stopsMatch ? Number(stopsMatch[1]) : null,
  };
}

function textOf(parent: Element | null, tag: string): string {
  return parent?.querySelector(tag)?.textContent?.trim() ?? '';
}

/**
 * 정류소 하나 + 노선 하나의 실시간 도착정보를 조회한다.
 * 인증키가 없거나, 네트워크/CORS 오류, API 자체 오류(승인 전파 지연 등) 등
 * 어떤 이유로든 실패하면 null을 반환한다 — 호출부는 항상 시뮬레이션 값으로 폴백해야 한다.
 */
export async function fetchLiveBusArrival(
  stop: SeoulBusStopConfig
): Promise<LiveBusArrival | null> {
  if (!SERVICE_KEY) return null;

  try {
    const url =
      `${PROXY_BASE}/arrive/getArrInfoByRoute` +
      `?serviceKey=${SERVICE_KEY}&stId=${stop.stId}&busRouteId=${stop.busRouteId}&ord=${stop.ord}`;

    const res = await fetch(url);
    if (!res.ok) return null;

    const xmlText = await res.text();
    const doc = new DOMParser().parseFromString(xmlText, 'text/xml');

    if (doc.querySelector('parsererror')) return null;

    const headerCd = textOf(doc.documentElement, 'headerCd');
    if (headerCd && headerCd !== '0') return null; // 인증 실패 등 API 자체 오류

    const item = doc.querySelector('itemList');
    if (!item) return null;

    const message = textOf(item, 'arrmsg1');
    if (!message) return null;

    const { minutes, stopsAway } = parseArrivalMessage(message);
    return { message, minutes, stopsAway };
  } catch {
    return null; // CORS, 네트워크 오류 등 — 조용히 실패하고 시뮬레이션으로 폴백
  }
}
