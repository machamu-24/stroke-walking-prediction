#!/bin/bash

# 脳卒中後歩行予後予測システム - 自動GitHubセットアップ
# GitHub: machamu-24

set -e  # エラーで停止

echo "======================================"
echo "🚀 GitHub自動セットアップ"
echo "======================================"
echo ""

# 色の定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 変数
GITHUB_USER="machamu-24"
REPO_NAME="stroke-walking-prediction"
REPO_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

echo -e "${BLUE}📂 現在のディレクトリ: $(pwd)${NC}"
echo ""

# Gitがインストールされているか確認
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Gitがインストールされていません${NC}"
    echo "Gitをインストールしてから再実行してください"
    exit 1
fi

echo -e "${GREEN}✅ Git確認完了${NC}"
echo ""

# Gitリポジトリ初期化
echo -e "${BLUE}🔧 Gitリポジトリを初期化しています...${NC}"
git init
echo -e "${GREEN}✅ 初期化完了${NC}"
echo ""

# ファイルをステージング
echo -e "${BLUE}📝 ファイルをステージングしています...${NC}"
git add .
echo -e "${GREEN}✅ ステージング完了${NC}"
echo ""

# ファイル数確認
FILE_COUNT=$(git diff --cached --numstat | wc -l)
echo -e "${BLUE}📊 ステージング済みファイル数: ${FILE_COUNT}${NC}"
echo ""

# 初回コミット
echo -e "${BLUE}💾 初回コミットを作成しています...${NC}"
git commit -m "🎉 Initial commit: 文献ベース脳卒中後歩行予後予測システム v1.0.0

主な機能:
- 5つの文献ルールエンジン実装（EPOS/TWIST/BBS/NIHSS/Perry）
- Fugl-Meyer下肢スコア追加
- 文献コンセンサス分析
- LocalStorageによるデータ保存
- CSVエクスポート機能
- レスポンシブUI（PC・タブレット対応）
- 説明可能性の完全実装（各予測に文献根拠を明示）

技術スタック:
- HTML5 / CSS3 / Vanilla JavaScript
- Google Fonts / Font Awesome
- LocalStorage（将来的にDB移行予定）

開発者: まさむ（理学療法士 / エンジニア）
ライセンス: MIT"

echo -e "${GREEN}✅ コミット完了${NC}"
echo ""

# リモートリポジトリの追加
echo -e "${BLUE}🔗 リモートリポジトリを追加しています...${NC}"
git remote add origin ${REPO_URL}
echo -e "${GREEN}✅ リモート追加完了${NC}"
echo ""

# デフォルトブランチ設定
echo -e "${BLUE}🌿 デフォルトブランチをmainに設定しています...${NC}"
git branch -M main
echo -e "${GREEN}✅ ブランチ設定完了${NC}"
echo ""

# プッシュ前の確認
echo "======================================"
echo -e "${BLUE}📤 プッシュ準備完了${NC}"
echo "======================================"
echo ""
echo -e "リモートURL: ${BLUE}${REPO_URL}${NC}"
echo -e "ブランチ: ${BLUE}main${NC}"
echo ""
echo "⚠️  注意: GitHubで以下のリポジトリを事前に作成してください:"
echo "   https://github.com/${GITHUB_USER}/${REPO_NAME}"
echo ""
read -p "リポジトリを作成済みですか？ (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}🚀 GitHubにプッシュしています...${NC}"
    git push -u origin main
    echo ""
    echo "======================================"
    echo -e "${GREEN}🎉 プッシュ完了！${NC}"
    echo "======================================"
    echo ""
    echo "リポジトリURL:"
    echo -e "${BLUE}https://github.com/${GITHUB_USER}/${REPO_NAME}${NC}"
    echo ""
    echo "次のステップ:"
    echo "1. GitHub Pagesを有効化（Settings → Pages）"
    echo "2. デモURL取得: https://${GITHUB_USER}.github.io/${REPO_NAME}/"
    echo "3. READMEにバッジ追加"
    echo ""
else
    echo ""
    echo -e "${RED}❌ キャンセルされました${NC}"
    echo ""
    echo "次のステップ:"
    echo "1. https://github.com/new にアクセス"
    echo "2. Repository name: ${REPO_NAME}"
    echo "3. Public を選択"
    echo "4. 'Create repository' をクリック"
    echo "5. このスクリプトを再実行"
    echo ""
fi
