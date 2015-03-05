#서버 실행하는 스켈레톤 생성.

### server.js 생성 - node 시작 프로그램.
- server.js 내용 참고.
- 노드의 환경변수를 가져오는 설정.
```
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
```
- `app.get('/')` 대신 `app.get('*')` 쓰는 것이 나음. 루트 뿐 아니라 전체 경로 받음.

###jade 파일 생성
- server/views 디렉토리 생성 후 그 안에 index.jade 추가.
- 레이아웃과 공통 스크립트는 server/includes 디렉토리 생성 후 layout.jade, scripts.jade로 추가.
- index.jade 에서 layout.jade 호출
```
extends ../includes/layout
```
- jade 대신 html 쓰고 싶으면 jade 파일에 include index.html 넣어주면 됨.

### css / js 파일 추가.
- public/css 디렉토리 생성 후 그 안에 site.styl 파일 추가.
  site.styl --> site.css로 변환 생성됨
  site.css 직접 추가해도 상관 없음.
  layout.jade의 `link(rel="stylesheet", href="/css/site.css")` 참고
- public/app 디렉토리 생성 후 app.js 파일 추가.
- server/views/conts 디렉토리 생성 후 main.jade 파일 추가.

### 서버 실행
```
node server.js
```
node server.js 하던지
nodemon 설치해서 하던지 ( npm install nodemon -g )
nodemon server.js
