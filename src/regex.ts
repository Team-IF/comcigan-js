export default {
    route: /(?<=\.)\/\d+\?\d+l/,
    prefix: /'\d+_'/,
    orgdata: /(?<=원자료=자료\.자료)\d+/,
    daydata: /(?<=일일자료=자료\.자료)\d+/,
    thname: /(?<=성명=자료\.자료)\d+/,
    sbname: /(?<=자료.자료)\d+(?=\[sb\])/
}
