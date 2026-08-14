# 그대를 바라 봄

정성원의 WAV/MP3 음원을 감상하는 음악 스트리밍 사이트입니다. Stitch 디자인을 바탕으로 만든 React SPA와 Cloudflare Worker/R2 스트리밍 API를 한 프로젝트에서 배포합니다.

## 구조

- React + Vite: 반응형 음악 플레이어와 저작권 안내
- Cloudflare Workers Static Assets: 프론트엔드 배포
- Cloudflare Worker: `/api/tracks`, `/media/:id` API
- Cloudflare R2: 비공개 음원 객체 저장
- Range 요청: 곡 탐색과 이어듣기 지원

## 로컬 실행

```bash
npm install
npm run dev
```

`npm run dev`는 `the-bom-wav`의 WAV/MP3 파일을 읽어 `src/data/tracks.json`을 자동 생성합니다. 프론트엔드는 `http://localhost:5173`에서 실행됩니다. 실제 음원 재생에는 R2가 연결된 Worker가 필요합니다.

전체 Worker 환경을 로컬에서 확인하려면:

```bash
npm run preview
```

## Cloudflare 준비와 배포

```bash
npx wrangler login
npm run r2:create
npm run r2:upload
npm run deploy
```

기본 R2 버킷 이름은 `the-bom-music`입니다. 다른 이름을 쓰려면 `wrangler.jsonc`의 `bucket_name`을 변경하고 업로드 시 `R2_BUCKET` 환경변수를 설정하세요.

```bash
R2_BUCKET=다른-버킷 npm run r2:upload
```

현재 음원 85개는 약 4.66GB이므로 업로드에 시간이 걸립니다. 업로드 도중 실패하면 해당 파일부터 다시 실행하거나, 대량 전송과 재시도가 필요한 경우 Cloudflare가 권장하는 `rclone`을 사용하세요.

배포 구성은 `the-bom.com`과 `www.the-bom.com`을 Worker Custom Domain으로 연결하며, `www` 요청은 경로와 쿼리를 유지한 채 apex 도메인으로 리디렉션합니다. 같은 호스트명에 기존 CNAME이 있으면 Cloudflare에서 충돌을 먼저 해소해야 합니다.

## 주요 명령

```bash
npm run typecheck       # TypeScript 검사
npm test                # 컴포넌트 테스트
npm run build           # 배포 빌드
npm run tracks:generate # 음원 목록/재생시간 갱신
npm run r2:upload       # 모든 WAV/MP3를 R2에 업로드
```

`.env`와 `the-bom-wav`는 Git에 포함되지 않습니다.
