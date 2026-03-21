#!/bin/bash

# 脳卒中後歩行予後予測システム - GitHub自動セットアップ（認証対応版）
# GitHub: machamu-24

set -e

echo "======================================"
echo "🚀 GitHub自動セットアップ（認証対応版）"
echo "======================================"
echo ""

# 色の定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 変数
GITHUB_USER="machamu-24"
REPO_NAME="stroke-walking-prediction"

echo -e "${BLUE}📂 現在のディレクトリ: $(pwd)${NC}"
echo ""

# Gitがインストールされているか確認
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Gitがインストールされていません${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Git確認完了${NC}"
echo ""

# 認証方法の選択
echo "======================================"
echo "🔐 GitHub認証方法を選択してください"
echo "======================================"
echo ""
echo "1. Personal Access Token（推奨・簡単）"
echo "2. SSH Key（上級者向け）"
echo "3. HTTPS（ユーザー名/パスワード入力）"
echo ""
read -p "選択 (1/2/3): " AUTH_METHOD
echo ""

case $AUTH_METHOD in
    1)
        echo -e "${YELLOW}📝 Personal Access Tokenを準備してください${NC}"
        echo ""
        echo "トークンの取得方法:"
        echo "1. https://github.com/settings/tokens にアクセス"
        echo "2. 'Generate new token' → 'Generate new token (classic)'"
        echo "3. 'repo' にチェックを入れる"
        echo "4. 'Generate token' をクリック"
        echo "5. 表示されたトークン（ghp_xxxxx...）をコピー"
        echo ""
        read -p "トークンを貼り付けてください: " GITHUB_TOKEN
        REPO_URL="https://${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${REPO_NAME}.git"
        ;;
    2)
        echo -e "${BLUE}🔑 SSH認証を使用します${NC}"
        echo ""
        # SSH Keyの確認
        if [ ! -f ~/.ssh/id_ed25519.pub ] && [ ! -f ~/.ssh/id_rsa.pub ]; then
            echo -e "${YELLOW}⚠️  SSH Keyが見つかりません${NC}"
            echo ""
            read -p "SSH Keyを生成しますか？ (y/n): " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                read -p "メールアドレスを入力: " EMAIL
                ssh-keygen -t ed25519 -C "$EMAIL"
                echo ""
                echo -e "${GREEN}✅ SSH Key生成完了${NC}"
                echo ""
                echo "公開鍵の内容:"
                cat ~/.ssh/id_ed25519.pub
                echo ""
                echo -e "${YELLOW}上記の公開鍵をGitHubに登録してください:${NC}"
                echo "https://github.com/settings/keys"
                echo ""
                read -p "登録完了後、Enterキーを押してください..."
            else
                echo -e "${RED}SSH Keyが必要です。終了します。${NC}"
                exit 1
            fi
        fi
        REPO_URL="git@github.com:${GITHUB_USER}/${REPO_NAME}.git"
        ;;
    3)
        echo -e "${BLUE}🔐 HTTPS認証を使用します${NC}"
        echo ""
        echo "プッシュ時にユーザー名とトークンを入力する必要があります"
        REPO_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
        ;;
    *)
        echo -e "${RED}無効な選択です${NC}"
        exit 1
        ;;
esac

echo ""
echo "======================================"
echo -e "${BLUE}🔧 Git初期化を開始します${NC}"
echo "======================================"
echo ""

# Gitリポジトリ初期化
if [ ! -d .git ]; then
    echo -e "${BLUE}🔧 Gitリポジトリを初期化しています...${NC}"
    git init
    echo -e "${GREEN}✅ 初期化完了${NC}"
else
    echo -e "${YELLOW}⚠️  既にGitリポジトリです${NC}"
fi
echo ""

# ファイルをステージング
echo -e "${BLUE}📝 ファイルをステージングしています...${NC}"
git add .
echo -e "${GREEN}✅ ステージング完了${NC}"
echo ""

# 初回コミット（既にコミットがある場合はスキップ）
if git rev-parse HEAD >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  既にコミットが存在します${NC}"
else
    echo -e "${BLUE}💾 初回コミットを作成しています...${NC}"
    git commit -m "🎉 Initial commit: 文献ベース脳卒中後歩行予後予測システム v1.0.0

主な機能:
- 5つの文献ルールエンジン実装（EPOS/TWIST/BBS/NIHSS/Perry）
- Fugl-Meyer下肢スコア追加
- 文献コンセンサス分析
- LocalStorageによるデータ保存
- CSVエクスポート機能
- レスポンシブUI
- 説明可能性の完全実装

開発者: まさむ（理学療法士 / エンジニア）"
    echo -e "${GREEN}✅ コミット完了${NC}"
fi
echo ""

# リモートリポジトリの追加
echo -e "${BLUE}🔗 リモートリポジトリを設定しています...${NC}"
if git remote | grep -q origin; then
    echo -e "${YELLOW}⚠️  既にリモート 'origin' が存在します${NC}"
    git remote remove origin
    echo -e "${BLUE}古いリモートを削除しました${NC}"
fi
git remote add origin ${REPO_URL}
echo -e "${GREEN}✅ リモート設定完了${NC}"
echo ""

# デフォルトブランチ設定
echo -e "${BLUE}🌿 デフォルトブランチをmainに設定...${NC}"
git branch -M main
echo -e "${GREEN}✅ ブランチ設定完了${NC}"
echo ""

# プッシュ
echo "======================================"
echo -e "${BLUE}📤 GitHubにプッシュしています...${NC}"
echo "======================================"
echo ""
echo "⚠️  リポジトリが存在することを確認してください:"
echo "   https://github.com/${GITHUB_USER}/${REPO_NAME}"
echo ""
read -p "プッシュを開始しますか？ (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
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
    echo "1. GitHub Pagesを有効化"
    echo "   Settings → Pages → Branch: main → Save"
    echo ""
    echo "2. デモサイトURL:"
    echo "   https://${GITHUB_USER}.github.io/${REPO_NAME}/"
    echo ""
else
    echo -e "${RED}キャンセルされました${NC}"
fi
