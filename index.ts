import axios from "axios";
import {parse} from "node-html-parser";
import * as iconv from "iconv-lite";

const routereg = new RegExp(String.raw`(?<=\.)/\d+\?\d+l`)
const prefixreg = new RegExp(String.raw`'\d+_'`)
const orgdatareg = new RegExp(String.raw`(?<=원자료=자료\.자료)\d+`)
const daydatareg = new RegExp(String.raw`(?<=일일자료=자료\.자료)\d+`)
const thnamereg = new RegExp(String.raw`(?<=성명=자료\.자료)\d+`)
const sbnamereg = new RegExp(String.raw`(?<=자료.자료)\d+(?=\[sb\])`)

const comcigan = axios.create({baseURL: 'http://112.186.146.81:4082',})

comcigan.get("/st", {responseType: "arraybuffer"}).then((res) => {
    const script = parse(iconv.decode(res.data, "EUC-KR")).querySelectorAll("script")[1]!.innerHTML
    //console.log(script)
    console.log(routereg.exec(script)![0])
    console.log(prefixreg.exec(script)![0])
    console.log(orgdatareg.exec(script)![0])
    console.log(daydatareg.exec(script)![0])
    console.log(thnamereg.exec(script)![0])
    console.log(sbnamereg.exec(script)![0])
})
