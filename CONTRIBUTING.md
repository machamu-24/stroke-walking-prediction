# 開発者向けガイド

このプロジェクトへの貢献を歓迎します！

## 🚀 開発環境のセットアップ

### 必要なもの
- Webブラウザ（Chrome, Firefox, Safari, Edge）
- テキストエディタ（VSCode推奨）
- Python 3.x（ローカルサーバー起動用、任意）

### ローカル起動

```bash
# リポジトリをクローン
git clone https://github.com/your-username/stroke-walking-prediction.git
cd stroke-walking-prediction

# ローカルサーバー起動（方法1: Python）
python -m http.server 8000

# ローカルサーバー起動（方法2: Node.js）
npx http-server -p 8000

# ブラウザで開く
open http://localhost:8000
```

または、`index.html` を直接ブラウザで開くこともできます。

---

## 📝 文献ルールの追加方法

### ステップ1: `js/rules.js` にルール定義を追加

```javascript
newRule: {
    name: "ルール名",
    source: "著者 年 雑誌",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/...",
    evidenceLevel: "Cohort Study",
    badge: "badge-cohort",
    
    applyWhen: (inputs) => {
        return /* 適用条件 */;
    },
    
    evaluate: (inputs) => {
        return {
            prediction: "予測結果",
            isPositive: true/false,
            details: ["詳細情報"],
            note: "メモ"
        };
    }
}
```

### ステップ2: 必要に応じて `index.html` に入力欄を追加

```html
<div class="form-group">
    <label for="new_variable">新しい変数名</label>
    <input type="number" id="new_variable" min="0" max="100" value="0">
</div>
```

### ステップ3: `js/app.js` のデータ収集に追加

```javascript
// collectFormData() 関数内に追加
new_variable: parseFloat(document.getElementById('new_variable').value) || null,
```

---

## 🧪 テスト方法

### 手動テスト
1. ブラウザの開発者ツール（F12）を開く
2. コンソールにエラーが出ないか確認
3. 各入力値を変更して予測結果が正しく変わるか確認

### データ確認
```javascript
// コンソールで実行
showStats()  // データ統計を表示
exportData()  // CSVファイルをダウンロード
```

---

## 📂 ファイル構造

```
stroke-walking-prediction/
├── index.html          # メインHTML
├── README.md           # プロジェクト説明
├── LICENSE             # MITライセンス
├── CONTRIBUTING.md     # このファイル
├── .gitignore          # Git除外設定
├── css/
│   └── style.css       # スタイルシート
└── js/
    ├── rules.js        # ルール定義
    ├── engine.js       # ルールエンジン
    ├── storage.js      # データ保存
    └── app.js          # UIロジック
```

---

## 🔧 コーディング規約

### JavaScript
- インデント: 4スペース
- セミコロン: 必須
- 変数名: camelCase
- 定数名: UPPER_SNAKE_CASE
- コメント: 日本語OK

### HTML
- インデント: 4スペース
- 属性の引用符: ダブルクォート `""`
- セマンティックHTML推奨

### CSS
- インデント: 4スペース
- クラス名: kebab-case
- CSS変数活用

---

## 🐛 バグ報告

GitHub Issuesで以下の情報を含めて報告してください:

1. **現象**: 何が起きたか
2. **再現手順**: どうやって再現するか
3. **期待される動作**: 本来どうあるべきか
4. **環境**: ブラウザ、OS、バージョン
5. **スクリーンショット**: あれば

---

## 💡 機能提案

新しい機能のアイデアがあれば、GitHub Issuesで提案してください。

以下の情報があると助かります:
- **背景**: なぜこの機能が必要か
- **提案内容**: 具体的にどんな機能か
- **ユースケース**: 誰がどのように使うか
- **優先度**: High / Medium / Low

---

## 📜 ライセンス

このプロジェクトはMITライセンスです。詳細は [LICENSE](LICENSE) を参照してください。

---

## 🙏 コントリビューター

貢献してくれた方々:
- Masamu（開発者 / 理学療法士）

---

ご協力ありがとうございます！🎉
