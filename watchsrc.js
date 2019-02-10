// https://stackoverflow.com/questions/20643470/execute-a-command-line-binary-with-node-js
const util = require('util')
const exec = util.promisify(require('child_process').exec);
async function ls(){
    console.log('going to await')
    const {stdOut,stderr} = await exec('dir')
    console.log('stdOut',stdOut)
    console.error('stdErr',stderr)
}
//ls()
async function tscw(){
    console.log('going to await')
    // await exec ('cd src')
    const {stdOut,stderr} = await exec('tsc -w -p src/tsconfig.json')
    console.log('stdOut',stdOut)
    console.error('stdErr',stderr)

}
tscw()