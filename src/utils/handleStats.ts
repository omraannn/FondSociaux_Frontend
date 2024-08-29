/*|--------------------------------------------------------------------------
|  Calculate Total [accepted - pending - rejected] demands amount & %
|-------------------------------------------------------------------------- */
export const calculateTotals = (stats:any) => {
    let totalAccepted = 0;
    let totalRejected = 0;
    let totalPending = 0;
    stats.forEach((stat:any) => {
        totalAccepted += parseFloat(stat.total_accepted_amount);
        totalRejected += parseFloat(stat.total_rejected_amount);
        totalPending += parseFloat(stat.total_pending_amount);
    });
    const totalAmount = totalAccepted + totalRejected + totalPending;
    if (totalAmount > 0) {
        const percentageAccepted = (totalAccepted / totalAmount) * 100;
        const percentageRejected = (totalRejected / totalAmount) * 100;
        const percentagePending = (totalPending / totalAmount) * 100;
        return {
            totalAccepted: totalAccepted.toFixed(2),
            totalRejected: totalRejected.toFixed(2),
            totalPending: totalPending.toFixed(2),
            percentageAccepted: percentageAccepted.toFixed(2),
            percentageRejected: percentageRejected.toFixed(2),
            percentagePending: percentagePending.toFixed(2),
        };
    } else {
        return {
            totalAccepted: 0,
            totalRejected: 0,
            totalPending: 0,
            percentageAccepted: 0,
            percentageRejected: 0,
            percentagePending: 0,
        };
    }
};


/*|--------------------------------------------------------------------------
|  Replace numbers by months label
|-------------------------------------------------------------------------- */
export const mapMonthlyStatisticsToChartData = (monthlyStatistics:any, getMonthLabel:any) => {
    return monthlyStatistics.map((stat:any) => ({
        month: getMonthLabel(stat.month),
        Montant_total_accepté: parseFloat(stat.total_accepted_amount),
        total_rejected_amount: parseFloat(stat.total_rejected_amount),
        total_pending_amount: parseFloat(stat.total_pending_amount),
    }));
};
export const getMonthLabel = (monthNumber:any) => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    return months[monthNumber - 1];
};


export const mapAnnualStatisticsToChartData = (statistics:any) => {
    if (!Array.isArray(statistics)) {
        return [];
    }
    return statistics.map(stat => ({
        year: stat.year,
        Montant_total_accepté: parseFloat(stat.total_accepted_amount),
        total_rejected_amount: parseFloat(stat.total_rejected_amount),
        total_pending_amount: parseFloat(stat.total_pending_amount),
    }));
};