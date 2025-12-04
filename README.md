# 소셜 로그인 기반 SNS의 프론트엔드 JWT 취약점 분석 및 보안 시스템 구현

1. 취약점 분석: LocalStorage 저장 방식과 무분별한 HTML 렌더링(dangerouslySetInnerHTML)의 위험성 증명

2. 공격 시나리오 실증: Stored XSS를 통한 토큰 탈취 및 계정 탈취(Account Takeover) 시연

3. 보안 강화: HttpOnly Cookie, DOMPurify, CSP를 적용한 안전한 인증 아키텍처 구현
