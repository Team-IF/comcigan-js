import axios, { AxiosInstance } from "axios";
import {parse} from "node-html-parser";
import * as iconv from "iconv-lite";

const routereg = /(?<=\.)\/\d+\?\d+l/
const prefixreg = /'\d+_'/
const orgdatareg = /(?<=원자료=자료\.자료)\d+/
const daydatareg = /(?<=일일자료=자료\.자료)\d+/
const thnamereg = /(?<=성명=자료\.자료)\d+/
const sbnamereg = /(?<=자료.자료)\d+(?=\[sb\])/

const comcigan: AxiosInstance = axios.create({ baseURL: 'http://112.186.146.81:4082', })

comcigan.get("/st", {responseType: "arraybuffer"}).then(res => {
    const script = parse(iconv.decode(res.data, "EUC-KR")).querySelectorAll("script")[1]!.innerHTML
    //console.log(script)
    console.log(routereg.exec(script)![0])
    console.log(prefixreg.exec(script)![0])
    console.log(orgdatareg.exec(script)![0])
    console.log(daydatareg.exec(script)![0])
    console.log(thnamereg.exec(script)![0])
    console.log(sbnamereg.exec(script)![0])
})
