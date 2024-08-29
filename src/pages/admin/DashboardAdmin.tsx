import { useEffect, useState } from "react";
import statsService from "../../services/statsService";
import { LoadingSpinner } from "../../components/index";
import { Column } from '@ant-design/plots';
import { Pie } from "@ant-design/charts";
import {
    mapMonthlyStatisticsToChartData,
    getMonthLabel, mapAnnualStatisticsToChartData,
} from "../../utils/handleStats";
import userService from "../../services/userService";
import typeFeesService from "../../services/typeFeesService";
import {Select} from "antd";
import {
    useHandlePermissionErrors
} from "../../utils/handlePermissionErrors";


const { Option } = Select;

const DashboardAdmin = () => {

    const [isLoading, setIsLoading] = useState(true);

    const [lastUpdatedDate, setLastUpdatedDate] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedFeeType, setSelectedFeeType] = useState(null);
    const [period, setPeriod] = useState<any>('monthly');
    const [employees, setEmployees] = useState([]);
    const [feeTypes, setFeeTypes] = useState([]);
    const [statistics, setStatistics] = useState([]);
    const [selectedYear, setSelectedYear] = useState<any>(new Date().getFullYear());

    const [totals, setTotals] = useState<any>([]);

    const { handlePermissionErrors } = useHandlePermissionErrors();

    useEffect(() => {
        fetchEmployeesAll();
        fetchFeeTypesAll();
    }, []);

    useEffect(() => {
        fetchStatistics();
    }, [selectedEmployee, selectedFeeType, period, selectedYear]);


    const fetchEmployeesAll = async () => {
        try {
            const response = await userService.getConfirmedEmployeeAll();
            setEmployees(response.confirmedUsers);
        } catch (error) {
            await handlePermissionErrors(error);
        }
    };

    const fetchFeeTypesAll = async () => {
        try {
            const response = await typeFeesService.getTypeFeesAll();
            setFeeTypes(response.typeFees);
        } catch (error) {
            console.log(error)
        }
    };

    const fetchStatistics = async () => {
        setIsLoading(true);
        try {
            console.log(period, selectedEmployee, selectedFeeType)
            const response = await statsService.getRefundStatistics(
                period || 'monthly',
                selectedEmployee || null,
                selectedFeeType || null,
                period === 'monthly' ? selectedYear : null
            );
            setStatistics(response.statistics);
            setTotals(response.totals);
            setLastUpdatedDate(new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }));
        } catch (error) {
            await handlePermissionErrors(error)
            console.error('Error fetching statistics:', error);
        } finally {
            setIsLoading(false);
        }
    };


    /*|--------------------------------------------------------------------------
    |  Configuration of column graph
    |-------------------------------------------------------------------------- */
    const columnConfig = {
        data: period === 'monthly'
            ? mapMonthlyStatisticsToChartData(statistics, getMonthLabel)
            : mapAnnualStatisticsToChartData(statistics),
        xField: period === 'monthly' ? 'month' : 'year',
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
        responsiveLayout: true,
        padding: 'auto',
        intervalPadding: 2,
        style: {
            fill: () => {
                return '#22CBCC';
            },
        },
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
    |  Configuration of pie graph
    |-------------------------------------------------------------------------- */
    const pieConfig = {
        data: [
            { type: 'En attente', TND: Number(totals.total_pending_overall) },
            { type: 'Accepté', TND: Number(totals.total_accepted_overall) },
            { type: 'Rejecté', TND: Number(totals.total_rejected_overall) },
        ],
        angleField: 'TND',
        colorField: 'type',
        radius: 1,
        interactions: [{ type: 'element-active' }],
        legend: {
            position: 'right',
        },
    };

    const handleEmployeeChange = (value:any) => {
        setSelectedEmployee(value === "" ? null : value);
    };
    const handleFeeTypeChange = (value:any) => setSelectedFeeType(value);
    const handlePeriodChange = (value:any) => setPeriod(value);

    const handleYearChange = (value:any) => {
        setSelectedYear(value);
    };

    const years = [];
    for (let year = new Date().getFullYear(); year >= new Date().getFullYear() - 10; year--) {
        years.push(year);
    }

    if (isLoading) {
        return <LoadingSpinner />;
    }


    /*|--------------------------------------------------------------------------|
    |                                 Start JSX                                  |
    |----------------------------------------------------------------------------|*/
    return (
        <div>
            <h3 className="mb-4">Tableau de bord</h3>
            <div className="text-center mb-3 d-flex flex-wrap justify-content-center gap-2">

                <Select
                    showSearch
                    placeholder="Selectionner un employé"
                    optionFilterProp="children"
                    onChange={handleEmployeeChange}
                    value={selectedEmployee || ""}
                    style={{maxWidth:"300px",width: '100%'}}
                >
                    <Option value="">Tous les employés</Option>
                    {employees && employees.map((employee:any) => (
                        <Option key={employee.id} value={employee.id}>
                            {employee.firstname} {employee.lastname} - {employee.cin}
                        </Option>
                    ))}
                </Select>

                <Select
                    placeholder="Selectionner un type de frais"
                    onChange={handleFeeTypeChange}
                    value={selectedFeeType}
                    style={{maxWidth:"300px",width: '100%'}}
                >
                    <Option value="">Tous les Types de frais</Option>
                    {feeTypes && feeTypes.map((feeType:any) => (
                        <Option key={feeType.id} value={feeType.id}>
                            {feeType.title}
                        </Option>
                    ))}
                </Select>

                <Select
                    defaultValue={period}
                    onChange={handlePeriodChange}
                    style={{maxWidth:"300px",width: '100%'}}
                >
                    <Option value="annual">Totale</Option>
                    <Option value="monthly">Annuelle / mensuelle</Option>
                </Select>

                {period === 'monthly' && (
                    <div className="text-center mb-3">
                        <Select
                            defaultValue={selectedYear}
                            onChange={handleYearChange}
                            style={{maxWidth:"300px",width: '100%'}}
                        >
                            {years.map(year => (
                                <Option key={year} value={year}>
                                    {year}
                                </Option>
                            ))}
                        </Select>
                    </div>
                )}
            </div>

            <div className="row">
                <div className="col-12 col-md-4 mb-3">
                    <div className="d-flex justify-content-between align-items-end bg-white p-4 rounded-3">
                        <div>
                            <p>Total accepté</p>
                            <h4 className="mb-0">{totals.total_accepted_overall} TND</h4>
                        </div>
                        <div className="d-flex flex-column align-items-end">
                            <h6>{}%</h6>
                            <p className="mb-0">{lastUpdatedDate}</p>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-4 mb-3">
                    <div className="d-flex justify-content-between align-items-end bg-white p-4 rounded-3">
                        <div>
                            <p>Total rejeté</p>
                            <h4 className="mb-0">{totals.total_rejected_overall} TND</h4>
                        </div>
                        <div className="d-flex flex-column align-items-end">
                            <h6>{}%</h6>
                            <p className="mb-0">{lastUpdatedDate}</p>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-4 mb-3">
                    <div className="d-flex justify-content-between align-items-end bg-white p-4 rounded-3">
                        <div>
                            <p>Total en attente</p>
                            <h4 className="mb-0">{totals.total_pending_overall} TND</h4>
                        </div>
                        <div className="d-flex flex-column align-items-end">
                            <h6>{}%</h6>
                            <p className="mb-0">{lastUpdatedDate}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <h3 className="mb-4">Statistiques</h3>
                <div className="row">
                    <div className="col-12 col-md-6">
                        <div className="bg-white p-5 rounded-3 h-100">
                            <Column {...columnConfig} />
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="bg-white p-5 rounded-3 h-100">
                            <Pie {...pieConfig} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardAdmin;