import axios from "axios";
import { parse } from "node-html-parser";
import { encode, decode } from "iconv-lite";

import regex from "./regex";

import Class from "./class";
import Day from "./day";

import { PeroidData, WeekData } from "./types/timetable";
import { SchoolOptions, SchoolPayload } from "./types/school";


class School {
    name?: string = undefined;
    sccode?: number = undefined;
    region?: string = undefined;

    URL: string = "http://112.186.146.81:4082";
    baseURL: string = "";
    searchURL: string = "";
    timeURL: string = "";

    orgNum?: number = undefined;
    dayNum?: number = undefined;
    thNum?: number = undefined;
    sbNum?: number = undefined;
    prefix?: string = undefined;

    weekData?: WeekData = undefined;
    [k: number]: Array<Class>;

    constructor (name: string | undefined = undefined, options: SchoolOptions = {}) {
        this.name = name;
        if ((options.initialize ?? true) && this.name) {
            this.initialize(name!, options);
        }
    }

    async initialize(name: string | undefined = undefined, options: SchoolOptions = {}) {
        if (name)
            this.name = name;

        if (!(options.fetchRequestInfo ?? true))
            return;
        await this.fetchRequestInfo();

        if (options.getSchoolInfo ?? true) {
            const scInfo = await this.getSchoolInfo(this.name!);

            this.name = scInfo.name;
            this.region = scInfo.region;
            this.sccode = scInfo.sccode;
            this.timeURL = encodeURI(`${this.baseURL}?${btoa(`${this.prefix}${this.sccode.toString()}_0_1`)}`);
        }

        if (options.refresh ?? true) {
            await this.refresh()
        }
    }

    async fetchRequestInfo (): Promise<void> {
        const res = await axios.get(`${this.URL}/st`, { responseType: "arraybuffer" });
        const script = parse(decode(res.data, "EUC-KR")).querySelectorAll("script")[1]!.innerHTML;

        const route = regex.route.exec(script)![0];
        this.baseURL = `${this.URL}/${route?.slice(1, 7)}`;
        this.searchURL = `${this.baseURL}?${route?.slice(8)}`;

        this.orgNum = parseInt(regex.orgdata.exec(script)?.toString()!);
        this.dayNum = parseInt(regex.daydata.exec(script)?.toString()!);
        this.thNum = parseInt(regex.thname.exec(script)?.toString()!);
        this.sbNum = parseInt(regex.sbname.exec(script)?.toString()!);
        this.prefix = regex.prefix.exec(script)![0]?.slice(1, -1);
    }

    async getSchoolInfo (name: string): Promise<SchoolPayload> {
        const res = await axios.get(this.searchURL! + [...encode(name, "EUC-KR")].map((b) => `%${b.toString(16)}`).join("").toUpperCase(), { responseType: "arraybuffer" });
        const scList = JSON.parse(res.data.toString().replace(/\0+$/, ""))["학교검색"];

        if (scList.length == 1) {
            const sc = scList[0];
            return {
                region: sc[1],
                name: sc[2],
                sccode: sc[3]
            }
        }
        else if (scList.length > 1) {
            throw new Error("More than one school is searched by the name passed.")
        }
        else {
            throw new Error("No schools have been searched by the name passed.")
        }
    }

    async refresh (): Promise<WeekData> {
        const res = await axios.get(this.timeURL);
        const timeTableJSON = JSON.parse(res.data.toString().replace(/\0+$/, ""));

        const subjects = timeTableJSON[`자료${this.sbNum}`];
        const longSubjects = timeTableJSON[`긴자료${this.sbNum}`];
        const teachers = timeTableJSON[`자료${this.thNum}`];

        this.weekData = (timeTableJSON[`자료${this.dayNum}`] as Array<Array<Array<Array<number>>>>)
            .map((grade, gradeIndex) => grade
                .map((_class, classIndex) => new Class(gradeIndex, classIndex, _class.slice(0, 6)
                    .map(day => new Day(day.filter(x => x && x.toString().slice(0, -2))
                        .map(x => {
                            return {
                                name: subjects[parseInt(x.toString().slice(-2))],
                                longName: longSubjects[parseInt(x.toString().slice(-2))],
                                teacher: parseInt(x.toString().slice(0, -2)) >= teachers.length ? "" : teachers[parseInt(x.toString().slice(0, -2))]
                            }
                        })
                    ))
                ))
            );

        for (const i in this.weekData) {
            this[i] = this.weekData[i]!;
        }

        return this.weekData;
    }

    getClass (grade: number, classNum: number): Class {
        return this.weekData![grade]![classNum]!;
    }

    getDay (grade: number, classNum: number, day: number): Day {
        return this.getClass(grade, classNum).getDay(day);
    }

    getPeriod (grade: number, classNum: number, day: number, period: number): PeroidData {
        return this.getDay(grade, classNum, day).getPeriod(period);
    }
}

export default School;
