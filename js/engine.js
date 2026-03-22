/**
 * ルールエンジン
 * 入力データに基づいて各ルールを評価し、統合結果を返す
 */

class StrokeWalkingPredictionEngine {
    constructor() {
        this.rules = RULES;
        this.inputCatalog = {
            nihss: { label: "NIHSSスコア", section: "神経学的評価" },
            tct_score: { label: "TCTスコア", section: "身体機能評価" },
            sitting_balance_30s: { label: "座位保持30秒", section: "身体機能評価" },
            motricity_index_lower: { label: "Motricity Index下肢", section: "身体機能評価" },
            bbs_score: { label: "BBSスコア", section: "身体機能評価" },
            walk_speed_10m: { label: "10m歩行速度", section: "身体機能評価" },
            mmse_score: { label: "MMSEスコア", section: "認知機能・社会背景" },
            spatial_neglect: { label: "半側空間無視", section: "神経学的評価" }
        };
    }

    /**
     * 入力データから全ルールの予測を実行
     * @param {Object} inputs - 患者入力データ
     * @returns {Object} - 予測結果
     */
    predictAll(inputs) {
        const applicableResults = [];
        const unavailableResults = [];
        
        // 各ルールを評価
        for (const [ruleId, rule] of Object.entries(this.rules)) {
            const missingInputs = this.getMissingRequiredInputs(rule, inputs);
            const isAvailableForPatient = rule.isAvailableForPatient
                ? rule.isAvailableForPatient(inputs)
                : rule.applyWhen(inputs);

            // 適用条件を満たすかチェック
            if (isAvailableForPatient && missingInputs.length === 0) {
                const evaluation = rule.evaluate(inputs);
                applicableResults.push({
                    id: ruleId,
                    name: rule.name,
                    source: rule.source,
                    sourceUrl: rule.sourceUrl,
                    evidenceLevel: rule.evidenceLevel,
                    badge: rule.badge,
                    isApplicable: true,
                    consensusEligible: rule.consensusEligible !== false,
                    ...evaluation
                });
            } else if (!isAvailableForPatient && rule.showWhenUnavailable) {
                unavailableResults.push({
                    id: ruleId,
                    name: rule.name,
                    source: rule.source,
                    sourceUrl: rule.sourceUrl,
                    evidenceLevel: rule.evidenceLevel,
                    badge: rule.badge,
                    isApplicable: false,
                    consensusEligible: false,
                    prediction: "適用外",
                    probability: null,
                    note: `発症からの日数: ${inputs.days_post_stroke}日`,
                    details: [
                        rule.getUnavailableReason
                            ? rule.getUnavailableReason(inputs)
                            : "適用条件を満たしていません。"
                    ],
                    displayTone: "muted",
                    isPositive: null
                });
            }
        }

        const results = [...applicableResults, ...unavailableResults];
        const suggestions = this.getAssessmentSuggestions(inputs);
        
        // コンセンサス分析
        const consensus = this.calculateConsensus(applicableResults);
        
        return {
            results: results,
            consensus: consensus,
            suggestions: suggestions
        };
    }

