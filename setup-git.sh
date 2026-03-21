#!/bin/bash

# 脳卒中後歩行予後予測システム - GitHubセットアップスクリプト

echo "======================================"
echo "GitHub リポジトリ セットアップ"
echo "======================================"
echo ""

# 現在のディレクトリ確認
echo "📂 現在のディレクトリ: $(pwd)"
echo ""

# Gitリポジトリ初期化
echo "🔧 Gitリポジトリを初期化しています..."
git init
echo "✅ 初期化完了"
echo ""

# ファイルをステージング
echo "📝 ファイルをステージングしています..."
git add .
echo "✅ ステージング完了"
echo ""

# 初回コミット
echo "💾 初回コミットを作成しています..."
git commit -m "🎉 Initial commit: 文献ベース脳卒中後歩行予後予測システム v1.0.0

- 5つの文献ルールエンジン実装（EPOS/TWIST/BBS/NIHSS/Perry）
- Fugl-Meyer下肢スコア追加
- 文献コンセンサス分析
- LocalStorageによるデータ保存
- CSVエクスポート機能
- レスポンシブUI
- 説明可能性の完全実装"
echo "✅ コミット完了"
echo ""

# リモートリポジトリの追加（手動で設定）
echo "======================================"
echo "次のステップ（手動で実行してください）"
echo "======================================"
echo ""
echo "1. GitHubで新しいリポジトリを作成"
echo "   リポジトリ名: stroke-walking-prediction"
echo "   説明: 文献ベース脳卒中後歩行予後予測システム"
echo ""
echo "2. リモートリポジトリを追加"
echo "   git remote add origin https://github.com/YOUR_USERNAME/stroke-walking-prediction.git"
echo ""
echo "3. デフォルトブランチ設定（main）"
echo "   git branch -M main"
echo ""
echo "4. プッシュ"
echo "   git push -u origin main"
echo ""
echo "======================================"
echo "完了！🎉"
echo "======================================"
