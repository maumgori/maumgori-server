#필요한 프로그램 및 라이브러리 설치

### 사용할 프로그램 및 패키지
- NodeJS
- git
- Bower
- ExpressJS
- Stylus
- Layout
- AngularJS
- Elasticsearch

### node 설치
http://www.nodejs.org/

설치 후 node 프로그램들은 권한 바꿔주는게 편함. 안 그러면 sudo 로 다 실행해야 함.
```
cd /usr/local/lib
sudo chown -R {유저명}:admin node_modules
```

노드 설치 후 아래 두 명령어만 치면 앞으로 설명할 내용 다 인스톨 됨.
```
npm install
node_modules/.bin/bower install
```


### package.json 생성 / express, jade, stylus 추가.
```
touch README.md
npm init
npm install --save express jade stylus
```

### git 레파지토리 생성
```
git init
```
- .gitignore 파일 생성. 다음 내용 추가.
```
.idea
node_modules
public/vendor
```
- 깃헙에 추가.
```
git add -A
git commit -m "첫 커밋"
git remote add origin git@github.com:maumgori/maumgori-server.git
git push -u origin master
```

### bower 추가
```
npm install bower --save-dev
```

### 디렉토리 생성
- server --> 서버
- public --> 각종 라이브러리
```
mkdir server
mkdir public
```

### bower 설정.
- .bowerrc 파일 생성. 다음 내용 추가. public/vendor 는 깃에 포함 안함.
```
{
  "directory" : "public/vendor"
}
```
- bower 설정. bower를 global로 설치했으면 /node_modules/.bin/ 생략 가능.
```
node_modules/.bin/bower init
node_modules/.bin/bower install bootstrap --save
node_modules/.bin/bower install toastr --save
node_modules/.bin/bower install angular angular-resource angular-route --save
```
- toastr 는 팝업을 좀 더 편하게 만들어 주는 라이브러리.
- 여기까지 하고 나면 public/vendor 아래에 각종 패키지 설치됨.
