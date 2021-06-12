import { PeroidData } from "./types/timetable";

export default class Day {
    timeTable: Array<PeroidData>;
    [k: number]: PeroidData;

    constructor (data: Array<PeroidData>) {
        this.timeTable = data;

        for (const i in this.timeTable) {
            this[parseInt(i) + 1] = this.timeTable[i]!;
        }
    }

    getPeriod (period: number): PeroidData {
        return this.timeTable[period - 1]!;
    }
}