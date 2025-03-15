# Supabase를 활용한 팀 기반 Todo 앱

이 프로젝트는 Supabase를 활용하여 팀 기반의 할일 관리 기능을 구현한 예제입니다.

# Project infra

* [Vercel](https://vercel.com/sungwoos-projects-d06f55a2/supabase-nextjs-todo-list)
* [Supabase](https://supabase.com/dashboard/project/imebztifhnronuuzxnmz)

# 작업 방법

* 새로운 branch에서 기능 추가를 한다.
* 다음 npm 명령으로 local <-> remote diff 한 migration 파일을 생성 후 remote db에 적용한다.
  `npm run prepare-merge`
* 생성한 `prepare_merge.sql` 파일을 작업 branch에서 작성한 파일로 이름을 변경한다.
* `npx supabase db reset` 명령으로 초기화 후 `npx run test:e2e` 테스트를 진행 한다.