    getAssessmentSuggestions(inputs) {
        const actionable = [];
        const blocked = [];

        for (const [ruleId, rule] of Object.entries(this.rules)) {
            const missingInputs = this.getMissingRequiredInputs(rule, inputs);
            if (missingInputs.length === 0) {
                continue;
            }

            const isAvailableForPatient = rule.isAvailableForPatient
                ? rule.isAvailableForPatient(inputs)
                : rule.applyWhen(inputs);

            const suggestion = {
                id: ruleId,
                name: rule.name,
                source: rule.source,
                sourceUrl: rule.sourceUrl,
                evidenceLevel: rule.evidenceLevel,
                badge: rule.badge,
                missingInputs: missingInputs,
                sections: this.getUniqueSections(missingInputs),
                outcome: rule.suggestionOutcome || rule.name,
                priority: rule.suggestionPriority || 99
            };

            if (isAvailableForPatient) {
                actionable.push({
                    ...suggestion,
                    message: `${missingInputs.map(input => input.label).join("、")}を追加で取得すると、${rule.suggestionOutcome || rule.name}に関する文献を活用できます。`
                });
            } else if (rule.showWhenUnavailable) {
                blocked.push({
                    ...suggestion,
                    message: rule.getUnavailableReason
                        ? rule.getUnavailableReason(inputs)
                        : "現時点では適用条件を満たしていません。"
                });
            }
        }

        const byPriority = (a, b) => {
            if (a.priority !== b.priority) {
                return a.priority - b.priority;
            }

            if (a.missingInputs.length !== b.missingInputs.length) {
                return a.missingInputs.length - b.missingInputs.length;
            }

            return a.name.localeCompare(b.name, "ja");
        };

        actionable.sort(byPriority);
        blocked.sort(byPriority);

        return {
            actionable: actionable,
            blocked: blocked
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
                description: "適用可能なルールがありません。入力データを確認してください。",
                cssClass: "neutral",
                totalCount: 0,
                positiveCount: 0,
                excludedCount: 0
            };
        }

        const consensusResults = results.filter(r => r.consensusEligible !== false);
        const excludedResults = results.filter(r => r.consensusEligible === false);
        const excludedNames = excludedResults.map(r => r.name).join("、");

        if (consensusResults.length === 0) {
            return {
                score: null,
                tone: "参考情報のみ",
                description: excludedNames
                    ? `${excludedNames}は参考表示していますが、予後コンセンサスに含めるルールがありません。`
                    : "予後コンセンサスに含めるルールがありません。",
                cssClass: "neutral",
                totalCount: 0,
                positiveCount: 0,
                excludedCount: excludedResults.length
            };
        }

        // 自立寄り（positive）のルール数をカウント
        const positiveCount = consensusResults.filter(r => r.isPositive === true).length;
        const totalCount = consensusResults.length;
        
        // コンセンサススコア（0-1）
        const score = totalCount > 0 ? positiveCount / totalCount : 0;
        
        // トーンの判定
        let tone, description, cssClass;
        
        if (score >= 0.7) {
            tone = "自立寄りのコンセンサス";
            description = `評価可能な予後ルール${totalCount}件のうち、${positiveCount}件が歩行自立を示唆しています。総合的に歩行自立の可能性が高いと考えられます。`;
            cssClass = "";
        } else if (score >= 0.4) {
            tone = "拮抗（文献の示唆が割れている）";
            description = `評価可能な予後ルール${totalCount}件のうち、${positiveCount}件が歩行自立を示唆しています。文献により予測が分かれており、個別評価が必要です。`;
            cssClass = "neutral";
        } else {
            tone = "困難寄りのコンセンサス";
            description = `評価可能な予後ルール${totalCount}件のうち、${positiveCount}件のみが歩行自立を示唆しています。歩行自立には課題がある可能性が高いと考えられます。`;
            cssClass = "negative";
        }

        if (excludedResults.length > 0) {
            description += ` なお、${excludedNames}は現時点の歩行レベル分類として参考表示し、コンセンサスには含めていません。`;
        }
        
        return {
            score: score,
            tone: tone,
            description: description,
            cssClass: cssClass,
            totalCount: totalCount,
            positiveCount: positiveCount,
            excludedCount: excludedResults.length
        };
    }

    getMissingRequiredInputs(rule, inputs) {
        const requiredInputs = rule.requiredInputs || [];

        return requiredInputs
            .filter(key => this.isMissingInputValue(inputs[key]))
            .map(key => ({
                key: key,
                label: this.inputCatalog[key]?.label || key,
                section: this.inputCatalog[key]?.section || "未分類"
            }));
    }

    getUniqueSections(inputs) {
        return [...new Set(inputs.map(input => input.section))];
    }

    isMissingInputValue(value) {
        return value === null
            || value === undefined
            || (typeof value === "string" && value.trim() === "");
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
