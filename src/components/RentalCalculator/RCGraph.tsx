import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { IRentalCalculatorPageData } from '../../interfaces';
import './RCGraph.css';

// Register the necessary components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const data = {
    labels: ['January', 'February', 'March', 'April', 'May'],
    datasets: [
        {
            label: 'Cash Flow',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
        },
    ],
};

export const RCGraph: React.FC<IRentalCalculatorPageData> = (props: IRentalCalculatorPageData) => {
    return (
        <section className='rc-graph'>
          <div className='graph-container'>
            <h2>Graph</h2>
          </div>
        </section>
    );
};
