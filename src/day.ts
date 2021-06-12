import { PeroidData } from "./types/timetable";

export default class Day {
    timeTable: Array<PeroidData>;

    constructor (data: Array<PeroidData>) {
        this.timeTable = data;
    }

    getPeriod (period: number): PeroidData {
        return this.timeTable[period - 1]!;
    }
}