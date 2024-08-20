import React, { useState } from 'react';
import './SensitivityTable.css';
import { IRentalCalculatorPageProps } from '../../interfaces';
import {
    CalculationUtils,
    getInterestRateDisplayConfig,
    getLoanTermDisplayConfig,
    getLoanToValuePercentDisplayConfig,
    getManagementFeesDisplayConfig,
    getOtherExpensesDisplayConfig,
    getPurchasePriceDisplayConfig,
    getRentalIncomeDisplayConfig,
    getVacancyDisplayConfig,
    IDataDisplayConfig,
    ValueType,
    getDisplayByValueType,
} from '@bpenwell/rei-module';
import { SelectableButton } from '../Button/SelectableButton';

const inputOptions = [
    'Rental Income',
    'Custom Expenses',
    'Vacancy',
    'Purchase Price',
    'Management Fees',
    'Loan To Value %',
    'Loan Term',
    'Interest Rate',
] as const;

const outputOptions = ['CoC ROI', '5-year annualized return'] as const;

type InputOption = typeof inputOptions[number];
type OutputOption = typeof outputOptions[number];

interface ITableEntry {
    data: number[];
    displayFormat: IDataDisplayConfig;
}

const STEPS_PER_INPUT = 10;

export const SensitivityTable: React.FC<IRentalCalculatorPageProps> = (props) => {
    const calculatorUtils = new CalculationUtils();
    const [selectedInputs, setSelectedInputs] = useState<InputOption[]>([]);
    const [selectedOutput, setSelectedOutput] = useState<OutputOption | null>(null);
    const [generatedTable, setGeneratedTable] = useState<(string | number)[][]>([]);
    const [tableData, setTableData] = useState<ITableEntry[]>([]); // Add this state

    const handleInputChange = (input: InputOption) => {
        const newSelectedInputs = selectedInputs.includes(input)
            ? selectedInputs.filter((i) => i !== input)
            : [...selectedInputs, input];
        setSelectedInputs(newSelectedInputs);
    };

    const handleOutputChange = (output: OutputOption) => {
        setSelectedOutput(selectedOutput === output ? null : output); // Allow unselecting
    };

    const generateTable = () => {
        if (selectedInputs.length !== 2 || selectedOutput === null) {
            alert('Please select exactly 2 input variables and 1 output variable.');
            return;
        }

        const tableData = formatTableInputData(selectedInputs);
        setTableData(tableData); // Update state with newTableData

        const table: (string | number)[][] = [];

        // Add the first header row with a cell spanning columns 2-10
        const headerRow: (string | number)[] = [
            '', // Top-left blank cell
            'Overall Header',
            ...Array(tableData[0].data.length).fill(''), // Empty cells for colspan
        ];
        table.push(headerRow);
        
        // Add the second header row
        const secondHeaderRow: (string | number)[] = [
            'Legend',
            ...tableData[0].data.map((val) => (
                getDisplayByValueType(val, tableData[0].displayFormat.valueType)
            )),
        ];
        table.push(secondHeaderRow);

        // Add data rows
        for (let i = 0; i < tableData[1].data.length; i++) {
            const row: (string | number)[] = [
                getDisplayByValueType(tableData[1].data[i], tableData[1].displayFormat.valueType),
                ...tableData[0].data.map(() => 0), // Placeholder for calculation
            ];
            table.push(row);
        }

        setGeneratedTable(table);
    };

    const populateTableDataByRange = (displayConfig: IDataDisplayConfig): number[] => {
        if (displayConfig.max === undefined || displayConfig.min === undefined) {
            throw new Error(`Invalid display configuration. Max and min values must be provided.`);
        }

        const stepSize = (displayConfig.max - displayConfig.min) / STEPS_PER_INPUT;
        const data: number[] = [];
        for (let i = 0; i < STEPS_PER_INPUT; i++) {
            data.push(displayConfig.min + i * stepSize);
        }
        return data;
    };

    const formatTableInputData = (selectedInputs: string[]): ITableEntry[] => {
        const formattedData: ITableEntry[] = [];
        selectedInputs.forEach((input) => {
            let data: ITableEntry;
            let displayConfig: IDataDisplayConfig;
            switch (input) {
                case 'Rental Income':
                    displayConfig = getRentalIncomeDisplayConfig(Number(props.fullLoanTermRentalReportData[0].rentalIncome.grossMonthlyIncome.toFixed(0)));
                    break;
                case 'Custom Expenses':
                    displayConfig = getOtherExpensesDisplayConfig(Number(props.fullLoanTermRentalReportData[0].expenseDetails.other.toFixed(0)));
                    break;
                case 'Vacancy':
                    displayConfig = getVacancyDisplayConfig(calculatorUtils.calculateVacancyPercentage(props.currentYearData));
                    break;
                case 'Purchase Price':
                    displayConfig = getPurchasePriceDisplayConfig(Number(props.fullLoanTermRentalReportData[0].purchaseDetails.purchasePrice.toFixed(0)));
                    break;
                case 'Management Fees':
                    displayConfig = getManagementFeesDisplayConfig(Number(props.fullLoanTermRentalReportData[0].expenseDetails.managementFees.toFixed(0)));
                    break;
                case 'Loan To Value %':
                    displayConfig = getLoanToValuePercentDisplayConfig(calculatorUtils.calculateLoanPercentage(props.currentYearData));
                    break;
                case 'Loan Term':
                    displayConfig = getLoanTermDisplayConfig(props.fullLoanTermRentalReportData[0].loanDetails.loanTerm);
                    break;
                case 'Interest Rate':
                    displayConfig = getInterestRateDisplayConfig(props.fullLoanTermRentalReportData[0].loanDetails.interestRate);
                    break;
                default:
                    throw new Error(`Invalid input option: ${input}`);
            }
            data = {
                data: populateTableDataByRange(displayConfig),
                displayFormat: displayConfig,
            };
            formattedData.push(data);
        });
        return formattedData;
    };

    return (
        <div className="sensitivity-table-container">
            <h2 className="header">Sensitivity Table</h2>
            <div className="form-group">
                <label className="label bold-label">Select Input Variables:</label>
                {inputOptions.map((input) => (
                    <SelectableButton
                        key={input}
                        label={input}
                        isSelected={selectedInputs.includes(input)}
                        onClick={() => handleInputChange(input)}
                        isDisabled={selectedInputs.length >= 2 && !selectedInputs.includes(input)}
                        className="selectable-button"
                    />
                ))}
            </div>
            <div className="form-group">
                <label className="label bold-label">Select Output Variable:</label>
                {outputOptions.map((output) => (
                    <SelectableButton
                        key={output}
                        label={output}
                        isSelected={selectedOutput === output}
                        onClick={() => handleOutputChange(output)}
                        isDisabled={selectedOutput !== null && selectedOutput !== output}
                        className="selectable-button"
                    />
                ))}
            </div>
            <button className="submit-button" onClick={generateTable}>
                Generate Table
            </button>

            {generatedTable.length > 0 && (
                <div className="table-container">
                    <table className="sensitivity-table">
                        <thead>
                                <tr>
                                <th></th>
                                <th colSpan={tableData[0].data.length}>Overall Header</th>
                            </tr>
                            <tr>
                                <th>Legend</th>
                                {tableData[0].data.map((val, index) => (
                                    <th key={index}>
                                        {getDisplayByValueType(val, tableData[0].displayFormat.valueType)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {generatedTable.slice(1).map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map((cell, cellIndex) => (
                                        <td key={cellIndex} className={rowIndex === 0 || cellIndex === 0 ? 'bold-cell' : ''}>
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
