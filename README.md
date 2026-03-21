# 脳卒中後歩行予後予測システム - Web版デモ

[![GitHub Pages](https://img.shields.io/badge/demo-live-success?style=flat-square&logo=github)](https://machamu-24.github.io/stroke-walking-prediction/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=flat-square)](CHANGELOG.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

文献ベースのルールエンジンによる説明可能な歩行予後予測ツール

**🌐 デモサイト**: https://machamu-24.github.io/stroke-walking-prediction/

---

## 📋 プロジェクト概要

**プロジェクト名:** 脳卒中後歩行予後予測支援ツール（Web版デモ）  
**バージョン:** 1.0.0  
**作成日:** 2026年3月2日  
**作成者:** まさむ（理学療法士 / エンジニア）

このシステムは、回復期リハビリテーション病棟に勤務する理学療法士が、脳卒中患者の歩行予後を**客観的かつ説明可能な形**で予測できる臨床支援ツールのデモ版です。

機械学習によるブラックボックスモデルではなく、**既存の臨床文献に基づくルールベースエンジン**を採用することで、「なぜこの予測が出たか」を患者・家族・他職種に説明できる透明性の高いシステムを実現しています。

全ての文献は、各ルール結果に直接リンクが表示されているため、予後に関する文献へのアクセスを容易にします。

---

## ✨ 主な機能

### 1. **5つの文献ベースルールエンジン**

現在は `js/rules.js` に定義された5つの文献ルールを基に解析を実施します。

**＊デモ版では、下記の5文献ルールを実装しています。追加や差し替えはコード編集で行う想定です。**

| ルール名 | 文献出典 | 評価時期 | 主要指標 |
|---------|---------|---------|---------|
| **EPOSモデル** | Veerbeek et al. (2011) | 発症72時間以内 | 座位保持30秒 × MI下肢 |
| **TWISTアルゴリズム** | Smith et al. (2017) | 発症1週間以内 | Trunk Control Test (TCT) |
| **BBSカットオフ** | Jenkin et al. (2021) | 回復期入院時 | Berg Balance Scale (BBS) |
| **NIHSSカットオフ** | Ikeda & Minamimura (2025) | 入院時 | NIHSS スコア（性別補正） |
| **Perry歩行速度分類** | Perry et al. (1995) | 評価時点 | 10m歩行速度 |

### 2. **説明可能性の重視**

各予測結果には必ず以下の情報が付与されます:

- ✅ **文献根拠リンク** (PubMed/PMC/J-STAGE)
- ✅ **カットオフ値・閾値**
- ✅ **予測精度指標**（Accuracy, AUC, 感度, 特異度）
- ✅ **エビデンスレベル**（SR/コホート/専門家分類）

### 3. **文献コンセンサス分析**

複数の文献ルールを統合し、「どれだけの文献が歩行自立を示唆しているか」をスコア化・可視化します。

### 4. **ブラウザ内保存とCSV出力**

予測結果はブラウザの LocalStorage に保存されます。画面上のデータ管理パネルから、累積件数・実績記録件数・精度確認と CSV 出力が可能です。

---

## 🎯 実装済みルール詳細

デモ版では、下記の文献ベースを登録しています。

### ✅ EPOSモデル（発症72時間以内）
- **根拠文献**: [Veerbeek et al. (2011) Neurorehabilitation and Neural Repair](https://pubmed.ncbi.nlm.nih.gov/21186329/)
- **カットオフ**: 座位保持30秒 + MI下肢≥25 → 6ヶ月後歩行自立確率98% / 条件未達 → 23%
- **精度**: Accuracy 92%, 感度 96%, 特異度 75%

### ✅ TWISTアルゴリズム（発症1週間時点）
- **根拠文献**: [Smith et al. (2017) Neurorehabilitation and Neural Repair](https://pubmed.ncbi.nlm.nih.gov/29090654/)
- **カットオフ**: TCT > 40点 → 6週間以内に歩行自立
- **精度**: Accuracy 91%

### ✅ BBSカットオフ（回復期入院時）
- **根拠文献**: [Jenkin et al. (2021) Physiotherapy Canada](https://pmc.ncbi.nlm.nih.gov/articles/PMC8370698/)
- **カットオフ**: BBS ≥ 14点 → 退院時歩行自立
- **精度**: AUC 0.81, 感度 73%, 特異度 89%

### ✅ NIHSSカットオフ（性別補正）
- **根拠文献**: [Ikeda & Minamimura (2025) Physical Therapy Research](https://www.jstage.jst.go.jp/article/ptr/advpub/0/advpub_25-E10354/_article/-char/en)
- **カットオフ**: 男性≤7.5点、女性≤5.5点 → 歩行自立
- **精度**: 男性 AUC 0.80, 女性 AUC 0.86

### ✅ Perry歩行速度分類
- **根拠文献**: [Perry et al. (1995) - 検証論文](https://pmc.ncbi.nlm.nih.gov/articles/PMC2587153/)
- **カットオフ**:
  - < 0.4 m/s: Household（家庭内歩行）
  - 0.4-0.8 m/s: Limited Community（限定的地域歩行）
  - ≥ 0.8 m/s: Community（地域歩行自立）

---

## 🚀 デモの使い方

### 1. **アクセス方法**

このWebアプリは静的HTMLで構成されているため、以下の方法で動作します:

#### 方法A: ブラウザで直接開く
```bash
# index.html をダブルクリックして開く
```

#### 方法B: ローカルサーバー起動（推奨）
```bash
# Python 3の場合
python -m http.server 8000

# または Python 2の場合
python -m SimpleHTTPServer 8000
```

その後、ブラウザで `http://localhost:8000` にアクセス

### 2. **入力の流れ**

1. **基本情報**: 年齢、性別、発症からの日数、病型
2. **神経学的評価**: NIHSS、半側空間無視
3. **身体機能評価**: TCT、座位保持、MI下肢、BBS、10m歩行速度
4. **認知機能・社会背景**: MMSE、介護者の有無、糖尿病合併
5. 「予測を実行」ボタンをクリック

### 3. **結果の見方**

#### A. 文献コンセンサス分析
- **スコア**: 自立寄りの文献の割合（0-100%）
- **トーン**: 
  - 70%以上: 自立寄りのコンセンサス（緑）
  - 40-70%: 拮抗（黄）
  - 40%未満: 困難寄りのコンセンサス（赤）

#### B. 個別ルール結果
各ルールカードには以下が表示されます:
- ルール名とエビデンスレベル
- 予測結果（色分け: 緑=自立寄り、赤=困難寄り）
- 詳細情報（スコア、カットオフ、精度指標）
- 文献根拠リンク（クリックで原著にアクセス可能）

#### C. データ管理
- 予測結果はブラウザ内に自動保存
- 累積予測数、実績記録数、精度を画面上で確認可能
- CSV出力ボタンから履歴をダウンロード可能

---

## 📂 ファイル構成

```
stroke-walking-prediction/
├── index.html          # メインHTML（入力フォーム・結果表示）
├── css/
│   └── style.css       # スタイルシート（レスポンシブ対応）
├── js/
│   ├── rules.js        # 5つの文献ルール定義
│   ├── engine.js       # ルールエンジン（評価・コンセンサス計算）
│   ├── storage.js      # LocalStorage保存・CSV出力・統計計算
│   └── app.js          # UIロジック（イベントハンドラー）
└── README.md           # このファイル
```

---

## 💡 デモでできること・できないこと

### ✅ できること
- 5つの主要文献ルールに基づく歩行予後予測
- 各文献の根拠・精度指標の確認
- 文献コンセンサスの可視化
- レスポンシブUI（PC・タブレット対応）
- 入力値の妥当性検証
- LocalStorage による予測履歴の保存
- CSV エクスポート
- 統計確認パネルの表示

### ⚠️ できないこと（今後の拡張予定）
- ユーザー認証・ログイン機能
- 端末間共有・クラウド同期
- PDF出力・印刷機能
- 追加ルールの動的登録
- 退院時実績の入力UI
- 院内サーバーへのデプロイ（ローカル動作のみ）

---

## 🔧 技術スタック

| レイヤー | 技術 | 理由 |
|---------|------|------|
| フロントエンド | HTML5 / CSS3 / JavaScript (Vanilla) | シンプル・高速・依存なし |
| スタイリング | Google Fonts / Font Awesome | 可読性・アイコン |
| データ管理 | LocalStorage（ブラウザ内に永続化） | デモ用・依存なし |
| ホスティング | 静的ファイル（ローカル/簡易サーバー） | デプロイ不要 |

---

## 📊 デモのサンプル入力値

初期表示時に以下のデフォルト値が設定されています:

| 項目 | 値 |
|------|-----|
| 年齢 | 70歳 |
| 性別 | 男性 |
| 発症からの日数 | 7日 |
| NIHSS | 8点 |
| TCT | 35点 |
| MI下肢 | 40点 |
| BBS | 12点 |
| 10m歩行速度 | 0.3 m/s |
| 座位保持30秒 | 可能 |

このサンプルでは:
- **EPOS**: 適用外（発症3日超）
- **TWIST**: 困難寄り（TCT≤40）
- **BBS**: 困難寄り（BBS<14）
- **NIHSS**: 困難寄り（男性で8>7.5）
- **Perry**: 困難寄り（0.3<0.4 Household）

→ 総合スコア: **0% = 困難寄りのコンセンサス**

---

## 🎓 引用・参考文献

このシステムで実装している全ての文献は、各ルール結果に直接リンクが表示されます。

主要な参考文献:
1. Veerbeek et al. (2011) - EPOS model. *Neurorehabilitation and Neural Repair*.
2. Smith et al. (2017) - TWIST algorithm. *Neurorehabilitation and Neural Repair*.
3. Jenkin et al. (2021) - BBS cutoff. *Physiotherapy Canada*.
4. Ikeda & Minamimura (2025) - NIHSS sex-specific cutoff. *Physical Therapy Research*.
5. Perry et al. (1995) - Gait speed classification. (Validation studies referenced)

---

## 🛠️ カスタマイズ方法

### ルールの追加・修正
`js/rules.js` を編集して新しいルールを追加できます:

```javascript
newRule: {
    name: "新ルール名",
    source: "著者 年 雑誌",
    sourceUrl: "https://...",
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
            // ...
        };
    }
}
```

### スタイル変更
`css/style.css` の CSS変数を編集:

```css
:root {
    --primary-color: #2563eb;  /* メインカラー */
    --secondary-color: #10b981;  /* 成功カラー */
    /* ... */
}
```

---

## 📝 開発ロードマップ

### Phase 1: プロトタイプ実装（✅ 完了）
- 5つの主要ルールの実装
- 文献コンセンサス分析
- レスポンシブUI

### Phase 2: 変数補強とルール追加（予定）
- Fugl-Meyer下肢スコア
- 国内文献のカットオフ値
- 重み付きスコアリングエンジン

### Phase 3: UI/UX改善と臨床検証（予定）
- PDF出力・印刷機能
- 予測履歴の保存（LocalStorage/DB）
- 他職種向けインターフェース

### Phase 4: 拡張・論文化（予定）
- 機械学習モデルとの比較検証
- 取得データを機械学習モデルと連携
- 院内勉強会・学術発表への展開

---

## ⚠️ 免責事項

このツールは**臨床判断の補助**を目的としており、最終的な診断・治療方針の決定は医療従事者が行ってください。

本システムの予測結果は文献ベースのカットオフ値に基づくものであり、個々の患者の状況により異なる可能性があります。

---

## 📧 問い合わせ・フィードバック

**開発者:** まさむ（理学療法士 / エンジニア）

フィードバック・要望・バグ報告は以下にお願いします:
- プロジェクト管理ツール経由
- チーム内共有チャンネル

---

## 📄 ライセンス

このプロジェクトは教育・研究目的で開発されています。
臨床利用時は、所属施設の倫理規定・個人情報保護規定を遵守してください。

---

**作成日:** 2026年3月2日  
**最終更新:** 2026年3月2日  
**バージョン:** 1.0.0 - デモ版
