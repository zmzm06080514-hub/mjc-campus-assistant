/**
 * 명지전문대학교 공지사항 크롤러
 *
 * https://www.mjc.ac.kr/bbs/data/list.do?menu_idx=66 목록에서 게시글을 읽어와
 * public/notices.json에 없는 새 글만 감지하고, 상세페이지까지 들러 전체 제목/본문
 * 이미지를 채운 뒤 public/notices.json에 최신순으로 병합 저장한다.
 *
 * 실행: npm run crawl:notices
 * (GitHub Actions에서 매일 KST 09:00에 자동 실행됨 — .github/workflows/crawl-notices.yml)
 */
import * as cheerio from 'cheerio';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SITE_ORIGIN = 'https://www.mjc.ac.kr';
const BBS_MST_IDX = 'BM0000000026';
const MENU_IDX = '66';
const LIST_URL = `${SITE_ORIGIN}/bbs/data/list.do?menu_idx=${MENU_IDX}`;
const OUTPUT_PATH = path.resolve(process.cwd(), 'public/notices.json');
const MAX_STORED = 50;
const USER_AGENT =
  'Mozilla/5.0 (compatible; MJC-Assistant-NoticeCrawler/1.0; +https://github.com/)';

export interface CrawledNotice {
  id: string; // data_idx (안정적인 고유 식별자)
  title: string; // 상세페이지에서 가져온 잘리지 않은 전체 제목
  url: string; // 상세페이지 링크
  author: string;
  date: string; // YYYY-MM-DD (목록에 표시된 날짜)
  views: number;
  images: string[]; // 본문에 첨부된 이미지 (최대 3장)
  crawledAt: string; // ISO timestamp, 이 스크립트가 이 글을 처음 수집한 시각
}

interface ListRow {
  bbsMstIdx: string;
  dataIdx: string;
  listTitle: string; // 목록에 표시된 (잘렸을 수 있는) 제목
  author: string;
  date: string;
  views: number;
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) {
    throw new Error(`요청 실패 (${res.status}): ${url}`);
  }
  return res.text();
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function parseListPage(html: string): ListRow[] {
  const $ = cheerio.load(html);
  const rows: ListRow[] = [];

  $('table.board_list tbody tr').each((_, el) => {
    const $row = $(el);
    const $link = $row.find('a[href^="javascript:fn_view"]').first();
    if ($link.length === 0) return; // 데이터 없음/구분선 행 등은 건너뜀

    const onclickTarget = $link.attr('href') ?? '';
    const match = onclickTarget.match(/fn_view\('([^']*)','([^']*)'/);
    if (!match) return;

    const [, bbsMstIdx, dataIdx] = match;
    const cells = $row.find('td');

    rows.push({
      bbsMstIdx,
      dataIdx,
      listTitle: normalizeWhitespace($link.text()),
      author: normalizeWhitespace(cells.eq(3).text()),
      date: normalizeWhitespace(cells.eq(4).text()),
      views: Number(normalizeWhitespace(cells.eq(5).text())) || 0,
    });
  });

  return rows;
}

async function fetchNoticeDetail(row: ListRow): Promise<CrawledNotice> {
  const url = `${SITE_ORIGIN}/bbs/data/view.do?bbs_mst_idx=${row.bbsMstIdx}&menu_idx=${MENU_IDX}&data_idx=${row.dataIdx}`;
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const fullTitle = normalizeWhitespace($('.board_view h2.tit').first().text()) || row.listTitle;

  const images = $('#divMemo img')
    .map((_, img) => $(img).attr('src') ?? '')
    .get()
    .filter(Boolean)
    .map((src) => (src.startsWith('http') ? src : `${SITE_ORIGIN}${src}`))
    .slice(0, 3);

  return {
    id: row.dataIdx,
    title: fullTitle,
    url,
    author: row.author,
    date: row.date,
    views: row.views,
    images,
    crawledAt: new Date().toISOString(),
  };
}

async function loadExisting(): Promise<CrawledNotice[]> {
  try {
    const raw = await readFile(OUTPUT_PATH, 'utf-8');
    return JSON.parse(raw) as CrawledNotice[];
  } catch {
    return []; // 파일이 없거나 비어있으면 첫 실행으로 간주
  }
}

async function main() {
  console.log(`[crawlNotices] 목록 페이지 조회: ${LIST_URL}`);
  const listHtml = await fetchHtml(LIST_URL);
  const rows = parseListPage(listHtml);
  console.log(`[crawlNotices] 목록에서 ${rows.length}개 항목 발견`);

  const existing = await loadExisting();
  const existingIds = new Set(existing.map((n) => n.id));
  const newRows = rows.filter((r) => !existingIds.has(r.dataIdx));

  if (newRows.length === 0) {
    console.log('[crawlNotices] 새 공지사항 없음. 종료.');
    return;
  }

  console.log(`[crawlNotices] 새 공지사항 ${newRows.length}건 발견, 상세페이지 조회 중...`);
  const newNotices: CrawledNotice[] = [];
  for (const row of newRows) {
    try {
      newNotices.push(await fetchNoticeDetail(row));
    } catch (err) {
      console.error(`[crawlNotices] 상세페이지 조회 실패 (data_idx=${row.dataIdx}):`, err);
    }
  }

  const merged = [...newNotices, ...existing].slice(0, MAX_STORED);

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(merged, null, 2) + '\n', 'utf-8');
  console.log(`[crawlNotices] ${newNotices.length}건 추가 저장 완료 → ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error('[crawlNotices] 실패:', err);
  process.exitCode = 1;
});
