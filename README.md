src/
├── assets/
│   └── styles/
│       ├── abstracts/     # 함수, 변수, 믹스인 등 (실제 CSS 없음)
│       │   ├── _variables.scss
│       │   ├── _mixins.scss
│       │   └── _functions.scss
│       ├── base/          # reset, typography 등 글로벌 스타일
│       │   ├── _reset.scss
│       │   ├── _typography.scss
│       │   └── _base.scss
│       ├── components/    # 공통 UI 컴포넌트 스타일
│       │   └── _button.scss
│       ├── layout/        # 레이아웃 관련 (grid, header, footer)
│       │   ├── _grid.scss
│       │   ├── _header.scss
│       │   └── _footer.scss
│       ├── pages/         # 페이지 단위 스타일
│       │   ├── _home.scss
│       │   └── _about.scss
│       ├── themes/        # 테마 (다크, 라이트 등)
│       │   └── _default.scss
│       ├── vendors/       # 외부 라이브러리 수정 (optional)
│       └── main.scss      # 실제 import 집약, Vite entry point
│
├── components/
│   └── base/              # 공통 컴포넌트
│   └── layout/            # 레이아웃에 포함되는 컴포넌트 (Sidebar, Header 등)
│   └── {busniss}/
├── containers/            # API관련처리
├── layouts/               # layout 컴포넌트
├── modals/                # Popup형태 컴포넌트


src/
├── components/
│   └── base/
│   └── {busniss}/