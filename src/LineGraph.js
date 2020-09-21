import React, { useState } from 'react'
import { Line } from 'react-chartjs-2'
import { useEffect } from 'react';
import { appConstants } from './Constants';
import numeral from 'numeral';

const options = {
    legend: {
        display: false,
    },
    elements: {
        point: {
            radius: 0,
        },
    },
    maintainAspectRatio: false,
    tooltips: {
        mode: "index",
        intersect: false,
        callbacks: {
            label: function (tooltipItem, data) {
                return numeral(tooltipItem.value).format("+0,0");
            },
        },
    },
    scales: {
        xAxes: [
            {
                type: "time",
                time: {
                    format: "MM/DD/YY",
                    tooltipFormat: "ll",
                }
            }
        ],
        yAxes: [
            {
                gridLines: {
                    display: false,
                },
                ticks: {
                    callback: function(value, index, values) {
                        return numeral(value).format("0a");
                    },
                },
            },
        ],
    },
}

// Consolidate the data to format for the chart
const buildChartData = (data, casesType = 'cases') => {
    const chartData = [];
    let lastDataPoint;

    for (let date in data.cases) {
        if (lastDataPoint) {
            let newDataPoint = {
                x: date,
                y: data[casesType][date] - lastDataPoint
            }
            chartData.push(newDataPoint);
        }

        lastDataPoint = data[casesType][date];
    }

    return chartData;
}

function LineGraph({ casesType = 'cases', ...props }) {
    const [data, setData] = useState({});
    const [color, setColor] = useState("rgba(204, 16, 52, 0.5)");
    const [borderColor, setBorderColor] = useState("#CC1034");

    // Fetch data from the API for the last 120 days
    useEffect(() => {
        const fetchData = async () => {
            await fetch(`${appConstants.DISEASE_SH_URL}/historical/all?lastdays=120`)
                .then(response => response.json())
                .then(data => {
                    let chartData = buildChartData(data, casesType);
                    setData(chartData);
                });

            if (casesType === 'cases') {
                setBorderColor(props.color.cases.hex);
                setColor(props.color.cases.rgba);
            } else if (casesType === 'recovered') {
                setBorderColor(props.color.recovered.hex);
                setColor(props.color.recovered.rgba);
            } else {
                setBorderColor(props.color.deaths.hex);
                setColor(props.color.deaths.rgba);
            }
        }

        fetchData();
    }, [casesType]);

    return (
        <div className={props.className}>
            {data?.length > 0 && (
                <Line data={{
                    datasets: [{
                        backgroundColor: color,
                        borderColor: borderColor,
                        data
                    }]
                }} options={options} />
            )}
        </div>
    )
}

export default LineGraph
