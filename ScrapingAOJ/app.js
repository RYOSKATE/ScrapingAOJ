const $ = require('jquery');
const fs = require('fs');
const csv = require('csv');
const iconv = require('iconv-lite');
const Nightmare = require('nightmare');

const inputFilename = (2 in process.argv) ? process.argv[2] : 'aoj.csv';
const inputFilenameRank = (3 in process.argv) ? process.argv[3] : 'aojRank.csv';
const outputFilename = (4 in process.argv) ? process.argv[4] : 'result.csv';


fs.readFile(inputFilename, (err, data) => {
    // オプションに{columns:true}をつけると、1行目をプロパティ名にしたオブジェクトの配列が返る
    csv.parse(data, { columns: true }, (err, output) => {

        var arrayCSV = new Array();

        output.forEach((value) => {
            arrayCSV.push(value);
        });

        fs.readFile(inputFilenameRank, (err, data) => {
            // オプションに{columns:true}をつけると、1行目をプロパティ名にしたオブジェクトの配列が返る
            csv.parse(data, { columns: true }, (err, output) => {

                var arrayRank = new Array();

                output.forEach((value) => {
                    arrayRank.push(value);
                });
                var count = 0;
                fs.writeFile(outputFilename, '学籍番号,出席簿番号,AOJ,その他,初心者,中級者,上級者,超上級者\n');
                var getAOJ = function () {
                    if (arrayCSV.length <= count) {
                        return 0;
                    }
                    const value = arrayCSV[count++];
                    const number = value.number;
                    const URL = value.account + "#2";
                    const syussekibo = value.syussekibo;


                    var nightmare = Nightmare(
                        {
                            show: true,
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
                            const numOfSolved = result.length;
                            var numOfSolvedByRank = {
                                0: 0,//その他
                                1: 0,
                                2: 0,
                                3: 0,
                                4: 0
                            };
                            function get_obj_by_key_value(dataAry, key, value) {
                                var result = $.grep(dataAry, function (e) {
                                    return e[key] == value;
                                });
                                return result;
                            }
                            //for (var i = 0; i < numOfSolved; ++i) {
                            //    const ID = result[i].problemID;
                            //    const obj = get_obj_by_key_value(arrayRank, 'id', ID);
                            //    if (obj) {
                            //        const rank = obj.rank;
                            //        ++numOfSolvedByRank[rank];
                            //    }
                            //    else {
                            //        ++numOfSolvedByRank[0];
                            //    }
                            //}
                            var text = number + ',' + syussekibo + ',' + numOfSolved;
                            for (var i = 0; i <= 4; ++i) {
                                text += ',' + numOfSolvedByRank[i];
                            }
                            fs.appendFile(outputFilename, text + '\n');
                            console.log(count + ":" + text);
                            getAOJ();
                        })
                        .catch(function (error) {
                            const text = number + ',' + syussekibo + ',' + value.account;
                            fs.appendFile(outputFilename, text + '\n');
                            console.error(count + ":" + number + ',' + URL + ',' + 'Search failed:', error);
                            getAOJ();
                        });
                }
                getAOJ();
            })
        });
    })
});