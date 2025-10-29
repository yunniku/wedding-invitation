#!/bin/bash

echo "🚀 배포를 시작합니다..."

# 변경사항 추가
git add .

# 커밋 메시지 입력받기
read -p "📋 커밋 메시지를 입력하세요: " msg
git commit -m "$msg"

# GitHub에 푸시
git push

echo "✅ GitHub 푸시 완료! Vercel 자동 배포 중..."
echo "🌐 잠시 후 사이트에서 새 버전을 확인하실 수 있습니다."
