import axios from "axios";
import { parse } from "node-html-parser";
import { encode, decode } from "iconv-lite";

import regex from "./regex";


interface SchoolOptions {
    fetchInfo?: boolean,
    getSchoolName?: boolean
}

interface WeekData {

}

class School {
    name?: string = undefined;

    URL: string = "http://112.186.146.81:4082";
    baseURL?: string = undefined;
    searchURL?: string = undefined;

    orgNum?: number = undefined;
    dayNum?: number = undefined;
    thNum?: number = undefined;
    sbNum?: number = undefined;

    private timeURL?: string = undefined;
    private weekData?: WeekData = undefined;

    constructor (name: string, options: SchoolOptions = {}) {
        if (!(options.fetchInfo ?? true))
            return;

        this.fetchInfo();

        if (!(options.getSchoolName ?? true))
            return;

        this.getSchoolName(name);
        this.timeURL, this.weekData;
    }

    private async fetchInfo () {
        const res = await axios.get(`${this.URL}/st`, { responseType: "arraybuffer" });
        const script = parse(decode(res.data, "EUC-KR")).querySelectorAll("script")[1]!.innerHTML;

        const route = regex.route.exec(script);
        this.baseURL = `${this.URL}${route?.slice(1, 8)}`;
        this.searchURL = `${this.baseURL}${route?.slice(8)}`;

        this.orgNum = parseInt(regex.orgdata.exec(script)?.toString()!);
        this.dayNum = parseInt(regex.daydata.exec(script)?.toString()!);
        this.thNum = parseInt(regex.thname.exec(script)?.toString()!);
        this.sbNum = parseInt(regex.sbname.exec(script)?.toString()!);
    }

    private async getSchoolName (name: string) {
        const res = await axios.get(this.searchURL! + encode(name, "EUC-KR").toString().toUpperCase().slice(2, -1).replaceAll("\\X", "\\").split("\\"));
        const scList = JSON.parse(decode(res.data, "UTF-8").replaceAll("\0", "")).학교검색;
    }
}

export default School;
