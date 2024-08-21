import React, { useState, useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { IRentalCalculatorPageProps } from '../../interfaces';
import { Slider } from '@mui/material';
import './RCCustomize.css';
import {
    CalculationUtils,
    displayAsMoney,
    IDataDisplayConfig,
    getRentalIncomeDisplayConfig,
    getOtherExpensesDisplayConfig,
    getVacancyDisplayConfig,
    getInterestRateDisplayConfig,
    getLoanTermDisplayConfig,
    getLoanToValuePercentDisplayConfig,
    getPurchasePriceDisplayConfig,
    getManagementFeesDisplayConfig,
    printObjectFields
} from '@bpenwell/rei-module';

// Register the necessary components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export const RCCustomize: React.FC<IRentalCalculatorPageProps> = (props: IRentalCalculatorPageProps) => {
    const { initialRentalReportData, currentYearData } = props;
    const calculatorUtils = new CalculationUtils();
    const [rentalIncome, setRentalIncome] = useState(Number(currentYearData.rentalIncome.grossMonthlyIncome.toFixed(0)));
    const [otherExpenses, setOtherExpenses] = useState(Number(currentYearData.expenseDetails.other.toFixed(0)));
    console.debug(`[DEBUG][RCCustomize] currentYearData vacancy=${currentYearData.expenseDetails.vacancy} vacancyPercent=${currentYearData.expenseDetails.vacancyPercent}`);
    console.debug(`[DEBUG][RCCustomize] calculatorUtils vacancy=${calculatorUtils.calculateVacancyPercentage(currentYearData)}`);
    const [vacancy, setVacancy] = useState(calculatorUtils.calculateVacancyPercentage(currentYearData) * 100);
    const [managementFees, setManagementFees] = useState(Number(currentYearData.expenseDetails.managementFees.toFixed(0)));
    const [purchasePrice, setPurchasePrice] = useState(Number(currentYearData.purchaseDetails.purchasePrice.toFixed(0)));
    const [loanToValuePercent, setLoanToValuePercent] = useState(currentYearData.loanDetails.loanToValuePercent);
    const [loanTerm, setLoanTerm] = useState(currentYearData.loanDetails.loanTerm);
    const [interestRate, setInterestRate] = useState(currentYearData.loanDetails.interestRate);

    const rentalIncomeSliderProps = useMemo<IDataDisplayConfig>(() => {
        return getRentalIncomeDisplayConfig(rentalIncome);
    }, []);
    const otherExpensesSliderProps = useMemo<IDataDisplayConfig>(() => {
        return getOtherExpensesDisplayConfig(otherExpenses);
    }, []);
    const vacancySliderProps = useMemo<IDataDisplayConfig>(() => {
        return getVacancyDisplayConfig(vacancy);
    }, []);
    const managementFeesSliderProps = useMemo<IDataDisplayConfig>(() => {
        return getManagementFeesDisplayConfig(managementFees);
    }, []);
    const purchasePriceSliderProps = useMemo<IDataDisplayConfig>(() => {
        return getPurchasePriceDisplayConfig(purchasePrice);
    }, []);
    const loanToValuePercentSliderProps = useMemo<IDataDisplayConfig>(() => {
        return getLoanToValuePercentDisplayConfig(loanToValuePercent);
    }, []);
    const loanTermSliderProps = useMemo<IDataDisplayConfig>(() => {
        return getLoanTermDisplayConfig(loanTerm);
    }, []);
    const interestRateSliderProps = useMemo<IDataDisplayConfig>(() => {
        return getInterestRateDisplayConfig(interestRate);
    }, []);
    console.debug('[DEBUG] Render RCCustomize');

    const handleRentalIncomeChange = (newValue: number) => {
        props.updateInitialData({
            ...initialRentalReportData, 
            rentalIncome: {
                ...initialRentalReportData.rentalIncome,
                grossMonthlyIncome: newValue as number
            }
        });
    };
    const handleOtherExpensesChange = (newValue: number) => {
        props.updateInitialData({
            ...initialRentalReportData, 
            expenseDetails: {
                ...initialRentalReportData.expenseDetails,
                other: newValue as number
            }
        });
    };
    const handleVacancyChange = (newValue: number) => {
        const newData = {
            ...initialRentalReportData, 
            expenseDetails: {
                ...initialRentalReportData.expenseDetails,
                vacancyPercent: newValue as number,
            }
        };
        newData.expenseDetails.vacancy = calculatorUtils.calculateVacancyAbsoluteValue(newData);
        props.updateInitialData(newData);
    };
    const handleManagementFeesChange = (newValue: number) => {
        props.updateInitialData({
            ...initialRentalReportData, 
            expenseDetails: {
                ...initialRentalReportData.expenseDetails,
                managementFees: newValue as number
            }
        });
    };
    const handlePurchasePriceChange = (newValue: number) => {
        props.updateInitialData({
            ...initialRentalReportData, 
            purchaseDetails: {
                ...initialRentalReportData.purchaseDetails,
                purchasePrice: newValue as number
            }
        });
    };
    const handleLoanPercentageChange = (newValue: number) => {
        props.updateInitialData({
            ...initialRentalReportData, 
            loanDetails: {
                ...initialRentalReportData.loanDetails,
                downPayment: newValue * initialRentalReportData.purchaseDetails.purchasePrice,
            }
        });
    };
    const handleInterestRateChange = (newValue: number) => {
        props.updateInitialData({
            ...initialRentalReportData, 
            loanDetails: {
                ...initialRentalReportData.loanDetails,
                interestRate: newValue,
            }
        });
    };
    const handleLoanTermChange = (newValue: number) => {
        props.updateInitialData({
            ...initialRentalReportData, 
            loanDetails: {
                ...initialRentalReportData.loanDetails,
                loanTerm: newValue,
            }
        });
    };

    /**
     * 
     * @param sectionTitle 
     * @param sliderLabel exact label suffix (might need to include spaces as needed)
     * @returns 
     */
    const makeSliderContainer = (sectionTitle: string, sliderLabel: string, currentSliderValue: number, dataDisplayConfig: IDataDisplayConfig, handleOnChange: React.Dispatch<React.SetStateAction<number>>, handleValueChange: (newValue: number) => void) => {
        return (
            <div className="slider-container">
                <span className="analysis-form-label">
                    <span>{sectionTitle}</span>
                    <span className="slider-value">{sliderLabel}</span>
                </span>
                <Slider
                className='custom-slider'
                aria-label="Small steps"
                value={currentSliderValue}
                getAriaValueText={(value, _) => {return sliderLabel}}
                step={dataDisplayConfig.step}
                marks
                min={dataDisplayConfig.min}
                max={dataDisplayConfig.max}
                valueLabelDisplay="auto"
                onChangeCommitted={(event, newValue) => {
                    if ((newValue as number[]).length > 1) {
                        throw Error(`Weird newValue: ${newValue}`);
                    }
                    handleValueChange(newValue as number);
                }}
                onChange={(event, newValue) => {
                    if ((newValue as number[]).length > 1) {
                        throw Error(`Weird newValue: ${newValue}`);
                    }
                    handleOnChange(newValue as number)
                }}
                />
            </div>
        );
    };

    return (
        <section className='rc-graph'>
            <h2 className='rc-header'>Test Different Scenarios</h2>
            <div className='graph-box'>
                <div className="report-section">
                    <div className="section-header">
                        <h3 className="section-title">Rental income</h3>
                    </div>
                    <div className="section-body">
                        {makeSliderContainer('Rental Income: ', `${displayAsMoney(rentalIncome)}`, rentalIncome, rentalIncomeSliderProps, setRentalIncome, handleRentalIncomeChange)}
                    </div>
                </div>
                <div className="report-section">
                    <div className="section-header">
                        <h3 className="section-title">Expenses</h3>
                    </div>
                    <div className="section-body">
                        {makeSliderContainer('Custom Expenses: ', `${displayAsMoney(otherExpenses)}`, otherExpenses, otherExpensesSliderProps, setOtherExpenses, handleOtherExpensesChange)}
                    </div>
                    <div className="section-body">
                        {makeSliderContainer('Vacancy: ', `${vacancy}%`, vacancy, vacancySliderProps, setVacancy, handleVacancyChange)}
                    </div>
                    <div className="section-body">
                        {makeSliderContainer('Management Fees: ', `${managementFees}%`, managementFees, managementFeesSliderProps, setManagementFees, handleManagementFeesChange)}
                    </div>
                </div>
                <div className="report-section">
                    <div className="section-header">
                        <h3 className="section-title">Loan details</h3>
                    </div>
                    <div className="section-body">
                        {makeSliderContainer('Purchase price: ', `${displayAsMoney(purchasePrice)}`, purchasePrice, purchasePriceSliderProps, setPurchasePrice, handlePurchasePriceChange)}
                    </div>
                    <div className="section-body">
                        {makeSliderContainer('Loan To Value (LTV): ', `${displayAsMoney(loanToValuePercent * purchasePrice)}`, loanToValuePercent, loanToValuePercentSliderProps, setLoanToValuePercent, handleLoanPercentageChange)}
                    </div>
                    <div className="section-body">
                        {makeSliderContainer('Loan term: ', `${loanTerm} years`, loanTerm, loanTermSliderProps, setLoanTerm, handleLoanTermChange)}
                    </div>
                    <div className="section-body">
                        {makeSliderContainer('Interest rate: ', `${interestRate}%`, interestRate, interestRateSliderProps, setInterestRate, handleInterestRateChange)}
                    </div>
                </div>
            </div>
        </section>
    );
};
