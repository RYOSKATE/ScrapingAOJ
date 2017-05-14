const $ = require('jquery');
const fs = require('fs');
const csv = require('csv');
const iconv = require('iconv-lite');
const Nightmare = require('nightmare');
const async = require('async');

const inputFilename = (2 in process.argv) ? process.argv[2] : 'aoj.csv';
const inputFilenameRank = (3 in process.argv) ? process.argv[3] : 'aojRank.csv';
const outputFilename = (4 in process.argv) ? process.argv[4] : 'result.csv';

async.waterfall([
    function (callback) {
        fs.readFile(inputFilename, (err, data) => {
            // オプションに{columns:true}をつけると、1行目をプロパティ名にしたオブジェクトの配列が返る
            csv.parse(data, { columns: true }, (err, output) => {
                let arrayCSV = new Array();
                output.forEach((value) => {
                    arrayCSV.push(value);
                });
                callback(null, arrayCSV);
            });
        });
    },
    function (arrayCSV, callback) {
        fs.readFile(inputFilenameRank, (err, data) => {
            // オプションに{columns:true}をつけると、1行目をプロパティ名にしたオブジェクトの配列が返る
            csv.parse(data, { columns: true }, (err, output) => {
                let arrayRank = new Array();
                output.forEach((value) => {
                    arrayRank.push(value);
                });
                callback(null, { arrayCSV, arrayRank });
            });
        });
    },
    function (arg, callback) {
        const arrayCSV = arg.arrayCSV;
        const arrayRank = arg.arrayRank;

        fs.writeFileSync(outputFilename, '学籍番号,出席簿番号,AOJ,その他,初心者,中級者,上級者,超上級者,経験言語数\n');

        let count = 0;
        async.timesSeries(arrayCSV.length, function (count, callback) {
            const value = arrayCSV[count];
            const number = value.number;
            const URL = value.account + "#2";
            const syussekibo = value.syussekibo;


            var nightmare = Nightmare(
                {
                    show: false,
                    //waitTimeout: 30000,
                    //gotoTimeout: 30000,
                    //loadTimeout: 30000,
                    //executionTimeout: 30000
                });

            nightmare
                .goto(URL)
                .wait('#pager_right')
                .evaluate(function () {
                    return solveddata;//これまでに解いた問題数
                })
                .end()
                .then(function (result) {
                    var numOfSolvedByRank = {
                        0: 0,//その他
                        1: 0,
                        2: 0,
                        3: 0,
                        4: 0
                    };
                    function get_obj_by_key_value(dataAry, key, value) {
                        var ret = null;
                        for (var i = 0; i < dataAry.length; ++i) {
                            if (dataAry[i][key] == value) {
                                ret = dataAry[i];
                                break;
                            }
                        }
                        return ret;
                    }

                    let numOfSolved = 0;
                    let langArray = new Array();
                    for (const ret of result) {
                        const lang = ret.language;
                        langArray.push(lang);
                        //if (lang == 'JAVA') {
                        const ID = ret.problemID;
                        const obj = get_obj_by_key_value(arrayRank, 'id', ID);
                        if (obj) {
                            const rank = obj.rank;
                            ++numOfSolvedByRank[rank];
                        }
                        else {
                            ++numOfSolvedByRank[0];
                        }
                        ++numOfSolved;
                        //}
                    }
                    const numOfLang = langArray.filter(function (x, i, self) {
                        return self.indexOf(x) === i;
                    }).length;

                    var text = number + ',' + syussekibo + ',' + numOfSolved;
                    for (var i = 0; i <= 4; ++i) {
                        text += ',' + numOfSolvedByRank[i];
                    }
                    text += ',' + numOfLang;
                    fs.appendFile(outputFilename, text + '\n');
                    console.log(count + ":" + text);
                    callback(null);
                })
                .catch(function (error) {
                    const text = number + ',' + syussekibo + ',' + value.account;
                    fs.appendFile(outputFilename, text + '\n');
                    console.error(count + ":" + number + ',' + URL + ',' + 'Search failed:', error);
                    callback(null);
                });
        }, function (err) {
            if (err) {
                console.log("err[" + err + "]");
            }
        });
    }
], function (err, results) {
    if (err) {
        console.log("err[" + err + "]");
    }
});
