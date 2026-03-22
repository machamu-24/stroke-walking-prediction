/**
 * ルール定義
 * 各ルールは文献ベースの評価ロジックと根拠を含む
 */

const RULES = {
    /**
     * EPOS モデル（発症72時間以内）
     * 出典: Veerbeek et al. (2011) Neurorehabilitation and Neural Repair
     */
    epos: {
        name: "EPOSモデル",
        source: "Veerbeek et al. (2011) Neurorehabilitation and Neural Repair",
        sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/21186329/",
        evidenceLevel: "Systematic Review",
        badge: "badge-sr",
        accuracy: 0.92,
        sensitivity: 0.96,
        specificity: 0.75,
        
        // 適用条件: 発症3日以内
        applyWhen: (inputs) => {
            return inputs.days_post_stroke <= 3;
        },
        
        // 評価ロジック
        evaluate(inputs) {
            const sittingBalance = inputs.sitting_balance_30s;
            const mi = inputs.motricity_index_lower;
            
            // 両条件クリア → 98% / どちらか欠損 → 23%
            const bothConditions = sittingBalance && mi >= 25;
            const probability = bothConditions ? 0.98 : 0.23;
            
            return {
                prediction: bothConditions 
                    ? "6ヶ月後：歩行自立の可能性が非常に高い（98%）" 
                    : "6ヶ月後：歩行自立は不確実（低確率23%）",
                probability: probability,
                note: `座位保持30秒: ${sittingBalance ? '可能' : '不可'} / MI下肢: ${mi}点`,
                details: [
                    `座位バランス保持（30秒）: ${sittingBalance ? '✓ 可能' : '✗ 不可'}`,
                    `Motricity Index 下肢: ${mi}点 (閾値: 25点)`,
                    `予測確率: ${(probability * 100).toFixed(0)}%`,
                    `精度: Accuracy ${(this.accuracy * 100).toFixed(0)}%, 感度 ${(this.sensitivity * 100).toFixed(0)}%, 特異度 ${(this.specificity * 100).toFixed(0)}%`
                ],
                isPositive: bothConditions
            };
        }
    },

    /**
     * TWIST アルゴリズム（発症1週間時点）
     * 出典: Smith et al. (2017) Neurorehabilitation and Neural Repair
     */
    twist: {
        name: "TWISTアルゴリズム",
        source: "Smith et al. (2017) Neurorehabilitation and Neural Repair",
        sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/29090654/",
        evidenceLevel: "Cohort Study",
        badge: "badge-cohort",
        accuracy: 0.91,
        
        // 適用条件: 発症7日以内
        applyWhen: (inputs) => {
            return inputs.days_post_stroke <= 7;
        },
        
        evaluate(inputs) {
            const tct = inputs.tct_score;
            const independent = tct > 40;
            
            return {
                prediction: independent 
                    ? "6週間以内：歩行自立の可能性が高い" 
                    : "6週間以内：歩行自立は難しい可能性（TCT≤40）",
                probability: null,
                note: `TCTスコア: ${tct}点（閾値: 40点）`,
                details: [
                    `Trunk Control Test (TCT): ${tct}点`,
                    `カットオフ値: 40点`,
                    `判定: ${independent ? 'TCT > 40 → 6週以内に歩行自立' : 'TCT ≤ 40 → 6週以内の歩行自立は困難'}`,
                    `予測精度: ${(this.accuracy * 100).toFixed(0)}%`
                ],
                isPositive: independent
            };
        }
    },

    /**
     * BBS カットオフ（回復期入院時）
     * 出典: Jenkin et al. (2021) Physiotherapy Canada
     */
    bbs: {
        name: "BBSカットオフ（退院時歩行自立）",
        source: "Jenkin et al. (2021) Physiotherapy Canada",
        sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8370698/",
        evidenceLevel: "Cohort Study",
        badge: "badge-cohort",
        auc: 0.81,
        sensitivity: 0.73,
        specificity: 0.89,
        
        // 常時適用
        applyWhen: (inputs) => {
            return inputs.bbs_score !== null && inputs.bbs_score !== undefined;
        },
        
        evaluate(inputs) {
            const bbs = inputs.bbs_score;
            const independent = bbs >= 14;
            
            return {
                prediction: independent 
                    ? "退院時：歩行自立の可能性が高い（BBS≥14）" 
                    : "退院時：歩行介助が必要な可能性（BBS<14）",
                probability: null,
                note: `BBSスコア: ${bbs}点（閾値: 14点）`,
                details: [
                    `Berg Balance Scale (BBS): ${bbs}点`,
                    `カットオフ値: 14点`,
                    `判定: ${independent ? 'BBS ≥ 14 → 退院時歩行自立の可能性' : 'BBS < 14 → 退院時歩行介助が必要'}`,
                    `AUC: ${this.auc}, 感度: ${(this.sensitivity * 100).toFixed(0)}%, 特異度: ${(this.specificity * 100).toFixed(0)}%`
                ],
                isPositive: independent
            };
        }
    },

    /**
     * NIHSS カットオフ（性別補正）
     * 出典: Ikeda & Minamimura (2025) Physical Therapy Research
     */
    nihss: {
        name: "NIHSSカットオフ（性別補正）",
        source: "Ikeda & Minamimura (2025) Physical Therapy Research",
        sourceUrl: "https://www.jstage.jst.go.jp/article/ptr/advpub/0/advpub_25-E10354/_article/-char/en",
        evidenceLevel: "Cohort Study",
        badge: "badge-cohort",
        
        // 常時適用
        applyWhen: (inputs) => {
            return inputs.nihss !== null && inputs.nihss !== undefined;
        },
        
        evaluate(inputs) {
            const nihss = inputs.nihss;
            const sex = inputs.sex;
            
            // 性別ごとのカットオフと精度
            const threshold = sex === "男性" ? 7.5 : 5.5;
            const auc = sex === "男性" ? 0.80 : 0.86;
            const independent = nihss <= threshold;
            
            return {
                prediction: independent 
                    ? `歩行自立の可能性が高い（NIHSS≤${threshold}）` 
                    : `歩行自立は難しい可能性（NIHSS>${threshold}）`,
                probability: null,
                note: `NIHSS: ${nihss}点 / ${sex} 閾値: ${threshold}点`,
                details: [
                    `NIHSS スコア: ${nihss}点`,
                    `性別: ${sex}`,
                    `カットオフ値: ${threshold}点 (${sex}基準)`,
                    `判定: ${independent ? `NIHSS ≤ ${threshold} → 歩行自立の可能性` : `NIHSS > ${threshold} → 歩行自立困難の可能性`}`,
                    `AUC: ${auc} (${sex})`
                ],
                isPositive: independent
            };
        }
    },

    /**
     * Perry 歩行速度分類
     * 出典: Perry et al. (1995) - 検証論文経由
     */
    perry: {
        name: "Perry歩行速度分類",
        source: "Perry et al. (1995) - 速度分類の臨床的妥当性",
        sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2587153/",
        evidenceLevel: "Expert Classification",
        badge: "badge-expert",
        consensusEligible: false,
        
        // 常時適用（歩行速度がある場合）
        applyWhen: (inputs) => {
            return inputs.walk_speed_10m !== null && inputs.walk_speed_10m !== undefined;
        },
        
        evaluate(inputs) {
            const speed = inputs.walk_speed_10m;
            
            let category, prediction;
            
            if (speed >= 0.8) {
                category = "Community Ambulator";
                prediction = "Community（地域歩行自立）";
            } else if (speed >= 0.4) {
                category = "Limited Community Ambulator";
                prediction = "Limited Community（限定的地域歩行）";
            } else {
                category = "Household Ambulator";
                prediction = "Household（屋内中心・歩行補助が必要な可能性）";
            }
            
            return {
                prediction: prediction,
                probability: null,
                note: `10m歩行速度: ${speed} m/s`,
                displayTone: "neutral",
                details: [
                    `10m歩行速度: ${speed} m/s`,
                    `分類カテゴリ: ${category}`,
                    `参考表示: 現時点の歩行レベル分類であり、予後コンセンサスには含めません`,
                    `< 0.4 m/s: Household (家庭内歩行)`,
                    `0.4 - 0.8 m/s: Limited Community (限定的地域歩行)`,
                    `≥ 0.8 m/s: Community (地域歩行自立)`
                ],
                isPositive: null
            };
        }
    }
};
