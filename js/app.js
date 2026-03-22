/**
 * UIロジック・イベントハンドラー
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('prediction-form');
    const resetBtn = document.getElementById('reset-btn');
    const resultsSection = document.getElementById('results-section');
    const exportBtn = document.getElementById('export-btn');
    const statsBtn = document.getElementById('stats-btn');
    const daysPostStrokeInput = document.getElementById('days_post_stroke');
    const timingAlert = document.getElementById('timing-alert');
    
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
        updateTimingAlert();
        refreshStats();
    });

    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            predictionStorage.downloadCSV();
            refreshStats();
        });
    }

    if (statsBtn) {
        statsBtn.addEventListener('click', function() {
            refreshStats();
        });
    }

    if (daysPostStrokeInput) {
        daysPostStrokeInput.addEventListener('input', updateTimingAlert);
        daysPostStrokeInput.addEventListener('change', updateTimingAlert);
    }
    
    /**
     * フォームからデータを収集
     */
    function collectFormData() {
        return {
            // 基本情報
            age: getNumericValue('age'),
            sex: document.getElementById('sex').value,
            days_post_stroke: getNumericValue('days_post_stroke'),
            stroke_type: document.getElementById('stroke_type').value,
            
            // 神経学的評価
            nihss: getNumericValue('nihss'),
            spatial_neglect: document.getElementById('spatial_neglect').checked,
            
            // 身体機能評価
            tct_score: getNumericValue('tct_score'),
            sitting_balance_30s: document.getElementById('sitting_balance_30s').checked,
            motricity_index_lower: getNumericValue('motricity_index_lower'),
            bbs_score: getNumericValue('bbs_score'),
            walk_speed_10m: getNumericValue('walk_speed_10m'),
            
            // 認知機能・社会背景
            mmse_score: getNumericValue('mmse_score'),
            caregiver_available: document.getElementById('caregiver_available').checked,
            diabetes: document.getElementById('diabetes').checked
        };
    }

    /**
     * 数値入力を取得
     * 0 は有効値として保持し、空文字のみ null 扱いにする
     */
    function getNumericValue(id) {
        const value = document.getElementById(id).value;
        if (value === '') {
            return null;
        }

        const parsedValue = parseFloat(value);
        return Number.isNaN(parsedValue) ? null : parsedValue;
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

        // 保存済みデータ統計を更新
        refreshStats();
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
            const predictionClass = result.displayTone || (result.isPositive ? 'positive' : 'negative');
            const icon = predictionClass === 'positive'
                ? 'fa-check-circle'
                : predictionClass === 'negative'
                    ? 'fa-exclamation-circle'
                    : 'fa-route';
            
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
     * 保存済みデータ統計を画面に反映
     */
    function refreshStats() {
        const stats = predictionStorage.getStatistics();

        setText('stats-total', stats.total);
        setText('stats-with-outcome', stats.with_outcome);
        setText('stats-pending-outcome', stats.pending_outcome);
        setText('stats-accuracy', stats.accuracy !== null
            ? (stats.accuracy * 100).toFixed(1) + '%'
            : '未計算'
        );

        const note = stats.date_range.last
            ? `最終保存: ${formatTimestamp(stats.date_range.last)} / ブラウザ内の LocalStorage に保存されます。`
            : 'ブラウザ内の LocalStorage に保存されます。';
        setText('stats-note', note);

        return stats;
    }

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = String(value);
        }
    }

    function formatTimestamp(timestamp) {
        return new Date(timestamp).toLocaleString('ja-JP');
    }

    function updateTimingAlert() {
        if (!timingAlert) {
            return;
        }

        const days = getNumericValue('days_post_stroke');

        if (days === null || days < 0) {
            timingAlert.hidden = true;
            timingAlert.innerHTML = '';
            return;
        }

        const eposActive = days <= 3;
        const twistActive = days <= 7;
        let summary;

        if (days <= 3) {
            summary = 'EPOS と TWIST の両方が適用範囲です。';
        } else if (days <= 7) {
            summary = 'TWIST は適用範囲内ですが、EPOS は適用外です。';
        } else {
            summary = 'EPOS と TWIST は適用外です。時期依存ではないルールを中心に解釈してください。';
        }

        timingAlert.hidden = false;
        timingAlert.innerHTML = `
            <div class="timing-alert-title">
                <i class="fas fa-clock"></i> 時期依存ルールの適用状況
            </div>
            <div class="timing-alert-summary">
                発症 ${days} 日: ${summary}
            </div>
            <div class="timing-alert-list">
                <div class="timing-alert-item">
                    <div>
                        <strong>EPOSモデル</strong><br>
                        <span>発症3日以内のみ適用</span>
                    </div>
                    <span class="timing-alert-status ${eposActive ? 'active' : 'inactive'}">
                        ${eposActive ? '適用可能' : '適用外'}
                    </span>
                </div>
                <div class="timing-alert-item">
                    <div>
                        <strong>TWISTアルゴリズム</strong><br>
                        <span>発症7日以内のみ適用</span>
                    </div>
                    <span class="timing-alert-status ${twistActive ? 'active' : 'inactive'}">
                        ${twistActive ? '適用可能' : '適用外'}
                    </span>
                </div>
            </div>
        `;
    }
    
    /**
     * 初期状態では結果セクションを非表示
     */
    resultsSection.style.display = 'none';
    window.refreshPredictionStats = refreshStats;
    updateTimingAlert();
    refreshStats();
});
