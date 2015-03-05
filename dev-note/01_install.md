##  설치 패키지
- NodeJS
- git
- Bower
- ExpressJS
- Stylus
- Layout
- AngularJS
- Elasticsearch


### package.json 생성
```
touch README.md
npm init
npm install --save express jade
```

### git 레파지토리 생성
```
git init
```
.gitignore 내용.
```
.idea
node_modules
```
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
- public --> 클라이언트
```
mkdir server
mkdir public
```

### bower 설정.
.bowerrc 파일 추가.
```
{
  "directory" : "public/vendor"
}
```
bower 설정
```
bower init
bower install jquery --save
bower install toastr --save
bower install angular angular-resource angular-route --save
```
toastr 는 팝업을 좀 더 편하게 만들어 주는 라이브러리.
여기까지 하고 나면 public/vendor 아래에 각종 패키지 설치됨.
