const fs = require('fs');
const csv = require('csv');
const iconv = require('iconv-lite');
const Nightmare = require('nightmare');

const inputFilename = (2 in process.argv) ? process.argv[2] : 'aoj.txt';
const outputFilename = (3 in process.argv) ? process.argv[3] : 'result.csv';

fs.readFile(inputFilename, (err, data) => {
    // オプションに{columns:true}をつけると、1行目をプロパティ名にしたオブジェクトの配列が返る
    csv.parse(data, { columns: true }, (err, output) => {

        var array = new Array();

        output.forEach((value) => {
            array.push(value);
        });

        var count = 0;
        fs.writeFile(outputFilename, '学籍番号,出席簿番号,AOJ\n');
        var getAOJ = function () {
            if (array.length <= count) {
                return 0;
            }
            const value = array[count++];
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
                    const element = document.querySelector('#pager_right div');
                    const innerHTML = element.innerHTML;
                    const numOfSolved = innerHTML.substr(innerHTML.lastIndexOf(' ')).trim();
                    return numOfSolved;
                })
                .end()
                .then(function (result) {
                    const text = number + ',' + syussekibo + ',' + result;
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