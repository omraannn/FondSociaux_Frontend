import { useEffect, useState } from 'react';
import { Column, Pie } from '@ant-design/charts';
import statsService from '../../services/statsService';
import { LoadingSpinner } from '../../components/index.js';
import { calculateTotals, getMonthLabel, mapMonthlyStatisticsToChartData } from '../../utils/handleStats';
import { Select } from 'antd';
import {useHandlePermissionErrors} from "../../utils/handlePermissionErrors";

const DashboardEmployee = () => {
    const [isLoading, setIsLoading] = useState(true);

    const [monthlyStatistics, setMonthlyStatistics] = useState([]);
    const [totalAccepted, setTotalAccepted] = useState();
    const [totalRejected, setTotalRejected] = useState();
    const [totalPending, setTotalPending] = useState();

    const [percentageAccepted, setPercentageAccepted] = useState(0);
    const [percentageRejected, setPercentageRejected] = useState(0);
    const [percentagePending, setPercentagePending] = useState(0);

    const [lastUpdatedDate, setLastUpdatedDate] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());


    const { handlePermissionErrors } = useHandlePermissionErrors();


    useEffect(() => {
        fetchMonthlyStatistics(selectedYear);
    }, [selectedYear]);


    const fetchMonthlyStatistics = async (year:any) => {
        try {
            setIsLoading(true);
            const response = await statsService.getMonthlyRefundStatsAuth(year);
            setMonthlyStatistics(response.monthly_statistics);
            const totals:any = calculateTotals(response.monthly_statistics);
            setTotalAccepted(totals.totalAccepted);
            setTotalRejected(totals.totalRejected);
            setTotalPending(totals.totalPending);
            setPercentageAccepted(totals.percentageAccepted);
            setPercentageRejected(totals.percentageRejected);
            setPercentagePending(totals.percentagePending);
            setLastUpdatedDate(new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }));
        } catch (error) {
            await handlePermissionErrors(error);
            console.error('Erreur lors du chargement des statistiques mensuelles :', error);
        } finally {
            setIsLoading(false);
        }
    };


    /*|--------------------------------------------------------------------------
    |  Configuration of column graph
    |-------------------------------------------------------------------------- */
    const columnConfig = {
        data: mapMonthlyStatisticsToChartData(monthlyStatistics, getMonthLabel),
        xField: 'month',
        yField: 'Montant_total_accepté',
        xAxis: {
            label: {
                autoHide: true,
                autoRotate: true,
            },
        },
        yAxis: {
            label: {
                formatter: (v:any) => `${v} TND`,
            },
        },
        style: {
            fill: () => '#22CBCC',
        },
        responsiveLayout: true,
        padding: 'auto',
        intervalPadding: 2,
        label: {
            text: (originData:any) => {
                const val = parseFloat(originData.value);
                if (val < 0.05) {
                    return (val * 100).toFixed(1) + '%';
                }
                return '';
            },
            offset: 10,
        },
        legend: false,
    };


    /*|--------------------------------------------------------------------------
    |  Configuration of PIE graph
    |-------------------------------------------------------------------------- */
    const pieConfig = {
        data: [
            { type: 'En attente', TND: Number(totalPending) },
            { type: 'Accepté', TND: Number(totalAccepted) },
            { type: 'Rejecté', TND: Number(totalRejected) },
        ],
        angleField: 'TND',
        colorField: 'type',
        radius: 1,
        interactions: [{ type: 'element-active' }],
        legend: {
            position: 'right',
        },
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }


    /*|--------------------------------------------------------------------------|
    |                                 Start JSX                                  |
    |----------------------------------------------------------------------------|*/
    return (
        <>
            <div>
                <h3 className="mb-4">Tableau de bord</h3>
                <Select
                    className="mb-3"
                    value={selectedYear}
                    onChange={setSelectedYear}
                    style={{ width: 120 }}
                >
                    {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return <Select.Option key={year} value={year}>{year}</Select.Option>;
                    })}
                </Select>
                <div className="row">
                    <div className="col-12 col-md-4 mb-3">
                        <div className="d-flex justify-content-between align-items-end bg-white p-4 rounded-3">
                            <div>
                                <p>Total accepté</p>
                                <h4 className="mb-0">{totalAccepted} TND</h4>
                            </div>
                            <div className="d-flex flex-column align-items-end">
                                <h6>{percentageAccepted}%</h6>
                                <p className="mb-0">{lastUpdatedDate}</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-md-4 mb-3">
                        <div className="d-flex justify-content-between align-items-end bg-white p-4 rounded-3">
                            <div>
                                <p>Total rejeté</p>
                                <h4 className="mb-0">{totalRejected} TND</h4>
                            </div>
                            <div className="d-flex flex-column align-items-end">
                                <h6>{percentageRejected}%</h6>
                                <p className="mb-0">{lastUpdatedDate}</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-md-4 mb-3">
                        <div className="d-flex justify-content-between align-items-end bg-white p-4 rounded-3">
                            <div>
                                <p>Total en attente</p>
                                <h4 className="mb-0">{totalPending} TND</h4>
                            </div>
                            <div className="d-flex flex-column align-items-end">
                                <h6>{percentagePending}%</h6>
                                <p className="mb-0">{lastUpdatedDate}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-4">
                    <h3 className="mb-4">Statistiques</h3>
                    <div className="row">
                        <div className="col-12 col-md-6">
                            <div className="bg-white p-4 rounded-3">
                                <Column {...columnConfig} />
                            </div>
                        </div>
                        <div className="col-12 col-md-6">
                            <div className="bg-white p-4 rounded-3">
                                <Pie {...pieConfig} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardEmployee;