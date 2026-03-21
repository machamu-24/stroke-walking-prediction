/**
 * ルールエンジン
 * 入力データに基づいて各ルールを評価し、統合結果を返す
 */

class StrokeWalkingPredictionEngine {
    constructor() {
        this.rules = RULES;
    }

    /**
     * 入力データから全ルールの予測を実行
     * @param {Object} inputs - 患者入力データ
     * @returns {Object} - 予測結果
     */
    predictAll(inputs) {
        const results = [];
        
        // 各ルールを評価
        for (const [ruleId, rule] of Object.entries(this.rules)) {
            // 適用条件を満たすかチェック
            if (rule.applyWhen(inputs)) {
                const evaluation = rule.evaluate(inputs);
                results.push({
                    id: ruleId,
                    name: rule.name,
                    source: rule.source,
                    sourceUrl: rule.sourceUrl,
                    evidenceLevel: rule.evidenceLevel,
                    badge: rule.badge,
                    ...evaluation
                });
            }
        }
        
        // コンセンサス分析
        const consensus = this.calculateConsensus(results);
        
        return {
            results: results,
            consensus: consensus
        };
    }

    /**
     * 複数ルールの結果から統合スコアを算出
     * @param {Array} results - 各ルールの評価結果
     * @returns {Object} - コンセンサス情報
     */
    calculateConsensus(results) {
        if (results.length === 0) {
            return {
                score: null,
                tone: "評価不可",
                description: "適用可能なルールがありません。入力データを確認してください。"
            };
        }

        // 自立寄り（positive）のルール数をカウント
        const positiveCount = results.filter(r => r.isPositive === true).length;
        const totalCount = results.length;
        
        // コンセンサススコア（0-1）
        const score = totalCount > 0 ? positiveCount / totalCount : 0;
        
        // トーンの判定
        let tone, description, cssClass;
        
        if (score >= 0.7) {
            tone = "自立寄りのコンセンサス";
            description = `評価した${totalCount}文献のうち、${positiveCount}文献が歩行自立を示唆しています。総合的に歩行自立の可能性が高いと考えられます。`;
            cssClass = "";
        } else if (score >= 0.4) {
            tone = "拮抗（文献の示唆が割れている）";
            description = `評価した${totalCount}文献のうち、${positiveCount}文献が歩行自立を示唆しています。文献により予測が分かれており、個別評価が必要です。`;
            cssClass = "neutral";
        } else {
            tone = "困難寄りのコンセンサス";
            description = `評価した${totalCount}文献のうち、${positiveCount}文献のみが歩行自立を示唆しています。歩行自立には課題がある可能性が高いと考えられます。`;
            cssClass = "negative";
        }
        
        return {
            score: score,
            tone: tone,
            description: description,
            cssClass: cssClass,
            totalCount: totalCount,
            positiveCount: positiveCount
        };
    }

    /**
     * 入力データの検証
     * @param {Object} inputs - 患者入力データ
     * @returns {Object} - { valid: boolean, errors: Array }
     */
    validateInputs(inputs) {
        const errors = [];
        
        // 必須項目チェック
        if (inputs.age === null || inputs.age === undefined || inputs.age < 0) {
            errors.push("年齢を正しく入力してください。");
        }
        
        if (!inputs.sex) {
            errors.push("性別を選択してください。");
        }
        
        if (inputs.days_post_stroke === null || inputs.days_post_stroke === undefined || inputs.days_post_stroke < 0) {
            errors.push("発症からの日数を正しく入力してください。");
        }
        
        // 範囲チェック
        if (inputs.nihss !== null && inputs.nihss !== undefined) {
            if (inputs.nihss < 0 || inputs.nihss > 42) {
                errors.push("NIHSSスコアは0-42の範囲で入力してください。");
            }
        }
        
        if (inputs.tct_score !== null && inputs.tct_score !== undefined) {
            if (inputs.tct_score < 0 || inputs.tct_score > 100) {
                errors.push("TCTスコアは0-100の範囲で入力してください。");
            }
        }
        
        if (inputs.motricity_index_lower !== null && inputs.motricity_index_lower !== undefined) {
            if (inputs.motricity_index_lower < 0 || inputs.motricity_index_lower > 100) {
                errors.push("Motricity Index下肢スコアは0-100の範囲で入力してください。");
            }
        }
        
        if (inputs.bbs_score !== null && inputs.bbs_score !== undefined) {
            if (inputs.bbs_score < 0 || inputs.bbs_score > 56) {
                errors.push("BBSスコアは0-56の範囲で入力してください。");
            }
        }
        
        if (inputs.walk_speed_10m !== null && inputs.walk_speed_10m !== undefined) {
            if (inputs.walk_speed_10m < 0 || inputs.walk_speed_10m > 3) {
                errors.push("10m歩行速度は0-3 m/sの範囲で入力してください。");
            }
        }
        
        if (inputs.mmse_score !== null && inputs.mmse_score !== undefined) {
            if (inputs.mmse_score < 0 || inputs.mmse_score > 30) {
                errors.push("MMSEスコアは0-30の範囲で入力してください。");
            }
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
}

// グローバルエンジンインスタンス
const predictionEngine = new StrokeWalkingPredictionEngine();
