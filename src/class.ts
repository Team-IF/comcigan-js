import Day from "./day";
import { PeroidData } from "./types/timetable";

export default class Class {
    grade: number;
    classNum: number;
    timeTable: Array<Day>;

    constructor (grade: number, classNum: number, data: Array<Day>) {
        this.grade = grade;
        this.classNum = classNum;
        this.timeTable = data;
    }

    getDay (day: number): Day {
        return this.timeTable[day]!;
    }

    getPeriod (day: number, period: number): PeroidData {
        return this.timeTable[day]!.getPeriod(period);
    }
}