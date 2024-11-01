import { mean, median, standardDeviation, quantile } from 'simple-statistics';
import { Meter } from "@prisma/client";
import { NextRequest } from "next/server";
import prisma from "src/lib/prismaClient";


function getWeekOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.floor(diff / oneWeek);
}

const updateWeekOfYearStatsForMeter = async (meter: Meter) => {

    // For every meterReading, start from the earliest timestamp and go until the latest timestamp,
    // skip readings until you are at the start from the first day of the week, everytime aggregate the data for the week
    // if there is a gap, use the previous weeks data,
    // use the sum of the primary and secondary values
    // store the data in the meterWeekOfYearStatistics table
    // you want to do a fresh calculation for each meter every time, so remove the existing data for the meter
    // If you have more than 1 year of data, you can delete the data for the previous year
    await prisma.meterWeekOfYearStatistics.deleteMany({
        where: {
            meterId: meter.id
        }
    });

    const meterReadings = await prisma.meterReading.findMany({
        where: {
            meterId: meter.id
        },
        orderBy: {
            timestamp: "asc"
        }
    });
    

    let currentWeek = -1;
    let currentYear = -1;
    let weeklyValues: number[] = [];

    for (const reading of meterReadings) {
        const readingDate = new Date(reading.timestamp);
        const weekOfYear = getWeekOfYear(readingDate);
        const year = readingDate.getFullYear();

        const startOfWeek = new Date(readingDate);
        startOfWeek.setDate(readingDate.getDate() - readingDate.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        if (weekOfYear !== currentWeek || year !== currentYear) {
            if(currentWeek !== -1 && weeklyValues.length > 0) {
                const meanValue = mean(weeklyValues);
                const medianValue = median(weeklyValues);
                const stdDevValue = standardDeviation(weeklyValues);

                const existingStats = await prisma.meterWeekOfYearStatistics.findFirst({
                    where: {
                        meterId: meter.id,
                        weekOfYear: currentWeek
                    }
                });

                if (existingStats) {
                    await prisma.meterWeekOfYearStatistics.updateMany({
                        where: {
                            meterId: meter.id,
                            weekOfYear: currentWeek
                        },
                        data: {
                            mean: meanValue,
                            median: medianValue,
                            standardDeviation: stdDevValue
                        }
                    })
                } else {
                    await prisma.meterWeekOfYearStatistics.create({
                    data: {
                        meterId: meter.id,
                        weekOfYear: currentWeek,
                        mean: meanValue,
                        median: medianValue,
                        standardDeviation: stdDevValue,
                        weekStartTimestamp: startOfWeek
                        }
                    });
                }
            }

            currentWeek = weekOfYear;
            currentYear = year;
            weeklyValues = [];
        }

        weeklyValues.push(reading.primaryValue + reading.secondaryValue);

    }
    if (currentWeek !== -1 && weeklyValues.length > 0) {
        const meanValue = mean(weeklyValues);
        const medianValue = median(weeklyValues);
        const stdDevValue = standardDeviation(weeklyValues);

        const lastReadingDate = new Date(meterReadings[meterReadings.length - 1].timestamp);
        const startOfLastWeek = new Date(lastReadingDate);
        startOfLastWeek.setDate(lastReadingDate.getDate() - lastReadingDate.getDay());
        startOfLastWeek.setHours(0, 0, 0, 0);

        const existingStats = await prisma.meterWeekOfYearStatistics.findFirst({
            where: {
                meterId: meter.id,
                weekOfYear: currentWeek
            }
        });

        if (existingStats) {
            await prisma.meterWeekOfYearStatistics.updateMany({
                where: {
                    meterId: meter.id,
                    weekOfYear: currentWeek
                },
                data: {
                    mean: meanValue,
                    median: medianValue,
                    standardDeviation: stdDevValue,
                    weekStartTimestamp: startOfLastWeek
                }
            })
        } else {
            await prisma.meterWeekOfYearStatistics.create({
                data: {
                    meterId: meter.id,
                    weekOfYear: currentWeek,
                    mean: meanValue,
                    median: medianValue,
                    standardDeviation: stdDevValue,
                    weekStartTimestamp: startOfLastWeek
                }
            })
        }
    }

    

    
}

const updateIntradayStatsForMeter = async (meter: Meter) => {

    // For a meter, get the meter readings from last 3 month, 
    // for each reading, get the hour of the day
    // aggregate the data into 30 minute buckets
    // for each bucket, calculate the 95%, 90%, 80%, 70%, 50% confidence intervals
    // store the data in the meterIntradayStatistics table
    // you want to do a fresh calculation for each meter every time, so remove the existing data for the meter
    // If the data does not go back 3 months, use the data that is available
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const meterReadings = await prisma.meterReading.findMany({
        where: {
            meterId: meter.id,
            timestamp: {
                gte: threeMonthsAgo,
                lte: new Date()
            }
        },
        orderBy: {
            timestamp: "asc"
        }
    });

    const intradayBuckets: { [key: string]: number[] } = {};

    for (const reading of meterReadings) {
        const readingDate = new Date(reading.timestamp);
        const hourOfDay = readingDate.getHours();
        const minuteOfHour = readingDate.getMinutes();
        if(minuteOfHour !== 30 && minuteOfHour !== 0) {
            continue;
        }

        const bucketKey = `${hourOfDay}:${minuteOfHour}`;
        if (!intradayBuckets[bucketKey]) {
            intradayBuckets[bucketKey] = [];
        }

        intradayBuckets[bucketKey].push(reading.primaryValue + reading.secondaryValue);
    }

    for (const [bucketKey, values] of Object.entries(intradayBuckets)) {
        const meanValue = mean(values);
        const medianValue = median(values);
        const stdDevValue = standardDeviation(values);

        const quantiles = {
            95: quantile(values, 0.95),
            90: quantile(values, 0.90),
            80: quantile(values, 0.80),
            70: quantile(values, 0.70),
            50: quantile(values, 0.50),
            30: quantile(values, 0.30),
            20: quantile(values, 0.20),
            10: quantile(values, 0.10), // Added for lower quantile
            5: quantile(values, 0.05) // Added for lower quantile
        };

        const [hour, minute] = bucketKey.split(':').map(Number);
        const currentWeekOfYear = getWeekOfYear(new Date());

        const existingStats = await prisma.meterIntradayStatistics.findFirst({
            where: {    
                meterId: meter.id,
                hourOfDay: hour,
                minuteOfHour: minute
            }
        });
        
        if (existingStats) {
            await prisma.meterIntradayStatistics.updateMany({
                where: {
                    meterId: meter.id,
                    hourOfDay: hour,
                    minuteOfHour: minute
                },
                data: {
                    mean: meanValue,
                    median: medianValue,
                    standardDeviation: stdDevValue,
                    upper95: quantiles[95],
                    lower95: quantiles[5],
                    upper90: quantiles[90],
                    lower90: quantiles[10],
                    upper80: quantiles[80],
                    lower80: quantiles[20],
                    upper70: quantiles[70],
                    lower70: quantiles[30],
                    upper50: quantiles[50],
                    lower50: quantiles[50],
                    weekOfYear: currentWeekOfYear

                }
            })
        } else {
            await prisma.meterIntradayStatistics.create({
                data: {
                    meterId: meter.id,
                    hourOfDay: hour,
                    minuteOfHour: minute,
                    mean: meanValue,
                    median: medianValue,
                    standardDeviation: stdDevValue,
                    upper95: quantiles[95],
                    lower95: quantiles[5],
                    upper90: quantiles[90],
                    lower90: quantiles[10],
                    upper80: quantiles[80],
                    lower80: quantiles[20],
                    upper70: quantiles[70],
                    lower70: quantiles[30],
                    upper50: quantiles[50],
                    lower50: quantiles[50],
                    weekOfYear: currentWeekOfYear
                }
            })
        }



    }
}

    

const updateStatsForMeter = async (req: NextRequest) => {
    // Update the day of week bands for all sites/meters
    const meters = await prisma.meter.findMany();

    for(const meter of meters) {
        await updateWeekOfYearStatsForMeter(meter);
        await updateIntradayStatsForMeter(meter);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

}


export { updateStatsForMeter as GET };