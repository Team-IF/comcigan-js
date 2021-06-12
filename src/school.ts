import axios from "axios";
import { parse } from "node-html-parser";
import { encode, decode } from "iconv-lite";

import regex from "./regex";


interface SchoolOptions {
    initialize?: boolean,
    fetchRequestInfo?: boolean,
    getSchoolInfo?: boolean
}

interface WeekData {

}

interface SchoolPayload {
    region: string,
    name: string,
    sccode: number
}

class School {
    name?: string = undefined;
    sccode?: number = undefined;
    region?: string = undefined;

    URL: string = "http://112.186.146.81:4082";
    baseURL?: string = undefined;
    searchURL?: string = undefined;

    orgNum?: number = undefined;
    dayNum?: number = undefined;
    thNum?: number = undefined;
    sbNum?: number = undefined;

    private timeURL?: string = undefined;
    private weekData?: WeekData = undefined;

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

        await this.fetchRequestInfo()
        if (options.getSchoolInfo ?? true) {
            const scInfo = await this.getSchoolInfo(this.name!);

            this.name = scInfo.name;
            this.region = scInfo.region;
            this.sccode = scInfo.sccode;
        }

        this.timeURL, this.weekData;
    }

    async fetchRequestInfo () {
        const res = await axios.get(`${this.URL}/st`, { responseType: "arraybuffer" });
        const script = parse(decode(res.data, "EUC-KR")).querySelectorAll("script")[1]!.innerHTML;

        const route = regex.route.exec(script)![0];
        this.baseURL = `${this.URL}/${route?.slice(1, 7)}`;
        this.searchURL = `${this.baseURL}?${route?.slice(8)}`;

        this.orgNum = parseInt(regex.orgdata.exec(script)?.toString()!);
        this.dayNum = parseInt(regex.daydata.exec(script)?.toString()!);
        this.thNum = parseInt(regex.thname.exec(script)?.toString()!);
        this.sbNum = parseInt(regex.sbname.exec(script)?.toString()!);
    }

    async getSchoolInfo (name: string): Promise<SchoolPayload> {
        const res = await axios.get(this.searchURL! + [...encode(name, "EUC-KR")].map((b) => `%${b.toString(16)}`).join("").toUpperCase(), { responseType: "arraybuffer" });
        console.log(typeof(res.data.toString('UTF-8')))
        const scList = JSON.parse(res.data.toString('UTF-8').replace(/\0+$/, ""))["학교검색"];

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
}

export default School;
