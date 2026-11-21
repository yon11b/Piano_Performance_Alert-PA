# 실행

## 통합된 화면과 기능

- `/`와 `/performances`: 포스터 카드, 검색, WORLD/NATIONAL/RISING 필터와 페이지 이동.
- `/performances-new`: NEWBEE 분류 공연과 작곡가 검색.
- `/performances-star`와 이전 상세 주소는 호환 경로로 유지합니다.
- `/seats`: 기존 좌석 도형 기반 확대·선호 좌석 선택, 현재 브라우저에 저장.
- 로그인·커뮤니티 백엔드는 이전 소스에도 없으므로 실제 동작처럼 표시하지 않습니다.

`docker compose up -d --build`는 DB가 준비된 후 migrate를 실행하고 앱과 수집기를 시작합니다.
기존 데이터는 유지하며 famous_level/program/composer 컬럼과 story 길이를 업그레이드합니다.
collector의 외부 API 호출이 실패해도 앱은 이용할 수 있습니다.

## 등급 기준

`openapi/classification_rules.json`은 사용자의 Notion ‘유명한 정도 분류’를 기준으로 합니다.
문서에 명시된 WORLD 연주자가 제목·출연진에 있거나 최고 좌석 가격이 20만원 이상이면 WORLD로 분류합니다.
NATIONAL/RISING/NEWBEE는 경력이 확인된 연주자 이름을 해당 목록에 추가하면 적용됩니다.
KOPIS 응답에는 콩쿠르 수상·소속사·해외 공연 경력이 구조화되어 있지 않으므로, 확인되지 않은 사람을 신인으로 단정하지 않습니다.
미분류 공연은 전체 목록에 표시됩니다. 기존에 입력된 등급은 보존합니다.
program/composer는 기존 자료를 저장할 수 있도록 추가한 필드이며, 없는 곡목을 임의로 생성하지 않습니다.
새 기준 반영은 `docker compose build migrate collector` 후 `docker compose run --rm migrate`로 가능합니다.

프로젝트 루트에서 Docker Desktop이 실행된 상태로:

```powershell
docker compose up -d --build
```

앱: http://localhost:3000/performances

MySQL: 127.0.0.1:3306 / 데이터베이스 pa / 사용자 pa / 비밀번호는 루트 .env의 DB_PASSWORD (기본 1234).
앱 컨테이너는 DB_HOST=db로 연결합니다. 로컬 npm 실행 시에는 code/.env에 DB_HOST=127.0.0.1, DB_NAME=pa, DB_USER=pa, DB_PASSWORD=1234를 설정합니다.
호스트에 MySQL을 별도로 설치할 필요 없이 DB 컨테이너가 MySQL 서버를 실행합니다.
새 DB에는 모델에 맞는 빈 performances 테이블을 자동 생성합니다.
collector 컨테이너가 DB 준비 후 서울 클래식 공연을 자동 수집합니다. 기본 범위는 한국 날짜 기준 오늘부터 90일 뒤까지입니다.
루트 .env에서 KOPIS_SERVICE_KEY, KOPIS_START_DATE, KOPIS_END_DATE(YYYYMMDD)를 지정할 수 있습니다. API 키가 비어 있으면 기존 코드의 키를 사용합니다.
수집은 실행 시 한 번 진행하며 매일 반복하지 않습니다. 앱은 수집과 동시에 시작하므로 수집 완료 후 공연 목록을 새로고침하세요.
수집 완료 시 collector의 Exited (0)은 정상입니다. 재수집은 `docker compose run --rm collector`, 로그 확인은 `docker compose logs -f collector`입니다.
코드 변경 후에는 프로젝트 루트에서 `docker compose up -d --build`로 이미지를 다시 빌드하세요.

```powershell
docker compose ps
docker compose logs --tail 100 app db
docker compose stop
docker compose down
```

DB 데이터는 mysql_data 볼륨에 유지됩니다. `docker compose down -v`는 DB 데이터를 삭제하므로 사용하지 마세요.
초기 SQL은 볼륨이 비어 있는 첫 실행에서만 적용됩니다.
루트 .env가 없다면 .env.example을 복사하고 MYSQL_ROOT_PASSWORD를 변경하세요.
