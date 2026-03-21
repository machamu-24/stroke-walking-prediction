/**
 * UIロジック・イベントハンドラー
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('prediction-form');
    const resetBtn = document.getElementById('reset-btn');
    const resultsSection = document.getElementById('results-section');
    
    /**
     * フォーム送信イベント
     */
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 入力データ取得
        const inputs = collectFormData();
        
        // 入力検証
        const validation = predictionEngine.validateInputs(inputs);
        if (!validation.valid) {
            displayErrors(validation.errors);
            return;
        }
        
        // 予測実行
        const prediction = predictionEngine.predictAll(inputs);
        
        // データ保存（LocalStorage）
        const savedId = predictionStorage.save({
            inputs: inputs,
            results: prediction.results,
            consensus: prediction.consensus
        });
        
        // 結果表示
        displayResults(prediction, savedId);
        
        // 結果セクションまでスクロール
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    
    /**
     * リセットボタン
     */
    resetBtn.addEventListener('click', function() {
        form.reset();
        resultsSection.style.display = 'none';
        
        // デフォルト値をリセット
        document.getElementById('age').value = 70;
        document.getElementById('sex').value = '男性';
        document.getElementById('days_post_stroke').value = 7;
        document.getElementById('nihss').value = 8;
        document.getElementById('tct_score').value = 35;
        document.getElementById('motricity_index_lower').value = 40;
        document.getElementById('bbs_score').value = 12;
        document.getElementById('walk_speed_10m').value = 0.3;
        document.getElementById('mmse_score').value = 24;
        document.getElementById('sitting_balance_30s').checked = true;
        document.getElementById('caregiver_available').checked = true;
    });
    
    /**
     * フォームからデータを収集
     */
    function collectFormData() {
        return {
            // 基本情報
            age: parseFloat(document.getElementById('age').value) || null,
            sex: document.getElementById('sex').value,
            days_post_stroke: parseFloat(document.getElementById('days_post_stroke').value) || null,
            stroke_type: document.getElementById('stroke_type').value,
            
            // 神経学的評価
            nihss: parseFloat(document.getElementById('nihss').value) || null,
            spatial_neglect: document.getElementById('spatial_neglect').checked,
            
            // 身体機能評価
            tct_score: parseFloat(document.getElementById('tct_score').value) || null,
            sitting_balance_30s: document.getElementById('sitting_balance_30s').checked,
            motricity_index_lower: parseFloat(document.getElementById('motricity_index_lower').value) || null,
            bbs_score: parseFloat(document.getElementById('bbs_score').value) || null,
            walk_speed_10m: parseFloat(document.getElementById('walk_speed_10m').value) || null,
            fma_lower: parseFloat(document.getElementById('fma_lower').value) || null,
            
            // 認知機能・社会背景
            mmse_score: parseFloat(document.getElementById('mmse_score').value) || null,
            caregiver_available: document.getElementById('caregiver_available').checked,
            diabetes: document.getElementById('diabetes').checked
        };
    }
    
    /**
     * エラー表示
     */
    function displayErrors(errors) {
        alert('入力エラー:\n\n' + errors.join('\n'));
    }
    
    /**
     * 予測結果を表示
     */
    function displayResults(prediction, savedId) {
        // 結果セクションを表示
        resultsSection.style.display = 'block';
        
        // 保存成功メッセージ
        if (savedId) {
            console.log('予測データを保存しました。ID:', savedId);
            // 統計情報を表示
            const stats = predictionStorage.getStatistics();
            console.log('累積データ数:', stats.total);
        }
        
        // コンセンサスボックスを表示
        displayConsensus(prediction.consensus);
        
        // 各ルールの結果を表示
        displayRuleResults(prediction.results);
    }
    
    /**
     * コンセンサスボックスの表示
     */
    function displayConsensus(consensus) {
        const consensusBox = document.getElementById('consensus-box');
        const scorePercent = consensus.score !== null ? (consensus.score * 100).toFixed(0) : '---';
        
        consensusBox.className = 'consensus-box ' + (consensus.cssClass || '');
        consensusBox.innerHTML = `
            <div class="consensus-title">
                <i class="fas fa-chart-pie"></i> 文献コンセンサス分析
            </div>
            <div class="consensus-score">${scorePercent}%</div>
            <div class="consensus-description">
                <strong>${consensus.tone}</strong><br>
                ${consensus.description}
            </div>
        `;
    }
    
    /**
     * 個別ルール結果の表示
     */
    function displayRuleResults(results) {
        const rulesContainer = document.getElementById('rules-container');
        
        if (results.length === 0) {
            rulesContainer.innerHTML = `
                <div class="rule-card">
                    <p>適用可能なルールがありません。発症からの日数や入力値を確認してください。</p>
                </div>
            `;
            return;
        }
        
        rulesContainer.innerHTML = results.map(result => {
            const predictionClass = result.isPositive ? 'positive' : 'negative';
            const icon = result.isPositive ? 'fa-check-circle' : 'fa-exclamation-circle';
            
            return `
                <div class="rule-card">
                    <div class="rule-header">
                        <div class="rule-title">
                            <i class="fas ${icon}"></i>
                            ${result.name}
                        </div>
                        <span class="rule-badge ${result.badge}">${result.evidenceLevel}</span>
                    </div>
                    
                    <div class="rule-prediction ${predictionClass}">
                        <i class="fas fa-arrow-right"></i>
                        ${result.prediction}
                    </div>
                    
                    <div class="rule-details">
                        ${result.details.map(detail => `
                            <div class="rule-detail-item">
                                <i class="fas fa-info-circle"></i>
                                <span>${detail}</span>
                            </div>
                        `).join('')}
                        
                        ${result.probability !== null ? `
                            <div class="rule-detail-item">
                                <i class="fas fa-percent"></i>
                                <span>予測確率: ${(result.probability * 100).toFixed(0)}%</span>
                            </div>
                        ` : ''}
                        
                        ${result.note ? `
                            <div class="rule-detail-item">
                                <i class="fas fa-sticky-note"></i>
                                <span>${result.note}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="rule-source">
                        <i class="fas fa-book-open"></i>
                        <strong>文献根拠:</strong>
                        <a href="${result.sourceUrl}" target="_blank" rel="noopener">
                            ${result.source}
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    /**
     * 初期状態では結果セクションを非表示
     */
    resultsSection.style.display = 'none';
});
