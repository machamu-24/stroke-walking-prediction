/**
 * データ保存・管理モジュール（LocalStorage版）
 * 将来的にDB版に置き換え可能な設計
 */

class PredictionStorage {
    constructor() {
        this.storageKey = 'stroke_predictions';
    }

    /**
     * 予測結果を保存
     * @param {Object} data - { inputs, results, consensus, timestamp, id }
     */
    save(data) {
        const predictions = this.getAll();
        
        // データ構造の整形
        const record = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            inputs: data.inputs,
            results: data.results,
            consensus: data.consensus,
            actual_outcome: null,  // 退院時に記録
            notes: ""
        };
        
        predictions.push(record);
        localStorage.setItem(this.storageKey, JSON.stringify(predictions));
        
        return record.id;
    }

    /**
     * 全予測履歴を取得
     */
    getAll() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * IDで特定の予測を取得
     */
    getById(id) {
        const predictions = this.getAll();
        return predictions.find(p => p.id === id);
    }

    /**
     * 実績（退院時データ）を更新
     */
    updateOutcome(id, outcome) {
        const predictions = this.getAll();
        const index = predictions.findIndex(p => p.id === id);
        
        if (index !== -1) {
            predictions[index].actual_outcome = outcome;
            predictions[index].outcome_recorded_at = new Date().toISOString();
            localStorage.setItem(this.storageKey, JSON.stringify(predictions));
            return true;
        }
        return false;
    }

    /**
     * CSVエクスポート用のデータ整形
     */
    exportToCSV() {
        const predictions = this.getAll();
        
        // ヘッダー行
        const headers = [
            'ID', '評価日時', '年齢', '性別', '発症日数', 'NIHSS', 'TCT', 'BBS', 
            '10m速度', 'MI下肢', 'MMSE', '座位30秒', '空間無視', 
            '介護者', '糖尿病', 'コンセンサス', '実績FAC', '実績記録日'
        ];
        
        // データ行
        const rows = predictions.map(p => [
            p.id,
            p.timestamp,
            p.inputs.age,
            p.inputs.sex,
            p.inputs.days_post_stroke,
            p.inputs.nihss,
            p.inputs.tct_score,
            p.inputs.bbs_score,
            p.inputs.walk_speed_10m,
            p.inputs.motricity_index_lower,
            p.inputs.mmse_score,
            p.inputs.sitting_balance_30s ? 1 : 0,
            p.inputs.spatial_neglect ? 1 : 0,
            p.inputs.caregiver_available ? 1 : 0,
            p.inputs.diabetes ? 1 : 0,
            p.consensus.score,
            p.actual_outcome?.fac_at_discharge || '',
            p.outcome_recorded_at || ''
        ]);
        
        // CSV文字列生成
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => 
                typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
            ).join(','))
        ].join('\n');
        
        return csvContent;
    }

    /**
     * CSVファイルとしてダウンロード
     */
    downloadCSV() {
        const csv = this.exportToCSV();
        const bom = '\uFEFF';  // UTF-8 BOM（Excelで文字化け防止）
        const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `stroke_predictions_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    /**
     * データ統計サマリー
     */
    getStatistics() {
        const predictions = this.getAll();
        const withOutcome = predictions.filter(p => p.actual_outcome !== null);
        
        // 文献ルールの精度計算（実績データがある場合）
        let accuracy = null;
        if (withOutcome.length > 0) {
            const correct = withOutcome.filter(p => {
                const predicted = p.consensus.score > 0.5;
                const actual = (p.actual_outcome.fac_at_discharge || 0) >= 4;
                return predicted === actual;
            }).length;
            accuracy = correct / withOutcome.length;
        }
        
        return {
            total: predictions.length,
            with_outcome: withOutcome.length,
            pending_outcome: predictions.length - withOutcome.length,
            accuracy: accuracy,
            date_range: {
                first: predictions[0]?.timestamp,
                last: predictions[predictions.length - 1]?.timestamp
            }
        };
    }

    /**
     * ID生成（UUID簡易版）
     */
    generateId() {
        return 'pred_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 全データクリア（開発用）
     */
    clearAll() {
        if (confirm('本当に全データを削除しますか？この操作は取り消せません。')) {
            localStorage.removeItem(this.storageKey);
            return true;
        }
        return false;
    }
}

// グローバルインスタンス
const predictionStorage = new PredictionStorage();
